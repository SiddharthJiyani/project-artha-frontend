// src/hooks/use-mcp-data.ts
import { useState, useEffect } from 'react';
import { mcpApiService } from '@/lib/mcp-api';
import { BankTransactionsResponse, NetWorthResponse, EPFDetailsResponse, CreditReportResponse, MFTransactionsResponse, StockTransactionsResponse } from '@/types/mcp-api';
import { useAuth } from '@/contexts/AuthContext';

interface UseApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBankTransactions(): UseApiDataReturn<BankTransactionsResponse> {
  const [data, setData] = useState<BankTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchData = async () => {
    if (!isAuthenticated) {
      setError('Please login to view transactions');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await mcpApiService.fetchBankTransactions();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  return { data, loading, error, refetch: fetchData };
}

export function useNetWorth(): UseApiDataReturn<NetWorthResponse> {
  const [data, setData] = useState<NetWorthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchData = async () => {
    if (!isAuthenticated) {
      setError('Please login to view net worth');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await mcpApiService.fetchNetWorth();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch net worth data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  return { data, loading, error, refetch: fetchData };
}

export function useEPFDetails(): UseApiDataReturn<EPFDetailsResponse> {
  const [data, setData] = useState<EPFDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchData = async () => {
    if (!isAuthenticated) {
      setError('Please login to view EPF details');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await mcpApiService.fetchEPFDetails();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch EPF details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  return { data, loading, error, refetch: fetchData };
}

export function useCreditReport(): UseApiDataReturn<CreditReportResponse> {
  const [data, setData] = useState<CreditReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchData = async () => {
    if (!isAuthenticated) {
      setError('Please login to view credit report');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await mcpApiService.fetchCreditReport();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  return { data, loading, error, refetch: fetchData };
}

export function useMFTransactions(): UseApiDataReturn<MFTransactionsResponse> {
  const [data, setData] = useState<MFTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchData = async () => {
    if (!isAuthenticated) {
      setError('Please login to view MF transactions');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await mcpApiService.fetchMFTransactions();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch MF transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  return { data, loading, error, refetch: fetchData };
}

export function useStockTransactions(): UseApiDataReturn<StockTransactionsResponse> {
  const [data, setData] = useState<StockTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchData = async () => {
    if (!isAuthenticated) {
      setError('Please login to view stock transactions');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await mcpApiService.fetchStockTransactions();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  return { data, loading, error, refetch: fetchData };
}
