
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useTrackables } from '@/hooks/useTrackables';

const colors = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', 
  '#ef4444', '#ec4899', '#84cc16', '#f97316', '#6366f1'
];

export function AddTrackableDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [loading, setLoading] = useState(false);
  const { createTrackable } = useTrackables();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createTrackable({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
        icon: 'check',
      });
      setName('');
      setDescription('');
      setSelectedColor(colors[0]);
      setOpen(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs sm:text-sm">
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Add Trackable</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Create New Trackable</DialogTitle>
          <DialogDescription className="text-sm">
            Add a new activity or habit to track daily.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise, Reading, Meditation"
              required
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the activity"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-900' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()} className="text-sm">
              {loading ? 'Creating...' : 'Create Trackable'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
