"use client";
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Loader,
  MessageSquare,
  Plus,
  Menu,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useFirebaseRepository";

interface FirebaseMessage {
  llm_response: string;
  query_user: string;
  timestamp: number;
  timestamps?: number;
  llm_thinking?: string;
}

interface ChatSidebarProps {
  userId: string;
  activeSession: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  userId,
  activeSession,
  onSessionSelect,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user: firebaseUser } = useUser(userId);

  // Get chat sessions from Firebase user data
  const chatSessions = React.useMemo(() => {
    if (!firebaseUser?.chats) {
      return [];
    }

    const sessions = Object.entries(firebaseUser.chats).map(
      ([sessionId, chatData]: [string, any]) => {
        const messages = Object.values(chatData || {}) as FirebaseMessage[];

        // Find the latest timestamp
        const timestamps = messages
          .map((msg) => msg.timestamps || msg.timestamp || 0)
          .filter((t) => t > 0);
        const latestTimestamp =
          timestamps.length > 0 ? Math.max(...timestamps) : 0;
        
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
      animate={{ width: isCollapsed ? 60 : 300 }}
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
                    "flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors mb-1.5 group",
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
                      {(title.length > 35 ? title.substring(0,30) + "..." : title)}
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
                </motion.div>
              )
            )}
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
};
