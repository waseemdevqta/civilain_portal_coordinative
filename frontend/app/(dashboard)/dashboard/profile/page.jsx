'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/toaster';
import { formatDate } from '@/lib/utils';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
    };

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters');
        setLoading(false);
        return;
      }
      payload.password = formData.newPassword;
    }

    const res = await updateProfile(payload);

    if (res.success) {
      toast.success('Profile updated successfully!');
      setFormData((prev) => ({ ...prev, newPassword: '', currentPassword: '' }));
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          User Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal account settings and authentication credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <Card className="border-border/80 bg-card/70 backdrop-blur-sm p-6 text-center flex flex-col items-center justify-center">
          <Avatar name={user?.name || 'User'} size="xl" className="mb-4" />
          <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{user?.email}</p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant={user?.role === 'admin' ? 'info' : 'secondary'} className="capitalize">
              {user?.role} Role
            </Badge>
            <Badge variant="success">Verified Session</Badge>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-border/60 text-left space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Member Since
              </span>
              <span className="font-medium text-foreground">{formatDate(user?.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" /> Account Security
              </span>
              <span className="font-medium text-emerald-400">JWT Encrypted</span>
            </div>
          </div>
        </Card>

        {/* Profile Edit Form */}
        <Card className="md:col-span-2 border-border/80 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Edit Profile Details</CardTitle>
            <CardDescription>
              Keep your profile credentials up to date across all sessions.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/60">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" /> Change Password
                </h3>

                <div className="space-y-1">
                  <Label htmlFor="newPassword">New Password (leave empty to keep current)</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Min 6 characters"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end border-t border-border/60 pt-4">
              <Button type="submit" variant="gradient" disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
