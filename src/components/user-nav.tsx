// src/components/user-nav.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import FiMcpLogin from './FiMcpLogin';
import { useToast } from '@/hooks/use-toast';

export default function UserNav() {
  const { isAuthenticated, sessionId, phoneNumber, logout, login } = useAuth();
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleLoginSuccess = (newSessionId: string, newPhoneNumber: string) => {
    login(newSessionId, newPhoneNumber);
    setLoginDialogOpen(false);
    toast({
      title: 'Login Successful!',
      description: `You are now logged in as ${newPhoneNumber}.`,
    });
  };

  const handleLogOut = () => {
    // Logout immediately first
    logout();
    
    toast({
      title: 'Logged Out',
      description: 'You have successfully logged out.',
    });

    // Force page reload to clear any cached state
    window.location.href = '/';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="user avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          {isAuthenticated ? (
            <>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Authenticated User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {phoneNumber}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={ () => {handleLogOut()}}>
                Log out
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuLabel>Welcome, Guest</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLoginDialogOpen(true)}>
                Log In
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isLoginDialogOpen && (
         <FiMcpLogin 
          onLoginSuccess={handleLoginSuccess} 
          onClose={() => setLoginDialogOpen(false)}
        />
      )}
    </>
  );
}
