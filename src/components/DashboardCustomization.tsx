
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, GripVertical, RotateCcw } from 'lucide-react';
import { Trackable } from '@/hooks/useTrackables';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';

interface DashboardCustomizationProps {
  trackables: Trackable[];
  onSettingsChange: (selectedIds: string[], orderedIds: string[]) => void;
}

export function DashboardCustomization({ trackables, onSettingsChange }: DashboardCustomizationProps) {
  const { settings, updateSettings, resetToDefault } = useDashboardSettings();
  const [open, setOpen] = useState(false);
  const [selectedTrackables, setSelectedTrackables] = useState<string[]>([]);
  const [orderedTrackables, setOrderedTrackables] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Initialize with current settings or all trackables
  useEffect(() => {
    if (settings) {
      setSelectedTrackables(settings.selected_trackables);
      setOrderedTrackables(settings.trackable_order);
    } else if (trackables.length > 0) {
      const allIds = trackables.map(t => t.id);
      setSelectedTrackables(allIds);
      setOrderedTrackables(allIds);
    }
  }, [settings, trackables]);

  const handleTrackableToggle = (trackableId: string, checked: boolean) => {
    if (checked) {
      setSelectedTrackables(prev => [...prev, trackableId]);
      if (!orderedTrackables.includes(trackableId)) {
        setOrderedTrackables(prev => [...prev, trackableId]);
      }
    } else {
      setSelectedTrackables(prev => prev.filter(id => id !== trackableId));
    }
  };

  const handleDragStart = (e: React.DragEvent, trackableId: string) => {
    setDraggedItem(trackableId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const newOrder = [...orderedTrackables];
    const draggedIndex = newOrder.indexOf(draggedItem);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setOrderedTrackables(newOrder);
    setDraggedItem(null);
  };

  const handleSave = async () => {
    try {
      await updateSettings(selectedTrackables, orderedTrackables);
      onSettingsChange(selectedTrackables, orderedTrackables);
      setOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleReset = async () => {
    const allIds = trackables.map(t => t.id);
    try {
      await resetToDefault(allIds);
      setSelectedTrackables(allIds);
      setOrderedTrackables(allIds);
      onSettingsChange(allIds, allIds);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const getOrderedSelectedTrackables = () => {
    return orderedTrackables
      .filter(id => selectedTrackables.includes(id))
      .map(id => trackables.find(t => t.id === id))
      .filter(Boolean) as Trackable[];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Dashboard</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selection Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Select Activities to Display</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trackables.map((trackable) => (
                <div
                  key={trackable.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedTrackables.includes(trackable.id)}
                    onCheckedChange={(checked) => 
                      handleTrackableToggle(trackable.id, checked as boolean)
                    }
                  />
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: trackable.color }}
                  />
                  <span className="text-sm font-medium">{trackable.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ordering Section */}
          {selectedTrackables.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">
                Arrange Display Order
                <Badge variant="secondary" className="ml-2">
                  {selectedTrackables.length} selected
                </Badge>
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Drag and drop to reorder your selected activities
              </p>
              <div className="space-y-2">
                {getOrderedSelectedTrackables().map((trackable, index) => (
                  <Card
                    key={trackable.id}
                    className={`p-3 cursor-move transition-all ${
                      draggedItem === trackable.id ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, trackable.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, trackable.id)}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: trackable.color }}
                        />
                        <span className="font-medium">{trackable.name}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Preview Section */}
          {selectedTrackables.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Preview</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Your dashboard will display these activities in this order:
                </p>
                <div className="flex flex-wrap gap-2">
                  {getOrderedSelectedTrackables().map((trackable, index) => (
                    <Badge key={trackable.id} variant="outline">
                      {index + 1}. {trackable.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
