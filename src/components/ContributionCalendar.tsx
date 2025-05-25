
import React from 'react';

interface Trackable {
  id: number;
  name: string;
  color: string;
  description: string;
}

interface ContributionCalendarProps {
  trackable: Trackable;
}

// Generate mock data for the last 365 days
const generateMockData = (color: string) => {
  const data = [];
  const today = new Date();
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random completion (0-4 levels)
    const level = Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0;
    
    data.push({
      date: date.toISOString().split('T')[0],
      level,
      count: level,
    });
  }
  
  return data;
};

const getIntensityColor = (level: number, baseColor: string) => {
  const intensities = {
    0: '#f3f4f6',
    1: baseColor + '40',
    2: baseColor + '60',
    3: baseColor + '80',
    4: baseColor,
  };
  return intensities[level as keyof typeof intensities] || intensities[0];
};

export function ContributionCalendar({ trackable }: ContributionCalendarProps) {
  const data = generateMockData(trackable.color);
  
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
        position: (11 - i) * 4.3, // Approximate position
      });
    }
    
    return labels;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {data.filter(d => d.level > 0).length} contributions in the last year
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getIntensityColor(level, trackable.color) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex text-xs text-gray-500 mb-2 pl-8">
            {getMonthLabels().map((label, index) => (
              <div key={index} className="w-11 text-center">
                {label.month}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col text-xs text-gray-500 mr-2">
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Mon</div>
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Wed</div>
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Fri</div>
              <div className="h-3"></div>
            </div>
            
            {/* Grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-3 h-3 rounded-sm cursor-pointer hover:ring-1 hover:ring-gray-400 transition-all"
                      style={{ backgroundColor: getIntensityColor(day.level, trackable.color) }}
                      title={`${day.date}: ${day.count} ${trackable.name.toLowerCase()}`}
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
