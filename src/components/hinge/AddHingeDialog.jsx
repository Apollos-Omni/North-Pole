import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AddHingeDialog({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    device_id: '',
    name: '',
    location: '',
    access_level: 'private',
    karma_reward: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      device_id: '',
      name: '',
      location: '',
      access_level: 'private',
      karma_reward: 1
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Establish a New Gateway</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device_id">Gateway ID</Label>
            <Input
              id="device_id"
              value={formData.device_id}
              onChange={(e) => handleChange('device_id', e.target.value)}
              placeholder="DH-001-ABC123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Gateway Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="E.g., 'Portal to the Studio'"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Threshold Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Physical location of the hinge"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_level">Access Level</Label>
            <Select value={formData.access_level} onValueChange={(value) => handleChange('access_level', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private (Owner only)</SelectItem>
                <SelectItem value="community">Community (Verified users)</SelectItem>
                <SelectItem value="public">Public (All users)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="karma_reward">Karma Reward per Use</Label>
            <Input
              id="karma_reward"
              type="number"
              min="1"
              max="10"
              value={formData.karma_reward}
              onChange={(e) => handleChange('karma_reward', parseInt(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Establish Gateway
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}