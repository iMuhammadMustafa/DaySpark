
import React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ReferenceLine } from 'recharts';
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
    return (
      <Card className="p-4 sm:p-6">
        <div className="text-center py-8">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Goals Set</h3>
          <p className="text-muted-foreground">Set a goal for this trackable to see progress charts.</p>
        </div>
      </Card>
    );
  }

  const goal = goals[0];
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

  const periodEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= periodStart && entryDate <= periodEnd && entry.completed;
  });

  const currentProgress = periodEntries.length;
  const progressPercentage = Math.round((currentProgress / goal.target_value) * 100);

  const chartDays = Math.max(30, periodDays);
  const chartData = [];
  
  for (let i = chartDays - 1; i >= 0; i--) {
    const date = subDays(today, i);
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
    if (progressPercentage >= 100) return 'text-green-600 dark:text-green-400';
    if (progressPercentage >= 75) return 'text-blue-600 dark:text-blue-400';
    if (progressPercentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusIcon = () => {
    if (progressPercentage >= 100) return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
    if (progressPercentage < 50) return <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
    return <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  };

  const getProgressBarColor = () => {
    if (progressPercentage >= 100) return '#22c55e';
    if (progressPercentage >= 75) return '#3b82f6';
    if (progressPercentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const chartConfig = {
    progress: {
      label: "Progress",
      color: trackable.color,
    },
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" style={{ color: trackable.color }} />
          <h3 className="text-lg font-semibold text-foreground">Goal Progress</h3>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {currentProgress}/{goal.target_value} ({progressPercentage}%)
          </span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-3">
          Target: {goal.target_value} times per {goal.target_period.replace('ly', '')}
        </p>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(progressPercentage, 100)}%`,
              backgroundColor: getProgressBarColor()
            }}
          />
        </div>
      </div>

      <div className="h-64">
        <ChartContainer config={chartConfig}>
          <LineChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
              axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              tickLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, Math.max(goal.target_value, Math.max(...chartData.map(d => d.progress)) || 0)]}
              axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              tickLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="progress"
              stroke={trackable.color}
              strokeWidth={3}
              dot={{ fill: trackable.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: trackable.color, strokeWidth: 2 }}
              name="Progress"
            />
            <ReferenceLine
              y={goal.target_value}
              stroke="#ef4444"
              strokeDasharray="8 4"
              strokeWidth={2}
              label={{ 
                value: `Goal: ${goal.target_value}`, 
                position: "top",
                style: { fontSize: '12px', fill: 'hsl(var(--foreground))' }
              }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      {progressPercentage >= 100 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              🎉 Congratulations! You've reached your goal!
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
