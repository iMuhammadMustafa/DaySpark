import React, { useState } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ContributionCalendar } from './ContributionCalendar';
import { TrackableCard } from './TrackableCard';
import { DailyCheckIn } from './DailyCheckIn';
import { AddTrackableDialog } from './AddTrackableDialog';
import { TrackableManagement } from './TrackableManagement';
import { StreakDisplay } from './StreakDisplay';
import { GoalProgressChart } from './GoalProgressChart';
import { DashboardCustomization } from './DashboardCustomization';
import { useTrackables } from '@/hooks/useTrackables';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu } from 'lucide-react';

export function Dashboard() {
  const { trackables, loading } = useTrackables();
  const { settings, loading: settingsLoading } = useDashboardSettings();
  const { user, signOut } = useAuth();
  const [selectedTrackable, setSelectedTrackable] = useState<string | null>(null);
  const [customSelectedTrackables, setCustomSelectedTrackables] = useState<string[]>([]);
  const [customTrackableOrder, setCustomTrackableOrder] = useState<string[]>([]);

  // Initialize custom settings
  React.useEffect(() => {
    if (settings) {
      setCustomSelectedTrackables(settings.selected_trackables);
      setCustomTrackableOrder(settings.trackable_order);
    } else if (trackables.length > 0) {
      const allIds = trackables.map(t => t.id);
      setCustomSelectedTrackables(allIds);
      setCustomTrackableOrder(allIds);
    }
  }, [settings, trackables]);

  // Set default selected trackable when trackables load
  React.useEffect(() => {
    if (trackables.length > 0 && !selectedTrackable) {
      const displayTrackables = getDisplayTrackables();
      if (displayTrackables.length > 0) {
        setSelectedTrackable(displayTrackables[0].id);
      }
    }
  }, [trackables, selectedTrackable, customSelectedTrackables, customTrackableOrder]);

  const getDisplayTrackables = () => {
    if (customSelectedTrackables.length === 0) return trackables;
    
    // Filter and order trackables based on user settings
    const selectedTrackables = trackables.filter(t => 
      customSelectedTrackables.includes(t.id)
    );
    
    // Sort by custom order
    return selectedTrackables.sort((a, b) => {
      const aIndex = customTrackableOrder.indexOf(a.id);
      const bIndex = customTrackableOrder.indexOf(b.id);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  };

  const handleSettingsChange = (selectedIds: string[], orderedIds: string[]) => {
    setCustomSelectedTrackables(selectedIds);
    setCustomTrackableOrder(orderedIds);
    
    // Update selected trackable if current one is no longer displayed
    if (selectedTrackable && !selectedIds.includes(selectedTrackable)) {
      setSelectedTrackable(selectedIds.length > 0 ? selectedIds[0] : null);
    }
  };

  const currentTrackable = trackables.find(t => t.id === selectedTrackable);
  const displayTrackables = getDisplayTrackables();

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your trackables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger className="md:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Track your daily habits and progress</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Welcome, {user?.email}</span>
          <DashboardCustomization 
            trackables={trackables} 
            onSettingsChange={handleSettingsChange}
          />
          <AddTrackableDialog />
          <button
            onClick={signOut}
            className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        {trackables.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">No trackables yet</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Create your first trackable to start tracking your daily habits.</p>
            <AddTrackableDialog />
          </div>
        ) : displayTrackables.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">No activities selected</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Customize your dashboard to select which activities to display.</p>
            <DashboardCustomization 
              trackables={trackables} 
              onSettingsChange={handleSettingsChange}
            />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="checkin" className="text-xs sm:text-sm">Check-in</TabsTrigger>
              <TabsTrigger value="manage" className="text-xs sm:text-sm">Manage</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 sm:space-y-8">
              {/* Trackables Grid */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Activities</h2>
                  {displayTrackables.length !== trackables.length && (
                    <p className="text-sm text-gray-500">
                      Showing {displayTrackables.length} of {trackables.length} activities
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayTrackables.map((trackable) => (
                    <TrackableCard
                      key={trackable.id}
                      trackable={trackable}
                      isSelected={selectedTrackable === trackable.id}
                      onClick={() => setSelectedTrackable(trackable.id)}
                    />
                  ))}
                </div>
              </section>

              {/* Stats for selected trackable */}
              {currentTrackable && (
                <section>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                    Stats: {currentTrackable.name}
                  </h2>
                  <StreakDisplay trackable={currentTrackable} />
                </section>
              )}

              {/* Goal Progress Chart */}
              {currentTrackable && (
                <section>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                    Goal Progress: {currentTrackable.name}
                  </h2>
                  <GoalProgressChart trackable={currentTrackable} />
                </section>
              )}

              {/* Calendar Visualization */}
              {currentTrackable && (
                <section>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                    Progress Calendar: {currentTrackable.name}
                  </h2>
                  <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                    <ContributionCalendar trackable={currentTrackable} />
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="checkin">
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Today's Check-in</h2>
                <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                  <DailyCheckIn trackables={trackables} />
                </div>
              </section>
            </TabsContent>

            <TabsContent value="manage">
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <TrackableManagement trackables={trackables} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
