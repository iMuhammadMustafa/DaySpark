
import React from 'react';
import { Card } from '@/components/ui/card';
import { useEntries } from '@/hooks/useEntries';
import { Trackable } from '@/hooks/useTrackables';

interface TrackableCardProps {
  trackable: Trackable;
  isSelected: boolean;
  onClick: () => void;
}

export function TrackableCard({ trackable, isSelected, onClick }: TrackableCardProps) {
  const { entries } = useEntries(trackable.id);
  
  // Calculate streak and monthly percentage
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const recentEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= thirtyDaysAgo && entry.completed;
  });
  
  // Calculate current streak
  let streak = 0;
  const sortedEntries = entries
    .filter(e => e.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    if (entryDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  
  const monthlyPercentage = Math.round((recentEntries.length / 30) * 100);

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:scale-105'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: trackable.color }}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{trackable.name}</h3>
          <p className="text-sm text-gray-600">{trackable.description}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">{streak} day streak</span>
        <span className="text-sm font-medium text-green-600">{monthlyPercentage}% this month</span>
      </div>
    </Card>
  );
}
