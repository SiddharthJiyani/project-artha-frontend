// src/app/(main)/stocks/page.tsx
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
  TrendingUp,
  TrendingDown,
  Info,
  Building2,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStockTransactions } from '@/hooks/use-mcp-data';
import { STOCK_TRANSACTION_TYPES, StockTransaction } from '@/types/mcp-api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { useState, useMemo, useEffect } from 'react';
import FiMcpLogin from '@/components/FiMcpLogin';
import { fetchStockName } from '@/lib/gemini-api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
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

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface EnrichedStockTransaction extends StockTransaction {
  stockName: string;
  isLoading?: boolean;
}

export default function StockTransactionsPage() {
  const { isAuthenticated, login } = useAuth();
  const { data: stockData, loading, error, refetch } = useStockTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showLogin, setShowLogin] = useState(false);
  const [enrichedStocks, setEnrichedStocks] = useState<EnrichedStockTransaction[]>([]);
  const [namesLoading, setNamesLoading] = useState(false);

  // Enrich stock data with names from Gemini API
  useEffect(() => {
    const enrichStockData = async () => {
      if (!stockData?.stockTransactions) {
        setEnrichedStocks([]);
        return;
      }

      setNamesLoading(true);
      
      // Set initial data with loading state
      const initialStocks = stockData.stockTransactions.map(stock => ({
        ...stock,
        stockName: `Loading...`,
        isLoading: true
      }));
      setEnrichedStocks(initialStocks);

      // Fetch names in parallel
      const enrichedStocks = await Promise.all(
        stockData.stockTransactions.map(async (stock, index) => {
          try {
            const stockName = await fetchStockName(stock.isin);
            return {
              ...stock,
              stockName,
              isLoading: false
            };
          } catch (error) {
            return {
              ...stock,
              stockName: `Stock ${stock.isin.slice(-6)}`,
              isLoading: false
            };
          }
        })
      );
      
      setEnrichedStocks(enrichedStocks);
      setNamesLoading(false);
    };

    enrichStockData();
  }, [stockData]);

  // Process all transactions for statistics
  const allTransactions = useMemo(() => {
    if (!enrichedStocks.length) return [];
    
    return enrichedStocks.flatMap(stock => 
      stock.txns.map(txn => {
        const [transactionType, transactionDate, quantity, navValue] = txn;
        return {
          stockName: stock.stockName,
          isin: stock.isin,
          type: transactionType,
          date: parseISO(transactionDate),
          quantity: parseFloat(quantity.toString()),
          navValue: navValue ? parseFloat(navValue.toString()) : null,
          value: navValue ? parseFloat(quantity.toString()) * parseFloat(navValue.toString()) : 0
        };
      })
    ).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [enrichedStocks]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(txn => {
      const matchesSearch = txn.stockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           txn.isin.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || 
                         (selectedType === 'buy' && txn.type === 1) ||
                         (selectedType === 'sell' && txn.type === 2) ||
                         (selectedType === 'bonus' && txn.type === 3) ||
                         (selectedType === 'split' && txn.type === 4);
      return matchesSearch && matchesType;
    });
  }, [allTransactions, searchTerm, selectedType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStocks = enrichedStocks.length;
    const totalTransactions = allTransactions.length;
    const buyTransactions = allTransactions.filter(txn => txn.type === 1);
    const sellTransactions = allTransactions.filter(txn => txn.type === 2);
    
    const totalBuyValue = buyTransactions.reduce((sum, txn) => sum + txn.value, 0);
    const totalSellValue = sellTransactions.reduce((sum, txn) => sum + txn.value, 0);
    
    return {
      totalStocks,
      totalTransactions,
      totalBuyTransactions: buyTransactions.length,
      totalSellTransactions: sellTransactions.length,
      totalBuyValue,
      totalSellValue,
      netValue: totalSellValue - totalBuyValue
    };
  }, [allTransactions, enrichedStocks]);

  // Transaction type distribution for chart
  const transactionTypeData = useMemo(() => {
    const distribution = allTransactions.reduce((acc, txn) => {
      const type = STOCK_TRANSACTION_TYPES[txn.type as keyof typeof STOCK_TRANSACTION_TYPES];
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(distribution).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    }));
  }, [allTransactions]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
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
            <p className="text-muted-foreground mb-4">Please log in to view your stock transactions</p>
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
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-chart-1" />
                Stock Transactions
              </h1>
              <p className="text-muted-foreground">
                Complete view of your stock portfolio transactions
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
              title: 'Total Stocks',
              value: stats.totalStocks,
              icon: Building2,
              iconColor: 'text-chart-1',
              bgColor: 'bg-chart-1/10'
            },
            {
              title: 'Total Transactions',
              value: stats.totalTransactions,
              icon: BarChart3,
              iconColor: 'text-chart-2',
              bgColor: 'bg-chart-2/10'
            },
            {
              title: 'Buy Transactions',
              value: stats.totalBuyTransactions,
              icon: ArrowDownRight,
              iconColor: 'text-success',
              bgColor: 'bg-success/10'
            },
            {
              title: 'Sell Transactions',
              value: stats.totalSellTransactions,
              icon: ArrowUpRight,
              iconColor: 'text-error',
              bgColor: 'bg-error/10'
            }
          ].map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card/80 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
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
          ))}
        </motion.div>

        {/* Charts Section */}
        <motion.div className="grid lg:grid-cols-2 gap-6" variants={containerVariants}>
          {/* Transaction Type Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 h-full bg-card/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Transaction Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-80 w-full" />
                ) : transactionTypeData.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={transactionTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value">
                        {transactionTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-80 text-muted-foreground">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Stocks by Transactions */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 h-full bg-card/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Stocks by Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || namesLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : enrichedStocks.length ? (
                  <div className="space-y-3">
                    {enrichedStocks.slice(0, 5).map((stock, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium">{stock.stockName}</p>
                          <p className="text-sm text-muted-foreground">{stock.isin}</p>
                        </div>
                        <Badge variant="outline">
                          {stock.txns.length} transactions
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80 text-muted-foreground">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm bg-card/80 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stocks or ISIN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {['all', 'buy', 'sell', 'bonus', 'split'].map(type => (
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
          <Card className="shadow-sm bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Stock Transactions ({filteredTransactions.length})
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
                    <p>Failed to load stock transactions</p>
                    <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
                      Try Again
                    </Button>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>No stock transactions found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredTransactions.map((txn, index) => {
                      const transactionType = STOCK_TRANSACTION_TYPES[txn.type as keyof typeof STOCK_TRANSACTION_TYPES];
                      const isBuy = txn.type === 1;
                      const isSell = txn.type === 2;
                      
                      return (
                        <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-full ${
                                isBuy ? 'bg-success/10 text-success' : 
                                isSell ? 'bg-error/10 text-error' : 
                                'bg-info/10 text-info'
                              }`}>
                                {isBuy ? (
                                  <ArrowDownRight className="h-4 w-4" />
                                ) : isSell ? (
                                  <ArrowUpRight className="h-4 w-4" />
                                ) : (
                                  <TrendingUp className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {namesLoading ? 'Loading...' : txn.stockName}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant={isBuy ? "default" : isSell ? "destructive" : "secondary"} 
                                    className="text-xs"
                                  >
                                    {transactionType}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{txn.isin}</span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(txn.date, 'MMM dd, yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">
                                {txn.quantity} shares
                              </p>
                              {txn.navValue && (
                                <p className="text-sm text-muted-foreground">
                                  @ {formatCurrency(txn.navValue)}
                                </p>
                              )}
                              {txn.value > 0 && (
                                <p className={`text-sm font-medium ${
                                  isBuy ? 'text-error' : 'text-success'
                                }`}>
                                  {formatCurrency(txn.value)}
                                </p>
                              )}
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
