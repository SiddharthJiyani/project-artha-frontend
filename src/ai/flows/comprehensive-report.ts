// src/ai/flows/comprehensive-report.ts
'use server';

/**
 * @fileOverview Comprehensive financial report generation with AI insights
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Comprehensive input schema for report generation
const ComprehensiveReportInputSchema = z.object({
  netWorthData: z.object({
    totalNetWorth: z.number(),
    assetBreakdown: z.array(z.object({
      name: z.string(),
      value: z.number(),
      percentage: z.number()
    })),
    monthOverMonthGrowth: z.number().optional()
  }),
  
  transactionData: z.object({
    bankTransactions: z.array(z.any()).optional(),
    monthlySpending: z.number().optional(),
    topExpenseCategories: z.array(z.string()).optional(),
    averageMonthlyIncome: z.number().optional()
  }),
  
  investmentData: z.object({
    mutualFunds: z.array(z.object({
      schemeName: z.string(),
      currentValue: z.number(),
      investedValue: z.number(),
      returns: z.number(),
      xirr: z.number().optional()
    })).optional(),
    stockHoldings: z.array(z.any()).optional(),
    totalInvestmentReturns: z.number(),
    riskProfile: z.string()
  }),
  
  creditData: z.object({
    creditScore: z.number().optional(),
    creditUtilization: z.number().optional(),
    creditHistory: z.string().optional(),
    totalDebt: z.number().optional()
  }),
  
  epfData: z.object({
    totalBalance: z.number().optional(),
    monthlyContribution: z.number().optional(),
    projectedRetirementCorpus: z.number().optional()
  }),
  
  personalFinanceMetrics: z.object({
    emergencyFundRatio: z.number(),
    savingsRate: z.number(),
    debtToIncomeRatio: z.number(),
    investmentToIncomeRatio: z.number()
  })
});

export type ComprehensiveReportInput = z.infer<typeof ComprehensiveReportInputSchema>;

// Comprehensive output schema with detailed sections
const ComprehensiveReportOutputSchema = z.object({
  executiveSummary: z.string().describe('High-level overview of financial health with key metrics and trends'),
  
  strengths: z.string().describe('Key financial strengths and positive aspects'),
  
  concerns: z.string().describe('Areas of concern and potential risks'),
  
  opportunities: z.string().describe('Investment and financial growth opportunities'),
  
  detailedAnalysis: z.object({
    wealthBuilding: z.string().describe('Analysis of wealth building progress and strategies'),
    riskManagement: z.string().describe('Risk assessment and management recommendations'),
    taxOptimization: z.string().describe('Tax efficiency and optimization opportunities'),
    retirementPlanning: z.string().describe('Retirement readiness and planning recommendations')
  }),
  
  actionPlan: z.object({
    immediate: z.array(z.string()).describe('Actions to take within 30 days'),
    shortTerm: z.array(z.string()).describe('Goals for next 3-6 months'),
    longTerm: z.array(z.string()).describe('Strategic goals for 1-3 years')
  }),
  
  marketInsights: z.string().describe('Current market conditions and their impact on portfolio'),
  
  keyMetrics: z.object({
    financialHealthScore: z.number().describe('Overall financial health score out of 100'),
    diversificationScore: z.number().describe('Portfolio diversification score out of 100'),
    goalProgressScore: z.number().describe('Progress towards financial goals out of 100')
  }),
  
  personalizedTips: z.array(z.string()).describe('Personalized financial tips based on user profile'),
  
  redFlags: z.array(z.string()).describe('Critical issues requiring immediate attention'),
  
  achievements: z.array(z.string()).describe('Financial milestones and positive achievements'),
  
  benchmarkComparison: z.string().describe('How user compares to peers in similar age/income bracket'),
  
  confidenceLevel: z.string().describe('AI confidence level in the analysis')
});

export type ComprehensiveReportOutput = z.infer<typeof ComprehensiveReportOutputSchema>;

// Transform raw API data into structured input
export async function transformToReportInput(rawData: any): Promise<ComprehensiveReportInput> {
  const netWorthData = rawData.netWorth?.netWorthResponse;
  const bankData = rawData.bankTransactions;
  const mfData = rawData.netWorth?.mfSchemeAnalytics?.schemeAnalytics || [];
  const creditData = rawData.creditReport?.creditReports?.[0]?.creditReportData;
  const epfData = rawData.epfDetails?.uanAccounts?.[0]?.rawDetails;
  
  // Calculate total net worth
  const totalNetWorth = parseFloat(netWorthData?.totalNetWorthValue?.units || '0');
  
  // Asset breakdown
  const assetBreakdown = netWorthData?.assetValues?.map((asset: any) => ({
    name: asset.netWorthAttribute,
    value: parseFloat(asset.value.units || '0'),
    percentage: totalNetWorth > 0 ? (parseFloat(asset.value.units || '0') / totalNetWorth) * 100 : 0
  })) || [];
  
  // Investment analysis
  const mutualFunds = mfData.map((scheme: any) => {
    const analytics = scheme.enrichedAnalytics?.analytics?.schemeDetails;
    return {
      schemeName: scheme.schemeDetail?.nameData?.longName || 'Unknown',
      currentValue: parseFloat(analytics?.currentValue?.units || '0'),
      investedValue: parseFloat(analytics?.investedValue?.units || '0'),
      returns: parseFloat(analytics?.unrealisedReturns?.units || '0'),
      xirr: analytics?.XIRR || 0
    };
  });
  
  const totalInvestmentReturns = mutualFunds.reduce((sum, mf) => sum + mf.returns, 0);
  
  // Credit analysis
  const creditScore = creditData?.score?.bureauScore ? parseInt(creditData.score.bureauScore) : undefined;
  const totalDebt = creditData?.creditAccount?.creditAccountSummary?.totalOutstandingBalance?.outstandingBalanceAll
    ? parseFloat(creditData.creditAccount.creditAccountSummary.totalOutstandingBalance.outstandingBalanceAll)
    : undefined;
  
  // EPF analysis
  const epfBalance = epfData?.overall_pf_balance?.current_pf_balance 
    ? parseFloat(epfData.overall_pf_balance.current_pf_balance) 
    : undefined;
  
  // Calculate personal finance metrics
  const liquidAssets = assetBreakdown
    .filter(asset => asset.name.includes('SAVINGS') || asset.name.includes('DEPOSITS'))
    .reduce((sum, asset) => sum + asset.value, 0);
  
  const estimatedMonthlyIncome = totalNetWorth > 0 ? totalNetWorth * 0.02 / 12 : 50000; // Estimate
  const emergencyFundRatio = liquidAssets / (estimatedMonthlyIncome * 6);
  const savingsRate = totalNetWorth > 0 ? 0.25 : 0.15; // Estimate
  const debtToIncomeRatio = totalDebt ? totalDebt / (estimatedMonthlyIncome * 12) : 0;
  const totalInvestments = assetBreakdown
    .filter(asset => asset.name.includes('MUTUAL_FUND') || asset.name.includes('SECURITIES'))
    .reduce((sum, asset) => sum + asset.value, 0);
  const investmentToIncomeRatio = totalInvestments / (estimatedMonthlyIncome * 12);
  
  return {
    netWorthData: {
      totalNetWorth,
      assetBreakdown,
      monthOverMonthGrowth: 5.2 // Mock data
    },
    
    transactionData: {
      bankTransactions: bankData?.bankTransactions || [],
      monthlySpending: estimatedMonthlyIncome * 0.6,
      topExpenseCategories: ['Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities'],
      averageMonthlyIncome: estimatedMonthlyIncome
    },
    
    investmentData: {
      mutualFunds,
      stockHoldings: rawData.stockTransactions?.stockTransactions || [],
      totalInvestmentReturns,
      riskProfile: totalInvestments > totalNetWorth * 0.7 ? 'Aggressive' : 
                   totalInvestments > totalNetWorth * 0.4 ? 'Moderate' : 'Conservative'
    },
    
    creditData: {
      creditScore,
      creditUtilization: creditScore ? (creditScore > 750 ? 25 : 45) : undefined,
      creditHistory: creditScore ? (creditScore > 750 ? 'Excellent' : creditScore > 650 ? 'Good' : 'Fair') : undefined,
      totalDebt
    },
    
    epfData: {
      totalBalance: epfBalance,
      monthlyContribution: epfBalance ? epfBalance * 0.01 : undefined,
      projectedRetirementCorpus: epfBalance ? epfBalance * 8 : undefined
    },
    
    personalFinanceMetrics: {
      emergencyFundRatio,
      savingsRate,
      debtToIncomeRatio,
      investmentToIncomeRatio
    }
  };
}

// Main report generation flow
export async function generateComprehensiveReport(rawData: any): Promise<ComprehensiveReportOutput> {
  const transformedInput = await transformToReportInput(rawData);
  return comprehensiveReportFlow(transformedInput);
}

const comprehensiveReportPrompt = ai.definePrompt({
  name: 'comprehensiveReportPrompt',
  input: { schema: ComprehensiveReportInputSchema },
  output: { schema: ComprehensiveReportOutputSchema },
  prompt: `You are Artha, an expert AI financial advisor with deep expertise in Indian financial markets and personal finance. 

Analyze the comprehensive financial data provided and generate a detailed, professional financial report.

FINANCIAL DATA:
Net Worth: ₹{{{netWorthData.totalNetWorth}}} with {{{netWorthData.assetBreakdown.length}}} asset categories
Monthly Income: ₹{{{transactionData.averageMonthlyIncome}}}
Investment Portfolio: {{{investmentData.mutualFunds.length}}} mutual fund schemes, Risk Profile: {{{investmentData.riskProfile}}}
Credit Profile: Score {{{creditData.creditScore}}}, Utilization {{{creditData.creditUtilization}}}%
EPF Balance: ₹{{{epfData.totalBalance}}}
Emergency Fund Ratio: {{{personalFinanceMetrics.emergencyFundRatio}}}
Savings Rate: {{{personalFinanceMetrics.savingsRate}}}%
Debt-to-Income: {{{personalFinanceMetrics.debtToIncomeRatio}}}

Generate a comprehensive report with:

1. EXECUTIVE SUMMARY: Brief overview with key metrics and overall assessment
2. STRENGTHS: What's working well in their financial profile
3. CONCERNS: Areas that need attention or improvement
4. OPPORTUNITIES: Growth and optimization opportunities
5. DETAILED ANALYSIS: Deep dive into wealth building, risk management, tax optimization, and retirement planning
6. ACTION PLAN: Immediate, short-term, and long-term action items
7. MARKET INSIGHTS: Current market context and portfolio impact
8. KEY METRICS: Financial health, diversification, and goal progress scores (0-100)
9. PERSONALIZED TIPS: 5-7 specific, actionable tips
10. RED FLAGS: Critical issues requiring immediate attention
11. ACHIEVEMENTS: Positive milestones and accomplishments
12. BENCHMARK COMPARISON: How they compare to peers

Use Indian financial context, INR currency, and current market conditions. Be specific with numbers, percentages, and timeframes. Provide actionable, practical advice.

Format everything in clear, professional markdown that's easy to read and understand.`
});

async function comprehensiveReportFlow(input: ComprehensiveReportInput): Promise<ComprehensiveReportOutput> {
  try {
    const { output } = await comprehensiveReportPrompt(input);
    return output!;
  } catch (error) {
    console.error("Error in comprehensiveReportFlow:", error);
    throw new Error("Comprehensive report generation failed.");
  }
}
