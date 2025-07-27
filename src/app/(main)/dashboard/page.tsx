// src/app/(main)/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  BarChart2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Search,
  FileText,
  Upload,
  Star,
  Wallet,
  Expand,
  PiggyBank,
  Building2,
  AlertCircle,
  RefreshCw,
  Info,
  List,
  PieChartIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNetWorth } from "@/hooks/use-mcp-data";
import { useAuth } from "@/contexts/AuthContext";
import { ASSET_TYPES } from "@/types/mcp-api";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FiMcpLogin from "@/components/FiMcpLogin";
import FinancialSummaryModal from "./financial-summary-modal";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

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

const quickActions = [
  { name: "Ask Artha AI", icon: Search, link: "/chat" },
  {
    name: "Investment Calculator",
    icon: BarChart2,
    link: "/investment-calculator",
  },
  { name: "Generate Report", icon: FileText, link: "/reports" },
];

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

export default function DashboardPage() {
  const { isAuthenticated, login } = useAuth();
  const { data: netWorthData, loading, error, refetch } = useNetWorth();
  const [showLogin, setShowLogin] = useState(false);
  const [viewMode, setViewMode] = useState("chart");

  console.log("netWorthData", netWorthData);

  const router = useRouter();

  // Process net worth data for overview cards
  const overviewStats = useMemo(() => {
    if (!netWorthData) return null;

    const totalNetWorth = parseFloat(
      netWorthData?.netWorthResponse?.totalNetWorthValue?.units || "0"
    );
    const assets =
      netWorthData?.netWorthResponse?.assetValues?.filter(
        (asset) => parseFloat(asset?.value?.units) > 0
      ) || [];
    const liabilities =
      netWorthData?.netWorthResponse?.assetValues?.filter(
        (asset) => parseFloat(asset?.value?.units) < 0
      ) || [];

    const totalAssets = assets.reduce(
      (sum, asset) => sum + parseFloat(asset?.value?.units || "0"),
      0
    );
    const totalLiabilities = Math.abs(
      liabilities.reduce(
        (sum, liability) => sum + parseFloat(liability?.value?.units || "0"),
        0
      )
    );

    // Calculate mutual fund returns
    const totalMFCurrent =
      netWorthData?.mfSchemeAnalytics?.schemeAnalytics?.reduce(
        (sum, scheme) =>
          sum +
          parseFloat(
            scheme.enrichedAnalytics?.analytics?.schemeDetails?.currentValue
              ?.units
          ),
        0
      ) || 0;
    const totalMFInvested =
      netWorthData?.mfSchemeAnalytics?.schemeAnalytics?.reduce(
        (sum, scheme) =>
          sum +
          parseFloat(
            scheme.enrichedAnalytics?.analytics?.schemeDetails?.investedValue
              ?.units
          ),
        0
      ) || 0;
    const mfReturns = totalMFCurrent - totalMFInvested;
    const mfReturnPercentage =
      totalMFInvested > 0
        ? ((mfReturns / totalMFInvested) * 100).toFixed(1)
        : "0";

    return {
      netWorth: totalNetWorth,
      totalAssets,
      totalLiabilities,
      mfReturns,
      mfReturnPercentage: parseFloat(mfReturnPercentage),
    };
  }, [netWorthData]);

  // Process asset allocation data
  const assetAllocation = useMemo(() => {
    if (!netWorthData) return [];

    const totalPositiveAssets =
      netWorthData?.netWorthResponse?.assetValues
        ?.filter((asset) => parseFloat(asset?.value?.units || "0") > 0)
        ?.reduce(
          (sum, asset) => sum + parseFloat(asset?.value?.units || "0"),
          0
        ) || 0;

    return (
      netWorthData?.netWorthResponse?.assetValues
        ?.filter((asset) => parseFloat(asset?.value?.units || "0") > 0)
        ?.map((asset) => {
          const value = parseFloat(asset?.value?.units || "0");
          const percentage =
            totalPositiveAssets > 0
              ? ((value / totalPositiveAssets) * 100).toFixed(1)
              : "0";
          return {
            name:
              ASSET_TYPES[
                asset?.netWorthAttribute as keyof typeof ASSET_TYPES
              ] ||
              asset?.netWorthAttribute ||
              "Unknown",
            value,
            percentage: parseFloat(percentage),
            progress: parseFloat(percentage),
          };
        })
        ?.sort((a, b) => b.value - a.value) || []
    );
  }, [netWorthData]);

  // Process mutual fund schemes
  const mutualFunds = useMemo(() => {
    if (!netWorthData?.mfSchemeAnalytics?.schemeAnalytics) return [];

    return (
      netWorthData?.mfSchemeAnalytics?.schemeAnalytics?.map((scheme) => ({
        name: scheme?.schemeDetail?.nameData?.longName || "Unknown Fund",
        amc: scheme?.schemeDetail?.amc?.replace(/_/g, " ") || "Unknown AMC",
        category:
          scheme?.schemeDetail?.categoryName?.replace(/_/g, " ") ||
          "Unknown Category",
        currentValue: parseFloat(
          scheme?.enrichedAnalytics?.analytics?.schemeDetails?.currentValue
            ?.units || "0"
        ),
        investedValue: parseFloat(
          scheme?.enrichedAnalytics?.analytics?.schemeDetails?.investedValue
            ?.units || "0"
        ),
        returns: parseFloat(
          scheme?.enrichedAnalytics?.analytics?.schemeDetails?.unrealisedReturns
            ?.units || "0"
        ),
        xirr: scheme?.enrichedAnalytics?.analytics?.schemeDetails?.XIRR || 0,
        units: scheme?.enrichedAnalytics?.analytics?.schemeDetails?.units || 0,
        nav: parseFloat(scheme?.schemeDetail?.nav?.units || "0"),
      })) || []
    );
  }, [netWorthData]);

  // Handle login success
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
              Please log in to view your dashboard
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Financial Dashboard</h1>
              <p className="text-muted-foreground">
                Your complete financial overview
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refetch} disabled={loading}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="outline">Export Report</Button>
              <FinancialSummaryModal data={netWorthData} />
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}>
          {/* Net Worth Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Net Worth
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-success" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : error ? (
                  <div className="text-destructive text-sm">Error loading</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">
                      {overviewStats
                        ? formatLakhs(overviewStats.netWorth)
                        : "₹0"}
                    </div>
                    {overviewStats?.mfReturnPercentage &&
                      overviewStats.mfReturnPercentage > 0 && (
                        <p className="text-xs text-success flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          MF Returns: +{overviewStats.mfReturnPercentage}%
                        </p>
                      )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Assets Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Assets
                </CardTitle>
                <PiggyBank className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : error ? (
                  <div className="text-destructive text-sm">Error loading</div>
                ) : (
                  <div className="text-3xl font-bold">
                    {overviewStats
                      ? formatLakhs(overviewStats.totalAssets)
                      : "₹0"}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Liabilities Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Liabilities
                </CardTitle>
                <CreditCard className="h-5 w-5 text-destructive" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : error ? (
                  <div className="text-destructive text-sm">Error loading</div>
                ) : (
                  <div className="text-3xl font-bold text-destructive">
                    {overviewStats
                      ? formatLakhs(overviewStats.totalLiabilities)
                      : "₹0"}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* MF Returns Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  MF Returns
                </CardTitle>
                <BarChart2 className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : error ? (
                  <div className="text-destructive text-sm">Error loading</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-success">
                      {overviewStats
                        ? formatLakhs(overviewStats.mfReturns)
                        : "₹0"}
                    </div>
                    {overviewStats?.mfReturnPercentage && (
                      <p className="text-xs text-muted-foreground">
                        {overviewStats.mfReturnPercentage}% returns
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Asset Allocation and Mutual Funds */}
        <motion.div
          className="grid lg:grid-cols-2 gap-6"
          variants={containerVariants}>
          {/* Asset Allocation */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 h-full bg-card backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Asset Allocation</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "chart" ? "default" : "ghost"}
                    size="sm"
                    className={
                      viewMode === "chart" ? "bg-[#00b899] text-white" : ""
                    }
                    onClick={() => setViewMode("chart")}>
                    <PieChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className={
                      viewMode === "list" ? "bg-[#00b899] text-white" : ""
                    }
                    onClick={() => setViewMode("list")}>
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  viewMode === "chart" ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  )
                ) : error ? (
                  <div className="text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Failed to load asset allocation</p>
                  </div>
                ) : assetAllocation.length > 0 ? (
                  <>
                    {viewMode === "chart" ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={assetAllocation}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) =>
                              `${name}: ${percentage}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value">
                            {assetAllocation.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value) => formatCurrency(value)}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="space-y-4">
                        {assetAllocation.map((asset, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor: `hsl(var(--chart-${
                                    (index % 5) + 1
                                  }))`,
                                }}
                              />
                              <span className="font-medium">{asset.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                {formatCurrency(asset.value)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {asset.percentage}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-muted-foreground h-80 flex items-center justify-center">
                    <div>
                      <Building2 className="h-8 w-8 mx-auto mb-2" />
                      <p>No asset data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Mutual Fund Schemes */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 h-full bg-card backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Mutual Fund Schemes</CardTitle>
                <Button variant="ghost" size="icon">
                  <BarChart2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex justify-between">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Failed to load mutual funds</p>
                  </div>
                ) : mutualFunds.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto space-y-4">
                    {mutualFunds.map((fund, index) => (
                      <div
                        key={index}
                        className="border-b border-border/40 pb-3 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium truncate"
                              title={fund.name}>
                              {fund.name.length > 40
                                ? fund.name.substring(0, 40) + "..."
                                : fund.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {fund.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                XIRR: {fund.xirr.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-sm font-semibold">
                              {formatCurrency(fund.currentValue)}
                            </p>
                            <p
                              className={`text-xs ${
                                fund.returns >= 0
                                  ? "text-success"
                                  : "text-destructive"
                              }`}>
                              {fund.returns >= 0 ? "+" : ""}
                              {formatCurrency(fund.returns)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <BarChart2 className="h-8 w-8 mx-auto mb-2" />
                    <p>No mutual fund data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {quickActions.map((action) => (
                  <Link key={action.name} href={action.link}>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-muted-foreground hover:text-foreground">
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}
