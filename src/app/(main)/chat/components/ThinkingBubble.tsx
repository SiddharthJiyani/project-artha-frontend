"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Brain, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ThinkingBubbleProps {
  thinking: string;
  isExpanded?: boolean;
  onToggle: () => void;
}

export const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({ 
  thinking, 
  isExpanded = false, 
  onToggle 
}) => {
  // Enhanced thinking step processing with markdown support
  const thinkingSteps = thinking
    .split(/\n+/) // Split by multiple newlines
    .map(step => step.trim())
    .filter(step => step.length > 0)
    .map(step => {
      // Clean up common prefixes and make more readable
      let cleanStep = step;
      
      // Remove bullet points and numbering at the start
      cleanStep = cleanStep.replace(/^[\-\*\+•]\s*/, '');
      cleanStep = cleanStep.replace(/^\d+\.\s*/, '');
      
      // If step is very short, treat as a title/header
      if (cleanStep.length < 50 && !cleanStep.includes('.') && !cleanStep.includes(',')) {
        cleanStep = `**${cleanStep}**`;
      }
      
      return cleanStep;
    });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-3 bg-accent/5 border border-accent/20 rounded-lg overflow-hidden">
      
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/10 transition-colors">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              rotate: isExpanded ? 180 : 0,
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 0.2 }}>
            <Brain className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium text-muted-foreground">
            Artha's Thinking Process
          </span>
          <Badge variant="outline" className="text-xs">
            {thinkingSteps.length} steps
          </Badge>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expandable thinking content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-accent/20">
            <div className="p-4 space-y-3 bg-accent/5">
              {thinkingSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3">
                  <motion.div
                    className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  />
                  <div className="text-muted-foreground leading-relaxed flex-1 min-w-0">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1 className="font-bold text-sm mb-1 text-foreground" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="font-semibold text-sm mb-1 text-foreground" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="font-medium text-sm mb-1 text-foreground" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="mb-1 last:mb-0 text-sm leading-relaxed" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="ml-3 mb-1 list-disc text-sm space-y-0.5" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="ml-3 mb-1 list-decimal text-sm space-y-0.5" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="text-sm leading-relaxed" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-semibold text-foreground" {...props} />
                          ),
                          em: ({ node, ...props }) => (
                            <em className="italic" {...props} />
                          ),
                          code: ({ node, ...props }) => (
                            <code className="bg-accent/50 px-1.5 py-0.5 rounded text-xs font-mono border" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-2 border-primary/30 pl-3 italic text-sm bg-accent/20 py-1 rounded-r" {...props} />
                          ),
                        }}>
                        {step}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
