
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PanelLeft,
  LayoutGrid,
  MessageCircle,
  Settings,
  Target,
  Briefcase,
  Bell,
  CheckCircle,
  AlertTriangle,
  Map,
  Calendar,
  BrainCircuit,
  TrendingUp,
  Receipt,
  Shield,
  MoreHorizontal,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import UserNav from '@/components/user-nav';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { ThemeToggle } from './theme-toggle';

// Primary navigation items (always visible on desktop)
const primaryNavItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/transactions', icon: Receipt, label: 'Transactions' },
  { href: '/stocks', icon: TrendingUp, label: 'Stocks' },
  { href: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  { href: '/chat', icon: MessageCircle, label: 'AI Chat' },
];

// Secondary navigation items (hidden in dropdown on smaller screens)
const secondaryNavItems = [
  { href: '/epf', icon: Shield, label: 'EPF' },
  { href: '/credit-report', icon: Shield, label: 'Credit Report' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/insights', icon: TrendingUp, label: 'Insights' },
  { href: '/map', icon: Map, label: 'Map' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
];

// All navigation items for mobile
const allNavItems = [...primaryNavItems, ...secondaryNavItems];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-8 flex ">
          <Link href="/" className="mr-6 ml-3  flex items-center space-x-3 transition-opacity hover:opacity-80">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00b899] to-[#0072ff]
 opacity-20 blur-sm"></div>
              <BrainCircuit className="h-6 w-6 text-[#00b899]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Artha
              </span>
              <span className="text-xs text-muted-foreground -mt-1 font-medium">
                Your personal financial assistant
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {/* Primary Navigation Items */}
            {primaryNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive 
                      ? 'text-[#00b899] bg-[#00b899]/10 shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-[#00b899]/5'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00b899]/10 to-[#00b899]/5 border border-[#00b899]/20"></div>
                  )}
                </Link>
              );
            })}
            
            {/* More Dropdown for Secondary Items */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    'relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200',
                    secondaryNavItems.some(item => pathname.startsWith(item.href))
                      ? 'text-[#00b899] bg-[#00b899]/10 shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-[#00b899]/5'
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="hidden lg:inline">More</span>
                  {secondaryNavItems.some(item => pathname.startsWith(item.href)) && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00b899]/10 to-[#00b899]/5 border border-[#00b899]/20"></div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 p-1 border-border/50 shadow-xl bg-background/80 backdrop-blur-xl" align="end">
                {secondaryNavItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                          isActive 
                            ? 'text-[#00b899] bg-[#00b899]/10' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-[#00b899]/5'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2 mr-3">
          <div className="hidden items-center space-x-1 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative h-9 w-9 rounded-full hover:bg-accent/50 transition-colors duration-200"
                >
                  <Bell className="h-4 w-4" />
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 text-xs font-bold border-2 border-background shadow-lg animate-pulse" 
                    variant="destructive"
                  >
                    2
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-0 border-border/50 shadow-xl bg-background/80 backdrop-blur-xl" align="end" forceMount>
                <div className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold">Notifications</h4>
                    <Badge variant="secondary" className="text-xs">2 new</Badge>
                  </div>
                </div>
                <DropdownMenuSeparator className="mx-4" />
                <div className="p-2">
                  <DropdownMenuItem className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="mt-0.5">
                      <AlertTriangle className="h-4 w-4 text-orange-500"/>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Idle Cash Alert</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        ₹3.2L is earning minimal returns. Consider high-yield options.
                      </p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-500"/>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Goal Achieved</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        You've hit 75% of your Emergency Fund goal! Keep it up.
                      </p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="mx-4" />
                <div className="p-2">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View All Notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="h-6 w-px bg-border/60 mx-1"></div>
            
            <ThemeToggle />
            <UserNav />
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 rounded-full md:hidden hover:bg-accent/50 transition-colors duration-200"
              >
                <PanelLeft className="h-4 w-4" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 border-border/50 bg-background/80 backdrop-blur-xl">
              <div className="flex items-center gap-3 p-6 border-b border-border/50">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 opacity-20 blur-sm"></div>
                  <BrainCircuit className="h-6 w-6 text-[#00b899]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Artha</h2>
                  <p className="text-sm text-muted-foreground">Your personal financial assiatant</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {allNavItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-[#00b899]/5',
                        isActive 
                          ? 'text-[#00b899] bg-[#00b899]/10' 
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <div className="my-2 h-px bg-border/60"></div>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[#00b899]/5 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <div className="my-2 h-px bg-border/60"></div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <div className="px-3 py-2">
                  <UserNav />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

    