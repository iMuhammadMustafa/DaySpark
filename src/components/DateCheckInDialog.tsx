
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Trackable } from '@/hooks/useTrackables';
import { useEntries } from '@/hooks/useEntries';

interface DateCheckInDialogProps {
  trackables: Trackable[];
}

export function DateCheckInDialog({ trackables }: DateCheckInDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const { entries, createEntry, deleteEntry } = useEntries();

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  React.useEffect(() => {
    if (selectedDateStr) {
      const dateEntries = entries.filter(entry => 
        entry.date === selectedDateStr && entry.completed
      );
      setCheckedItems(new Set(dateEntries.map(entry => entry.trackable_id)));
    }
  }, [entries, selectedDateStr]);

  const handleToggle = async (trackableId: string) => {
    if (!selectedDateStr) return;

    const newCheckedItems = new Set(checkedItems);
    const isCurrentlyChecked = newCheckedItems.has(trackableId);

    try {
      if (isCurrentlyChecked) {
        newCheckedItems.delete(trackableId);
        await deleteEntry(trackableId, selectedDateStr);
      } else {
        newCheckedItems.add(trackableId);
        await createEntry(trackableId, selectedDateStr, true);
      }
      setCheckedItems(newCheckedItems);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleSubmit = () => {
    setIsOpen(false);
    setCheckedItems(new Set());
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarDays className="w-4 h-4" />
          Check-in for Date
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Check-in for a Specific Date</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-sm text-muted-foreground">Select a date:</div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date > new Date()}
              className="rounded-md border"
            />
          </div>

          {selectedDate && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  Check-in for {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                </h3>
                <p className="text-sm text-muted-foreground">Mark the activities you completed on this date</p>
              </div>

              {trackables.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No trackables available.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {trackables.map((trackable) => (
                    <div
                      key={trackable.id}
                      className={`p-3 border rounded-lg transition-all duration-200 ${
                        checkedItems.has(trackable.id)
                          ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={checkedItems.has(trackable.id)}
                          onCheckedChange={() => handleToggle(trackable.id)}
                          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: trackable.color }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{trackable.name}</h4>
                          <p className="text-sm text-muted-foreground">{trackable.description}</p>
                        </div>
                        {checkedItems.has(trackable.id) && (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleSubmit} className="gap-2">
                  <Check className="w-4 h-4" />
                  Save Check-in
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
