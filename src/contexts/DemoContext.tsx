
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Trackable } from '@/hooks/useTrackables';
import { Entry } from '@/hooks/useEntries';
import { Goal } from '@/hooks/useGoals';
import { DashboardSettings } from '@/hooks/useDashboardSettings';

interface DemoContextType {
  isDemoMode: boolean;
  demoTrackables: Trackable[];
  demoEntries: Entry[];
  demoGoals: Goal[];
  demoSettings: DashboardSettings | null;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setIsDemoMode(user?.email === 'demo@demo.demo');
  }, [user]);

  // Mock trackables
  const demoTrackables: Trackable[] = [
    {
      id: 'demo-1',
      name: 'Morning Exercise',
      description: 'Daily workout routine',
      color: '#3b82f6',
      icon: 'dumbbell',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'demo-2',
      name: 'Read for 30 min',
      description: 'Daily reading habit',
      color: '#10b981',
      icon: 'book',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'demo-3',
      name: 'Drink 8 glasses of water',
      description: 'Stay hydrated throughout the day',
      color: '#06b6d4',
      icon: 'droplets',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'demo-4',
      name: 'Meditate',
      description: '10 minutes of mindfulness',
      color: '#8b5cf6',
      icon: 'brain',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  // Generate mock entries for the last 90 days
  const generateMockEntries = (): Entry[] => {
    const entries: Entry[] = [];
    const today = new Date();
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      demoTrackables.forEach((trackable, trackableIndex) => {
        // Vary completion rates by trackable (some habits are harder to maintain)
        const completionRates = [0.8, 0.6, 0.9, 0.7];
        const shouldComplete = Math.random() < completionRates[trackableIndex];
        
        if (shouldComplete) {
          entries.push({
            id: `demo-entry-${trackable.id}-${dateString}`,
            trackable_id: trackable.id,
            date: dateString,
            completed: true,
            created_at: date.toISOString(),
          });
        }
      });
    }
    
    return entries;
  };

  const demoEntries = generateMockEntries();

  // Mock goals
  const demoGoals: Goal[] = [
    {
      id: 'demo-goal-1',
      trackable_id: 'demo-1',
      target_value: 7,
      target_period: 'weekly',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'demo-goal-2',
      trackable_id: 'demo-2',
      target_value: 30,
      target_period: 'monthly',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  // Mock dashboard settings
  const demoSettings: DashboardSettings = {
    id: 'demo-settings',
    user_id: 'demo-user',
    selected_trackables: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
    trackable_order: ['demo-1', 'demo-2', 'demo-3', 'demo-4'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const value = {
    isDemoMode,
    demoTrackables,
    demoEntries,
    demoGoals,
    demoSettings,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
