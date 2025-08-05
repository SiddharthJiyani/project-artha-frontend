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
  executiveSummary: z.string().describe('Comprehensive 4-5 paragraph overview of financial health with detailed metrics, trends, strengths, concerns, and trajectory analysis. Should be substantial and informative, minimum 300 words.'),
  
  strengths: z.string().describe('Extensive 3-4 paragraph analysis of key financial strengths, positive aspects, successful strategies, and areas of excellence. Include specific metrics and comparisons. Minimum 250 words.'),
  
  concerns: z.string().describe('Detailed 3-4 paragraph assessment of areas of concern, potential risks, vulnerabilities, and improvement areas. Be specific about issues and their implications. Minimum 250 words.'),
  
  opportunities: z.string().describe('Comprehensive 3-4 paragraph analysis of investment opportunities, growth strategies, optimization potential, and wealth-building prospects with specific recommendations. Minimum 250 words.'),
  
  detailedAnalysis: z.object({
    wealthBuilding: z.string().describe('Detailed 2-3 paragraph analysis of wealth building progress, strategies, and specific recommendations with timelines and expected outcomes. Minimum 200 words.'),
    riskManagement: z.string().describe('Comprehensive 2-3 paragraph risk assessment and management recommendations including insurance, diversification, and mitigation strategies. Minimum 200 words.'),
    taxOptimization: z.string().describe('Detailed 2-3 paragraph tax efficiency analysis and optimization opportunities with specific strategies and expected savings. Minimum 200 words.'),
    retirementPlanning: z.string().describe('Thorough 2-3 paragraph retirement readiness assessment with detailed projections, recommendations, and action steps. Minimum 200 words.')
  }),
  
  actionPlan: z.object({
    immediate: z.array(z.string()).describe('5-7 specific actions to take within 30 days with detailed implementation steps'),
    shortTerm: z.array(z.string()).describe('5-7 strategic goals for next 3-6 months with detailed implementation plans'),
    longTerm: z.array(z.string()).describe('5-7 strategic objectives for 1-3 years with comprehensive roadmaps')
  }),
  
  marketInsights: z.string().describe('Detailed 2-3 paragraph analysis of current market conditions, sector recommendations, and portfolio impact with specific investment suggestions. Minimum 200 words.'),
  
  keyMetrics: z.object({
    financialHealthScore: z.number().describe('Overall financial health score out of 100 with detailed explanation of scoring factors'),
    diversificationScore: z.number().describe('Portfolio diversification score out of 100 with analysis of current allocation'),
    goalProgressScore: z.number().describe('Progress towards financial goals out of 100 with specific assessments')
  }),
  
  personalizedTips: z.array(z.string()).describe('8-10 highly specific, actionable financial tips with implementation steps and expected benefits tailored to user profile'),
  
  redFlags: z.array(z.string()).describe('5-7 critical issues requiring immediate attention with specific remediation steps and timelines'),
  
  achievements: z.array(z.string()).describe('5-7 financial milestones and positive accomplishments with specific metrics and peer comparisons'),
  
  benchmarkComparison: z.string().describe('Detailed 2-3 paragraph comparison with peers in similar age/income bracket including specific metrics and percentile rankings. Minimum 200 words.'),
  
  confidenceLevel: z.string().describe('AI confidence level in the analysis with explanation of data quality and reliability factors')
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
  const maxRetries = 3;
  const models = ['googleai/gemini-2.0-flash', 'googleai/gemini-1.5-flash', 'googleai/gemini-1.5-pro'];
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const model of models) {
      try {
        console.log(`Attempt ${attempt + 1}/${maxRetries} with model: ${model}`);
        
        // Create a custom prompt with specific model
        const customPrompt = ai.definePrompt({
          name: `comprehensiveReportPrompt_${model.replace('googleai/', '').replace(/[.-]/g, '_')}_${Date.now()}`,
          input: { schema: ComprehensiveReportInputSchema },
          output: { schema: ComprehensiveReportOutputSchema },
          model: model,
          config: {
            maxOutputTokens: 8000, // Increase token limit for longer responses
            temperature: 0.7, // Balanced creativity and consistency
          },
          prompt: `You are Artha, an expert AI financial advisor with deep expertise in Indian financial markets and personal finance. 

Analyze the comprehensive financial data provided and generate a detailed, professional financial report. This should be a COMPREHENSIVE and DETAILED report, not a brief summary.

FINANCIAL DATA:
Net Worth: ₹{{{netWorthData.totalNetWorth}}} with {{{netWorthData.assetBreakdown.length}}} asset categories
Monthly Income: ₹{{{transactionData.averageMonthlyIncome}}}
Investment Portfolio: {{{investmentData.mutualFunds.length}}} mutual fund schemes, Risk Profile: {{{investmentData.riskProfile}}}
Credit Profile: Score {{{creditData.creditScore}}}, Utilization {{{creditData.creditUtilization}}}%
EPF Balance: ₹{{{epfData.totalBalance}}}
Emergency Fund Ratio: {{{personalFinanceMetrics.emergencyFundRatio}}}
Savings Rate: {{{personalFinanceMetrics.savingsRate}}}%
Debt-to-Income: {{{personalFinanceMetrics.debtToIncomeRatio}}}

Generate a COMPREHENSIVE and DETAILED financial report with extensive analysis. Each section should be thorough and informative:

1. EXECUTIVE SUMMARY: Write a detailed 4-5 paragraph overview covering financial health, key metrics, major strengths, primary concerns, and overall trajectory. Include specific numbers and percentages.

2. STRENGTHS: Provide an extensive analysis (3-4 paragraphs) of what's working well in their financial profile. Highlight positive metrics, good financial habits, successful investments, and areas where they excel compared to peers.

3. CONCERNS: Write a detailed assessment (3-4 paragraphs) of areas that need attention. Be specific about risks, missed opportunities, suboptimal allocations, and potential financial vulnerabilities.

4. OPPORTUNITIES: Comprehensive analysis (3-4 paragraphs) of growth and optimization opportunities. Include specific investment suggestions, tax optimization strategies, and wealth-building opportunities with expected returns.

5. DETAILED ANALYSIS: This should be the most comprehensive section with 4 detailed sub-sections:
   - WEALTH BUILDING: Detailed strategy analysis with specific recommendations, timelines, and expected outcomes (2-3 paragraphs)
   - RISK MANAGEMENT: Comprehensive risk assessment with specific mitigation strategies and insurance recommendations (2-3 paragraphs)
   - TAX OPTIMIZATION: Detailed tax efficiency analysis with specific strategies for tax savings and optimization (2-3 paragraphs)
   - RETIREMENT PLANNING: Thorough retirement readiness assessment with detailed projections and recommendations (2-3 paragraphs)

6. ACTION PLAN: Detailed action items with specific steps, timelines, and expected outcomes:
   - IMMEDIATE (next 30 days): 5-7 specific, actionable items with exact steps
   - SHORT-TERM (3-6 months): 5-7 strategic goals with detailed implementation plans
   - LONG-TERM (1-3 years): 5-7 strategic objectives with comprehensive roadmaps

7. MARKET INSIGHTS: Detailed analysis (2-3 paragraphs) of current market conditions, sector-specific recommendations, and their impact on the portfolio with specific investment suggestions.

8. KEY METRICS: Provide detailed scores with explanations:
   - Financial Health Score (0-100): Include detailed explanation of scoring factors
   - Diversification Score (0-100): Analyze current allocation and improvement areas
   - Goal Progress Score (0-100): Assess progress towards financial objectives

9. PERSONALIZED TIPS: Provide 8-10 highly specific, actionable tips tailored to their exact financial situation. Each tip should include implementation steps and expected benefits.

10. RED FLAGS: Identify 5-7 critical issues requiring immediate attention with specific remediation steps and timelines.

11. ACHIEVEMENTS: Recognize 5-7 financial milestones and positive accomplishments with specific metrics and comparisons.

12. BENCHMARK COMPARISON: Detailed comparison (2-3 paragraphs) with peers in similar age/income bracket, including specific metrics and percentile rankings.

IMPORTANT FORMATTING REQUIREMENTS:
- Use extensive markdown formatting for clarity and readability
- Include specific numbers, percentages, and rupee amounts throughout
- Make each section substantial and comprehensive - minimum 200-300 words per major section
- Use bullet points, tables, and structured formatting where appropriate
- Be specific about Indian financial products, tax implications, and market conditions
- Provide actionable, practical advice with clear implementation steps
- Include specific timeframes and expected outcomes for all recommendations

This should be a professional, comprehensive financial advisory report that provides significant value to the user. Do not provide brief summaries - each section should be detailed and informative.`
        });
        
        const { output } = await customPrompt(input);
        console.log(`Successfully generated report with model: ${model}`);
        return output!;
        
      } catch (error: any) {
        console.error(`Error with model ${model} on attempt ${attempt + 1}:`, error);
        
        // If it's a 503 error (overloaded), try the next model immediately
        if (error?.status === 503 || error?.message?.includes('overloaded')) {
          console.log(`Model ${model} is overloaded, trying next model...`);
          continue;
        }
        
        // For other errors, wait a bit before retrying
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }
  
  throw new Error("Comprehensive report generation failed after all retry attempts. All models are currently unavailable.");
}
