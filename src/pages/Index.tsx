
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <Dashboard />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
