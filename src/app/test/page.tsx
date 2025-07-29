// src/app/test/page.tsx
"use client";
import { useState, useEffect } from 'react';
import ApiTest from '@/components/api-test';
import FirebaseDataViewer from '@/components/FirebaseDataViewer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { fetchAllUserIds, exploreFirebaseData } from '@/utils/fetchUserIds';

export default function TestPage() {
  const [userId, setUserId] = useState('user_123'); // Default user ID
  const [customUserId, setCustomUserId] = useState('');

  const handleSetUserId = () => {
    if (customUserId.trim()) {
      setUserId(customUserId.trim());
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Test Dashboard</h1>
        
        <Tabs defaultValue="firebase" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="firebase">Firebase Data</TabsTrigger>
            <TabsTrigger value="api">API Test</TabsTrigger>
          </TabsList>
          
          <TabsContent value="firebase">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Firebase Data Viewer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter User ID"
                    value={customUserId}
                    onChange={(e) => setCustomUserId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSetUserId()}
                  />
                  <Button onClick={handleSetUserId}>Set User ID</Button>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Current User ID: <code className="bg-muted px-2 py-1 rounded">{userId}</code>
                </div>
                
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold mb-2 text-blue-800">🔍 Explore Firebase Data</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    Open your browser's developer console and run:
                  </p>
                  <div className="bg-blue-100 p-2 rounded font-mono text-sm">
                    <code>exploreFirebaseData()</code>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    This will show you all available user IDs and preview their data. Use any discovered user ID in the input above.
                  </p>
                </div>
                
                <FirebaseDataViewer userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Connection Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <ApiTest />
                </div>
                
                <div className="mt-8 text-sm text-muted-foreground">
                  <h2 className="font-semibold mb-2">Instructions:</h2>
                  <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Test Connection:</strong> Checks if both frontend and backend servers are running</li>
                    <li><strong>Test MCP API Call:</strong> Makes an authenticated API call (requires session ID in localStorage)</li>
                  </ol>
                  
                  <div className="mt-4">
                    <h3 className="font-semibold">Expected Servers:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Next.js Frontend: <code>http://localhost:3000</code></li>
                      <li>Go Backend: <code>http://artha-mcp-server.onrender.com</code></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
