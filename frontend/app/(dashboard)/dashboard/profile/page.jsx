'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, isOfficer } = useAuth();

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
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-[#F8F9FF] text-[#0B1C30] transition-colors">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF4FF] px-3 py-0.5 text-xs font-bold text-[#1E40AF] mb-2">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>ACCOUNT CREDENTIALS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1C30]">
              Account Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your personal credentials, contact email, and security settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Profile Card Summary */}
            <div className="md:col-span-4 rounded-3xl border border-slate-200 bg-white p-6 text-center flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(11,28,48,0.03)]">
              <div className="h-20 w-20 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center text-2xl font-black mb-4 shadow-sm">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AW'}
              </div>
              <h2 className="text-lg font-bold text-[#0B1C30]">{user?.name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 capitalize border border-slate-200">
                  {user?.role} Role
                </span>
                <span className="rounded-full bg-[#E8F9ED] px-3 py-1 text-xs font-bold text-[#1F6C3A] border border-[#A4F1B2] flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-[#1F6C3A]" />
                  Active Session
                </span>
              </div>

              <div className="w-full mt-6 pt-6 border-t border-slate-100 text-left space-y-3 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> Member Since
                  </span>
                  <span className="font-medium text-[#0B1C30]">{formatDate(user?.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-[#1F6C3A]" /> Account Security
                  </span>
                  <span className="font-semibold text-[#1F6C3A]">Encrypted JWT</span>
                </div>
              </div>
            </div>

            {/* Profile Edit Form */}
            <div className="md:col-span-8 rounded-3xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(11,28,48,0.03)] p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#0B1C30]">Edit Profile Details</h3>
                <p className="text-xs text-slate-500">
                  Keep your personal account information accurate across the platform.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 h-10 text-xs sm:text-sm bg-[#F8F9FF] border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 h-10 text-xs sm:text-sm bg-[#F8F9FF] border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-slate-500" /> Change Password
                  </h4>

                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-700">
                      New Password (leave empty to keep current)
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="h-10 text-xs sm:text-sm bg-[#F8F9FF] border-slate-200"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button type="submit" disabled={loading} className="gap-2 h-10 px-5 rounded-xl text-xs sm:text-sm font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-sm hover:-translate-y-0.5 transition-all">
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
                </div>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
