
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Entry {
  id: string;
  trackable_id: string;
  date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
}

export function useEntries(trackableId?: string) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEntries = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('entries')
        .select('*')
        .order('date', { ascending: false });

      if (trackableId) {
        query = query.eq('trackable_id', trackableId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (trackableId: string, date: string, completed: boolean = true, notes?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('entries')
        .upsert({
          user_id: user.id,
          trackable_id: trackableId,
          date,
          completed,
          notes,
        })
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => {
        const filtered = prev.filter(e => !(e.trackable_id === trackableId && e.date === date));
        return [data, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save entry",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEntry = async (trackableId: string, date: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('trackable_id', trackableId)
        .eq('date', date);

      if (error) throw error;
      setEntries(prev => prev.filter(e => !(e.trackable_id === trackableId && e.date === date)));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user, trackableId]);

  return {
    entries,
    loading,
    createEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
}
