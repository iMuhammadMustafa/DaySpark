
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Trackable {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export function useTrackables() {
  const [trackables, setTrackables] = useState<Trackable[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTrackables = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trackables')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTrackables(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch trackables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTrackable = async (trackable: Omit<Trackable, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trackables')
        .insert([{ ...trackable, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setTrackables(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Trackable created successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create trackable",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTrackable = async (id: string, updates: Partial<Trackable>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trackables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTrackables(prev => prev.map(t => t.id === id ? data : t));
      toast({
        title: "Success",
        description: "Trackable updated successfully",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update trackable",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTrackable = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trackables')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTrackables(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Success",
        description: "Trackable deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete trackable",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTrackables();
  }, [user]);

  return {
    trackables,
    loading,
    createTrackable,
    updateTrackable,
    deleteTrackable,
    refetch: fetchTrackables,
  };
}
