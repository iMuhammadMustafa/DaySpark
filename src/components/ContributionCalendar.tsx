
import React from 'react';
import { useEntries } from '@/hooks/useEntries';
import { Trackable } from '@/hooks/useTrackables';

interface ContributionCalendarProps {
  trackable: Trackable;
}

const getIntensityColor = (hasEntry: boolean, baseColor: string) => {
  if (!hasEntry) return '#f3f4f6';
  return baseColor;
};

export function ContributionCalendar({ trackable }: ContributionCalendarProps) {
  const { entries } = useEntries(trackable.id);
  
  // Generate the last 365 days
  const generateCalendarData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const hasEntry = entries.some(entry => 
        entry.date === dateString && entry.completed
      );
      
      data.push({
        date: dateString,
        hasEntry,
      });
    }
    
    return data;
  };

  const data = generateCalendarData();
  
  // Group data by weeks
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const getMonthLabels = () => {
    const labels = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push({
        month: months[date.getMonth()],
        position: (11 - i) * 4.3,
      });
    }
    
    return labels;
  };

  const completedCount = data.filter(d => d.hasEntry).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {completedCount} contributions in the last year
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <span>Less</span>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-gray-200" />
          <div
            className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm"
            style={{ backgroundColor: trackable.color }}
          />
          <span>More</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="hidden sm:flex text-xs text-gray-500 mb-2 pl-6 sm:pl-8">
            {getMonthLabels().map((label, index) => (
              <div key={index} className="w-8 sm:w-11 text-center">
                {label.month}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="flex">
            {/* Day labels - hidden on mobile */}
            <div className="hidden sm:flex flex-col text-xs text-gray-500 mr-2">
              <div className="h-2 sm:h-3"></div>
              <div className="h-2 sm:h-3 flex items-center">Mon</div>
              <div className="h-2 sm:h-3"></div>
              <div className="h-2 sm:h-3 flex items-center">Wed</div>
              <div className="h-2 sm:h-3"></div>
              <div className="h-2 sm:h-3 flex items-center">Fri</div>
              <div className="h-2 sm:h-3"></div>
            </div>
            
            {/* Grid */}
            <div className="flex gap-0.5 sm:gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5 sm:gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm cursor-pointer hover:ring-1 hover:ring-gray-400 transition-all"
                      style={{ backgroundColor: getIntensityColor(day.hasEntry, trackable.color) }}
                      title={`${day.date}: ${day.hasEntry ? 'Completed' : 'Not completed'} ${trackable.name.toLowerCase()}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
