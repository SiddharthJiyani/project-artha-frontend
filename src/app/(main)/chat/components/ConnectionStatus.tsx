"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  waitingForResponse: boolean;
  firebaseUser: any;
  activeSession: string;
  pendingSessionId: string | null;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  waitingForResponse,
  firebaseUser,
  activeSession,
  pendingSessionId,
}) => {
  return (
    <div className="mt-2 text-center">
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            waitingForResponse ? "bg-orange-500" : "bg-green-500"
          )} />
          <span>
            {waitingForResponse 
              ? "Waiting for Artha AI response..." 
              : "Connected to Artha AI"
            }
          </span>
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
              Active: {activeSession.substring(0, 12)}...
            </span>
          </>
        )}
        {pendingSessionId && (
          <>
            <span>•</span>
            <span className="text-orange-500">
              Creating: {pendingSessionId.substring(0, 12)}...
            </span>
          </>
        )}
      </div>
    </div>
  );
};
