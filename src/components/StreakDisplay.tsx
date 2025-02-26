
import React from 'react';
import { Flame, Calendar, TrendingUp, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEntries } from '@/hooks/useEntries';
import { useGoals } from '@/hooks/useGoals';
import { Trackable } from '@/hooks/useTrackables';
import { GoalDialog } from './GoalDialog';
import { startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear } from 'date-fns';

interface StreakDisplayProps {
  trackable: Trackable;
}

export function StreakDisplay({ trackable }: StreakDisplayProps) {
  const { entries } = useEntries(trackable.id);
  const { goals, deleteGoal } = useGoals(trackable.id);

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

    // Calculate goal progress if goal exists
    let goalProgress = null;
    if (goals.length > 0) {
      const goal = goals[0];
      const today = new Date();
      let periodStart: Date;
      let periodEnd: Date;

      switch (goal.target_period) {
        case 'daily':
          periodStart = new Date(today);
          periodEnd = new Date(today);
          break;
        case 'weekly':
          periodStart = startOfWeek(today, { weekStartsOn: 1 });
          periodEnd = endOfWeek(today, { weekStartsOn: 1 });
          break;
        case 'monthly':
          periodStart = startOfMonth(today);
          periodEnd = endOfMonth(today);
          break;
        case 'yearly':
          periodStart = startOfYear(today);
          periodEnd = endOfYear(today);
          break;
      }

      const periodEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= periodStart && entryDate <= periodEnd && entry.completed;
      });

      goalProgress = {
        current: periodEntries.length,
        target: goal.target_value,
        percentage: Math.round((periodEntries.length / goal.target_value) * 100),
        period: goal.target_period,
        goalId: goal.id
      };
    }

    return {
      currentStreak,
      longestStreak,
      completionRate,
      totalCompletions: completedEntries.length,
      goalProgress
    };
  };

  const stats = calculateStats();

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goalId);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 text-center">
          <Flame className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-orange-500" />
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.currentStreak}</div>
          <div className="text-xs sm:text-sm text-gray-600">Current Streak</div>
        </Card>
        
        <Card className="p-3 sm:p-4 text-center">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-green-500" />
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.longestStreak}</div>
          <div className="text-xs sm:text-sm text-gray-600">Best Streak</div>
        </Card>
        
        <Card className="p-3 sm:p-4 text-center">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-blue-500" />
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
          <div className="text-xs sm:text-sm text-gray-600">30-Day Rate</div>
        </Card>
        
        <Card className="p-3 sm:p-4 text-center">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-purple-500" />
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCompletions}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Done</div>
        </Card>
      </div>

      {/* Goal Progress Section */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: trackable.color }} />
            Goal Progress
          </h3>
          <div className="flex gap-2">
            {stats.goalProgress ? (
              <>
                <GoalDialog trackable={trackable} goal={goals[0]}>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    Edit Goal
                  </Button>
                </GoalDialog>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteGoal(stats.goalProgress!.goalId)}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </>
            ) : (
              <GoalDialog trackable={trackable} />
            )}
          </div>
        </div>

        {stats.goalProgress ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {stats.goalProgress.current}/{stats.goalProgress.target} times per {stats.goalProgress.period.replace('ly', '')}
              </span>
              <span className={`text-sm font-medium ${
                stats.goalProgress.percentage >= 100 ? 'text-green-600' : 
                stats.goalProgress.percentage >= 75 ? 'text-blue-600' : 
                stats.goalProgress.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {stats.goalProgress.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(stats.goalProgress.percentage, 100)}%`,
                  backgroundColor: stats.goalProgress.percentage >= 100 ? '#22c55e' : 
                                 stats.goalProgress.percentage >= 75 ? '#3b82f6' : 
                                 stats.goalProgress.percentage >= 50 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            {stats.goalProgress.percentage >= 100 && (
              <div className="text-center">
                <span className="text-sm font-medium text-green-600">🎉 Goal achieved!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 mb-3">No goals set yet</p>
            <p className="text-sm text-gray-500">Set a goal to track your progress and stay motivated!</p>
          </div>
        )}
      </Card>
    </div>
  );
}
