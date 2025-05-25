
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';
import { Trackable } from '@/hooks/useTrackables';
import { useEntries } from '@/hooks/useEntries';

interface DailyCheckInProps {
  trackables: Trackable[];
}

export function DailyCheckIn({ trackables }: DailyCheckInProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { entries, createEntry, deleteEntry } = useEntries();

  const today = new Date().toISOString().split('T')[0];

  // Initialize checked items based on existing entries for today
  useEffect(() => {
    const todayEntries = entries.filter(entry => 
      entry.date === today && entry.completed
    );
    setCheckedItems(new Set(todayEntries.map(entry => entry.trackable_id)));
  }, [entries, today]);

  const handleToggle = async (trackableId: string) => {
    const newCheckedItems = new Set(checkedItems);
    const isCurrentlyChecked = newCheckedItems.has(trackableId);

    try {
      if (isCurrentlyChecked) {
        newCheckedItems.delete(trackableId);
        await deleteEntry(trackableId, today);
      } else {
        newCheckedItems.add(trackableId);
        await createEntry(trackableId, today, true);
      }
      setCheckedItems(newCheckedItems);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Check in for {todayFormatted}
        </h3>
        <p className="text-gray-600">Mark the activities you completed today</p>
      </div>

      {trackables.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No trackables available. Create some trackables to start checking in!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trackables.map((trackable) => (
            <div
              key={trackable.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                checkedItems.has(trackable.id)
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleToggle(trackable.id)}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={checkedItems.has(trackable.id)}
                  onChange={() => handleToggle(trackable.id)}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: trackable.color }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{trackable.name}</h4>
                  <p className="text-sm text-gray-600">{trackable.description}</p>
                </div>
                {checkedItems.has(trackable.id) && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {trackables.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={checkedItems.size === 0}
            className={`${
              isSubmitted
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            } transition-all duration-200`}
          >
            {isSubmitted ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              `Submit Check-in (${checkedItems.size})`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
