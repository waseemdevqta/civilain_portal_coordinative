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
import { userApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export function UserModal({ open, onOpenChange, targetUser = null, onSaved }) {
  const isEditing = !!targetUser;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (targetUser) {
      setFormData({
        name: targetUser.name || '',
        email: targetUser.email || '',
        password: '',
        role: targetUser.role || 'user',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
      });
    }
    setError('');
  }, [targetUser, open]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please provide name and email.');
      return;
    }

    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      setError('Please provide a password of at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        const updatePayload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          updatePayload.password = formData.password;
        }
        const res = await userApi.update(targetUser._id, updatePayload);
        toast.success('User updated successfully!');
        if (onSaved) onSaved(res.data);
      } else {
        const res = await userApi.create(formData);
        toast.success('User created successfully!');
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
        <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Update the user profile and role assignments.'
            : 'Create a new user account with role permissions.'}
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="userName">Full Name *</Label>
          <Input
            id="userName"
            name="name"
            placeholder="e.g. Jordan Smith"
            value={formData.name}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="userEmail">Email Address *</Label>
          <Input
            id="userEmail"
            name="email"
            type="email"
            placeholder="jordan@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="userRole">Role</Label>
          <Select
            id="userRole"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">Standard User</option>
            <option value="admin">Administrator</option>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="userPassword">
            {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
          </Label>
          <Input
            id="userPassword"
            name="password"
            type="password"
            placeholder={isEditing ? '••••••••' : 'Min 6 characters'}
            value={formData.password}
            onChange={handleChange}
            required={!isEditing}
          />
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
              'Save User'
            ) : (
              'Create User'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
