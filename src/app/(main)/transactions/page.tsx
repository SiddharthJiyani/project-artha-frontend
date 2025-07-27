// src/app/(main)/transactions/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBankTransactions } from '@/hooks/use-mcp-data';
import { TRANSACTION_TYPES } from '@/types/mcp-api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, subDays, isAfter, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { useState, useMemo } from 'react';
import FiMcpLogin from '@/components/FiMcpLogin';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${num.toLocaleString('en-IN')}`;
};

export default function TransactionsPage() {
  const { isAuthenticated, login } = useAuth();
  const { data: transactionsData, loading, error, refetch } = useBankTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showLogin, setShowLogin] = useState(false);

  // Process transactions data
  const allTransactions = useMemo(() => {
    if (!transactionsData?.bankTransactions) return [];
    
    return transactionsData?.bankTransactions?.flatMap(bank => 
      bank.txns.map(txn => {
        const [amount, narration, date, type, mode, balance] = txn;
        return {
          amount: parseFloat(amount),
          narration,
          date: parseISO(date),
          type,
          mode,
          balance: parseFloat(balance),
          bank: bank.bank,
          isCredit: type === 1
        };
      })
    ).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactionsData]);


  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(txn => {
      const matchesSearch = txn.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           txn.mode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || 
                         (selectedType === 'credit' && txn.isCredit) ||
                         (selectedType === 'debit' && !txn.isCredit);
      return matchesSearch && matchesType;
    });
  }, [allTransactions, searchTerm, selectedType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recent = allTransactions.filter(txn => isAfter(txn.date, thirtyDaysAgo));
    
    const totalCredits = recent
      .filter(txn => txn.isCredit)
      .reduce((sum, txn) => sum + txn.amount, 0);
    
    const totalDebits = recent
      .filter(txn => !txn.isCredit)
      .reduce((sum, txn) => sum + txn.amount, 0);

    return {
      totalTransactions: allTransactions.length,
      monthlyCredits: totalCredits,
      monthlyDebits: totalDebits,
      netFlow: totalCredits - totalDebits,
      currentBalance: allTransactions[0]?.balance || 0,
      recentTransactionsCount: recent.length,
      recentCreditsCount: recent.filter(txn => txn.isCredit).length,
      recentDebitsCount: recent.filter(txn => !txn.isCredit).length
    };
  }, [allTransactions]);

  // Helper function to get tooltip content for zero values
  const getZeroValueTooltip = (type: 'credits' | 'debits' | 'netFlow') => {
    if (stats.totalTransactions === 0) {
      return "No transaction data available";
    }
    
    if (stats.recentTransactionsCount === 0) {
      return "No transactions found in the last 30 days";
    }
    
    switch (type) {
      case 'credits':
        return stats.recentCreditsCount === 0 
          ? "No money received in the last 30 days" 
          : null;
      case 'debits':
        return stats.recentDebitsCount === 0 
          ? "No money spent in the last 30 days" 
          : null;
      case 'netFlow':
        return stats.monthlyCredits === stats.monthlyDebits
          ? "Credits and debits are equal this month"
          : null;
      default:
        return null;
    }
  };

  const handleLoginSuccess = (sessionId: string, phoneNumber: string) => {
    login(sessionId, phoneNumber);
    setShowLogin(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h2 className="text-2xl font-bold">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to view your transactions</p>
            <Button onClick={() => setShowLogin(true)}>
              Login with Fi MCP
            </Button>
          </div>
        </div>
        {showLogin && (
          <FiMcpLogin
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setShowLogin(false)}
          />
        )}
      </>
    );
  }

  return (
    <TooltipProvider>
      <motion.div 
        className="space-y-6"
        initial="hidden" 
        animate="visible" 
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Transaction History</h1>
              <p className="text-muted-foreground">
                Complete view of your banking transactions across all accounts
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refetch} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
        >
          {[
            {
              id: 'balance',
              title: 'Current Balance',
              value: formatCurrency(stats.currentBalance),
              icon: DollarSign,
              iconColor: 'text-chart-1',
              bgColor: 'bg-chart-1/10'
            },
            {
              id: 'credits',
              title: 'Monthly Credits',
              value: formatCurrency(stats.monthlyCredits),
              icon: TrendingUp,
              iconColor: 'text-chart-2',
              bgColor: 'bg-chart-2/10',
              showInfo: stats.monthlyCredits === 0
            },
            {
              id: 'debits',
              title: 'Monthly Debits',
              value: formatCurrency(stats.monthlyDebits),
              icon: TrendingDown,
              iconColor: 'text-destructive',
              bgColor: 'bg-destructive/10',
              showInfo: stats.monthlyDebits === 0
            },
            {
              id: 'netFlow',
              title: 'Net Flow',
              value: `${stats.netFlow >= 0 ? '+' : ''}${formatCurrency(stats.netFlow)}`,
              icon: stats.netFlow >= 0 ? ArrowUpRight : ArrowDownRight,
              iconColor: stats.netFlow >= 0 ? 'text-chart-2' : 'text-destructive',
              bgColor: stats.netFlow >= 0 ? 'bg-chart-2/10' : 'bg-destructive/10',
              showInfo: stats.netFlow === 0
            }
          ].map((stat, index) => {
            const tooltipContent = stat.showInfo ? getZeroValueTooltip(stat.id as 'credits' | 'debits' | 'netFlow') : null;
            
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                          {tooltipContent && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p>{tooltipContent}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {loading ? (
                          <Skeleton className="h-8 w-24 mt-2" />
                        ) : (
                          <p className="text-2xl font-bold">{stat.value}</p>
                        )}
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm bg-card backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {['all', 'credit', 'debit'].map(type => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm bg-card backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Transactions ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Failed to load transactions</p>
                  <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
                    Try Again
                  </Button>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredTransactions.map((txn, index) => {
                    const transactionType = TRANSACTION_TYPES[txn.type as keyof typeof TRANSACTION_TYPES];
                    
                    return (
                      <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${txn.isCredit ? 'bg-chart-2/20' : 'bg-destructive/20'}`}>
                              {txn.isCredit ? (
                                <ArrowDownRight className="h-4 w-4 text-chart-2" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{txn.narration}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant={txn.isCredit ? "default" : "secondary"} 
                                  className="text-xs"
                                >
                                  {transactionType}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{txn.mode}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(txn.date, 'MMM dd, yyyy')}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{txn.bank}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${txn.isCredit ? 'text-chart-2' : 'text-destructive'}`}>
                              {txn.isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Balance: {formatCurrency(txn.balance)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  </TooltipProvider>
  );
}
