
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';
import { format } from 'date-fns';
import { Trackable } from '@/hooks/useTrackables';
import { useEntries } from '@/hooks/useEntries';

interface SingleTrackableDateDialogProps {
  trackable: Trackable;
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SingleTrackableDateDialog({ trackable, date, isOpen, onClose }: SingleTrackableDateDialogProps) {
  const [isChecked, setIsChecked] = useState(false);
  const { entries, createEntry, deleteEntry } = useEntries(trackable.id);

  useEffect(() => {
    const existingEntry = entries.find(entry => 
      entry.date === date && entry.completed && entry.trackable_id === trackable.id
    );
    setIsChecked(!!existingEntry);
  }, [entries, date, trackable.id]);

  const handleToggle = async () => {
    try {
      if (isChecked) {
        await deleteEntry(trackable.id, date);
        setIsChecked(false);
      } else {
        await createEntry(trackable.id, date, true);
        setIsChecked(true);
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleSave = () => {
    onClose();
  };

  const formattedDate = new Date(date + 'T00:00:00');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Entry for {format(formattedDate, 'EEEE, MMMM do, yyyy')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div
            className={`p-4 border rounded-lg transition-all duration-200 ${
              isChecked
                ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isChecked}
                onCheckedChange={handleToggle}
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
              {isChecked && (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Check className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
