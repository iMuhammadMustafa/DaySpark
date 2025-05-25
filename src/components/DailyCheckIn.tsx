
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, StickyNote } from 'lucide-react';
import { Trackable } from '@/hooks/useTrackables';
import { useEntries } from '@/hooks/useEntries';
import { NotesDialog } from './NotesDialog';

interface DailyCheckInProps {
  trackables: Trackable[];
}

export function DailyCheckIn({ trackables }: DailyCheckInProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [notesDialog, setNotesDialog] = useState<{
    isOpen: boolean;
    trackableId: string;
    trackableName: string;
  }>({ isOpen: false, trackableId: '', trackableName: '' });
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

  const handleAddNotes = (trackableId: string, trackableName: string) => {
    setNotesDialog({
      isOpen: true,
      trackableId,
      trackableName
    });
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

  const todayEntry = (trackableId: string) => 
    entries.find(e => e.trackable_id === trackableId && e.date === today);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Check in for {todayFormatted}
        </h3>
        <p className="text-sm sm:text-base text-gray-600">Mark the activities you completed today</p>
      </div>

      {trackables.length === 0 ? (
        <p className="text-gray-500 text-center py-8 text-sm sm:text-base">
          No trackables available. Create some trackables to start checking in!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {trackables.map((trackable) => {
            const entry = todayEntry(trackable.id);
            return (
              <div
                key={trackable.id}
                className={`p-3 sm:p-4 border rounded-lg transition-all duration-200 ${
                  checkedItems.has(trackable.id)
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={checkedItems.has(trackable.id)}
                    onCheckedChange={() => handleToggle(trackable.id)}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 flex-shrink-0"
                  />
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: trackable.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">{trackable.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{trackable.description}</p>
                    {entry?.notes && (
                      <p className="text-xs text-gray-500 mt-1 italic line-clamp-2">"{entry.notes}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddNotes(trackable.id, trackable.name)}
                      className="p-1 h-7 w-7 sm:h-8 sm:w-8"
                    >
                      <StickyNote className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    {checkedItems.has(trackable.id) && (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {trackables.length > 0 && (
        <div className="flex justify-center sm:justify-end">
          <Button
            onClick={handleSubmit}
            disabled={checkedItems.size === 0}
            className={`w-full sm:w-auto ${
              isSubmitted
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            } transition-all duration-200`}
            size="lg"
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

      <NotesDialog
        isOpen={notesDialog.isOpen}
        onClose={() => setNotesDialog(prev => ({ ...prev, isOpen: false }))}
        trackableId={notesDialog.trackableId}
        trackableName={notesDialog.trackableName}
        date={today}
      />
    </div>
  );
}
