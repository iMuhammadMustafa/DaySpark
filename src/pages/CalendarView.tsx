
import React, { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useTrackables } from '@/hooks/useTrackables';
import { useEntries } from '@/hooks/useEntries';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';

export default function CalendarView() {
  const { user, signOut } = useAuth();
  const { trackables, loading: trackablesLoading } = useTrackables();
  const { entries, loading: entriesLoading } = useEntries();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getEntriesForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return entries.filter(entry => entry.date === dateString && entry.completed);
  };

  const getTrackableById = (id: string) => {
    return trackables.find(t => t.id === id);
  };

  const hasEntriesForDate = (date: Date) => {
    return getEntriesForDate(date).length > 0;
  };

  const selectedDateEntries = selectedDate ? getEntriesForDate(selectedDate) : [];

  if (trackablesLoading || entriesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <header className="bg-card border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Activity Calendar</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">View all your activities in calendar format</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user?.email}</span>
              <ThemeToggle />
              <button
                onClick={signOut}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Out
              </button>
            </div>
          </header>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Calendar View</h2>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      hasEntries: (date) => hasEntriesForDate(date),
                    }}
                    modifiersStyles={{
                      hasEntries: {
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </div>
              </div>

              {/* Selected Date Details */}
              <div className="space-y-6">
                {/* Date Summary */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                  </h3>
                  
                  {selectedDate && (
                    <div className="space-y-4">
                      {selectedDateEntries.length > 0 ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {selectedDateEntries.length} {selectedDateEntries.length === 1 ? 'activity' : 'activities'} completed
                          </p>
                          <div className="space-y-2">
                            {selectedDateEntries.map((entry) => {
                              const trackable = getTrackableById(entry.trackable_id);
                              if (!trackable) return null;
                              
                              return (
                                <div key={entry.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: trackable.color }}
                                  />
                                  <span className="text-sm font-medium">{trackable.name}</span>
                                  {entry.notes && (
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      Has notes
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">No activities completed on this date</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Your Activities</h3>
                  <div className="space-y-2">
                    {trackables.map((trackable) => (
                      <div key={trackable.id} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: trackable.color }}
                        />
                        <span className="text-sm">{trackable.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded bg-primary"></div>
                      <span>Days with completed activities</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
