"use client";
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
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
  EyeOff,
  Zap,
  Database,
  AlertCircle,
  TrendingUp,
  Shield,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import FiMcpLogin from "@/components/FiMcpLogin";

// Import your existing Firebase repository hooks
import {
  useUserChats,
  useSortedUserChats,
  useFinancialSummary,
  useChatSearch,
  useUser,
  useChatMessages,
} from "@/hooks/useFirebaseRepository";

interface FirebaseMessage {
  llm_response: string;
  query_user: string;
  timestamp: number;
  timestamps?: number; // Firebase uses plural field
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  messageId?: string; // Firebase message ID
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messageCount: number;
}

// Sidebar Component
const ChatSidebar = ({
  userId,
  activeSession,
  onSessionSelect,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
}: {
  userId: string;
  activeSession: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) => {
  const { user: firebaseUser } = useUser(userId);
  console.log("Firebase user:", firebaseUser);

  // Get chat sessions from Firebase user data - CLEAN & SIMPLE
  const chatSessions = React.useMemo(() => {
    if (!firebaseUser?.chats) {
      return [];
    }

    const sessions = Object.entries(firebaseUser.chats).map(
      ([sessionId, chatData]: [string, any]) => {
        const messages = Object.values(chatData || {}) as FirebaseMessage[];

        // Debug: Log the actual message structure
        console.log("Session:", sessionId, "Messages sample:", messages[0]);

        // Find the latest timestamp - use 'timestamps' as per Firebase structure
        const timestamps = messages
          .map((msg) => msg.timestamps || msg.timestamp || 0)
          .filter((t) => t > 0);
        const latestTimestamp =
          timestamps.length > 0 ? Math.max(...timestamps) : 0;

        console.log(
          "Session:",
          sessionId,
          "Latest timestamp:",
          latestTimestamp
        );

        // Get first user message for title
        const firstUserMessage = messages.find((msg) => msg.query_user);
        const title =
          firstUserMessage?.query_user || `Chat ${sessionId.substring(0, 8)}`;
        
        // Adjust title truncation for better fit
        const displayTitle = title.length > 35 ? title.substring(0, 35) + "..." : title;

        return {
          sessionId,
          title: displayTitle,
          timestamp: latestTimestamp,
          messageCount: messages.length,
        };
      }
    );

    // Sort by timestamp - newest first
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  }, [firebaseUser?.chats]);

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp <= 0) {
      return "Unknown";
    }

    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 60 : 300 }} // Increased width from 280 to 300
      className="h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-lg">Chats</h2>
              {firebaseUser?.chats && (
                <p className="text-xs text-muted-foreground">
                  {chatSessions.length} conversations found
                </p>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              onClick={onNewChat}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
            {!isCollapsed && (
              <Button
                onClick={onToggleCollapse}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {!firebaseUser ? (
          <div className="p-4 text-center">
            <Loader className="h-6 w-6 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Loading chats...
            </p>
          </div>
        ) : isCollapsed ? (
          <div className="p-2 space-y-2">
            {chatSessions.slice(0, 8).map(({ sessionId }) => (
              <Button
                key={sessionId}
                variant={activeSession === sessionId ? "default" : "ghost"}
                size="sm"
                className="w-full h-10 p-0 justify-center"
                onClick={() => onSessionSelect(sessionId)}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            ))}
            <Button
              onClick={onToggleCollapse}
              variant="ghost"
              size="sm"
              className="w-full h-8 p-0 justify-center mt-4">
              <ChevronDown className="h-3 w-3 rotate-90" />
            </Button>
          </div>
        ) : chatSessions.length === 0 ? (
          <div className="p-4 text-center">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No chats yet</p>
            <p className="text-xs text-muted-foreground">
              Start a conversation!
            </p>
          </div>
        ) : (
          <div className="p-2">
            {chatSessions.map(
              ({ sessionId, title, timestamp, messageCount }) => (
                <motion.div
                  key={sessionId}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors mb-1.5 group",
                    activeSession === sessionId
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-accent/10"
                  )}
                  onClick={() => onSessionSelect(sessionId)}>
                  <div className="flex-shrink-0">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="font-medium text-sm truncate leading-tight mb-0.5">
                      {title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {messageCount}{" "}
                      {messageCount === 1 ? "message" : "messages"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate flex-1 mr-2">
                        {formatDate(timestamp)}
                      </span>
                    </div>
                  </div>
                  {activeSession === sessionId && (
                    <div className="flex-shrink-0 self-start mt-0.5">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                  )}
                </motion.div>
              )
            )}
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
};


// Message Component
const MessageBubble = ({ message }: { message: Message }) => {
  const formatTime = (timestamp: number) => {
    if (!timestamp || timestamp <= 0) return "";

    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-4 mb-6",
        message.isUser ? "justify-end" : "justify-start"
      )}>
      {!message.isUser && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              AI
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className={cn("max-w-2xl", message.isUser ? "order-first" : "")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            message.isUser
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-muted"
          )}>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {typeof message.text === "string" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h3: ({ node, ...props }) => (
                    <h3
                      className="font-semibold text-base mb-2 mt-3 first:mt-0"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-2 last:mb-0" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="ml-4 mb-2 list-disc" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="ml-4 mb-2 list-decimal" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-1" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic" {...props} />
                  ),
                }}>
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}
          </div>
        </div>

        <div
          className={cn(
            "text-xs text-muted-foreground mt-1 px-1",
            message.isUser ? "text-right" : "text-left"
          )}>
          {formatTime(message.timestamp)}
        </div>
      </div>

      {message.isUser && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-accent text-accent-foreground">
              U
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </motion.div>
  );
};

// Thinking Animation Component
const ThinkingIndicator = ({
  steps,
  isVisible,
}: {
  steps: string[];
  isVisible: boolean;
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-end gap-3 justify-start mb-6">
          <div className="flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                AI
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="bg-muted rounded-2xl px-4 py-3 max-w-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">
                  Artha is thinking...
                </span>
              </div>
              <AnimatePresence>
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0.3 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 text-xs">
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.7],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    />
                    <span className="text-muted-foreground">{step}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Simulated AI functions (replace with actual implementations from your original code)
const getChatSuggestions = async ({ chatHistory }: { chatHistory: string }) => {
  return {
    suggestions: [
      "Analyze my portfolio",
      "Investment recommendations",
      "Budget optimization",
    ],
  };
};

const sendMessage = async (params: any) => {
  // Use your existing sendMessage function here
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    response: `Based on your financial profile and Firebase data, here's my analysis:

## Key Insights from Your Firebase Data
- Your profile shows **${params.totalSessions || 0} previous conversations**
- Data quality score: **${params.dataQualityScore || "Good"}**
- Available financial sources: **${params.availableSources || "Multiple"}**

### Personalized Recommendations
1. **Portfolio Analysis**: Based on your historical Firebase queries
2. **Investment Strategy**: Tailored to your conversation patterns
3. **Financial Planning**: Using your behavioral profile from Firebase

*This response is generated using your actual Firebase data and conversation context.*`,
    thinkingProcess: [
      "Accessing your Firebase chat history...",
      "Analyzing conversation patterns from Firebase...",
      "Processing financial data quality metrics...",
      "Cross-referencing with user behavioral profile...",
      "Generating personalized recommendations...",
    ],
  };
};

// Main Chat Interface
export default function ChatbotInterface() {
  const { isAuthenticated, login, phoneNumber } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSession, setActiveSession] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Use your existing Firebase hooks
  const userId = phoneNumber || "1313131313"; // fallback for testing
  const { user: firebaseUser, loading: userLoading } = useUser(userId);
  const { chats, loading: chatsLoading } = useUserChats(userId);
  const { financialSummary } = useFinancialSummary(userId);

  // Transform Firebase messages to display format - keeping timestamps intact
  const transformFirebaseMessages = (chatData: any): Message[] => {
    if (!chatData) return [];

    const messages: Message[] = [];

    // Get all message entries and sort by Firebase timestamp
    const messageEntries = Object.entries(chatData) as [
      string,
      FirebaseMessage
    ][];
    const sortedEntries = messageEntries.sort(([, a], [, b]) => {
      // Sort by Firebase timestamps (plural) field
      const timestampA = a.timestamps || a.timestamp || 0;
      const timestampB = b.timestamps || b.timestamp || 0;
      return timestampA - timestampB;
    });

    console.log(
      "Sorted Firebase messages by timestamp:",
      sortedEntries.map(([id, msg]) => ({ id, timestamp: msg.timestamp }))
    );

    sortedEntries.forEach(([messageId, messageData]) => {
      // Use Firebase timestamps (plural) field correctly
      const firebaseTimestamp =
        messageData.timestamps || messageData.timestamp || 0;

      console.log(
        `Processing message ${messageId}: Firebase timestamp = ${firebaseTimestamp}, type = ${typeof firebaseTimestamp}`
      );

      // Add user message if exists
      if (messageData.query_user) {
        messages.push({
          id: `${messageId}-user`,
          text: messageData.query_user,
          isUser: true,
          timestamp: firebaseTimestamp, // Use exact Firebase timestamp
          messageId: messageId,
        });
      }

      // Add AI response if exists
      if (messageData.llm_response) {
        messages.push({
          id: `${messageId}-ai`,
          text: messageData.llm_response,
          isUser: false,
          timestamp: firebaseTimestamp, // Use exact same Firebase timestamp
          messageId: messageId,
        });
      }
    });

    console.log(
      "Final transformed messages:",
      messages.map((m) => ({
        id: m.id,
        timestamp: m.timestamp,
        time: new Date(m.timestamp).toLocaleTimeString(),
      }))
    );
    return messages;
  };

  // Load messages for active session from Firebase
  useEffect(() => {
    if (activeSession && firebaseUser?.chats?.[activeSession]) {
      console.log("Loading messages for session:", activeSession);
      const chatData = firebaseUser.chats[activeSession];
      const transformedMessages = transformFirebaseMessages(chatData);
      setMessages(transformedMessages);
      console.log(
        `Loaded ${transformedMessages.length} messages for session ${activeSession}`
      );
    } else if (!activeSession) {
      // Default welcome message for new chat
      setMessages([
        {
          id: "welcome",
          text: `Welcome! I'm Artha, your intelligent financial advisor. I have access to your complete financial profile${
            firebaseUser
              ? ` and can see you have ${
                  Object.keys(firebaseUser.chats || {}).length
                } previous conversations`
              : ""
          }. I can provide personalized insights about your wealth management, investment strategies, and financial goals. How can I assist you today?`,
          isUser: false,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [activeSession, firebaseUser]);

  // Auto-select first chat session when Firebase data loads
  useEffect(() => {
    if (firebaseUser?.chats && !activeSession) {
      const chatIds = Object.keys(firebaseUser.chats);
      if (chatIds.length > 0) {
        // Get the most recent chat by finding the latest timestamp
        const sortedChats = chatIds
          .map((sessionId) => {
            const chatData = firebaseUser.chats[sessionId];
            const messages = Object.values(chatData || {}) as any[];

            // Find the latest timestamp from Firebase using correct field name
            let latestTimestamp = 0;
            messages.forEach((msg) => {
              const msgTimestamp = msg.timestamps || msg.timestamp || 0;
              if (msgTimestamp > latestTimestamp) {
                latestTimestamp = msgTimestamp;
              }
            });

            return {
              sessionId,
              timestamp: latestTimestamp,
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp);

        console.log(
          "Auto-selecting most recent chat:",
          sortedChats[0]?.sessionId,
          "with timestamp:",
          sortedChats[0]?.timestamp
        );
        setActiveSession(sortedChats[0]?.sessionId || chatIds[0]);
      }
    }
  }, [firebaseUser?.chats, activeSession]);

  // Real-time updates - watch for changes in Firebase data
  useEffect(() => {
    if (activeSession && firebaseUser?.chats?.[activeSession]) {
      const chatData = firebaseUser.chats[activeSession];
      const transformedMessages = transformFirebaseMessages(chatData);

      // Only update if messages actually changed
      if (JSON.stringify(transformedMessages) !== JSON.stringify(messages)) {
        setMessages(transformedMessages);
        console.log("Real-time update for session:", activeSession);
      }
    }
  }, [firebaseUser?.chats, activeSession]);

  // Get suggestions based on Firebase data
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
    const chatHistory = messages
      .map(
        (m) =>
          `${m.isUser ? "User" : "Artha"}: ${
            typeof m.text === "string" ? m.text : "Complex UI"
          }`
      )
      .join("\n");
    getSuggestions(chatHistory);
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input;
    setInput("");
    setIsLoading(true);
    setThinkingSteps([]);

    try {
      const chatHistory = [...messages, userMessage]
        .map(
          (m) =>
            `${m.isUser ? "User" : "Artha"}: ${
              typeof m.text === "string" ? m.text : "Complex UI"
            }`
        )
        .join("\n");

      // Include Firebase data in the context
      const firebaseContext = {
        totalSessions: firebaseUser?.chats
          ? Object.keys(firebaseUser.chats).length
          : 0,
        dataQualityScore:
          (firebaseUser as any)?.user_state?.data_quality?.data_quality_score ||
          "Good",
        availableSources:
          (
            firebaseUser as any
          )?.user_state?.data_quality?.available_sources?.join(", ") ||
          "Multiple",
        behavioralSummary:
          (firebaseUser as any)?.user_state?.behavioral_summary ||
          "Active user",
        agentPersona:
          (firebaseUser as any)?.user_state?.agent_persona ||
          "conscientious_extroverted",
        netWorth: financialSummary?.netWorthResponse?.totalNetWorthValue?.units
          ? `${financialSummary.netWorthResponse.totalNetWorthValue.currencyCode} ${financialSummary.netWorthResponse.totalNetWorthValue.units}`
          : "Available in profile",
      };

      const resultPromise = sendMessage({
        message: messageText,
        chatHistory: chatHistory,
        userId: userId,
        sessionId: activeSession,
        ...firebaseContext,
      });

      // Simulate realtime thinking with Firebase context
      const simulateRealtimeThinking = async (promise: Promise<any>) => {
        const result = await promise;
        const thinkingStepsFromResult = result.thinkingProcess;

        // Show thinking steps one by one
        for (let i = 0; i < thinkingStepsFromResult.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          setThinkingSteps((prev) => [...prev, thinkingStepsFromResult[i]]);
        }

        // Wait a bit before starting response
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Add AI response
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.response,
          isUser: false,
          timestamp: Date.now() + 1,
        };

        setMessages((prev) => [...prev, aiMessage]);
        setThinkingSteps([]);
        setIsLoading(false);
      };

      await simulateRealtimeThinking(resultPromise);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing some technical difficulties. Please try again in a moment.",
        isUser: false,
        timestamp: Date.now() + 1,
      };
      setMessages((prev) => [...prev, errorResponse]);
      setIsLoading(false);
      setThinkingSteps([]);
    }
  };

  const handleNewChat = () => {
    setActiveSession("");
    setMessages([
      {
        id: "welcome",
        text: `Welcome! I'm Artha, your intelligent financial advisor. I have access to your complete financial profile${
          firebaseUser
            ? ` and can see you have ${
                Object.keys(firebaseUser.chats || {}).length
              } previous conversations`
            : ""
        }. I can provide personalized insights about your wealth management, investment strategies, and financial goals. How can I assist you today?`,
        isUser: false,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLoginSuccess = (sessionId: string, phoneNumber: string) => {
    login(sessionId, phoneNumber);
    setShowLogin(false);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, thinkingSteps]);

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-background">
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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar
        userId={userId}
        activeSession={activeSession}
        onSessionSelect={setActiveSession}
        onNewChat={handleNewChat}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sidebarCollapsed && (
                <Button
                  onClick={() => setSidebarCollapsed(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0">
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    A
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">Artha AI</h3>
                  <p className="text-xs text-muted-foreground">
                    {(firebaseUser as any)?.user_state?.agent_persona?.replace(
                      "_",
                      " "
                    ) || "Financial Assistant"}
                  </p>
                </div>
              </div>
              {activeSession && (
                <Badge variant="outline" className="text-xs">
                  Session: {activeSession.substring(0, 8)}...
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {firebaseUser && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  {Object.keys(firebaseUser.chats || {}).length} chats
                </Badge>
              )}
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                Firebase Connected
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages - Rendered from Firebase */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto space-y-6">
            {messages?.length === 0 && (
              <div className="text-center py-8">
                <Database className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Loading Firebase messages...
                </p>
              </div>
            )}
            {messages.map((message) => {
              return <MessageBubble key={message.id} message={message} />;
            })}
            <ThinkingIndicator steps={thinkingSteps} isVisible={isLoading} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-4xl mx-auto">
            {/* Firebase Data Debug Info */}
            {activeSession && firebaseUser?.chats?.[activeSession] && (
              <div className="mb-3 p-2 bg-accent/20 rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3 text-primary" />
                  <span className="font-medium">Firebase Session Data:</span>
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(firebaseUser.chats[activeSession]).length}{" "}
                    messages
                  </Badge>
                </div>
              </div>
            )}

            {/* Suggestions */}
            <AnimatePresence>
              {!isLoading && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 mb-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Wand2 className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">
                      Quick Actions:
                    </span>
                  </div>
                  {suggestions.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(s)}
                        className="rounded-full text-xs bg-gradient-to-r from-accent/20 to-accent/30 hover:from-accent/40 hover:to-accent/50 border-accent/50 shadow-sm transition-all duration-200 hover:shadow-md h-7 px-3">
                        <Sparkles className="h-2.5 w-2.5 mr-1 text-primary" />
                        {s}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Ask Artha about your finances${
                  firebaseUser
                    ? ` (${
                        Object.keys(firebaseUser.chats || {}).length
                      } Firebase conversations available)`
                    : ""
                }...`}
                className="min-h-[60px] max-h-[200px] pr-20 resize-none"
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoading}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoading}>
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Firebase Connection Status */}
            <div className="mt-2 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Firebase Real-time Connected</span>
                </div>
                {firebaseUser && (
                  <>
                    <span>•</span>
                    <span>
                      {Object.keys(firebaseUser.chats || {}).length} total
                      conversations
                    </span>
                  </>
                )}
                {activeSession && (
                  <>
                    <span>•</span>
                    <span>
                      Active session: {activeSession.substring(0, 12)}...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
