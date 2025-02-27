
import React from 'react';
import { useEntries } from '@/hooks/useEntries';
import { Trackable } from '@/hooks/useTrackables';
import { format, startOfYear, endOfYear, eachDayOfInterval, getDay, startOfWeek } from 'date-fns';

interface ContributionCalendarProps {
  trackable: Trackable;
}

const getIntensityColor = (hasEntry: boolean, baseColor: string) => {
  if (!hasEntry) return 'hsl(var(--muted))';
  return baseColor;
};

export function ContributionCalendar({ trackable }: ContributionCalendarProps) {
  const { entries } = useEntries(trackable.id);
  
  const generateCalendarData = () => {
    const today = new Date();
    const startDate = startOfYear(today);
    const endDate = today;
    
    const allDates = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Pad the start to align with Monday (1)
    const firstDayOfWeek = getDay(startDate);
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert Sunday (0) to 6
    
    const paddedDates = [];
    for (let i = paddingDays - 1; i >= 0; i--) {
      const paddingDate = new Date(startDate);
      paddingDate.setDate(startDate.getDate() - i - 1);
      paddedDates.push({
        date: format(paddingDate, 'yyyy-MM-dd'),
        hasEntry: false,
        isPadding: true,
      });
    }
    
    const actualDates = allDates.map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const hasEntry = entries.some(entry => 
        entry.date === dateString && entry.completed
      );
      
      return {
        date: dateString,
        hasEntry,
        isPadding: false,
      };
    });
    
    return [...paddedDates, ...actualDates];
  };

  const data = generateCalendarData();
  
  // Group data by weeks (7 days each)
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
    const year = today.getFullYear();
    
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1);
      if (date <= today) {
        // Calculate which week this month starts in
        const monthStart = new Date(year, month, 1);
        const yearStart = new Date(year, 0, 1);
        const daysDiff = Math.floor((monthStart.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
        const firstDayOfYear = getDay(yearStart);
        const paddingDays = firstDayOfYear === 0 ? 6 : firstDayOfYear - 1;
        const weekIndex = Math.floor((daysDiff + paddingDays) / 7);
        
        labels.push({
          month: months[month],
          weekIndex: weekIndex,
        });
      }
    }
    
    return labels;
  };

  const completedCount = data.filter(d => d.hasEntry && !d.isPadding).length;
  const dayLabels = ['Mon', 'Wed', 'Fri'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {completedCount} contributions this year
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <span>Less</span>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-muted" />
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
          <div className="hidden sm:flex text-xs text-muted-foreground mb-2 relative" style={{ paddingLeft: '32px' }}>
            {getMonthLabels().map((label, index) => (
              <div 
                key={index} 
                className="absolute text-left"
                style={{ 
                  left: `${32 + (label.weekIndex * 16)}px`,
                  minWidth: '28px'
                }}
              >
                {label.month}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="hidden sm:flex flex-col text-xs text-muted-foreground mr-2 w-7">
              {dayLabels.map((day, index) => (
                <div 
                  key={day} 
                  className="h-3 flex items-center justify-end pr-1" 
                  style={{ 
                    marginTop: index === 0 ? '0' : '4px',
                    marginBottom: '4px'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm transition-all hover:ring-1 hover:ring-ring ${
                        day.isPadding ? 'opacity-0 pointer-events-none' : 'cursor-pointer'
                      }`}
                      style={{ 
                        backgroundColor: day.isPadding ? 'transparent' : getIntensityColor(day.hasEntry, trackable.color)
                      }}
                      title={day.isPadding ? '' : `${day.date}: ${day.hasEntry ? 'Completed' : 'Not completed'} ${trackable.name.toLowerCase()}`}
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
