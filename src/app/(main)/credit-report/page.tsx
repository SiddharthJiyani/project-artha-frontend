// src/app/(main)/credit-report/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RefreshCw,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  Download,
  Shield,
  Eye,
  AlertTriangle,
  Info,
  Star,
  DollarSign,
  BarChart3,
  History,
  FileCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCreditReport } from "@/hooks/use-mcp-data";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import FiMcpLogin from "@/components/FiMcpLogin";
import {
  ACCOUNT_TYPES,
  ACCOUNT_STATUS,
  PAYMENT_RATING,
  CreditAccountDetail,
} from "@/types/mcp-api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

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
      type: "spring",
      stiffness: 100,
    },
  },
};

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
};

const formatLakhs = (amount: string | number) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  return formatCurrency(num);
};

const safeParseDateForDisplay = (dateString: string, defaultValue: string = 'N/A') => {
  try {
    if (!dateString || dateString.length !== 8) return defaultValue;
    
    // Format: YYYYMMDD -> YYYY-MM-DD
    const formatted = `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
    const parsed = parseISO(formatted);
    
    if (isNaN(parsed.getTime())) return defaultValue;
    return format(parsed, "MMM dd, yyyy");
  } catch (error) {
    console.warn('Error parsing date for display:', error, { dateString });
    return defaultValue;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 750) return "text-success bg-success/10";
  if (score >= 650) return "text-warning bg-warning/10";
  return "text-destructive bg-destructive/10";
};

const getAccountStatusColor = (status: string) => {
  switch (status) {
    case '11': return "text-success bg-success/10"; // Active
    case '71': return "text-muted-foreground bg-muted/10"; // Closed
    case '78': return "text-warning bg-warning/10"; // Settled
    case '82': return "text-primary bg-primary/10"; // Current
    case '83': return "text-destructive bg-destructive/10"; // Overdue
    default: return "text-muted-foreground bg-muted/10";
  }
};

const getPaymentRatingColor = (rating: string) => {
  switch (rating) {
    case '0': return "text-success bg-success/10"; // Standard
    case '1': return "text-warning bg-warning/10"; // SMA-0
    case '2': return "text-warning bg-warning/10"; // SMA-1
    case '3': return "text-destructive bg-destructive/10"; // SMA-2
    case '4':
    case '5': return "text-destructive bg-destructive/10"; // Sub-standard/Doubtful
    default: return "text-muted-foreground bg-muted/10";
  }
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function CreditReportPage() {
  const { isAuthenticated, login } = useAuth();
  const { data: creditData, loading, error, refetch } = useCreditReport();
  const [showLogin, setShowLogin] = useState(false);

  // Process credit report data
  const processedData = useMemo(() => {
    if (!creditData?.creditReports?.[0]?.creditReportData) return null;

    try {
      const reportData = creditData.creditReports[0].creditReportData;
      
      // Credit Score
      const creditScore = parseInt(reportData?.score?.bureauScore || '0');
      const scoreConfidence = reportData?.score?.bureauScoreConfidenceLevel || 'L';
      
      // Account Summary
      const accountSummary = reportData?.creditAccount?.creditAccountSummary?.account;
      const outstandingBalance = reportData?.creditAccount?.creditAccountSummary?.totalOutstandingBalance;
      
      // Credit Accounts
      const creditAccounts = reportData?.creditAccount?.creditAccountDetails || [];
      
      // Enquiries (CAPS)
      const capsData = reportData?.caps?.capsApplicationDetailsArray || [];
      const capsSummary = reportData?.caps?.capsSummary;
      
      // Account type distribution
      const accountTypeDistribution = creditAccounts.reduce((acc: any, account: CreditAccountDetail) => {
        const accountType = ACCOUNT_TYPES[account?.accountType as keyof typeof ACCOUNT_TYPES] || 'Other';
        acc[accountType] = (acc[accountType] || 0) + 1;
        return acc;
      }, {});
      
      const pieChartData = Object.entries(accountTypeDistribution).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));
      
      // Outstanding balance by account type
      const balanceByType = creditAccounts.reduce((acc: any, account: CreditAccountDetail) => {
        const accountType = ACCOUNT_TYPES[account?.accountType as keyof typeof ACCOUNT_TYPES] || 'Other';
        const balance = parseFloat(account?.currentBalance || '0');
        acc[accountType] = (acc[accountType] || 0) + balance;
        return acc;
      }, {});
      
      const balanceChartData = Object.entries(balanceByType).map(([name, value]) => ({
        name,
        value: value as number
      }));

      return {
        creditScore,
        scoreConfidence,
        accountSummary,
        outstandingBalance,
        creditAccounts,
        capsData,
        capsSummary,
        pieChartData,
        balanceChartData,
        reportHeader: reportData?.creditProfileHeader,
        totalOutstanding: parseFloat(outstandingBalance?.outstandingBalanceAll || '0'),
        securedBalance: parseFloat(outstandingBalance?.outstandingBalanceSecured || '0'),
        unsecuredBalance: parseFloat(outstandingBalance?.outstandingBalanceUnSecured || '0'),
      };
    } catch (error) {
      console.error('Error processing credit report data:', error);
      return null;
    }
  }, [creditData]);

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
            <p className="text-muted-foreground mb-4">
              Please log in to view your credit report
            </p>
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
        variants={containerVariants}>
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8 text-chart-1" />
                Credit Report
              </h1>
              <p className="text-muted-foreground">
                Comprehensive view of your credit profile and history
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refetch} disabled={loading}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Credit Score & Overview Cards */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}>
          
          {/* Credit Score Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Credit Score
                </CardTitle>
                <Star className="h-5 w-5 text-warning" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : error ? (
                  <div className="text-destructive text-sm">Error loading</div>
                ) : (
                  <>
                    <div className={`text-3xl font-bold ${processedData ? getScoreColor(processedData.creditScore).split(' ')[0] : ''}`}>
                      {processedData?.creditScore || 'N/A'}
                    </div>
                    {processedData?.scoreConfidence && (
                      <p className="text-xs text-muted-foreground">
                        Confidence: {processedData.scoreConfidence === 'H' ? 'High' : processedData.scoreConfidence === 'M' ? 'Medium' : 'Low'}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Outstanding */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Outstanding
                </CardTitle>
                <DollarSign className="h-5 w-5 text-destructive" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-3xl font-bold text-destructive">
                    {formatLakhs(processedData?.totalOutstanding || 0)}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Accounts */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Accounts
                </CardTitle>
                <CreditCard className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-3xl font-bold">
                    {processedData?.accountSummary?.creditAccountActive || '0'}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Enquiries */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Recent Enquiries (30d)
                </CardTitle>
                <Eye className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-3xl font-bold">
                    {processedData?.capsSummary?.capsLast30Days || '0'}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          className="grid lg:grid-cols-2 gap-6"
          variants={containerVariants}>
          
          {/* Account Type Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 h-full bg-card backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Account Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-80 w-full" />
                ) : processedData?.pieChartData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={processedData.pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value">
                        {processedData.pieChartData.map((entry, index) => (
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

          {/* Outstanding Balance by Type */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 h-full bg-card backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Outstanding Balance by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-80 w-full" />
                ) : processedData?.balanceChartData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={processedData.balanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                      />
                      <RechartsTooltip
                        formatter={(value: number) => [formatCurrency(value), "Amount"]}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-80 text-muted-foreground">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Credit Accounts Details */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Credit Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center text-muted-foreground py-8">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Failed to load credit accounts</p>
                </div>
              ) : processedData?.creditAccounts?.length ? (
                <div className="space-y-4">
                  {processedData.creditAccounts.map((account: CreditAccountDetail, index: number) => (
                    <div
                      key={index}
                      className="border border-border/40 rounded-lg p-6 hover:bg-muted/20 transition-colors">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Account Info */}
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-chart-1" />
                            {account?.subscriberName || 'Unknown Bank'}
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {ACCOUNT_TYPES[account?.accountType as keyof typeof ACCOUNT_TYPES] || account?.accountType}
                              </Badge>
                              <Badge 
                                className={`text-xs ${getAccountStatusColor(account?.accountStatus || '')}`}
                                variant="secondary">
                                {ACCOUNT_STATUS[account?.accountStatus as keyof typeof ACCOUNT_STATUS] || account?.accountStatus}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">
                              Opened: {safeParseDateForDisplay(account?.openDate || '')}
                            </p>
                          </div>
                        </div>

                        {/* Financial Info */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                            <p className="text-lg font-bold text-destructive">
                              {formatCurrency(account?.currentBalance || '0')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Credit Limit / Loan Amount</p>
                            <p className="text-sm font-semibold">
                              {formatCurrency(account?.creditLimitAmount || account?.highestCreditOrOriginalLoanAmount || '0')}
                            </p>
                          </div>
                          {account?.amountPastDue && parseFloat(account.amountPastDue) > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Amount Past Due</p>
                              <p className="text-sm font-semibold text-destructive">
                                {formatCurrency(account.amountPastDue)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Payment Info */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Payment Rating</p>
                            <Badge 
                              className={`text-xs ${getPaymentRatingColor(account?.paymentRating || '')}`}
                              variant="secondary">
                              {PAYMENT_RATING[account?.paymentRating as keyof typeof PAYMENT_RATING] || account?.paymentRating}
                            </Badge>
                          </div>
                          {account?.rateOfInterest && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                              <p className="text-sm font-semibold">{account.rateOfInterest}%</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Last Reported</p>
                            <p className="text-sm">{safeParseDateForDisplay(account?.dateReported || '')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CreditCard className="h-8 w-8 mx-auto mb-2" />
                  <p>No credit accounts found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Enquiries */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Credit Enquiries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : processedData?.capsData?.length ? (
                <div className="space-y-3">
                  {processedData.capsData.map((enquiry: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/10">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{enquiry?.SubscriberName || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">
                            Purpose: {enquiry?.FinancePurpose || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {enquiry?.DateOfRequest && (
                          <p className="text-sm text-muted-foreground">
                            {safeParseDateForDisplay(enquiry.DateOfRequest)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Eye className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent enquiries found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}
