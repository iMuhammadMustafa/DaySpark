
import React, { useState } from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ContributionCalendar } from './ContributionCalendar';
import { TrackableCard } from './TrackableCard';
import { DailyCheckIn } from './DailyCheckIn';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for demonstration
const mockTrackables = [
  { id: 1, name: 'Exercise', color: '#22c55e', description: 'Daily workout routine' },
  { id: 2, name: 'Reading', color: '#3b82f6', description: 'Read for 30 minutes' },
  { id: 3, name: 'Meditation', color: '#8b5cf6', description: 'Mindfulness practice' },
  { id: 4, name: 'Water Intake', color: '#06b6d4', description: '8 glasses of water' },
];

export function Dashboard() {
  const [selectedTrackable, setSelectedTrackable] = useState(mockTrackables[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Track your daily habits and progress</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Trackable
        </Button>
      </header>

      <div className="p-6 space-y-8">
        {/* Trackables Grid */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Trackables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockTrackables.map((trackable) => (
              <TrackableCard
                key={trackable.id}
                trackable={trackable}
                isSelected={selectedTrackable.id === trackable.id}
                onClick={() => setSelectedTrackable(trackable)}
              />
            ))}
          </div>
        </section>

        {/* Calendar Visualization */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Progress for: {selectedTrackable.name}
          </h2>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <ContributionCalendar trackable={selectedTrackable} />
          </div>
        </section>

        {/* Daily Check-in */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Check-in</h2>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <DailyCheckIn trackables={mockTrackables} />
          </div>
        </section>
      </div>
    </div>
  );
}
