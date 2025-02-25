
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEntries } from '@/hooks/useEntries';

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trackableId: string;
  trackableName: string;
  date: string;
}

export function NotesDialog({ isOpen, onClose, trackableId, trackableName, date }: NotesDialogProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { entries, createEntry } = useEntries(trackableId);

  useEffect(() => {
    if (isOpen) {
      const existingEntry = entries.find(e => e.date === date);
      setNotes(existingEntry?.notes || '');
    }
  }, [isOpen, entries, date]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await createEntry(trackableId, date, true, notes);
      onClose();
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Notes</DialogTitle>
          <DialogDescription>
            Add notes for {trackableName} on {new Date(date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this activity..."
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
