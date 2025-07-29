"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Send, Loader, Paperclip, Mic } from "lucide-react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  placeholder: string;
  disabled: boolean;
  isLoading: boolean;
  waitingForResponse: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onInputChange,
  onSend,
  onKeyPress,
  placeholder,
  disabled,
  isLoading,
  waitingForResponse,
}) => {
  return (
    <div className="relative">
      <Textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyPress}
        placeholder={placeholder}
        className="min-h-[60px] max-h-[200px] pr-20 resize-none"
        disabled={disabled}
      />
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={disabled}>
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={disabled}>
          <Mic className="h-4 w-4" />
        </Button>
        <Button
          onClick={onSend}
          disabled={disabled || !input.trim()}
          size="sm"
          className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading || waitingForResponse ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
