// src/lib/mcp-api.ts
import { 
  MCPApiResponse, 
  BankTransactionsResponse, 
  NetWorthResponse,
  EPFDetailsResponse,
  CreditReportResponse,
  MFTransactionsResponse,
  StockTransactionsResponse
} from '@/types/mcp-api';

// Use Next.js API routes as proxy to avoid CORS issues
const MCP_API_URL = '/api/mcp';
const HEALTH_API_URL = '/api/health';

class MCPApiService {
  private async makeApiCall<T>(method: string, params: any = {}): Promise<T> {
    const sessionId = localStorage.getItem('fi-mcp-session-id');
    
    if (!sessionId) {
      throw new Error('No session ID found. Please login first.');
    }

    const response = await fetch(MCP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'mcp-session-id': sessionId, // Use lowercase header for consistency
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: method,
          arguments: params,
        },
      }),
    });

    console.log('API call response:', response);

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data: MCPApiResponse<T> = await response.json();
    
    if (!data.result?.content?.[0]?.text) {
      throw new Error('Invalid API response format');
    }

    // Parse the JSON text from the response
    return JSON.parse(data.result.content[0].text);
  }

  async fetchBankTransactions(): Promise<BankTransactionsResponse> {
    return this.makeApiCall<BankTransactionsResponse>('fetch_bank_transactions');
  }

  async fetchNetWorth(): Promise<NetWorthResponse> {
    return this.makeApiCall<NetWorthResponse>('fetch_net_worth');
  }

  async fetchEPFDetails(): Promise<EPFDetailsResponse> {
    return this.makeApiCall<EPFDetailsResponse>('fetch_epf_details');
  }

  async fetchCreditReport(): Promise<CreditReportResponse> {
    return this.makeApiCall<CreditReportResponse>('fetch_credit_report');
  }

  async fetchMFTransactions(): Promise<MFTransactionsResponse> {
    return this.makeApiCall<MFTransactionsResponse>('fetch_mf_transactions');
  }

  async fetchStockTransactions(): Promise<StockTransactionsResponse> {
    return this.makeApiCall<StockTransactionsResponse>('fetch_stock_transactions');
  }

  // Health check method
  async healthCheck(): Promise<any> {
    const response = await fetch(HEALTH_API_URL, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Simple API call for testing (doesn't require authentication)
  async testConnection(): Promise<any> {
    try {
      return await this.healthCheck();
    } catch (error) {
      throw new Error(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const mcpApiService = new MCPApiService();
