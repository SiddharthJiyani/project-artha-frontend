"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ChatSuggestionsProps {
  suggestions: string[];
  isVisible: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  suggestions,
  isVisible,
  onSuggestionClick,
}) => {
  return (
    <AnimatePresence>
      {isVisible && suggestions.length > 0 && (
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
          {suggestions.map((suggestion, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick(suggestion)}
                className="rounded-full text-xs bg-gradient-to-r from-accent/20 to-accent/30 hover:from-accent/40 hover:to-accent/50 border-accent/50 shadow-sm transition-all duration-200 hover:shadow-md h-7 px-3">
                <Sparkles className="h-2.5 w-2.5 mr-1 text-primary" />
                {suggestion}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
