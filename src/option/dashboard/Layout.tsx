import React from 'react';
import { TopBar } from './TopBar';
import { Overlay } from './Overlay';
import { Sidebar } from './sidebar/Sidebar';
import { DashboardProvider } from './Provider';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: LayoutProps) {
  return (
    <DashboardProvider>
      <div className="bg-slate-50 zinc-900 min-h-screen overflow-hidden relative">
        <div className="flex items-start">
          <Overlay />
          <Sidebar mobileOrientation="end" />
          <div className="flex flex-col h-screen pl-6 pr-4 w-full lg:pl-28 lg:space-y-4">
            {/* <TopBar /> */}
            <main className="h-screen overflow-hidden pb-36 pt-4 px-2 md:pb-8 md:pt-4 lg:pt-0 lg:px-4">{children}</main>
          </div>
        </div>
      </div>
      <Toaster />
    </DashboardProvider>
  );
}
