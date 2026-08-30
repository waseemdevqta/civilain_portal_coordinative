'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toaster';
import { resourceApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export function ResourceModal({ open, onOpenChange, resource = null, onSaved }) {
  const isEditing = !!resource;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || '',
        description: resource.description || '',
        status: resource.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'active',
      });
    }
    setError('');
  }, [resource, open]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide a resource name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        const res = await resourceApi.update(resource._id, formData);
        toast.success('Resource updated successfully!');
        if (onSaved) onSaved(res.data);
      } else {
        const res = await resourceApi.create(formData);
        toast.success('Resource created successfully!');
        if (onSaved) onSaved(res.data);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Resource' : 'Create New Resource'}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Modify the details of this resource. Changes will sync to MongoDB.'
            : 'Add a new generic resource record into the MongoDB database.'}
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">Resource Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Project Alpha, Property #102, Patient Record"
            value={formData.name}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="flex w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            placeholder="Provide relevant details or metadata..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active (Operational)</option>
            <option value="pending">Pending (Reviewing)</option>
            <option value="inactive">Inactive (Paused)</option>
            <option value="archived">Archived (Closed)</option>
          </Select>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="gradient" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Create Resource'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
