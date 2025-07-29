// components/FiMcpLogin.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface FiMcpLoginProps {
  onLoginSuccess: (sessionId: string, phoneNumber: string) => void;
  onClose: () => void;
  mcpServerUrl?: string;
}

export default function FiMcpLogin({
  onLoginSuccess,
  onClose,
  mcpServerUrl = 'http://localhost:8080'
}: FiMcpLoginProps) {
  const [status, setStatus] = useState('Opening login window...');
  const popupRef = useRef<Window | null>(null);
  
  const generateSessionId = () => {
    // Generate session ID in the format expected by Go server
    return `mcp-session-${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 12)}`;
  };

  const handleMessage = useCallback((event: MessageEvent) => {
      // IMPORTANT: In a production environment, you must validate event.origin
      // to ensure the message is coming from your trusted auth server.
      // if (event.origin !== mcpServerUrl) {
      //   console.warn('Message from untrusted origin ignored:', event.origin);
      //   return;
      // }

      if (event.data && event.data.type === 'FIMCP_LOGIN_SUCCESS') {
          popupRef.current?.close();
          onLoginSuccess(event.data.sessionId, event.data.phoneNumber);
      }
  }, [onLoginSuccess]);


  useEffect(() => {
    // Generate session ID and open popup
    const newSessionId = "mcp-session-594e48ea-fea1-40ef-8c52-7552dd9272af";
    const loginUrl = `${mcpServerUrl}/mockWebPage?sessionId=${newSessionId}`;
    localStorage.setItem('fi-mcp-temp-session-id', newSessionId);  // Store temporarily

    // This is the correct way to open a popup that maintains its opener reference
    popupRef.current = window.open(
      loginUrl,
      'fi-mcp-login',
      'width=500,height=700,scrollbars=yes,resizable=yes'
    );

     window.addEventListener('message', handleMessage, false);

    if (!popupRef.current) {
      setStatus('Popup blocked! Please allow popups for this site.');
      setTimeout(() => onClose(), 3000);
      return;
    } else {
        setStatus('Please complete the login in the popup window.');
    }

    const checkPopupClosed = setInterval(() => {
      if (popupRef.current && popupRef.current.closed) {
        clearInterval(checkPopupClosed);
        window.removeEventListener('message', handleMessage);
        onClose(); // Close the dialog if the user manually closes the popup
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(checkPopupClosed);
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, [handleMessage, mcpServerUrl, onClose]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fi MCP Authentication</DialogTitle>
          <DialogDescription>
            A popup window has been opened. Please complete the login process there to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{status}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
