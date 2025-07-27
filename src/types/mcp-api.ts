// src/types/mcp-api.ts

export interface BankTransaction {
  transactionAmount: string;
  transactionNarration: string;
  transactionDate: string;
  transactionType: number;
  transactionMode: string;
  currentBalance: string;
}

export interface BankTransactionsData {
  bank: string;
  txns: [string, string, string, number, string, string][];
}

export interface BankTransactionsResponse {
  schemaDescription: string;
  bankTransactions: BankTransactionsData[];
}

export interface AssetValue {
  netWorthAttribute: string;
  value: {
    currencyCode: string;
    units: string;
  };
}

export interface MutualFundScheme {
  schemeDetail: {
    amc: string;
    nameData: {
      longName: string;
    };
    planType: string;
    investmentType: string;
    optionType: string;
    nav: {
      currencyCode: string;
      units: string;
    };
    assetClass: string;
    isinNumber: string;
    categoryName: string;
  };
  enrichedAnalytics: {
    analytics: {
      schemeDetails: {
        currentValue: {
          currencyCode: string;
          units: string;
        };
        investedValue: {
          currencyCode: string;
          units: string;
        };
        XIRR: number;
        unrealisedReturns: {
          currencyCode: string;
          units: string;
        };
        units: number;
      };
    };
  };
}

export interface AccountDetail {
  accountDetails: {
    fipId: string;
    maskedAccountNumber: string;
    accInstrumentType: string;
  };
  mutualFundSummary?: {
    currentValue: { currencyCode: string; units: string };
    holdingsInfo: { isin: string; folioNumber: string }[];
  };
  epfSummary?: {
    currentBalance: { currencyCode: string; units: string };
    accountStatus: string;
  };
  depositSummary?: {
    currentBalance: { currencyCode: string; units: string };
    depositAccountType: string;
  };
  loanSummary?: {
    currentOutstanding: { currencyCode: string; units: string };
    loanType: string;
    loanStatus: string;
  };
  creditCardSummary?: {
    currentBalance: { currencyCode: string; units: string };
    creditLimit: { currencyCode: string; units: string };
  };
}

export interface NetWorthResponse {
  netWorthResponse: {
    assetValues: AssetValue[];
    totalNetWorthValue: {
      currencyCode: string;
      units: string;
    };
  };
  mfSchemeAnalytics: {
    schemeAnalytics: MutualFundScheme[];
  };
  accountDetailsBulkResponse: {
    accountDetailsMap: Record<string, AccountDetail>;
  };
}

export interface MCPApiResponse<T> {
  jsonrpc: string;
  id: number;
  result: {
    content: Array<{
      type: string;
      text: string;
    }>;
  };
}

// Transaction type constants
export const TRANSACTION_TYPES = {
  1: 'CREDIT',
  2: 'DEBIT', 
  3: 'OPENING',
  4: 'INTEREST',
  5: 'TDS',
  6: 'INSTALLMENT',
  7: 'CLOSING',
  8: 'OTHERS'
} as const;

// EPF Details Types
export interface EPFEstablishment {
  est_name: string;
  member_id: string;
  office: string;
  doj_epf: string;
  doe_epf: string;
  doe_eps: string;
  pf_balance: {
    net_balance: string;
    employee_share: {
      credit: string;
      balance?: string;
    };
    employer_share: {
      credit: string;
      balance?: string;
    };
  };
}

export interface EPFOverallBalance {
  pension_balance: string;
  current_pf_balance: string;
  employee_share_total: {
    credit: string;
    balance: string;
  };
}

export interface EPFUANAccount {
  phoneNumber: Record<string, any>;
  rawDetails: {
    est_details: EPFEstablishment[];
    overall_pf_balance: EPFOverallBalance;
  };
}

export interface EPFDetailsResponse {
  uanAccounts: EPFUANAccount[];
}

// Credit Report Types
export interface CreditAccountDetail {
  subscriberName: string;
  portfolioType: string;
  accountType: string;
  openDate: string;
  highestCreditOrOriginalLoanAmount: string;
  creditLimitAmount?: string;
  accountStatus: string;
  paymentRating: string;
  paymentHistoryProfile: string;
  currentBalance: string;
  amountPastDue: string;
  dateReported: string;
  occupationCode: string;
  rateOfInterest?: string;
  repaymentTenure: string;
  dateOfAddition: string;
  currencyCode: string;
  accountHolderTypeCode: string;
}

export interface CreditAccountSummary {
  account: {
    creditAccountTotal: string;
    creditAccountActive: string;
    creditAccountDefault: string;
    creditAccountClosed: string;
    cadSuitFiledCurrentBalance: string;
  };
  totalOutstandingBalance: {
    outstandingBalanceSecured: string;
    outstandingBalanceSecuredPercentage: string;
    outstandingBalanceUnSecured: string;
    outstandingBalanceUnSecuredPercentage: string;
    outstandingBalanceAll: string;
  };
}

export interface CapsApplicationDetail {
  SubscriberName: string;
  DateOfRequest?: string;
  EnquiryReason?: string;
  FinancePurpose: string;
  capsApplicantDetails?: any;
  capsOtherDetails?: any;
  capsApplicantAddressDetails?: any;
  capsApplicantAdditionalAddressDetails?: any;
}

export interface CreditReportData {
  userMessage: {
    userMessageText: string;
  };
  creditProfileHeader: {
    reportDate: string;
    reportTime: string;
  };
  currentApplication: {
    currentApplicationDetails: {
      enquiryReason: string;
      amountFinanced: string;
      durationOfAgreement: string;
      currentApplicantDetails: {
        dateOfBirthApplicant: string;
      };
    };
  };
  creditAccount: {
    creditAccountSummary: CreditAccountSummary;
    creditAccountDetails: CreditAccountDetail[];
  };
  matchResult: {
    exactMatch: string;
  };
  totalCapsSummary: {
    totalCapsLast7Days: string;
    totalCapsLast30Days: string;
    totalCapsLast90Days: string;
    totalCapsLast180Days: string;
  };
  nonCreditCaps: {
    nonCreditCapsSummary: {
      nonCreditCapsLast7Days: string;
      nonCreditCapsLast30Days: string;
      nonCreditCapsLast90Days: string;
      nonCreditCapsLast180Days: string;
    };
    capsApplicationDetailsArray: CapsApplicationDetail[];
  };
  score: {
    bureauScore: string;
    bureauScoreConfidenceLevel: string;
  };
  segment: any;
  caps: {
    capsSummary: {
      capsLast7Days: string;
      capsLast30Days: string;
      capsLast90Days: string;
      capsLast180Days: string;
    };
    capsApplicationDetailsArray: CapsApplicationDetail[];
  };
  vendor: string;
}

export interface CreditReportResponse {
  creditReports: {
    creditReportData: CreditReportData;
  }[];
}

// Mutual Fund Transactions Types
export interface MFTransaction {
  isin: string;
  schemeName: string;
  folioId: string;
  txns: [number, string, number, number, number][]; // [orderType, transactionDate, purchasePrice, purchaseUnits, transactionAmount]
}

export interface MFTransactionsResponse {
  mfTransactions: MFTransaction[];
  schemaDescription: string;
}

// Asset type constants
export const ASSET_TYPES = {
  'ASSET_TYPE_MUTUAL_FUND': 'Mutual Funds',
  'ASSET_TYPE_EPF': 'EPF',
  'ASSET_TYPE_SAVINGS_ACCOUNTS': 'Savings Account',
  'LIABILITY_TYPE_LOAN': 'Loans',
  'LIABILITY_TYPE_CREDIT_CARD': 'Credit Cards'
} as const;

// Credit Report Constants
export const ACCOUNT_TYPES = {
  '01': 'Personal Loan',
  '02': 'Auto Loan (Personal)',
  '03': 'Housing Loan',
  '04': 'Property Loan',
  '05': 'Loan Against Property',
  '06': 'Consumer Loan',
  '10': 'Credit Card',
  '53': 'Two Wheeler Loan',
} as const;

export const ACCOUNT_STATUS = {
  '11': 'Active',
  '71': 'Closed',
  '78': 'Settled',
  '82': 'Current',
  '83': 'Overdue',
} as const;

export const PAYMENT_RATING = {
  '0': 'Standard',
  '1': 'SMA-0 (0-30 days)',
  '2': 'SMA-1 (31-60 days)', 
  '3': 'SMA-2 (61-90 days)',
  '4': 'Sub-standard (91-180 days)',
  '5': 'Doubtful (181+ days)',
} as const;

// MF Transaction Constants
export const MF_ORDER_TYPES = {
  1: 'BUY',
  2: 'SELL'
} as const;

// Stock Transaction Types
export interface StockTransaction {
  isin: string;
  stockName?: string; // Added for display purposes after API lookup
  txns: [number, string, number, number?][]; // [transactionType, transactionDate, quantity, navValue?]
}

export interface StockTransactionsResponse {
  schemaDescription: string;
  stockTransactions: StockTransaction[];
}

// Stock Transaction Constants
export const STOCK_TRANSACTION_TYPES = {
  1: 'BUY',
  2: 'SELL',
  3: 'BONUS',
  4: 'SPLIT'
} as const;
