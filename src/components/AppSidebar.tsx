
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
} from "@/components/ui/sidebar";
import { Calendar, Plus, User, Check, BarChart3, CalendarDays } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Calendar View",
    url: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Check-in",
    url: "#checkin",
    icon: Check,
  },
  {
    title: "Add Trackable",
    url: "#add",
    icon: Plus,
  },
  {
    title: "Manage",
    url: "#manage",
    icon: User,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (url: string) => {
    if (url.startsWith('#')) {
      const section = url.substring(1);
      if (section === 'add') {
        // Trigger add trackable dialog
        const addButton = document.querySelector('[data-dialog="add-trackable"]') as HTMLElement;
        addButton?.click();
      } else {
        // Switch to the appropriate tab
        const tabTrigger = document.querySelector(`[value="${section}"]`) as HTMLElement;
        tabTrigger?.click();
      }
    } else {
      // Navigate to the page
      navigate(url);
    }
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
                      location.pathname === item.url ? 'bg-accent text-accent-foreground' : ''
                    }`}
                    onClick={() => handleNavigation(item.url)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
