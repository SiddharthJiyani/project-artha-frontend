"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import FiMcpLogin from "@/components/FiMcpLogin";
import { arthaApi } from "@/lib/artha-api";
import {
  useUserChats,
  useFinancialSummary,
  useUser,
} from "@/hooks/useFirebaseRepository";

// Import our new components
import {
  ChatSidebar,
  MessageBubble,
  LiveThinkingIndicator,
  ChatSuggestions,
  ChatInput,
  ChatHeader,
  ConnectionStatus,
  useTypewriterAnimation,
  getChatSuggestions,
  transformFirebaseMessages,
  type Message,
  type FirebaseMessage,
} from "./index";

// Main Chat Interface
export default function ChatbotInterface() {
  const { isAuthenticated, login, phoneNumber } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSession, setActiveSession] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentThinkingMessage, setCurrentThinkingMessage] = useState<string | null>(null);
  const [isShowingThinking, setIsShowingThinking] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Use typewriter animation hook
  const {
    thinkingSteps,
    currentStepText,
    isTyping,
    startTypewriterAnimation,
    resetAnimation,
  } = useTypewriterAnimation();

  // Use existing Firebase hooks
  const userId = phoneNumber || "1313131313"; // fallback for testing
  const { user: firebaseUser, loading: userLoading } = useUser(userId);
  const { chats, loading: chatsLoading } = useUserChats(userId);
  const { financialSummary } = useFinancialSummary(userId);

  // Load messages for active session from Firebase
  useEffect(() => {
    if (activeSession && firebaseUser?.chats?.[activeSession]) {
      console.log("Loading messages for session:", activeSession);
      const chatData = firebaseUser.chats[activeSession];
      const transformedMessages = transformFirebaseMessages(chatData);
      setMessages(transformedMessages);
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

        setActiveSession(sortedChats[0]?.sessionId || chatIds[0]);
      }
    }
  }, [firebaseUser?.chats, activeSession]);

  // Real-time updates - watch for changes in Firebase data and handle thinking animation
  useEffect(() => {
    // Handle pending session ID (new chat) - watch for Firebase data to appear
    if (pendingSessionId && firebaseUser?.chats?.[pendingSessionId] && !activeSession) {
      console.log('New chat session detected in Firebase:', pendingSessionId);
      setActiveSession(pendingSessionId);
      setPendingSessionId(null);
      return;
    }

    if (activeSession && firebaseUser?.chats?.[activeSession]) {
      const chatData = firebaseUser.chats[activeSession];
      
      // Get the latest message that might have new thinking data
      const messageEntries = Object.entries(chatData) as [string, FirebaseMessage][];
      const sortedEntries = messageEntries.sort(([, a], [, b]) => {
        const timestampA = a.timestamps || a.timestamp || 0;
        const timestampB = b.timestamps || b.timestamp || 0;
        return timestampB - timestampA; // Latest first
      });

      const latestMessage = sortedEntries[0];
      if (latestMessage) {
        const [messageId, messageData] = latestMessage;
        
        // Check if we have thinking but no response yet (thinking phase)
        if (messageData.llm_thinking && !messageData.llm_response && waitingForResponse) {
          if (currentThinkingMessage !== messageId && !isShowingThinking) {
            console.log('Starting thinking animation for message:', messageId);
            setCurrentThinkingMessage(messageId);
            setIsShowingThinking(true);
            setIsLoading(false); // Stop general loading, start thinking animation
            
            // Prepare thinking steps for typewriter effect
            const thinkingText = messageData.llm_thinking;
            const steps = thinkingText
              .split(/\n+/)
              .map(step => step.trim())
              .filter(step => step.length > 0)
              .slice(0, 8); // Allow more steps
            
            startTypewriterAnimation(steps);
          }
        }
        
        // Check if response has arrived - end waiting state
        if (messageData.llm_response && waitingForResponse) {
          console.log('Response arrived from Firebase for message:', messageId);
          setWaitingForResponse(false);
          setIsLoading(false);
          
          // If thinking animation is still ongoing, let it complete
          if (isShowingThinking && currentThinkingMessage === messageId) {
            console.log('Response ready, but letting thinking animation complete...');
            return;
          }
          
          // Update messages with the complete data
          const transformedMessages = transformFirebaseMessages(chatData);
          setMessages(transformedMessages);
          setCurrentThinkingMessage(null);
          return;
        }
      }
      
      // Update messages normally if not in waiting state
      if (!waitingForResponse && !isShowingThinking) {
        const transformedMessages = transformFirebaseMessages(chatData);
        
        // Only update if messages actually changed
        if (JSON.stringify(transformedMessages) !== JSON.stringify(messages)) {
          setMessages(transformedMessages);
        }
      }
    }
  }, [firebaseUser?.chats, activeSession, currentThinkingMessage, isShowingThinking, waitingForResponse, pendingSessionId]);

  // Get suggestions based on conversation context
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

  // Handle sending messages to Artha API
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
    setWaitingForResponse(true);

    try {
      // Determine session ID - use existing or generate new for new chat
      let sessionId = activeSession;
      if (!sessionId) {
        sessionId = arthaApi.generateSessionId();
        setPendingSessionId(sessionId);
        console.log('Generated new session ID:', sessionId);
      }

      console.log('Sending message to Artha API...', {
        userId,
        sessionId,
        messagePreview: messageText.substring(0, 100)
      });

      // Call Artha API - this will update Firebase, not return the AI response
      const apiResponse = await arthaApi.sendMessage(
        userId,
        sessionId,
        messageText
      );

      console.log('Artha API response:', apiResponse);

      if (apiResponse.status === 'success') {
        console.log('Message sent successfully, waiting for Firebase response...');
        
        // Set active session if this was a new chat
        if (!activeSession && sessionId) {
          console.log('Setting active session to:', sessionId);
          setActiveSession(sessionId);
        }
        
        // The actual AI response will come through Firebase real-time updates
        // We just wait for it and show loading state
        
      } else {
        throw new Error(apiResponse.message || 'API call failed');
      }

    } catch (error) {
      console.error("Failed to send message:", error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing some technical difficulties. Please try again in a moment.",
        isUser: false,
        timestamp: Date.now() + 1,
      };
      
      setMessages((prev) => [...prev, errorResponse]);
      setIsLoading(false);
      setWaitingForResponse(false);
    }
  };

  // Handle new chat creation
  const handleNewChat = () => {
    console.log('Starting new chat...');
    setActiveSession("");
    setPendingSessionId(null);
    setWaitingForResponse(false);
    setIsLoading(false);
    setIsShowingThinking(false);
    setCurrentThinkingMessage(null);
    resetAnimation();
    
    // Set welcome message for new chat
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
    if (isLoading || waitingForResponse) return;
    setInput(suggestion);
    setTimeout(() => handleSend(), 100); // Small delay to ensure input is set
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
    <div className="flex h-screen bg-background overflow-hidden">
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
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <ChatHeader 
          activeSession={activeSession}
          firebaseUser={firebaseUser}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Messages - Rendered from Firebase */}
        <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
          <div className="w-full space-y-6 p-4">
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
            
            {/* Show thinking animation when Firebase thinking arrives but response hasn't */}
            <LiveThinkingIndicator 
              steps={thinkingSteps} 
              isVisible={isShowingThinking}
              currentStepText={currentStepText}
              isTyping={isTyping}
            />
            
            {/* Show waiting animation for API response */}
            <LiveThinkingIndicator 
              steps={[]} 
              isVisible={waitingForResponse && !isShowingThinking}
              currentStepText=""
              isTyping={false}
            />
            
            {/* Show loading animation for manual messages */}
            <LiveThinkingIndicator 
              steps={[]} 
              isVisible={isLoading && !isShowingThinking && !waitingForResponse}
              currentStepText=""
              isTyping={false}
            />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4 flex-shrink-0">
          <div className="w-full">
            {/* Suggestions */}
            <ChatSuggestions 
              suggestions={suggestions}
              isLoading={isLoading}
              waitingForResponse={waitingForResponse}
              onSuggestionClick={handleSuggestionClick}
            />

            {/* Chat Input */}
            <ChatInput 
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              waitingForResponse={waitingForResponse}
              onSend={handleSend}
              onKeyPress={handleKeyPress}
              firebaseUser={firebaseUser}
            />

            {/* Connection Status */}
            <ConnectionStatus 
              waitingForResponse={waitingForResponse}
              firebaseUser={firebaseUser}
              activeSession={activeSession}
              pendingSessionId={pendingSessionId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
