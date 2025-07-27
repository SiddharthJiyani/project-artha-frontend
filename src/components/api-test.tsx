"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mcpApiService } from '@/lib/mcp-api';

export default function ApiTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);

  const testConnection = async () => {
    setConnectionLoading(true);
    setResult('');

    try {
      console.log('Testing connection to backend...');
      const healthData = await mcpApiService.testConnection();
      
      setResult(`✅ Connection successful!\n\n${JSON.stringify(healthData, null, 2)}`);
    } catch (error) {
      console.error('Connection Test Error:', error);
      setResult(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setConnectionLoading(false);
    }
  };

  const testApi = async () => {
    setLoading(true);
    setResult('');

    try {
      // Get session ID from localStorage
      const sessionId = localStorage.getItem('fi-mcp-session-id');
      
      if (!sessionId) {
        setResult('Error: No session ID found. Please login first.');
        return;
      }

      console.log('Making API call with session ID:', sessionId.substring(0, 10) + '...');

      // Use the proxy endpoint instead of direct call
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
            name: 'fetch_net_worth',
            arguments: {}
          }
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        setResult(`Error: ${response.status} ${response.statusText}\n${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('API Test Error:', error);
      setResult(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>MCP API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testConnection} 
            disabled={connectionLoading}
            variant="outline"
            className="flex-1"
          >
            {connectionLoading ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button 
            onClick={testApi} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Testing API...' : 'Test MCP API Call'}
          </Button>
        </div>
        
        {result && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
