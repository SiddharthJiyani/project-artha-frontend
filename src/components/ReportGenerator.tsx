import React, { useState, useRef } from 'react';
import { mcpApiService } from '@/lib/mcp-api';
import { getFinancialSummary } from '@/ai/flows/financial-summary';
import { FinancialSummaryOutput } from '@/ai/flows/financial-summary';
import { generateComprehensiveReport } from '@/ai/flows/comprehensive-report';
import { ComprehensiveReportOutput } from '@/ai/flows/comprehensive-report';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { FileDown, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ReportData {
  comprehensiveReport: ComprehensiveReportOutput;
  basicSummary: FinancialSummaryOutput;
  rawData: {
    netWorth: any;
    epfDetails: any;
    creditReport: any;
    mfTransactions: any;
    stockTransactions: any;
    bankTransactions: any;
  };
  analytics: {
    totalNetWorth: number;
    assetBreakdown: any[];
    monthlyTransactions: any[];
    creditScore: number;
    investmentReturns: number;
    riskScore: number;
  };
}

const ReportGenerator: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiCalls = await Promise.allSettled([
        mcpApiService.fetchNetWorth(),
        mcpApiService.fetchEPFDetails(),
        mcpApiService.fetchCreditReport(),
        mcpApiService.fetchMFTransactions(),
        mcpApiService.fetchStockTransactions(),
        mcpApiService.fetchBankTransactions(),
      ]);
      
      const [netWorth, epfDetails, creditReport, mfTransactions, stockTransactions, bankTransactions] = apiCalls.map(
        (result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            console.error(`API call ${index} failed:`, result.reason);
            return null;
          }
        }
      );
      
      const rawData = {
        netWorth,
        epfDetails,
        creditReport,
        mfTransactions,
        stockTransactions,
        bankTransactions,
      };

      // Generate comprehensive report
      const comprehensiveReport = await generateComprehensiveReport(rawData);
      
      // Generate basic summary as fallback
      const basicSummary = await getFinancialSummary({
        netWorthResponse: netWorth,
        mfSchemeAnalytics: netWorth?.mfSchemeAnalytics,
        accountDetailsBulkResponse: netWorth?.accountDetailsBulkResponse,
      });

      // Process analytics
      const analytics = processAnalytics(rawData);

      setReportData({
        comprehensiveReport,
        basicSummary,
        rawData,
        analytics,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (rawData: any) => {
    const netWorthData = rawData.netWorth?.netWorthResponse;
    const totalNetWorth = parseFloat(netWorthData?.totalNetWorthValue?.units || '0');
    
    // Asset breakdown
    const assetBreakdown = netWorthData?.assetValues?.map((asset: any) => ({
      name: asset.netWorthAttribute.replace('ASSET_TYPE_', '').replace('LIABILITY_TYPE_', ''),
      value: parseFloat(asset.value.units || '0'),
      type: asset.netWorthAttribute.includes('LIABILITY') ? 'liability' : 'asset',
    })) || [];

    // Monthly transactions (mock data for demonstration)
    const monthlyTransactions = [
      { month: 'Jan', income: 85000, expenses: 45000, investments: 25000 },
      { month: 'Feb', income: 87000, expenses: 42000, investments: 30000 },
      { month: 'Mar', income: 82000, expenses: 48000, investments: 20000 },
      { month: 'Apr', income: 89000, expenses: 44000, investments: 35000 },
      { month: 'May', income: 91000, expenses: 46000, investments: 32000 },
      { month: 'Jun', income: 88000, expenses: 43000, investments: 28000 },
    ];

    // Credit score calculation (mock)
    const creditScore = rawData.creditReport?.creditReports?.[0]?.creditReportData?.score?.bureauScore 
      ? parseInt(rawData.creditReport.creditReports[0].creditReportData.score.bureauScore) 
      : 750;

    // Investment returns calculation
    const mfSchemes = rawData.netWorth?.mfSchemeAnalytics?.schemeAnalytics || [];
    const totalXIRR = mfSchemes.reduce((sum: number, scheme: any) => {
      const xirr = scheme.enrichedAnalytics?.analytics?.schemeDetails?.XIRR || 0;
      return sum + xirr;
    }, 0);
    const investmentReturns = mfSchemes.length > 0 ? totalXIRR / mfSchemes.length : 0;

    // Risk score (0-100)
    const equityAllocation = assetBreakdown
      .filter(asset => asset.name.includes('MUTUAL_FUND') || asset.name.includes('SECURITIES'))
      .reduce((sum, asset) => sum + asset.value, 0);
    const riskScore = Math.min(100, (equityAllocation / totalNetWorth) * 100);

    return {
      totalNetWorth,
      assetBreakdown,
      monthlyTransactions,
      creditScore,
      investmentReturns,
      riskScore,
    };
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const today = new Date().toLocaleDateString('en-IN');
      pdf.save(`Financial-Report-${today}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
  };

  const getAssetAllocationChartData = () => {
    if (!reportData?.analytics.assetBreakdown) return null;
    
    const assets = reportData.analytics.assetBreakdown.filter(item => item.type === 'asset' && item.value > 0);
    
    return {
      labels: assets.map(asset => asset.name.replace('_', ' ')),
      datasets: [{
        data: assets.map(asset => asset.value / 100000), // Convert to lakhs
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        borderWidth: 2,
      }],
    };
  };

  const getMonthlyTransactionChartData = () => {
    if (!reportData?.analytics.monthlyTransactions) return null;
    
    return {
      labels: reportData.analytics.monthlyTransactions.map(item => item.month),
      datasets: [
        {
          label: 'Income',
          data: reportData.analytics.monthlyTransactions.map(item => item.income / 1000),
          backgroundColor: '#4BC0C0',
          borderColor: '#4BC0C0',
          borderWidth: 2,
        },
        {
          label: 'Expenses',
          data: reportData.analytics.monthlyTransactions.map(item => item.expenses / 1000),
          backgroundColor: '#FF6384',
          borderColor: '#FF6384',
          borderWidth: 2,
        },
        {
          label: 'Investments',
          data: reportData.analytics.monthlyTransactions.map(item => item.investments / 1000),
          backgroundColor: '#36A2EB',
          borderColor: '#36A2EB',
          borderWidth: 2,
        },
      ],
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comprehensive Financial Report</h1>
          <p className="text-gray-600 mt-2">AI-powered insights and analysis of your complete financial profile</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={fetchData} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating Report...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
          
          {reportData && (
            <Button 
              onClick={generatePDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {reportData && (
        <div ref={reportRef} className="bg-white">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-lg">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-2">Financial Health Report</h1>
              <p className="text-xl opacity-90">Comprehensive Analysis & AI-Powered Insights</p>
              <p className="text-sm opacity-75 mt-2">Generated on {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Executive Summary
                </CardTitle>
                <CardDescription>
                  AI-powered analysis of your complete financial profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{(reportData.analytics.totalNetWorth / 100000).toFixed(1)}L
                    </div>
                    <div className="text-sm text-gray-600">Net Worth</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {reportData.analytics.creditScore}
                    </div>
                    <div className="text-sm text-gray-600">Credit Score</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {reportData.analytics.investmentReturns.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Returns</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {reportData.analytics.riskScore.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">Risk Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>Distribution of your investments and assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {getAssetAllocationChartData() && (
                      <Doughnut 
                        data={getAssetAllocationChartData()!} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Cash Flow */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Cash Flow Trend</CardTitle>
                  <CardDescription>Income, expenses, and investment patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {getMonthlyTransactionChartData() && (
                      <Bar 
                        data={getMonthlyTransactionChartData()!} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Amount (₹ thousands)',
                              },
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Executive Summary Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {reportData.comprehensiveReport.executiveSummary}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {reportData.comprehensiveReport.keyMetrics.financialHealthScore}/100
                    </div>
                    <div className="text-sm text-gray-600">Financial Health Score</div>
                    <Progress value={reportData.comprehensiveReport.keyMetrics.financialHealthScore} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {reportData.comprehensiveReport.keyMetrics.diversificationScore}/100
                    </div>
                    <div className="text-sm text-gray-600">Diversification Score</div>
                    <Progress value={reportData.comprehensiveReport.keyMetrics.diversificationScore} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {reportData.comprehensiveReport.keyMetrics.goalProgressScore}/100
                    </div>
                    <div className="text-sm text-gray-600">Goal Progress Score</div>
                    <Progress value={reportData.comprehensiveReport.keyMetrics.goalProgressScore} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strengths and Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Financial Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reportData.comprehensiveReport.strengths}
                    </ReactMarkdown>
                  </div>
                  
                  {reportData.comprehensiveReport.achievements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-green-700 mb-2">🏆 Recent Achievements</h4>
                      <ul className="space-y-1">
                        {reportData.comprehensiveReport.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Areas of Concern
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reportData.comprehensiveReport.concerns}
                    </ReactMarkdown>
                  </div>
                  
                  {reportData.comprehensiveReport.redFlags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-red-700 mb-2">🚨 Critical Issues</h4>
                      <ul className="space-y-1">
                        {reportData.comprehensiveReport.redFlags.map((flag, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <div className="space-y-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>💰 Wealth Building Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reportData.comprehensiveReport.detailedAnalysis.wealthBuilding}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🛡️ Risk Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reportData.comprehensiveReport.detailedAnalysis.riskManagement}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Tax Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reportData.comprehensiveReport.detailedAnalysis.taxOptimization}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🏖️ Retirement Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reportData.comprehensiveReport.detailedAnalysis.retirementPlanning}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Plan */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3">🚀 Immediate (30 days)</h4>
                    <ul className="space-y-2">
                      {reportData.comprehensiveReport.actionPlan.immediate.map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-3">📈 Short-term (3-6 months)</h4>
                    <ul className="space-y-2">
                      {reportData.comprehensiveReport.actionPlan.shortTerm.map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">🎯 Long-term (1-3 years)</h4>
                    <ul className="space-y-2">
                      {reportData.comprehensiveReport.actionPlan.longTerm.map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personalized Tips */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>💡 Personalized Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportData.comprehensiveReport.personalizedTips.map((tip, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="text-sm">{tip}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Insights and Benchmark */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>📈 Market Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reportData.comprehensiveReport.marketInsights}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Peer Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reportData.comprehensiveReport.benchmarkComparison}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Opportunities */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Growth Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {reportData.comprehensiveReport.opportunities}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Confidence & Disclaimer */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Badge variant="secondary">AI Confidence: {reportData.comprehensiveReport.confidenceLevel}</Badge>
                  <p className="text-sm text-gray-600">
                    This report is generated using AI analysis of your financial data. 
                    Please consult with a qualified financial advisor for personalized advice.
                  </p>
                  <p className="text-xs text-gray-500">
                    Report generated on {new Date().toLocaleString('en-IN')} • 
                    Data processed securely using end-to-end encryption
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
