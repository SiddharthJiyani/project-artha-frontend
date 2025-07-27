"use client";
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Send, 
  Loader, 
  Paperclip, 
  Mic, 
  Sparkles, 
  Brain, 
  MessageSquare, 
  Plus, 
  MoreHorizontal,
  SparklesIcon,
  PenTool,
  Trash2,
  Clock,
  Check,
  Copy,
  Share,
  Archive,
  Search,
  Settings,
  User,
  ChevronDown,
  Wand2,
  EyeOff ,
  Zap,
  Database,
  AlertCircle,
  TrendingUp,
  Shield
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import FiMcpLogin from '@/components/FiMcpLogin';

// Import Firebase repository hooks
import { 
  useUserChats, 
  useSortedUserChats, 
  useFinancialSummary,
  useChatSearch,
  useUser,
  useChatMessages
} from '@/hooks/useFirebaseRepository';

interface FirebaseMessage {
  llm_response: string;
  query_user: string;
  timestamps: number;
}

interface Message {
  id: string;
  text: string | React.ReactNode;
  isUser: boolean;
  timestamp: number;
}

// Markdown formatting component
const MarkdownText = ({ content }: { content: string }) => {
  const formatMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-accent/50 px-1 py-0.5 rounded text-xs">$1</code>')
      .replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-semibold mb-2 text-foreground">$1</h3>')
      .replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold mb-3 text-foreground">$1</h2>')
      .replace(/# (.*?)(\n|$)/g, '<h1 class="text-2xl font-bold mb-4 text-foreground">$1</h1>')
      .replace(/- (.*?)(\n|$)/g, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
    />
  );
};

// Chat Sidebar Component
const ChatSidebar = ({ 
  userId, 
  activeSession, 
  onSessionSelect, 
  onNewChat 
}: { 
  userId: string;
  activeSession: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
}) => {
  const { chatSessions, loading } = useSortedUserChats(
    userId, 
    { field: 'timestamps', direction: 'desc' },
    50
  );

  const getSessionTitle = (sessionId: string, messages: any) => {
    // Get first user message as title
    const firstMessage = Object.values(messages || {})
      .sort((a: any, b: any) => a.timestamps - b.timestamps)
      .find((msg: any) => msg.query_user);

      console.log('firstMessage', firstMessage);
    
    if (firstMessage?.query_user) {
      return firstMessage.query_user.length > 40 
        ? firstMessage.query_user.substring(0, 40) + '...' 
        : firstMessage.query_user;
    }
    return `Chat ${sessionId.substring(0, 8)}...`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 h-full bg-background border-r border-border/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Chats</h2>
          <Button 
            onClick={onNewChat}
            size="sm" 
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center">
            <Loader className="h-6 w-6 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading chats...</p>
          </div>
        ) : chatSessions.length === 0 ? (
          <div className="p-4 text-center">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No chats yet</p>
            <p className="text-xs text-muted-foreground">Start a conversation!</p>
          </div>
        ) : (
          <div className="p-2">
            {chatSessions.map(({ sessionId, session, lastMessage }) => (
              <motion.div
                key={sessionId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-2",
                  activeSession === sessionId 
                    ? "bg-primary/10 border border-primary/20" 
                    : "hover:bg-accent/50"
                )}
                onClick={() => onSessionSelect(sessionId)}
              >
                <div className="flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage  />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {getSessionTitle(sessionId, session)}
                  </h3>
                  {lastMessage && (
                    <>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {lastMessage.llm_response ? 
                          (lastMessage.llm_response.length > 60 ? 
                            lastMessage.llm_response.substring(0, 60) + '...' : 
                            lastMessage.llm_response
                          ) : 'New conversation'
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(lastMessage.timestamps)}
                      </p>
                    </>
                  )}
                </div>
                {activeSession === sessionId && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

// Message Component
const MessageBubble = ({ message, isLast }: { message: Message; isLast: boolean }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-4 mb-6",
        message.isUser ? "justify-end" : "justify-start"
      )}
    >
      {!message.isUser && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage />
            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
          </Avatar>
        </div>
      )}
      
      <div className={cn(
        "max-w-2xl",
        message.isUser ? "order-first" : ""
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-3 shadow-sm",
          message.isUser 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted"
        )}>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {message.text.split('\n').map((line, i) => (
              <p key={i} className={cn(
                "mb-2 last:mb-0",
                message.isUser ? "text-primary-foreground" : "text-foreground"
              )}>
                {line}
              </p>
            ))}
          </div>
        </div>
        <div className={cn(
          "text-xs text-muted-foreground mt-1 px-1",
          message.isUser ? "text-right" : "text-left"
        )}>
          {formatTime(message.timestamp)}
        </div>
      </div>

      {message.isUser && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage  />
            <AvatarFallback className="bg-accent text-accent-foreground">U</AvatarFallback>
          </Avatar>
        </div>
      )}
    </motion.div>
  );
};

// Chat Input Component
const ChatInput = ({ 
  input, 
  setInput, 
  onSend, 
  isLoading 
}: {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-border/50 bg-background/80 backdrop-blur">
      <div className="p-4">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message Artha AI..."
            className="min-h-[60px] max-h-[200px] pr-12 resize-none border-border/50 focus:border-primary/50"
            disabled={isLoading}
          />
          <Button
            onClick={onSend}
            disabled={isLoading || !input.trim()}
            size="sm"
            className="absolute bottom-2 right-2 h-8 w-8 p-0"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Firebase Data Panel Component
const FirebaseDataPanel = ({ 
  userId, 
  isVisible, 
  onToggle 
}: { 
  userId: string; 
  isVisible: boolean; 
  onToggle: () => void; 
}) => {
  const { user: firebaseUser, loading: userLoading } = useUser(userId);
  const { chats, loading: chatsLoading } = useUserChats(userId);
  const { chatSessions, loading: sessionsLoading } = useSortedUserChats(
    userId, 
    { field: 'timestamps', direction: 'desc' },
    5 // Show latest 5 sessions
  );
  const { financialSummary, loading: financialLoading } = useFinancialSummary(userId);

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed top-20 right-4 z-50 shadow-lg"
      >
        <Database className="h-4 w-4 mr-2" />
        Show Firebase Data
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      className="fixed top-0 right-0 w-80 h-full bg-background/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-40 overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Firebase Data</h3>
        </div>
        <Button onClick={onToggle} variant="ghost" size="sm">
          <EyeOff className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* User Info */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <span>User Data</span>
              {userLoading && <Loader className="h-3 w-3 animate-spin" />}
            </h4>
            {firebaseUser ? (
              <div className="text-xs space-y-1 p-2 bg-muted/30 rounded">
                <div>User ID: {userId}</div>
                <div>Has Chats: {firebaseUser.chats ? 'Yes' : 'No'}</div>
                <div>Has Financial Data: {firebaseUser.financial_summary ? 'Yes' : 'No'}</div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No user data found</div>
            )}
          </div>

          {/* Chat Sessions */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <span>Recent Chat Sessions</span>
              {sessionsLoading && <Loader className="h-3 w-3 animate-spin" />}
            </h4>
            {chatSessions.length > 0 ? (
              <div className="space-y-2">
                {chatSessions.map(({ sessionId, lastMessage }, index) => (
                  <div key={sessionId} className="p-2 bg-muted/20 rounded text-xs">
                    <div className="font-mono text-xs text-muted-foreground mb-1">
                      Session #{index + 1}
                    </div>
                    <div className="text-xs">
                      {sessionId.length > 30 ? `${sessionId.substring(0, 30)}...` : sessionId}
                    </div>
                    {lastMessage && (
                      <div className="text-xs mt-1 text-muted-foreground">
                        Last: {new Date(lastMessage.timestamps).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No chat sessions found</div>
            )}
          </div>

          {/* Financial Summary */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <span>Financial Summary</span>
              {financialLoading && <Loader className="h-3 w-3 animate-spin" />}
            </h4>
            {financialSummary ? (
              <div className="space-y-2">
                <div className="p-2 bg-muted/20 rounded text-xs">
                  <div className="font-semibold text-green-600">Net Worth</div>
                  <div>
                    {financialSummary.netWorthResponse?.totalNetWorthValue?.currencyCode}{' '}
                    {financialSummary.netWorthResponse?.totalNetWorthValue?.units}
                  </div>
                </div>
                
                <div className="p-2 bg-muted/20 rounded text-xs">
                  <div className="font-semibold">Asset Types</div>
                  <div className="text-xs">
                    {financialSummary.netWorthResponse?.assetValues?.length || 0} categories
                  </div>
                </div>

                <div className="p-2 bg-muted/20 rounded text-xs">
                  <div className="font-semibold">Mutual Funds</div>
                  <div className="text-xs">
                    {financialSummary.mfSchemeAnalytics?.schemeAnalytics?.length || 0} schemes
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No financial data found</div>
            )}
          </div>

          {/* Raw Data Stats */}
          <div>
            <h4 className="font-medium text-sm mb-2">Raw Data Stats</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Total Sessions:</span>
                <span>{chats ? Object.keys(chats).length : 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Loading State:</span>
                <span>{chatsLoading ? 'Loading...' : 'Complete'}</span>
              </div>
            </div>
          </div>

          {/* Debug Actions */}
          <div>
            <h4 className="font-medium text-sm mb-2">Debug Actions</h4>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  console.log('=== FIREBASE DEBUG DATA ===');
                  console.log('User:', firebaseUser);
                  console.log('Chats:', chats);
                  console.log('Chat Sessions:', chatSessions);
                  console.log('Financial Summary:', financialSummary);
                  console.log('========================');
                }}
              >
                Log All Data to Console
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  if (financialSummary) {
                    const netWorth = financialSummary.netWorthResponse?.totalNetWorthValue;
                    alert(`Net Worth: ${netWorth?.currencyCode} ${netWorth?.units}`);
                  } else {
                    alert('No financial data available');
                  }
                }}
              >
                Show Net Worth Alert
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

// Simulated AI functions (replace with actual implementations)
const getChatSuggestions = async ({ chatHistory }: { chatHistory: string }) => {
  return { suggestions: ["Analyze my portfolio", "Investment recommendations", "Budget optimization"] };
};

const sendMessage = async (params: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    response: `Based on your financial profile with net worth of ₹52,00,000 and monthly income of ₹1,50,000, here's my analysis:

## Key Insights
- Your **credit score of 780** is excellent and opens many investment opportunities
- With ₹3,20,000 in idle savings, consider **diversifying into equity mutual funds**
- Your EMI-to-income ratio of 28% is healthy

### Recommendations
1. **Emergency Fund**: You're well-positioned with good liquidity
2. **Investment Strategy**: Consider SIP investments of ₹25,000/month
3. **Tax Planning**: Explore ELSS funds for Section 80C benefits

*Would you like me to elaborate on any specific area?*`,
    thinkingProcess: [
      "Analyzing your financial portfolio and risk profile...",
      "Evaluating current market conditions and opportunities...",
      "Cross-referencing with your investment goals and timeline...",
      "Calculating optimal asset allocation strategies...",
      "Generating personalized recommendations..."
    ]
  };
};

export default function ChatLayout() {
  const { isAuthenticated, login, phoneNumber } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showFirebasePanel, setShowFirebasePanel] = useState(false);
  const [activeSession, setActiveSession] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome! I'm Artha, your intelligent financial advisor. I have access to your complete financial profile and can provide personalized insights about your wealth management, investment strategies, and financial goals. How can I assist you today?",
      isUser: false,
      avatar: '/artha-avatar.png',
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [thinkingProcess, setThinkingProcess] = useState<string[]>([]);
  const { user: firebaseUser, loading: userLoading } = useUser(phoneNumber || ''); // Use phone number or fallback for testing
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  console.log('Firebase User:', firebaseUser);
// Firebase hooks - use user phone number or a default for testing
  const userId = phoneNumber || '1313131313'; // fallback for testing
  const { financialSummary } = useFinancialSummary(userId);
  const { chatSessions } = useSortedUserChats(userId, { field: 'timestamps', direction: 'desc' }, 3);
  const { messages: sessionMessages, loading: messagesLoading } = useChatMessages(userId, activeSession);

  console.log('Chat sessions:', chatSessions);
  // Replace local messages with Firebase messages when a session is active
  useEffect(() => {
    if (activeSession && !messagesLoading) {
      const transformedMessages = Object.entries(sessionMessages || {}).map(([id, msg]) => ({
        id,
        text: msg.query_user || msg.llm_response,
        isUser: Boolean(msg.query_user),
        timestamp: msg.timestamps
      }));
      setMessages(transformedMessages);
    }
  }, [activeSession, sessionMessages, messagesLoading]);

  // Update financial context with real data when available
  // const financialContext = {
  //   netWorth: financialSummary?.netWorthResponse?.totalNetWorthValue?.units 
  //     ? `${financialSummary.netWorthResponse.totalNetWorthValue.currencyCode} ${financialSummary.netWorthResponse.totalNetWorthValue.units}`
  //     : '₹52,00,000',
  //   monthlyIncome: '₹1,50,000',
  //   creditScore: '780',
  //   monthlyEMI: '₹42,000',
  //   idleSavings: '₹3,20,000',
  //   collateralAvailable: '₹30,00,000',
  //   paymentDiscipline: '94%',
  //   financialBiases: 'Anchoring Bias, Herding Behavior',
  //   diwaliExpenses: '₹50,000',
  //   familyStabilityMaintained: 'Yes',
  //   puneRealEstatePerformance: 'Pune real estate outperforms Mumbai rental yield',
  //   // Add Firebase-derived data
  //   totalMutualFunds: financialSummary?.mfSchemeAnalytics?.schemeAnalytics?.length || 0,
  //   totalAssetCategories: financialSummary?.netWorthResponse?.assetValues?.length || 0,
  //   recentChatSessions: chatSessions.length,
  // };

  const getSuggestions = async (history: string) => {
    try {
      const result = await getChatSuggestions({ chatHistory: history });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Failed to get suggestions:", error);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    const chatHistory = messages.map(m => `${m.isUser ? 'User' : 'Artha'}: ${typeof m.text === 'string' ? m.text : 'Complex UI'}`).join('\n');
    getSuggestions(chatHistory);
  }, [messages, isLoading]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading, thinkingProcess]);

  const processMessage = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      avatar: '/user-avatar.png',
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setSuggestions([]);
    setThinkingProcess([]);

    try {
      const chatHistory = newMessages.map(m => `${m.isUser ? 'User' : 'Artha'}: ${typeof m.text === 'string' ? m.text : 'Complex UI'}`).join('\n');

      const resultPromise = sendMessage({
        message: messageText,
        chatHistory: chatHistory,
        ...financialContext, // Now includes real Firebase data
      });

      const simulateRealtimeThinking = async (promise: Promise<any>) => {
        const result = await promise;
        const thinkingSteps = result.thinkingProcess;

        // Show thinking steps one by one
        for (let i = 0; i < thinkingSteps.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 800));
          setThinkingProcess(prev => [...prev, thinkingSteps[i]]);
        }

        // Wait a bit before starting response
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate streaming response with fade-in animation
        const responseText = result.response;
        setThinkingProcess([]);

        // Add placeholder message
        const aiMessageId = Date.now() + 1;
        setMessages(prev => [...prev, {
          id: aiMessageId,
          text: '',
          isUser: false,
          avatar: '/artha-avatar.png',
          timestamp: new Date(),
        }]);

        // Fade-in the response
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, text: <MarkdownText content={responseText} /> }
            : msg
        ));

        setIsLoading(false);
      };

      await simulateRealtimeThinking(resultPromise);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: "I'm experiencing some technical difficulties. Please try again in a moment.",
        isUser: false,
        avatar: '/artha-avatar.png',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    processMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    processMessage(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleLoginSuccess = (sessionId: string, phoneNumber: string) => {
    login(sessionId, phoneNumber);
    setShowLogin(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h2 className="text-2xl font-bold">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to chat with Artha AI
            </p>
            <Button onClick={() => setShowLogin(true)}>
              Login with Fi MCP
            </Button>
          </div>
        </div>
        {showLogin && (
          <FiMcpLogin
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setShowLogin(false)}
          />
        )}
      </>
    );
  }

  const handleNewChat = () => {
    setActiveSession('');
    setMessages([
      {
        id: 'welcome',
        text: "Welcome! I'm Artha, your intelligent financial advisor. I have access to your complete financial profile and can provide personalized insights about your wealth management, investment strategies, and financial goals. How can I assist you today?",
        isUser: false,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar for Chat Sessions */}
      <ChatSidebar
        userId={userId}
        activeSession={activeSession}
        onSessionSelect={setActiveSession}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Content */}
      <div className="flex-1 relative">
        {/* Firebase Data Panel */}
        <AnimatePresence>
          <FirebaseDataPanel
            userId={userId}
            isVisible={showFirebasePanel}
            onToggle={() => setShowFirebasePanel(!showFirebasePanel)}
          />
        </AnimatePresence>

        <Card className={cn(
          "flex flex-col shadow-2xl shadow-primary/10 bg-gradient-to-br from-background via-background to-accent/5 backdrop-blur-xl border-border/50 overflow-hidden rounded-none transition-all duration-300",
          showFirebasePanel ? "w-[calc(100%-320px)]" : "w-full"
        )}
        >
        <CardHeader className="flex flex-row items-center justify-between border-b border-gradient-to-r from-transparent via-border/50 to-transparent bg-gradient-to-r from-background via-accent/5 to-background p-4 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 opacity-20 blur-md animate-pulse"></div>
              <Avatar className="relative ring-2 ring-primary/30 h-10 w-10 shadow-lg">
                <AvatarImage  alt="Artha AI" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                  A
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background shadow-sm animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Artha AI
                </h3>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Verified</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3 text-primary" />
                <p className="text-xs text-muted-foreground font-medium">
                  Personal Financial Intelligence
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">Live Market</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <Zap className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-700">Real-time</span>
            </div>
            {/* Firebase Data Indicator */}
            {financialSummary && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Database className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Firebase Connected</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
            <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="flex-1 flex flex-col relative min-h-0">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-6 max-w-5xl mx-auto">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={cn(
                      'flex items-end gap-3',
                      message.isUser ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {!message.isUser && (
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-8 w-8 shadow-md ring-2 ring-primary/20">
                          <AvatarImage alt="Artha AI" />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                            A
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-primary rounded-full border-2 border-background"></div>
                      </div>
                    )}
                    <div className="flex flex-col gap-1 max-w-xs md:max-w-lg lg:max-w-4xl">
                      <div
                        className={cn(
                          'relative rounded-2xl px-4 py-3 text-sm shadow-lg backdrop-blur-sm',
                          message.isUser
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md border border-primary/20'
                            : 'bg-gradient-to-br from-card to-card/80 rounded-bl-md border border-border/50'
                        )}
                      >
                        {!message.isUser && (
                          <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-card/80"></div>
                        )}
                        {message.isUser && (
                          <div className="absolute -right-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-primary"></div>
                        )}
                        {typeof message.text === 'string' ? (
                          <MarkdownText content={message.text} />
                        ) : (
                          message.text
                        )}
                      </div>
                      {message.timestamp && (
                        <p className={cn(
                          'text-xs text-muted-foreground px-1',
                          message.isUser ? 'text-right' : 'text-left'
                        )}>
                          {formatTime(message.timestamp)}
                        </p>
                      )}
                    </div>
                    {message.isUser && (
                      <Avatar className="h-8 w-8 shadow-md ring-2 ring-accent/30 flex-shrink-0">
                        <AvatarImage  alt="User" />
                        <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground font-semibold text-sm">
                          U
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-end gap-3 justify-start"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-8 w-8 shadow-md ring-2 ring-primary/20">
                        <AvatarImage  alt="Artha AI" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                          A
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-primary rounded-full border-2 border-background animate-pulse"></div>
                    </div>
                    <div className="relative rounded-2xl px-4 py-3 bg-gradient-to-br from-card to-card/80 rounded-bl-md shadow-lg backdrop-blur-sm max-w-lg border border-border/50">
                      <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-card/80"></div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <SparklesIcon className="h-4 w-4 text-primary animate-pulse" />
                          <span className="text-sm font-medium text-foreground">Artha is thinking...</span>
                        </div>
                        <AnimatePresence>
                          {thinkingProcess.map((step, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0.3 }}
                              transition={{ duration: 0.3 }}
                              className="flex items-center gap-2 text-xs"
                            >
                              <motion.div
                                className="h-1.5 w-1.5 rounded-full bg-primary"
                                animate={{
                                  scale: [1, 1.5, 1],
                                  opacity: [0.5, 1, 0.7]
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity
                                }}
                              />
                              <span className="text-muted-foreground">
                                {step}
                              </span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
            
            {/* Enhanced Input Area */}
            <div className="p-4 border-t border-gradient-to-r from-transparent via-border/50 to-transparent bg-gradient-to-r from-background via-accent/5 to-background backdrop-blur-xl flex-shrink-0">
              <div className="max-w-5xl mx-auto">
                {/* Suggestions */}
                <AnimatePresence>
                  {!isLoading && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 mb-3 flex-wrap"
                    >
                      <div className="flex items-center gap-1">
                        <Wand2 className="h-3 w-3 text-primary" />
                        <span className="text-xs text-muted-foreground font-medium">Quick Actions:</span>
                      </div>
                      {suggestions.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionClick(s)}
                            className="rounded-full text-xs bg-gradient-to-r from-accent/20 to-accent/30 hover:from-accent/40 hover:to-accent/50 hover:text-black/70 border-accent/50 shadow-sm transition-all duration-200 hover:shadow-md h-7 px-3"
                          >
                            <Sparkles className="h-2.5 w-2.5 mr-1 text-primary" />
                            {s}
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Input Field */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <Textarea
                    placeholder="Ask Artha about your investments, spending patterns, financial goals, or market insights..."
                    className="relative pr-32 min-h-[48px] resize-none rounded-xl py-3 px-4 border-2 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 bg-background/80 backdrop-blur-sm shadow-md text-sm leading-relaxed"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className='text-muted-foreground hover:text-foreground rounded-lg h-7 w-7 transition-colors'
                      disabled={isLoading}
                    >
                      <Paperclip className='h-3.5 w-3.5'/>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className='text-muted-foreground hover:text-foreground rounded-lg h-7 w-7 transition-colors'
                      disabled={isLoading}
                    >
                      <Mic className='h-3.5 w-3.5'/>
                    </Button>
                    <div className="w-px h-5 bg-border/50 mx-0.5"></div>
                    <Button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      size="sm"
                      className="rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground h-8 px-3 shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5 mr-1" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    </div>
  );
}
