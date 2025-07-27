// src/lib/repositories/FirebaseRepository.ts
import { 
  ref, 
  get, 
  query, 
  orderByChild, 
  orderByKey,
  limitToFirst, 
  limitToLast,
  startAt,
  endAt,
  onValue,
  off,
  DataSnapshot
} from 'firebase/database';
import { db } from './firebase';
import { 
  User, 
  UserChats, 
  ChatSession, 
  ChatMessage, 
  FinancialSummaryData,
  PaginatedResponse,
  SortOptions,
  ChatFilters
} from '../types/firebase';

export class FirebaseRepository {
  /**
   * Get all users from the database
   */
  async getAllUsers(): Promise<Record<string, User> | null> {
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Get a specific user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw new Error(`Failed to fetch user ${userId}`);
    }
  }

  /**
   * Get all chat sessions for a user
   */
  async getUserChats(userId: string): Promise<UserChats | null> {
    try {
      const chatsRef = ref(db, `users/${userId}/chats`);
      const snapshot = await get(chatsRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(`Error fetching chats for user ${userId}:`, error);
      throw new Error(`Failed to fetch user chats`);
    }
  }

  /**
   * Get a specific chat session
   */
  async getChatSession(userId: string, sessionId: string): Promise<ChatSession | null> {
    try {
      const sessionRef = ref(db, `users/${userId}/chats/${sessionId}`);
      const snapshot = await get(sessionRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(`Error fetching chat session ${sessionId}:`, error);
      throw new Error(`Failed to fetch chat session`);
    }
  }

  /**
   * Get chat sessions sorted by timestamp
   */
  async getUserChatsSorted(
    userId: string, 
    sortOptions: SortOptions = { field: 'timestamps', direction: 'desc' },
    limit?: number
  ): Promise<Array<{ sessionId: string; session: ChatSession; lastMessage?: ChatMessage }>> {
    try {
      const chatsRef = ref(db, `users/${userId}/chats`);
      const snapshot = await get(chatsRef);
      
      if (!snapshot.exists()) return [];

      const chatsData: UserChats = snapshot.val();
      const chatSessions = Object.entries(chatsData).map(([sessionId, session]) => {
        // Get the last message for sorting
        const messages = Object.values(session);
        const lastMessage = messages.sort((a, b) => b.timestamps - a.timestamps)[0];
        
        return {
          sessionId,
          session,
          lastMessage
        };
      });

      // Sort sessions
      chatSessions.sort((a, b) => {
        const aValue = a.lastMessage?.[sortOptions.field] || 0;
        const bValue = b.lastMessage?.[sortOptions.field] || 0;
        
        if (sortOptions.field === 'timestamps') {
          return sortOptions.direction === 'desc' 
            ? (bValue as number) - (aValue as number)
            : (aValue as number) - (bValue as number);
        } else {
          return sortOptions.direction === 'desc'
            ? String(bValue).localeCompare(String(aValue))
            : String(aValue).localeCompare(String(bValue));
        }
      });

      return limit ? chatSessions.slice(0, limit) : chatSessions;
    } catch (error) {
      console.error(`Error fetching sorted chats for user ${userId}:`, error);
      throw new Error(`Failed to fetch sorted user chats`);
    }
  }

  /**
   * Get all messages from a chat session, optionally sorted
   */
  async getChatMessages(
    userId: string, 
    sessionId: string,
    sortOptions: SortOptions = { field: 'timestamps', direction: 'asc' },
    filters?: ChatFilters
  ): Promise<Array<{ messageId: string; message: ChatMessage }>> {
    try {
      const sessionRef = ref(db, `users/${userId}/chats/${sessionId}`);
      const snapshot = await get(sessionRef);
      
      if (!snapshot.exists()) return [];

      const sessionData: ChatSession = snapshot.val();
      let messages = Object.entries(sessionData).map(([messageId, message]) => ({
        messageId,
        message
      }));

      // Apply filters
      if (filters) {
        messages = messages.filter(({ message }) => {
          if (filters.startDate && message.timestamps < filters.startDate) return false;
          if (filters.endDate && message.timestamps > filters.endDate) return false;
          if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            return message.query_user.toLowerCase().includes(searchTerm) ||
                   message.llm_response.toLowerCase().includes(searchTerm);
          }
          return true;
        });
      }

      // Sort messages
      messages.sort((a, b) => {
        const aValue = a.message[sortOptions.field];
        const bValue = b.message[sortOptions.field];
        
        if (sortOptions.field === 'timestamps') {
          return sortOptions.direction === 'desc' 
            ? (bValue as number) - (aValue as number)
            : (aValue as number) - (bValue as number);
        } else {
          return sortOptions.direction === 'desc'
            ? String(bValue).localeCompare(String(aValue))
            : String(aValue).localeCompare(String(bValue));
        }
      });

      return messages;
    } catch (error) {
      console.error(`Error fetching messages for session ${sessionId}:`, error);
      throw new Error(`Failed to fetch chat messages`);
    }
  }

  /**
   * Get user's financial summary (parsed)
   */
  async getUserFinancialSummary(userId: string): Promise<FinancialSummaryData | null> {
    try {
      const userRef = ref(db, `users/${userId}/financial_summary`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) return null;

      const financialSummaryString = snapshot.val();
      return JSON.parse(financialSummaryString);
    } catch (error) {
      console.error(`Error fetching financial summary for user ${userId}:`, error);
      throw new Error(`Failed to fetch financial summary`);
    }
  }

  /**
   * Get user's net worth data
   */
  async getUserNetWorth(userId: string): Promise<any | null> {
    try {
      const financialData = await this.getUserFinancialSummary(userId);
      return financialData?.netWorthResponse || null;
    } catch (error) {
      console.error(`Error fetching net worth for user ${userId}:`, error);
      throw new Error(`Failed to fetch net worth`);
    }
  }

  /**
   * Get user's mutual fund data
   */
  async getUserMutualFunds(userId: string): Promise<any | null> {
    try {
      const financialData = await this.getUserFinancialSummary(userId);
      return financialData?.mfSchemeAnalytics || null;
    } catch (error) {
      console.error(`Error fetching mutual funds for user ${userId}:`, error);
      throw new Error(`Failed to fetch mutual funds`);
    }
  }

  /**
   * Search across all user's chat messages
   */
  async searchUserChats(userId: string, searchTerm: string, limit: number = 50): Promise<Array<{
    sessionId: string;
    messageId: string;
    message: ChatMessage;
  }>> {
    try {
      const chatsRef = ref(db, `users/${userId}/chats`);
      const snapshot = await get(chatsRef);
      
      if (!snapshot.exists()) return [];

      const chatsData: UserChats = snapshot.val();
      const results: Array<{
        sessionId: string;
        messageId: string;
        message: ChatMessage;
      }> = [];

      const searchTermLower = searchTerm.toLowerCase();

      Object.entries(chatsData).forEach(([sessionId, session]) => {
        Object.entries(session).forEach(([messageId, message]) => {
          if (
            message.query_user.toLowerCase().includes(searchTermLower) ||
            message.llm_response.toLowerCase().includes(searchTermLower)
          ) {
            results.push({ sessionId, messageId, message });
          }
        });
      });

      // Sort by timestamp (most recent first)
      results.sort((a, b) => b.message.timestamps - a.message.timestamps);

      return results.slice(0, limit);
    } catch (error) {
      console.error(`Error searching chats for user ${userId}:`, error);
      throw new Error(`Failed to search user chats`);
    }
  }

  /**
   * Get real-time updates for user data
   */
  subscribeToUser(userId: string, callback: (user: User | null) => void): () => void {
    const userRef = ref(db, `users/${userId}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      const userData = snapshot.exists() ? snapshot.val() : null;
      callback(userData);
    });

    return () => off(userRef, 'value', unsubscribe);
  }

  /**
   * Get real-time updates for user chats
   */
  subscribeToUserChats(userId: string, callback: (chats: UserChats | null) => void): () => void {
    const chatsRef = ref(db, `users/${userId}/chats`);
    
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const chatsData = snapshot.exists() ? snapshot.val() : null;
      callback(chatsData);
    });

    return () => off(chatsRef, 'value', unsubscribe);
  }

  /**
   * Get real-time updates for user financial summary
   */
  subscribeToUserFinancialSummary(userId: string, callback: (financialSummary: FinancialSummaryData | null) => void): () => void {
    const financialRef = ref(db, `users/${userId}/financial_summary`);
    
    const unsubscribe = onValue(financialRef, (snapshot) => {
      try {
        if (!snapshot.exists()) {
          callback(null);
          return;
        }
        
        const financialSummaryString = snapshot.val();
        const financialData = JSON.parse(financialSummaryString);
        callback(financialData);
      } catch (error) {
        console.error(`Error parsing financial summary for user ${userId}:`, error);
        callback(null);
      }
    });

    return () => off(financialRef, 'value', unsubscribe);
  }

  /**
   * Get paginated chat messages
   */
  async getPaginatedChatMessages(
    userId: string,
    sessionId: string,
    pageSize: number = 20,
    startAfterKey?: string
  ): Promise<PaginatedResponse<{ messageId: string; message: ChatMessage }>> {
    try {
      const sessionRef = ref(db, `users/${userId}/chats/${sessionId}`);
      let queryRef = query(sessionRef, orderByKey());

      if (startAfterKey) {
        queryRef = query(queryRef, startAt(startAfterKey));
      }

      queryRef = query(queryRef, limitToFirst(pageSize + 1));

      const snapshot = await get(queryRef);
      
      if (!snapshot.exists()) {
        return { data: [], hasMore: false };
      }

      const sessionData: ChatSession = snapshot.val();
      const messages = Object.entries(sessionData).map(([messageId, message]) => ({
        messageId,
        message
      }));

      const hasMore = messages.length > pageSize;
      const data = hasMore ? messages.slice(0, -1) : messages;
      const lastKey = hasMore ? messages[messages.length - 2].messageId : undefined;

      return {
        data,
        hasMore,
        lastKey
      };
    } catch (error) {
      console.error(`Error fetching paginated messages:`, error);
      throw new Error(`Failed to fetch paginated messages`);
    }
  }
}

// Export singleton instance
export const firebaseRepository = new FirebaseRepository();
