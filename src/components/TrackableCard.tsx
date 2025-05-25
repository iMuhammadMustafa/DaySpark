
import React from 'react';
import { Card } from '@/components/ui/card';

interface Trackable {
  id: number;
  name: string;
  color: string;
  description: string;
}

interface TrackableCardProps {
  trackable: Trackable;
  isSelected: boolean;
  onClick: () => void;
}

export function TrackableCard({ trackable, isSelected, onClick }: TrackableCardProps) {
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
        <span className="text-sm text-gray-500">7 day streak</span>
        <span className="text-sm font-medium text-green-600">85% this month</span>
      </div>
    </Card>
  );
}
