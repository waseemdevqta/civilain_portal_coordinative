'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import {
  Wrench,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  ClipboardList,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { AwazLogo } from '@/components/common/AwazLogo';

export default function StaffLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isTechnician, isOfficer } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (isTechnician || user.role === 'technician') {
        router.replace('/staff/dashboard');
      } else if (isOfficer) {
        router.replace('/officer/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, user, isTechnician, isOfficer, router]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError('Please enter your technician credentials.');
      return;
    }
    setLoading(true);
    setError('');

    const res = await login(formData.email.trim(), formData.password);

    if (res.success) {
      if (res.user.role === 'technician') {
        toast.success(`Welcome to Field Operations, ${res.user.name}!`);
        router.replace('/staff/dashboard');
      } else if (res.user.role === 'officer') {
        toast.success(`Welcome, Officer ${res.user.name}!`);
        router.replace('/officer/dashboard');
      } else {
        toast.success(`Welcome, ${res.user.name}!`);
        router.replace('/dashboard');
      }
    } else {
      setError(res.message || 'Invalid technician credentials.');
      toast.error(res.message || 'Login failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#071322] text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="container mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <AwazLogo size="md" showText={false} />
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight text-white leading-none">AWAZ</span>
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mt-0.5">Field Crew & Staff Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Citizen Login
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/officer/login" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
            Officer Portal
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left Context Side */}
          <div className="hidden md:block md:col-span-6 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.15)]">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                FIELD CREW & TECHNICIAN DISPATCH
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Field Operations<br />& Resolution Portal
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Log in to inspect your assigned municipal repair work orders, start maintenance on site, and upload Before & After resolution photos directly from the field.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-amber-500/20 transition-colors">
                <ClipboardList className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Assigned Work Orders</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    View work orders assigned to you by supervising officers with priority levels and damage photos.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-amber-500/20 transition-colors">
                <Camera className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Field Proof-of-Fix Upload</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Snap and attach completion photos right on the street to verify that repairs meet standards.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-amber-500/20 transition-colors">
                <BadgeCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">1-Tap Status Updates</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Update work orders from Pending to In-Progress and Resolved with instant citizen notification.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="md:col-span-6 max-w-md mx-auto w-full">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-7 sm:p-9 space-y-6 shadow-[0_12px_36px_rgba(0,0,0,0.4)]">
              {/* Form header */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.35)]">
                  <Wrench className="h-6 w-6 font-bold" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Staff Sign In</h2>
                  <p className="text-xs text-slate-400">Field crew credentials required</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="staff-email" className="text-xs font-semibold text-slate-300">
                    Technician Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="staff-email"
                      name="email"
                      type="email"
                      placeholder="technician@municipality.gov"
                      className="pl-10 h-11 text-sm bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-400 focus-visible:bg-slate-900 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:border-amber-500"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-password" className="text-xs font-semibold text-slate-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="staff-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 text-sm bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-400 focus-visible:bg-slate-900 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:border-amber-500"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full font-bold text-xs sm:text-sm h-11 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-[0_4px_16px_rgba(245,158,11,0.35)]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                      Authenticating Staff...
                    </span>
                  ) : (
                    'Access Field Dashboard'
                  )}
                </Button>
              </form>

              <div className="pt-2 border-t border-white/10 text-center">
                <p className="text-xs text-slate-400">
                  Technician accounts are provisioned by your Supervising Officer in the Staff Management console.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-500 border-t border-white/5">
        &copy; {new Date().getFullYear()} AWAZ Municipal Governance Platform &bull; Field Operations Division
      </footer>
    </div>
  );
}
