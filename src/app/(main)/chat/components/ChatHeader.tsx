"use client";
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, MoreHorizontal, Brain } from "lucide-react";

interface ChatHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  activeSession: string;
  firebaseUser: any;
  hasThinking: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  sidebarCollapsed,
  onToggleSidebar,
  activeSession,
  firebaseUser,
  hasThinking,
}) => {
  return (
    <div className="border-b border-border bg-card p-4 pb-6 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {sidebarCollapsed && (
            <Button
              onClick={onToggleSidebar}
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
              Session Id: {activeSession}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasThinking && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <Brain className="h-3 w-3 mr-1" />
              Thinking Available
            </Badge>
          )}
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
