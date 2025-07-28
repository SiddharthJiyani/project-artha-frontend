// src/app/(main)/epf/page.tsx
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
  Building2,
  Clock,
  PiggyBank,
  Users,
  TrendingUp,
  Download,
  AlertCircle,
  Briefcase,
  Calendar,
  Info,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEPFDetails } from "@/hooks/use-mcp-data";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useState } from "react";
import {
  format,
  parseISO,
  differenceInMonths,
  differenceInYears,
} from "date-fns";
import FiMcpLogin from "@/components/FiMcpLogin";
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
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  Tooltip as RechartsTooltip, // <-- Add this explicit import
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
  return `₹${num.toLocaleString("en-IN")}`;
};

const formatLakhs = (amount: string | number) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  return formatCurrency(num);
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export default function EPFPage() {
  const { isAuthenticated, login } = useAuth();
  const { data: epfData, loading, error, refetch } = useEPFDetails();
  const [showLogin, setShowLogin] = useState(false);

  // Process EPF data for visualizations
  const processedData = useMemo(() => {
    console.log('EPF Data received:', epfData);
    
    if (!epfData?.uanAccounts?.[0]?.rawDetails) {
      console.warn('No EPF data found:', epfData);
      return null;
    }

    try {
      const rawDetails = epfData?.uanAccounts?.[0]?.rawDetails;
      const establishments = rawDetails?.est_details || [];
      const overallBalance = rawDetails?.overall_pf_balance;

      console.log('Raw Details:', rawDetails);
      console.log('Establishments:', establishments);
      console.log('Overall Balance:', overallBalance);

      if (!establishments.length || !overallBalance) {
        console.warn('Missing establishments or overall balance data', {
          establishmentsLength: establishments.length,
          overallBalance
        });
        return null;
      }

      // Calculate totals with safe parsing
      const totalEmployeeShare = parseFloat(
        overallBalance?.employee_share_total?.credit || '0'
      );
      const totalPensionBalance = parseFloat(overallBalance?.pension_balance || '0');
      const totalCurrentPF = parseFloat(overallBalance?.current_pf_balance || '0');

    // Pie chart data for balance distribution
    const balanceDistribution = [
      {
        name: "Employee Share",
        value: totalEmployeeShare,
        color: COLORS[0],
      },
      {
        name: "Employer Share",
        value: totalCurrentPF - totalEmployeeShare,
        color: COLORS[1],
      },
      {
        name: "Pension Fund",
        value: totalPensionBalance,
        color: COLORS[2],
      },
    ];

      // Bar chart data for establishment-wise breakdown
      const establishmentData = establishments.map((est, index) => ({
        name:
          (est?.est_name || 'Unknown Company').length > 20
            ? (est?.est_name || 'Unknown Company').substring(0, 20) + "..."
            : (est?.est_name || 'Unknown Company'),
        fullName: est?.est_name || 'Unknown Company',
        employeeShare: parseFloat(est?.pf_balance?.employee_share?.credit || '0'),
        employerShare: parseFloat(est?.pf_balance?.employer_share?.credit || '0'),
        totalBalance: parseFloat(est?.pf_balance?.net_balance || '0'),
        tenure: calculateTenure(est?.doj_epf || '', est?.doe_epf || ''),
        color: COLORS[index % COLORS.length],
      }));

      // Timeline data for service history
      const timelineData = establishments
        .map((est, index) => {
          const startDate = safeParseDateForProcessing(est?.doj_epf || '');
          const endDate = safeParseDateForProcessing(est?.doe_epf || '');
          return {
            company: est?.est_name || 'Unknown Company',
            startDate: startDate || new Date(),
            endDate: endDate || new Date(),
            balance: parseFloat(est?.pf_balance?.net_balance || '0'),
            tenure: calculateTenure(est?.doj_epf || '', est?.doe_epf || ''),
          };
        })
        .filter(item => item.startDate && item.endDate) // Filter out invalid dates
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      return {
        balanceDistribution,
        establishmentData,
        timelineData,
        totalEmployeeShare,
        totalPensionBalance,
        totalCurrentPF,
        establishments,
        overallBalance,
      };
    } catch (error) {
      console.error('Error processing EPF data:', error);
      return null;
    }
  }, [epfData]);

  function parseDDMMYYYY(dateString: string): Date | null {
    try {
      if (!dateString) return null;
      
      // Handle DD-MM-YYYY format
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      // Fallback to parseISO for other formats
      const isoDate = parseISO(dateString);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }
      
      return null;
    } catch (error) {
      console.warn('Error parsing date:', error, { dateString });
      return null;
    }
  }

  function calculateTenure(startDate: string, endDate: string) {
    try {
      if (!startDate || !endDate) return 'N/A';
      
      const start = parseDDMMYYYY(startDate);
      const end = parseDDMMYYYY(endDate);
      
      if (!start || !end) {
        return 'N/A';
      }
      
      const years = differenceInYears(end, start);
      const months = differenceInMonths(end, start) % 12;
      return `${years}y ${months}m`;
    } catch (error) {
      console.warn('Error calculating tenure:', error, { startDate, endDate });
      return 'N/A';
    }
  }

  function safeParseDateForDisplay(dateString: string, defaultValue: string = 'N/A') {
    try {
      if (!dateString) return defaultValue;
      const parsed = parseDDMMYYYY(dateString);
      if (!parsed) return defaultValue;
      return format(parsed, "MMM dd, yyyy");
    } catch (error) {
      console.warn('Error parsing date for display:', error, { dateString });
      return defaultValue;
    }
  }

  function safeParseDateForProcessing(dateString: string) {
    try {
      if (!dateString) return null;
      return parseDDMMYYYY(dateString);
    } catch (error) {
      console.warn('Error parsing date for processing:', error, { dateString });
      return null;
    }
  }

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
              Please log in to view your EPF details
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

  // Debug render information
  console.log('EPF Page render:', { 
    isAuthenticated, 
    loading, 
    error, 
    epfData, 
    processedData 
  });

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
                <Shield className="h-8 w-8 text-chart-2" />
                EPF Portfolio
              </h1>
              <p className="text-muted-foreground">
                Complete overview of your Employee Provident Fund accounts
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

        {/* Overview Cards */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}>
          {processedData
            ? [
                {
                  title: "Total PF Balance",
                  value: formatLakhs(processedData.totalCurrentPF),
                  icon: PiggyBank,
                  iconColor: "text-chart-1",
                  bgColor: "bg-chart-1/10",
                  change: "+12.5%",
                  changeColor: "text-chart-2",
                },
                {
                  title: "Employee Share",
                  value: formatLakhs(processedData.totalEmployeeShare),
                  icon: Users,
                  iconColor: "text-chart-2",
                  bgColor: "bg-chart-2/10",
                  subtitle: "Your Contributions",
                },
                {
                  title: "Pension Fund",
                  value: formatLakhs(processedData.totalPensionBalance),
                  icon: TrendingUp,
                  iconColor: "text-chart-3",
                  bgColor: "bg-chart-3/10",
                  subtitle: "EPS Balance",
                },
                {
                  title: "Active Accounts",
                  value: processedData.establishments.length.toString(),
                  icon: Building2,
                  iconColor: "text-chart-4",
                  bgColor: "bg-chart-4/10",
                  subtitle: "Establishments",
                },
              ].map((stat, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card/80 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </p>
                          {loading ? (
                            <Skeleton className="h-8 w-24 mt-2" />
                          ) : (
                            <>
                              <p className="text-2xl font-bold">{stat.value}</p>
                              {stat.change && (
                                <p
                                  className={`text-xs ${stat.changeColor} flex items-center mt-1`}>
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {stat.change} from last year
                                </p>
                              )}
                              {stat.subtitle && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {stat.subtitle}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            : [...Array(4)].map((_, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="shadow-sm bg-card/80 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </motion.div>

        {/* Charts Section */}
        <motion.div
          className="grid lg:grid-cols-2 gap-6 "
          variants={containerVariants}>
          {/* Balance Distribution Pie Chart */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 h-full bg-card/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Balance Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-80 w-full" />
                ) : processedData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={processedData.balanceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value">
                        {processedData.balanceDistribution.map(
                          (entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          )
                        )}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Amount",
                        ]}
                      
                      />
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

          {/* Establishment-wise Breakdown */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 h-full bg-card/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Company-wise Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-80 w-full" />
                ) : processedData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={processedData.establishmentData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) =>
                          `₹${(value / 1000).toFixed(0)}K`
                        }
                      />
                      <RechartsTooltip
                        formatter={(value: number) => [
                          formatCurrency(value),
                          "Amount",
                        ]}
                        labelFormatter={(label) =>
                          processedData.establishmentData.find(
                            (d) => d.name === label
                          )?.fullName || label
                        }
                        
                      />
                      <Legend />
                      <Bar
                        dataKey="employeeShare"
                        fill="hsl(var(--chart-2))"
                        name="Employee Share"
                      />
                      <Bar
                        dataKey="employerShare"
                        fill="hsl(var(--chart-1))"
                        name="Employer Share"
                      />
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

        {/* Establishment Details */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Employment History & PF Details
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
                  <p>Failed to load EPF details</p>
                </div>
              ) : processedData?.establishments ? (
                <div className="space-y-6">
                  {processedData.establishments.map((est, index) => (
                    <div
                      key={index}
                      className="border border-border/40 rounded-lg p-6 hover:bg-muted/20 transition-colors">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-chart-1" />
                            {est?.est_name || 'Unknown Company'}
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {est?.member_id || 'N/A'}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {est?.office || 'N/A'}
                            </p>
                            <div className="flex items-center gap-4">
                              <p className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {safeParseDateForDisplay(est?.doj_epf || '')}{" "}
                                -{" "}
                                {safeParseDateForDisplay(est?.doe_epf || '')}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {calculateTenure(est?.doj_epf || '', est?.doe_epf || '')}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-chart-1/10 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">
                              Employee Share
                            </p>
                            <p className="text-lg font-bold text-chart-1">
                              {formatCurrency(
                                est?.pf_balance?.employee_share?.credit || '0'
                              )}
                            </p>
                            {est?.pf_balance?.employee_share?.balance && (
                              <p className="text-xs text-muted-foreground">
                                Balance:{" "}
                                {formatCurrency(
                                  est?.pf_balance?.employee_share?.balance || '0'
                                )}
                              </p>
                            )}
                          </div>

                          <div className="bg-chart-2/10 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">
                              Employer Share
                            </p>
                            <p className="text-lg font-bold text-chart-2">
                              {formatCurrency(
                                est?.pf_balance?.employer_share?.credit || '0'
                              )}
                            </p>
                            {est?.pf_balance?.employer_share?.balance && (
                              <p className="text-xs text-muted-foreground">
                                Balance:{" "}
                                {formatCurrency(
                                  est?.pf_balance?.employer_share?.balance || '0'
                                )}
                              </p>
                            )}
                          </div>

                          <div className="col-span-2 bg-chart-3/10 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">
                              Total PF Balance
                            </p>
                            <p className="text-2xl font-bold text-chart-3">
                              {formatCurrency(est?.pf_balance?.net_balance || '0')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Briefcase className="h-8 w-8 mx-auto mb-2" />
                  <p>No EPF data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}
