
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Edit } from 'lucide-react';
import { useGoals, Goal } from '@/hooks/useGoals';
import { Trackable } from '@/hooks/useTrackables';

interface GoalDialogProps {
  trackable: Trackable;
  goal?: Goal;
  children?: React.ReactNode;
}

export function GoalDialog({ trackable, goal, children }: GoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [targetValue, setTargetValue] = useState(goal?.target_value?.toString() || '');
  const [targetPeriod, setTargetPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(goal?.target_period || 'weekly');
  const [loading, setLoading] = useState(false);
  const { createGoal, updateGoal } = useGoals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetValue.trim() || parseInt(targetValue) <= 0) return;

    setLoading(true);
    try {
      const goalData = {
        trackable_id: trackable.id,
        target_value: parseInt(targetValue),
        target_period: targetPeriod,
      };

      if (goal) {
        await updateGoal(goal.id, goalData);
      } else {
        await createGoal(goalData);
      }
      
      setTargetValue('');
      setTargetPeriod('weekly');
      setOpen(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            {goal ? <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> : <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
            {goal ? 'Edit Goal' : 'Set Goal'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5" />
            {goal ? 'Edit Goal' : 'Set Goal'} for {trackable.name}
          </DialogTitle>
          <DialogDescription className="text-sm">
            Set a target for how many times you want to complete this activity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-value" className="text-sm">Target Value</Label>
            <Input
              id="target-value"
              type="number"
              min="1"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="e.g., 7"
              required
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-period" className="text-sm">Time Period</Label>
            <Select value={targetPeriod} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setTargetPeriod(value)}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !targetValue.trim() || parseInt(targetValue) <= 0} className="text-sm">
              {loading ? (goal ? 'Updating...' : 'Creating...') : (goal ? 'Update Goal' : 'Create Goal')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
