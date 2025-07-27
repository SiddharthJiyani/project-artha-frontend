// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface AuthContextType {
  sessionId: string | null;
  phoneNumber: string | null;
  isAuthenticated: boolean;
  login: (sessionId: string, phoneNumber: string) => void;
  logout: () => void;
  mcpApiCall: (toolName: string, params?: Record<string, any>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedSessionId = localStorage.getItem('fi-mcp-session-id');
    const savedPhoneNumber = localStorage.getItem('fi-mcp-phone-number');
    if (savedSessionId && savedPhoneNumber) {
        login(savedSessionId, savedPhoneNumber);
    }
  }, []);

  const login = (newSessionId: string, newPhoneNumber: string) => {
    setSessionId(newSessionId);
    setPhoneNumber(newPhoneNumber);
    setIsAuthenticated(true);
    localStorage.setItem('fi-mcp-session-id', newSessionId);
    localStorage.setItem('fi-mcp-phone-number', newPhoneNumber);
  };

  const logout = () => {
    setSessionId(null);
    setPhoneNumber(null);
    setIsAuthenticated(false);
    localStorage.removeItem('fi-mcp-session-id');
    localStorage.removeItem('fi-mcp-phone-number');
  };

  const mcpApiCall = async (toolName: string, params: Record<string, any> = {}) => {
    if (!isAuthenticated || !sessionId) {
        throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch('/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params,
        },
      })
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            logout();
            throw new Error('Session expired. Please log in again.');
        }
        const responseText = await response.text();
        throw new Error(`API call failed: ${response.statusText} - ${responseText}`);
    }

    const responseText = await response.text();
    
    try {
        const jsonData = JSON.parse(responseText);
        if (jsonData.status === 'login_required') {
            logout();
            throw new Error('Session invalid, please log in again.');
        }
        return jsonData;
    } catch(e) {
        return { result: responseText };
    }
  };

  return (
    <AuthContext.Provider value={{ sessionId, phoneNumber, isAuthenticated, login, logout, mcpApiCall }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
