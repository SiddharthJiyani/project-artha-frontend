// src/components/FirebaseDataViewer.tsx
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader } from 'lucide-react';

import { 
  useUserChats, 
  useSortedUserChats, 
  useFinancialSummary,
  useChatSearch,
  useChatMessages
} from '@/hooks/useFirebaseRepository';

interface FirebaseDataViewerProps {
  userId: string;
}

export default function FirebaseDataViewer({ userId }: FirebaseDataViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { chats, loading: chatsLoading } = useUserChats(userId);
  const { chatSessions } = useSortedUserChats(userId);
  const { financialSummary } = useFinancialSummary(userId);
  const { searchResults, search, loading: searchLoading } = useChatSearch(userId);
  const { messages: sessionMessages } = useChatMessages(
    userId, 
    selectedSession || '', 
    { field: 'timestamps', direction: 'asc' }
  );

  const handleSearch = () => {
    if (searchTerm.trim()) {
      search(searchTerm);
    }
  };

  if (chatsLoading) {
    return <div className="p-4">Loading Firebase data...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Firebase Data Viewer</h1>
      
      <Tabs defaultValue="chats" className="w-full">
        <TabsList>
          <TabsTrigger value="chats">Chat Sessions</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="financial">Financial Data</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="chats">
          <Card>
            <CardHeader>
              <CardTitle>Chat Sessions ({chatSessions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {chatSessions.map(({ sessionId, lastMessage }) => (
                    <div 
                      key={sessionId} 
                      className="p-3 border rounded cursor-pointer hover:bg-muted"
                      onClick={() => setSelectedSession(sessionId)}
                    >
                      <div className="font-mono text-sm text-muted-foreground">
                        {sessionId}
                      </div>
                      {lastMessage && (
                        <>
                          <div className="text-sm mt-1">
                            <strong>Last Query:</strong> {lastMessage.query_user.substring(0, 100)}...
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(lastMessage.timestamps).toLocaleString()}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>
                Messages
                {selectedSession && (
                  <Badge variant="outline" className="ml-2">
                    {selectedSession}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedSession ? (
                <p className="text-muted-foreground">Select a chat session to view messages</p>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {sessionMessages.map(({ messageId, message }) => (
                      <div key={messageId} className="border rounded p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-semibold text-blue-600">User Query:</div>
                            <p className="text-sm">{message.query_user}</p>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-green-600">AI Response:</div>
                            <p className="text-sm">{message.llm_response}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(message.timestamps).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {financialSummary ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Net Worth</h3>
                    <p className="text-2xl font-bold">
                      {financialSummary.netWorthResponse?.totalNetWorthValue?.currencyCode}{' '}
                      {financialSummary.netWorthResponse?.totalNetWorthValue?.units}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">Asset Breakdown</h3>
                    <div className="space-y-2">
                      {financialSummary.netWorthResponse?.assetValues?.map((asset, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{asset.netWorthAttribute.replace('ASSET_TYPE_', '').replace('LIABILITY_TYPE_', '')}</span>
                          <span>{asset.value.currencyCode} {asset.value.units}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold">Mutual Funds ({financialSummary.mfSchemeAnalytics?.schemeAnalytics?.length || 0})</h3>
                    <ScrollArea className="h-48">
                      {financialSummary.mfSchemeAnalytics?.schemeAnalytics?.map((fund, index) => (
                        <div key={index} className="border rounded p-2 mb-2">
                          <div className="font-medium">{fund.schemeDetail?.nameData?.longName}</div>
                          <div className="text-sm text-muted-foreground">
                            Current: {fund.enrichedAnalytics?.analytics?.schemeDetails?.currentValue?.units} | 
                            Invested: {fund.enrichedAnalytics?.analytics?.schemeDetails?.investedValue?.units}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <p>No financial data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Chat History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Search in chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searchLoading}>
                  {searchLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {searchResults.map(({ sessionId, messageId, message }) => (
                    <div key={`${sessionId}-${messageId}`} className="border rounded p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        Session: {sessionId}
                      </div>
                      <div className="text-sm">
                        <strong>Q:</strong> {message.query_user}
                      </div>
                      <div className="text-sm mt-1">
                        <strong>A:</strong> {message.llm_response.substring(0, 200)}...
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(message.timestamps).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
