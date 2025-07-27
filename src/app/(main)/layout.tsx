
'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/header';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

const MotionMain = dynamic(() => import('framer-motion').then(mod => mod.motion.main), { ssr: false });

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-400/20 dark:bg-violet-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/20 dark:bg-accent/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      <Header />
      <div className="flex flex-1 flex-col">
        {isClient && (
          <AnimatePresence mode="wait">
            <MotionMain
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-1 p-6 md:p-8"
            >
              {children}
            </MotionMain>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

    