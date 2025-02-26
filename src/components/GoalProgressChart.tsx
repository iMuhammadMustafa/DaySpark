
import React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import { useEntries } from '@/hooks/useEntries';
import { useGoals } from '@/hooks/useGoals';
import { Trackable } from '@/hooks/useTrackables';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear } from 'date-fns';

interface GoalProgressChartProps {
  trackable: Trackable;
}

export function GoalProgressChart({ trackable }: GoalProgressChartProps) {
  const { entries } = useEntries(trackable.id);
  const { goals } = useGoals(trackable.id);

  if (goals.length === 0) {
    return null;
  }

  const goal = goals[0]; // Use the first goal for now
  const today = new Date();

  const getPeriodData = () => {
    let periodStart: Date;
    let periodEnd: Date;
    let periodDays: number;

    switch (goal.target_period) {
      case 'daily':
        periodStart = new Date(today);
        periodEnd = new Date(today);
        periodDays = 1;
        break;
      case 'weekly':
        periodStart = startOfWeek(today, { weekStartsOn: 1 });
        periodEnd = endOfWeek(today, { weekStartsOn: 1 });
        periodDays = 7;
        break;
      case 'monthly':
        periodStart = startOfMonth(today);
        periodEnd = endOfMonth(today);
        periodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
        break;
      case 'yearly':
        periodStart = startOfYear(today);
        periodEnd = endOfYear(today);
        periodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
        break;
    }

    return { periodStart, periodEnd, periodDays };
  };

  const { periodStart, periodEnd, periodDays } = getPeriodData();

  // Get entries within the current period
  const periodEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= periodStart && entryDate <= periodEnd && entry.completed;
  });

  const currentProgress = periodEntries.length;
  const progressPercentage = Math.round((currentProgress / goal.target_value) * 100);

  // Generate chart data for the last 30 days or current period, whichever is longer
  const chartDays = Math.max(30, periodDays);
  const chartData = [];
  
  for (let i = chartDays - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEntries = entries.filter(e => e.date === dateStr && e.completed).length;
    
    // Calculate cumulative progress for the current period
    let cumulativeProgress = 0;
    if (date >= periodStart) {
      cumulativeProgress = entries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate >= periodStart && entryDate <= date && e.completed;
      }).length;
    }

    chartData.push({
      date: format(date, 'MMM dd'),
      progress: cumulativeProgress,
      target: date >= periodStart ? goal.target_value : null,
    });
  }

  const getStatusColor = () => {
    if (progressPercentage >= 100) return 'text-green-600';
    if (progressPercentage >= 75) return 'text-blue-600';
    if (progressPercentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (progressPercentage >= 100) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (progressPercentage < 50) return <AlertCircle className="w-4 h-4 text-red-600" />;
    return <Target className="w-4 h-4 text-blue-600" />;
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" style={{ color: trackable.color }} />
          <h3 className="text-lg font-semibold">Goal Progress</h3>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {currentProgress}/{goal.target_value} ({progressPercentage}%)
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Target: {goal.target_value} times per {goal.target_period.replace('ly', '')}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(progressPercentage, 100)}%`,
              backgroundColor: progressPercentage >= 100 ? '#22c55e' : progressPercentage >= 75 ? '#3b82f6' : progressPercentage >= 50 ? '#f59e0b' : '#ef4444'
            }}
          />
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, Math.max(goal.target_value, Math.max(...chartData.map(d => d.progress)))]}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="progress"
              stroke={trackable.color}
              strokeWidth={2}
              dot={{ fill: trackable.color, strokeWidth: 2, r: 3 }}
              name="Progress"
            />
            <ReferenceLine
              y={goal.target_value}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: "Goal", position: "top" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {progressPercentage >= 100 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              🎉 Congratulations! You've reached your goal!
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
