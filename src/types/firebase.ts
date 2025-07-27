// src/types/firebase.ts

export interface ChatMessage {
  llm_response: string;
  query_user: string;
  timestamps: number;
}

export interface ChatSession {
  [messageId: string]: ChatMessage;
}

export interface UserChats {
  [sessionId: string]: ChatSession;
}

export interface FinancialSummaryData {
  netWorthResponse: {
    assetValues: Array<{
      netWorthAttribute: string;
      value: {
        currencyCode: string;
        units: string;
      };
    }>;
    totalNetWorthValue: {
      currencyCode: string;
      units: string;
    };
  };
  mfSchemeAnalytics: {
    schemeAnalytics: Array<{
      schemeDetail: {
        amc: string;
        nameData: { longName: string };
        planType: string;
        optionType: string;
        nav: { currencyCode: string; units: string };
        assetClass: string;
        isinNumber: string;
        categoryName: string;
      };
      enrichedAnalytics: {
        analytics: {
          schemeDetails: {
            currentValue: { currencyCode: string; units: string };
            investedValue: { currencyCode: string; units: string };
            XIRR: string;
            unrealisedReturns: { currencyCode: string; units: string };
            units: string;
          };
        };
      };
    }>;
  };
  accountDetailsBulkResponse: {
    accountDetailsMap: {
      [accountId: string]: {
        accountDetails: {
          fipId: string;
          maskedAccountNumber: string;
          accInstrumentType: string;
        };
        [summaryType: string]: any;
      };
    };
  };
}

export interface User {
  chats: UserChats;
  financial_summary: string; // JSON string that needs parsing
}

export interface UsersDatabase {
  users: {
    [userId: string]: User;
  };
}

// Utility types for API responses
export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  lastKey?: string;
}

export interface SortOptions {
  field: keyof ChatMessage;
  direction: 'asc' | 'desc';
}

export interface ChatFilters {
  startDate?: number;
  endDate?: number;
  searchTerm?: string;
}
