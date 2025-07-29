"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ThinkingBubble } from "./ThinkingBubble";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  messageId?: string;
  thinking?: string;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [showThinking, setShowThinking] = useState(false);
  
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
        {/* Show thinking bubble for AI messages that have thinking data */}
        {!message.isUser && message.thinking && (
          <ThinkingBubble
            thinking={message.thinking}
            isExpanded={showThinking}
            onToggle={() => setShowThinking(!showThinking)}
          />
        )}

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
