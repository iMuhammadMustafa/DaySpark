
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DashboardSettings {
  id: string;
  user_id: string;
  selected_trackables: string[];
  trackable_order: string[];
  created_at: string;
  updated_at: string;
}

export function useDashboardSettings() {
  const [settings, setSettings] = useState<DashboardSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dashboard_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (selectedTrackables: string[], trackableOrder: string[]) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dashboard_settings')
        .upsert({
          user_id: user.id,
          selected_trackables: selectedTrackables,
          trackable_order: trackableOrder,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setSettings(data as DashboardSettings);
      toast({
        title: "Success",
        description: "Dashboard settings saved successfully",
      });
      return data as DashboardSettings;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save dashboard settings",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetToDefault = async (allTrackableIds: string[]) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dashboard_settings')
        .upsert({
          user_id: user.id,
          selected_trackables: allTrackableIds,
          trackable_order: allTrackableIds,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setSettings(data as DashboardSettings);
      toast({
        title: "Success",
        description: "Dashboard reset to default settings",
      });
      return data as DashboardSettings;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reset dashboard settings",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    updateSettings,
    resetToDefault,
    refetch: fetchSettings,
  };
}
