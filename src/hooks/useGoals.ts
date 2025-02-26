
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Goal {
  id: string;
  trackable_id: string;
  target_value: number;
  target_period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export function useGoals(trackableId?: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (trackableId) {
        query = query.eq('trackable_id', trackableId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{ ...goal, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setGoals(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Goal created successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setGoals(prev => prev.map(g => g.id === id ? data : g));
      toast({
        title: "Success",
        description: "Goal updated successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGoals(prev => prev.filter(g => g.id !== id));
      toast({
        title: "Success",
        description: "Goal deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user, trackableId]);

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals,
  };
}
