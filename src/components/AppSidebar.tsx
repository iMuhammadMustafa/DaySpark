
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Calendar, Plus, User, Check, BarChart3, CalendarDays, Settings, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { useTrackables } from '@/hooks/useTrackables';
import { DashboardCustomization } from './DashboardCustomization';

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
    type: "route" as const,
  },
  {
    title: "Calendar View",
    url: "/calendar",
    icon: CalendarDays,
    type: "route" as const,
  },
  {
    title: "Check-in",
    url: "#checkin",
    icon: Check,
    type: "tab" as const,
  },
  {
    title: "Add Trackable",
    url: "#add",
    icon: Plus,
    type: "dialog" as const,
  },
  {
    title: "Manage",
    url: "#manage",
    icon: User,
    type: "tab" as const,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { trackables } = useTrackables();

  const handleNavigation = (item: typeof navigationItems[0]) => {
    if (item.type === 'route') {
      // Navigate to the page
      navigate(item.url);
    } else if (item.type === 'dialog') {
      // For dialogs, only navigate to dashboard if not already there, then trigger dialog
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete before triggering dialog
        setTimeout(() => {
          const section = item.url.substring(1);
          const addButton = document.querySelector('[data-dialog="add-trackable"]') as HTMLElement;
          addButton?.click();
        }, 100);
      } else {
        const section = item.url.substring(1);
        const addButton = document.querySelector('[data-dialog="add-trackable"]') as HTMLElement;
        addButton?.click();
      }
    } else if (item.type === 'tab') {
      // For tabs, only navigate to dashboard if not already there, then switch tab
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete before switching tab
        setTimeout(() => {
          const section = item.url.substring(1);
          const tabTrigger = document.querySelector(`[value="${section}"]`) as HTMLElement;
          tabTrigger?.click();
        }, 100);
      } else {
        const section = item.url.substring(1);
        const tabTrigger = document.querySelector(`[value="${section}"]`) as HTMLElement;
        tabTrigger?.click();
      }
    }
  };

  const isItemActive = (item: typeof navigationItems[0]) => {
    if (item.type === 'route') {
      return location.pathname === item.url;
    }
    // For tabs and dialogs, they're only active when on dashboard AND not when on other routes
    return false; // We'll handle tab active state differently in the Dashboard component
  };

  const handleSettingsChange = (selectedIds: string[], orderedIds: string[]) => {
    // This will be handled by the DashboardCustomization component itself
    // and passed down to the Dashboard component
  };

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarHeader className="border-b border-border p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">DayTracker</h1>
            <p className="text-sm text-muted-foreground">Build better habits</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className={`hover:bg-accent hover:text-accent-foreground transition-colors ${
                      isItemActive(item) ? 'bg-accent text-accent-foreground' : ''
                    }`}
                    onClick={() => handleNavigation(item)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {location.pathname === '/' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
              Settings
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className="px-2">
                    <DashboardCustomization 
                      trackables={trackables} 
                      onSettingsChange={handleSettingsChange}
                    />
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="text-xs text-muted-foreground mb-2 px-2">
              {user?.email}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={signOut}
              className="hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
