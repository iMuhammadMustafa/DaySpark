
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Calendar, Plus, User, Check } from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Add Trackable",
    url: "#",
    icon: Plus,
  },
  {
    title: "Daily Check-in",
    url: "#",
    icon: Check,
  },
  {
    title: "Profile",
    url: "#",
    icon: User,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r bg-white">
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">DayTracker</h1>
            <p className="text-sm text-gray-500">Build better habits</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.title}</span>
                    </a>
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
