
import React from 'react';
import { useEntries } from '@/hooks/useEntries';
import { useTrackables } from '@/hooks/useTrackables';
import { format, startOfYear, eachDayOfInterval, getDay } from 'date-fns';

export function OverallContributionCalendar() {
  const { entries } = useEntries();
  const { trackables } = useTrackables();
  
  const generateCalendarData = () => {
    const today = new Date();
    const startDate = startOfYear(today);
    const endDate = today;
    
    const allDates = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Calculate completion counts for each date
    const dateCompletions = new Map<string, number>();
    let maxCompletions = 0;
    
    allDates.forEach(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const completedCount = entries.filter(entry => 
        entry.date === dateString && entry.completed
      ).length;
      
      dateCompletions.set(dateString, completedCount);
      maxCompletions = Math.max(maxCompletions, completedCount);
    });
    
    // Pad the start to align with Monday (1)
    const firstDayOfWeek = getDay(startDate);
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const paddedDates = [];
    for (let i = paddingDays - 1; i >= 0; i--) {
      const paddingDate = new Date(startDate);
      paddingDate.setDate(startDate.getDate() - i - 1);
      paddedDates.push({
        date: format(paddingDate, 'yyyy-MM-dd'),
        completions: 0,
        intensity: 0,
        isPadding: true,
      });
    }
    
    const actualDates = allDates.map(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      const completions = dateCompletions.get(dateString) || 0;
      const intensity = maxCompletions > 0 ? completions / maxCompletions : 0;
      
      return {
        date: dateString,
        completions,
        intensity,
        isPadding: false,
      };
    });
    
    return [...paddedDates, ...actualDates];
  };

  const getIntensityColor = (intensity: number, isPadding: boolean) => {
    if (isPadding) return 'transparent';
    if (intensity === 0) return 'hsl(var(--muted))';
    
    // Green color with varying opacity based on intensity
    const opacity = Math.max(0.2, intensity);
    return `rgba(34, 197, 94, ${opacity})`;
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

  const totalCompletions = data.filter(d => !d.isPadding).reduce((sum, d) => sum + d.completions, 0);
  const dayLabels = ['Mon', 'Wed', 'Fri'];

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Activity Overview</h3>
            <p className="text-sm text-muted-foreground">
              {totalCompletions} completions across {trackables.length} activities this year
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span>Less</span>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-muted" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-500/20" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-500/60" />
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm bg-green-500" />
            <span>More</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="hidden sm:flex text-xs text-muted-foreground mb-1 relative" style={{ paddingLeft: '32px', height: '16px' }}>
              {getMonthLabels().map((label, index) => (
                <div 
                  key={index} 
                  className="absolute text-left"
                  style={{ 
                    left: `${32 + (label.weekIndex * 16)}px`,
                    minWidth: '32px',
                    top: '0px'
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
                        className={`w-3 h-3 rounded-sm transition-all ${
                          day.isPadding ? 'opacity-0 pointer-events-none' : 'hover:ring-1 hover:ring-ring hover:scale-110'
                        }`}
                        style={{ 
                          backgroundColor: getIntensityColor(day.intensity, day.isPadding)
                        }}
                        title={day.isPadding ? '' : `${day.date}: ${day.completions} completions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
