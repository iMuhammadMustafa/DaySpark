
import React from 'react';
import { Flame, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEntries } from '@/hooks/useEntries';
import { Trackable } from '@/hooks/useTrackables';

interface StreakDisplayProps {
  trackable: Trackable;
}

export function StreakDisplay({ trackable }: StreakDisplayProps) {
  const { entries } = useEntries(trackable.id);

  const calculateStats = () => {
    const today = new Date();
    const completedEntries = entries.filter(e => e.completed);
    
    // Calculate current streak
    let currentStreak = 0;
    const sortedEntries = completedEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const allEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (let i = 0; i < allEntries.length; i++) {
      if (allEntries[i].completed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate completion rate (last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const recentEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= thirtyDaysAgo && entry.completed;
    });
    
    const completionRate = Math.round((recentEntries.length / 30) * 100);

    return {
      currentStreak,
      longestStreak,
      completionRate,
      totalCompletions: completedEntries.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 text-center">
        <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
        <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
        <div className="text-sm text-gray-600">Current Streak</div>
      </Card>
      
      <Card className="p-4 text-center">
        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
        <div className="text-2xl font-bold text-gray-900">{stats.longestStreak}</div>
        <div className="text-sm text-gray-600">Best Streak</div>
      </Card>
      
      <Card className="p-4 text-center">
        <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-500" />
        <div className="text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
        <div className="text-sm text-gray-600">30-Day Rate</div>
      </Card>
      
      <Card className="p-4 text-center">
        <div 
          className="w-6 h-6 mx-auto mb-2 rounded-full"
          style={{ backgroundColor: trackable.color }}
        />
        <div className="text-2xl font-bold text-gray-900">{stats.totalCompletions}</div>
        <div className="text-sm text-gray-600">Total Done</div>
      </Card>
    </div>
  );
}
