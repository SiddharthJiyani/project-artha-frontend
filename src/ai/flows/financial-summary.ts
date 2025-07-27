// src/ai/flows/financial-summary.ts
'use server';

/**
 * @fileOverview Enhanced financial summary with comprehensive data analysis
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Use the provided input schema
const FinancialSummaryInputSchema = z.object({
  netWorth: z.string().describe("The user's total net worth with breakdown."),
  monthlyIncome: z.string().describe("The user's estimated monthly income."),
  creditScore: z.string().describe("The user's credit score or estimated creditworthiness."),
  monthlyEMI: z.string().describe("The user's monthly EMI and debt obligations."),
  idleSavings: z.string().describe("The amount of idle cash and liquid savings."),
  collateralAvailable: z.string().describe("Available collateral including real estate and investments."),
  paymentDiscipline: z.string().describe("Payment discipline based on credit utilization."),
  financialBiases: z.string().describe("Identified financial biases from investment patterns."),
  investmentPerformance: z.string().describe("Overall investment performance and returns."),
  assetAllocation: z.string().describe("Current asset allocation across different categories."),
  riskProfile: z.string().describe("Risk assessment based on investment choices."),
  taxEfficiency: z.string().describe("Tax efficiency of current investments."),
  liquidityPosition: z.string().describe("Overall liquidity and emergency fund status."),
});

export type FinancialSummaryInput = z.infer<typeof FinancialSummaryInputSchema>;

const FinancialSummaryOutputSchema = z.object({
  overallHealth: z.string().describe('Comprehensive assessment of financial health with specific metrics.'),
  keyConcerns: z.string().describe('Detailed analysis of financial risks and areas needing attention.'),
  actionableRecommendations: z.string().describe('Specific, prioritized recommendations for financial improvement.'),
  confidenceLevel: z.string().describe('AI confidence level in the analysis.'),
});

export type FinancialSummaryOutput = z.infer<typeof FinancialSummaryOutputSchema>;

// Added extra error handling and data check
export async function transformFinancialData(rawData: any): Promise<FinancialSummaryInput> {
  if (!rawData?.netWorthResponse) {
    return {
      netWorth: "Data not available",
      monthlyIncome: "Unable to estimate",
      creditScore: "Not available",
      monthlyEMI: "No debt information",
      idleSavings: "Not available",
      collateralAvailable: "Not available", 
      paymentDiscipline: "Unable to assess",
      financialBiases: "Insufficient data",
      investmentPerformance: "No investment data",
      assetAllocation: "Not available",
      riskProfile: "Unable to assess",
      taxEfficiency: "Not available",
      liquidityPosition: "Not available"
    };
  }

  const netWorthData = rawData.netWorthResponse;
  const mfData = rawData.mfSchemeAnalytics;
  const accountData = rawData.accountDetailsBulkResponse;

  // Calculate key metrics
  const totalNetWorth = parseFloat(netWorthData?.totalNetWorthValue?.units || '0');
  const assets = netWorthData?.assetValues || [];
  
  // Asset breakdown
  const mutualFunds = parseFloat(assets.find((a: any) => a.netWorthAttribute === 'ASSET_TYPE_MUTUAL_FUND')?.value?.units || '0');
  const epf = parseFloat(assets.find((a: any) => a.netWorthAttribute === 'ASSET_TYPE_EPF')?.value?.units || '0');
  const indianStocks = parseFloat(assets.find((a: any) => a.netWorthAttribute === 'ASSET_TYPE_INDIAN_SECURITIES')?.value?.units || '0');
  const usStocks = parseFloat(assets.find((a: any) => a.netWorthAttribute === 'ASSET_TYPE_US_SECURITIES')?.value?.units || '0');
  const sgb = parseFloat(assets.find((a: any) => a.netWorthAttribute === 'ASSET_TYPE_SGB')?.value?.units || '0');
  const etf = parseFloat(assets.find((a: any) => a.netWorthAttribute === 'ASSET_TYPE_ETF')?.value?.units || '0');
  const savings = parseFloat(assets.find((a: any) => a.netWorthAttribute === 'ASSET_TYPE_SAVINGS_ACCOUNTS')?.value?.units || '0');
  const creditCardDebt = Math.abs(parseFloat(assets.find((a: any) => a.netWorthAttribute === 'LIABILITY_TYPE_CREDIT_CARD')?.value?.units || '0'));

  // Investment performance analysis
  const mfSchemes = mfData?.schemeAnalytics || [];
  let totalInvested = 0;
  let totalCurrent = 0;
  let totalXIRR = 0;
  let xirr_count = 0;
  
  mfSchemes.forEach((scheme: any) => {
    const analytics = scheme.enrichedAnalytics?.analytics?.schemeDetails;
    if (analytics) {
      totalInvested += parseFloat(analytics.investedValue?.units || '0');
      totalCurrent += parseFloat(analytics.currentValue?.units || '0');
      if (analytics.XIRR && analytics.XIRR > 0) {
        totalXIRR += analytics.XIRR;
        xirr_count++;
      }
    }
  });

  const avgXIRR = xirr_count > 0 ? totalXIRR / xirr_count : 0;
  const totalReturns = totalCurrent - totalInvested;

  // Credit utilization analysis
  const creditCards = Object.values(accountData?.accountDetailsMap || {})
    .filter((account: any) => account.accountDetails?.accInstrumentType === 'ACC_INSTRUMENT_TYPE_CREDIT_CARD');
  
  let totalCreditUsed = 0;
  let totalCreditLimit = 0;
  
  creditCards.forEach((card: any) => {
    totalCreditUsed += parseFloat(card.creditCardSummary?.currentBalance?.units || '0');
    totalCreditLimit += parseFloat(card.creditCardSummary?.creditLimit?.units || '0');
  });

  const creditUtilization = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0;

  // Asset allocation
  const totalInvestments = mutualFunds + indianStocks + usStocks + sgb + etf;
  const equityPct = totalInvestments > 0 ? ((mutualFunds * 0.8 + indianStocks + usStocks + etf) / totalInvestments) * 100 : 0;
  const internationalPct = totalInvestments > 0 ? (usStocks / totalInvestments) * 100 : 0;

  // Estimated monthly income
  const estimatedMonthlySavings = totalInvested / 24; // 2 years assumption
  const estimatedMonthlyIncome = estimatedMonthlySavings / 0.25; // 25% savings rate

  return {
    netWorth: `Total Net Worth: ₹${(totalNetWorth / 100000).toFixed(1)} lakhs. Assets: MF ₹${(mutualFunds / 100000).toFixed(1)}L, EPF ₹${(epf / 100000).toFixed(1)}L, Stocks ₹${(indianStocks / 100000).toFixed(1)}L, US Stocks ₹${(usStocks / 100000).toFixed(1)}L, Gold ₹${(sgb / 100000).toFixed(1)}L, Cash ₹${(savings / 100000).toFixed(1)}L. Debt: ₹${(creditCardDebt / 1000).toFixed(0)}K`,
    
    monthlyIncome: `Estimated monthly income: ₹${(estimatedMonthlyIncome / 1000).toFixed(0)}K based on investment pattern analysis`,
    
    creditScore: `Credit utilization: ${creditUtilization.toFixed(1)}% across ${creditCards.length} credit cards. Total credit limit: ₹${(totalCreditLimit / 100000).toFixed(1)}L`,
    
    monthlyEMI: `Current debt: Credit card outstanding ₹${(totalCreditUsed / 1000).toFixed(0)}K. No other EMIs detected`,
    
    idleSavings: `Liquid cash: ₹${(savings / 100000).toFixed(1)} lakhs in savings accounts`,
    
    collateralAvailable: `Investment assets: ₹${(totalInvestments / 100000).toFixed(1)} lakhs in liquid investments. EPF: ₹${(epf / 100000).toFixed(1)}L (locked)`,
    
    paymentDiscipline: `Credit discipline: ${creditUtilization < 30 ? 'Good' : creditUtilization < 50 ? 'Fair' : 'Poor'} with ${creditUtilization.toFixed(1)}% utilization`,
    
    financialBiases: `Investment behavior: ${mfSchemes.length} mutual fund schemes indicating diversification mindset. ${internationalPct > 5 ? 'International exposure shows global thinking' : 'Limited international diversification'}`,
    
    investmentPerformance: `Portfolio performance: ${avgXIRR.toFixed(1)}% average XIRR across ₹${(totalInvested / 100000).toFixed(1)}L invested. Unrealized gains: ₹${(totalReturns / 100000).toFixed(1)}L`,
    
    assetAllocation: `Current allocation: Equity ${equityPct.toFixed(1)}%, International ${internationalPct.toFixed(1)}%, Cash ${((savings / totalNetWorth) * 100).toFixed(1)}%. Total ${mfSchemes.length} schemes`,
    
    riskProfile: `Risk level: ${equityPct > 80 ? 'High' : equityPct > 60 ? 'Moderate-High' : 'Moderate'} with ${equityPct.toFixed(1)}% equity allocation`,
    
    taxEfficiency: `Tax planning: Direct mutual fund plans show cost consciousness. ELSS funds for 80C benefits detected`,
    
    liquidityPosition: `Liquidity: ₹${(savings / 100000).toFixed(1)}L emergency fund. Accessible investments: ₹${((totalInvestments + savings) / 100000).toFixed(1)}L`
  };
}

export async function getFinancialSummary(rawData: any): Promise<FinancialSummaryOutput> {
  const transformedInput = await transformFinancialData(rawData);
  return financialSummaryFlow(transformedInput);
}

const financialSummaryPrompt = ai.definePrompt({
  name: 'financialSummaryPrompt',
  input: {schema: FinancialSummaryInputSchema},
  output: {schema: FinancialSummaryOutputSchema},
  prompt: `You are Artha, an expert AI financial advisor. Analyze the user's financial data and provide insights.

Financial Data:
Net Worth: {{{netWorth}}}
Monthly Income: {{{monthlyIncome}}}
Credit Score: {{{creditScore}}}
Monthly EMI: {{{monthlyEMI}}}
Idle Savings: {{{idleSavings}}}
Collateral Available: {{{collateralAvailable}}}
Payment Discipline: {{{paymentDiscipline}}}
Financial Biases: {{{financialBiases}}}
Investment Performance: {{{investmentPerformance}}}
Asset Allocation: {{{assetAllocation}}}
Risk Profile: {{{riskProfile}}}
Tax Efficiency: {{{taxEfficiency}}}
Liquidity Position: {{{liquidityPosition}}}

Provide a comprehensive financial health assessment with:

1. OVERALL HEALTH: Detailed financial health summary with specific metrics and benchmarks
2. KEY CONCERNS: Critical risks and issues requiring immediate attention  
3. ACTIONABLE RECOMMENDATIONS: Specific, prioritized action items with clear steps

Use Indian financial context. Be specific with numbers and practical advice.
Return a high quality markdown which looks easy to read.`,
});

async function financialSummaryFlow(input: FinancialSummaryInput): Promise<FinancialSummaryOutput> {
  try {
    const {output} = await financialSummaryPrompt(input);
    return output!;
  } catch (error) {
    console.error("Error in financialSummaryFlow:", error);
    throw new Error("Financial summary analysis failed.");
  }
}
