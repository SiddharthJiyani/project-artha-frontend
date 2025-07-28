"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useMFTransactions } from "@/hooks/use-mcp-data";
import { MF_ORDER_TYPES } from "@/types/mcp-api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChartIcon,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import FiMcpLogin from "@/components/FiMcpLogin";

interface ProcessedMFData {
  schemeName: string;
  isin: string;
  folioId: string;
  totalUnits: number;
  totalInvestment: number;
  averagePrice: number;
  lastTransactionDate: string;
  transactions: Array<{
    orderType: string;
    date: string;
    price: number;
    units: number;
    amount: number;
  }>;
}

interface SchemeAllocation {
  name: string;
  value: number;
  percentage: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(var(--destructive))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--muted))",
  "hsl(var(--chart-1))",
];

export default function PortfolioPage() {
  const { data: mfData, loading, error } = useMFTransactions();
  const [selectedTab, setSelectedTab] = useState("overview");
  const { isAuthenticated, login } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  console.log("mfData", mfData);

  // Process MF transaction data
  const processedData = useMemo(() => {
    if (!mfData?.mfTransactions) return [];

    return mfData.mfTransactions
      .map((fund) => {
        let totalUnits = 0;
        let totalInvestment = 0;
        let lastTransactionDate = "";
        const processedTransactions = [];

        console.log("fund", fund);

        // Use the correct property name 'txns' from your data structure
        const transactions = fund.txns || [];

        if (!Array.isArray(transactions) || transactions.length === 0) {
          console.warn(
            "No valid transactions found for fund:",
            fund.schemeName
          );
          return {
            schemeName: fund.schemeName || "Unknown Fund",
            isin: fund.isin || "",
            folioId: fund.folioId || "",
            totalUnits: 0,
            totalInvestment: 0,
            averagePrice: 0,
            lastTransactionDate: "",
            transactions: [],
          };
        }

        for (const transaction of transactions) {
          // Based on your data: [orderType, date, price, units, amount]
          const [orderType, date, price, units, amount] = transaction;

          // Ensure numeric values
          const numericUnits = parseFloat(units) || 0;
          const numericAmount = parseFloat(amount) || 0;
          const numericPrice = parseFloat(price) || 0;

          if (orderType === MF_ORDER_TYPES.BUY || orderType === 1) {
            totalUnits += numericUnits;
            totalInvestment += numericAmount;
          } else if (orderType === MF_ORDER_TYPES.SELL || orderType === 2) {
            totalUnits -= numericUnits;
            totalInvestment -= numericAmount;
          }

          processedTransactions.push({
            orderType,
            date,
            price: numericPrice,
            units: numericUnits,
            amount: numericAmount,
          });

          // Update last transaction date safely
          try {
            if (
              !lastTransactionDate ||
              new Date(date) > new Date(lastTransactionDate)
            ) {
              lastTransactionDate = date;
            }
          } catch (dateError) {
            console.warn("Invalid date format:", date, dateError);
          }
        }

        const averagePrice = totalUnits > 0 ? totalInvestment / totalUnits : 0;

        return {
          schemeName: fund.schemeName,
          isin: fund.isin,
          folioId: fund.folioId,
          totalUnits,
          totalInvestment,
          averagePrice,
          lastTransactionDate,
          transactions: processedTransactions.sort((a, b) => {
            try {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            } catch (error) {
              console.warn("Date sorting error:", error);
              return 0;
            }
          }),
        };
      })
      .filter((fund) => fund && fund.totalUnits > 0); // Only show funds with positive holdings
  }, [mfData]);

  // Calculate portfolio summary
  const portfolioSummary = useMemo(() => {
    const totalInvestment = processedData.reduce(
      (sum, fund) => sum + fund.totalInvestment,
      0
    );
    const totalSchemes = processedData.length;
    const averageInvestmentPerScheme =
      totalSchemes > 0 ? totalInvestment / totalSchemes : 0;

    return {
      totalInvestment,
      totalSchemes,
      averageInvestmentPerScheme,
    };
  }, [processedData]);

  // Prepare data for charts
  const allocationData: SchemeAllocation[] = useMemo(() => {
    const totalInvestment = portfolioSummary.totalInvestment;
    if (totalInvestment === 0) return [];

    return processedData
      .map((fund) => ({
        name:
          fund.schemeName.length > 30
            ? fund.schemeName.substring(0, 30) + "..."
            : fund.schemeName,
        value: fund.totalInvestment,
        percentage: (fund.totalInvestment / totalInvestment) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [processedData, portfolioSummary.totalInvestment]);

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

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">
              Your mutual fund investments
            </p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Portfolio</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!processedData || processedData.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">
              Your mutual fund investments
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Investment Data</h3>
            <p className="text-muted-foreground text-center">
              No mutual fund transactions found. Your portfolio data will appear
              here once you have investments.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto  space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Your mutual fund investments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Investment
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {portfolioSummary.totalInvestment.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schemes</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioSummary.totalSchemes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Investment
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹
              {portfolioSummary.averageInvestmentPerScheme.toLocaleString(
                "en-IN",
                { maximumFractionDigits: 0 }
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Allocation Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>
                  Distribution across mutual fund schemes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ percentage }) => `${percentage.toFixed(1)}%`}>
                      {allocationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `₹${value.toLocaleString("en-IN")}`,
                        "Investment",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Investment Distribution Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
                <CardDescription>Investment amount by scheme</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={allocationData.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={10}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `₹${(value / 1000).toFixed(0)}K`
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `₹${value.toLocaleString("en-IN")}`,
                        "Investment",
                      ]}
                      labelFormatter={(label) => `Scheme: ${label}`}
                    />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Holdings</CardTitle>
              <CardDescription>Your mutual fund positions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scheme Name</TableHead>
                    <TableHead>Folio ID</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Investment</TableHead>
                    <TableHead className="text-right">Avg. Price</TableHead>
                    <TableHead>Last Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData.map((fund, index) => (
                    <TableRow key={`${fund.isin}-${fund.folioId}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{fund.schemeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {fund.isin}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{fund.folioId}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {fund.totalUnits.toLocaleString("en-IN", {
                          maximumFractionDigits: 3,
                        })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹
                        {fund.totalInvestment.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹
                        {fund.averagePrice.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(fund.lastTransactionDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {processedData.map((fund) => (
            <Card key={`${fund.isin}-${fund.folioId}`}>
              <CardHeader>
                <CardTitle className="text-lg">{fund.schemeName}</CardTitle>
                <CardDescription>
                  ISIN: {fund.isin} • Folio: {fund.folioId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fund.transactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.orderType === MF_ORDER_TYPES.BUY
                                ? "default"
                                : "destructive"
                            }>
                            {transaction.orderType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString(
                            "en-IN"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹
                          {transaction.price.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.units.toLocaleString("en-IN", {
                            maximumFractionDigits: 3,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹
                          {transaction.amount.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
