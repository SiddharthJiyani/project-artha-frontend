// src/hooks/useFirebaseRepository.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseRepository } from '../lib/FirebaseRepository';
import { User, UserChats, ChatMessage, FinancialSummaryData, SortOptions, ChatFilters } from '../types/firebase';

// Hook for getting user data with real-time updates
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || userId.trim() === '') {
      setLoading(false);
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    // Use real-time subscription
    const unsubscribe = firebaseRepository.subscribeToUser(userId, (userData) => {
      setUser(userData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { user, loading, error };
}

// Hook for getting user chats with real-time updates
export function useUserChats(userId: string) {
  const [chats, setChats] = useState<UserChats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || userId.trim() === '') {
      setLoading(false);
      setChats(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    console.log('firebaseRepo', firebaseRepository)  ; 
    const unsubscribe = firebaseRepository.subscribeToUserChats(userId, (chatsData) => {
      setChats(chatsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { chats, loading, error };
}

// Hook for getting sorted chat sessions with real-time updates
export function useSortedUserChats(
  userId: string, 
  sortOptions?: SortOptions,
  limit?: number
) {
  const [chatSessions, setChatSessions] = useState<Array<{ sessionId: string; session: any; lastMessage?: ChatMessage }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || userId.trim() === '') {
      setLoading(false);
      setChatSessions([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Use real-time subscription
    const unsubscribe = firebaseRepository.subscribeToUserChats(userId, (chatsData) => {
      if (!chatsData) {
        setChatSessions([]);
        setLoading(false);
        return;
      }

      const chatSessions = Object.entries(chatsData).map(([sessionId, session]) => {
        const lastMessage = Object.values(session).sort((a, b) => b.timestamps - a.timestamps)[0];
        return { sessionId, session, lastMessage };
      });

      chatSessions.sort((a, b) => {
        const aValue = a.lastMessage?.timestamps || 0;
        const bValue = b.lastMessage?.timestamps || 0;
        return bValue - aValue;
      });

      setChatSessions(limit ? chatSessions.slice(0, limit) : chatSessions);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId, limit]);

  return { chatSessions, loading, error };
}

// Hook for getting chat messages
export function useChatMessages(
  userId: string,
  sessionId: string,
  sortOptions?: SortOptions,
  filters?: ChatFilters
) {
  const [messages, setMessages] = useState<Array<{ messageId: string; message: ChatMessage }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize complex objects to prevent infinite loops
  const memoizedSortOptions = useMemo(() => 
    sortOptions || { field: 'timestamps' as keyof ChatMessage, direction: 'asc' as const }
  , [sortOptions?.field, sortOptions?.direction]);

  const memoizedFilters = useMemo(() => filters, [
    filters?.startDate, 
    filters?.endDate, 
    filters?.searchTerm
  ]);

  useEffect(() => {
    if (!userId || userId.trim() === '' || !sessionId || sessionId.trim() === '') {
      setLoading(false);
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const messagesList = await firebaseRepository.getChatMessages(
          userId, 
          sessionId, 
          memoizedSortOptions, 
          memoizedFilters
        );
        setMessages(messagesList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId, sessionId, memoizedSortOptions, memoizedFilters]);

  return { messages, loading, error };
}

// Hook for financial summary with real-time updates
export function useFinancialSummary(userId: string) {
  const [financialSummary, setFinancialSummary] = useState<FinancialSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || userId.trim() === '') {
      setLoading(false);
      setFinancialSummary(null);
      return;
    }

    const fetchFinancialSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await firebaseRepository.getUserFinancialSummary(userId);
        setFinancialSummary(summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialSummary();
  }, [userId]);

  return { financialSummary, loading, error };
}

// Hook for searching chats
export function useChatSearch(userId: string) {
  const [searchResults, setSearchResults] = useState<Array<{
    sessionId: string;
    messageId: string;
    message: ChatMessage;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchTerm: string, limit: number = 50) => {
    if (!userId || userId.trim() === '' || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await firebaseRepository.searchUserChats(userId, searchTerm, limit);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Clear results when userId changes
  useEffect(() => {
    setSearchResults([]);
    setError(null);
  }, [userId]);

  return { searchResults, search, loading, error };
}
