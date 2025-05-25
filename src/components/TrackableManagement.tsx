
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit } from 'lucide-react';
import { useTrackables } from '@/hooks/useTrackables';
import { Trackable } from '@/hooks/useTrackables';

const colors = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', 
  '#ef4444', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

interface EditTrackableFormProps {
  trackable: Trackable;
  onSuccess: () => void;
}

function EditTrackableForm({ trackable, onSuccess }: EditTrackableFormProps) {
  const [name, setName] = useState(trackable.name);
  const [description, setDescription] = useState(trackable.description || '');
  const [selectedColor, setSelectedColor] = useState(trackable.color);
  const [loading, setLoading] = useState(false);
  const { updateTrackable } = useTrackables();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await updateTrackable(trackable.id, {
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
      });
      onSuccess();
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the activity"
        />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                selectedColor === color ? 'border-gray-900' : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Updating...' : 'Update Trackable'}
        </Button>
      </div>
    </form>
  );
}

interface TrackableManagementProps {
  trackables: Trackable[];
}

export function TrackableManagement({ trackables }: TrackableManagementProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTrackable, setSelectedTrackable] = useState<Trackable | null>(null);
  const { deleteTrackable } = useTrackables();

  const handleEdit = (trackable: Trackable) => {
    setSelectedTrackable(trackable);
    setEditDialogOpen(true);
  };

  const handleDelete = async (trackable: Trackable) => {
    if (window.confirm(`Are you sure you want to delete "${trackable.name}"? This will also delete all associated entries.`)) {
      await deleteTrackable(trackable.id);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Manage Trackables</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trackables.map((trackable) => (
          <div key={trackable.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div 
                className="w-4 h-4 rounded-full mt-1"
                style={{ backgroundColor: trackable.color }}
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{trackable.name}</h4>
                <p className="text-sm text-gray-600">{trackable.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(trackable)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(trackable)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trackable</DialogTitle>
            <DialogDescription>
              Update your trackable activity details.
            </DialogDescription>
          </DialogHeader>
          {selectedTrackable && (
            <EditTrackableForm
              trackable={selectedTrackable}
              onSuccess={() => {
                setEditDialogOpen(false);
                setSelectedTrackable(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
