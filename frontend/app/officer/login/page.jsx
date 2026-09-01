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
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  ClipboardList,
  MapPin,
  Wrench,
} from 'lucide-react';
import { AwazLogo } from '@/components/common/AwazLogo';

export default function OfficerLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isOfficer } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (isOfficer) {
        router.replace('/officer/dashboard');
      } else {
        // Citizen accidentally landed here — send to citizen dashboard
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, user, isOfficer, router]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError('Please enter your officer credentials.');
      return;
    }
    setLoading(true);
    setError('');

    const res = await login(formData.email.trim(), formData.password);

    if (res.success) {
      if (res.user.role !== 'officer') {
        setError('Access denied. This portal is for authorised municipal officers only.');
        toast.error('This portal is for officers only. Please use the citizen login.');
        setLoading(false);
        return;
      }
      toast.success(`Welcome, Officer ${res.user.name}!`);
      router.replace('/officer/dashboard');
    } else {
      setError(res.message);
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1C30] text-white flex flex-col justify-between">
      {/* Header */}
      <header className="container mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <AwazLogo
            size="md"
            showText={false}
          />
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight text-white leading-none">AWAZ</span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Municipal Officer Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/staff/login" className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
            <Wrench className="h-3.5 w-3.5" />
            Field Staff Portal
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/login" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Citizen Login
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left panel */}
          <div className="hidden md:block md:col-span-6 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                RESTRICTED ACCESS — AUTHORISED PERSONNEL ONLY
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Municipal Officer<br />Command Portal
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Exclusively for authorised field officers and municipal administrators. Manage civic complaints, dispatch crews, and verify resolutions with photo proof.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-white/5 bg-white/5">
                <ClipboardList className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Dispatch Queue Management</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">View, filter, and manage all civic complaint tickets by area, priority, and status.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-white/5 bg-white/5">
                <BadgeCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Resolution Proof Upload</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Attach photographic evidence of completed repairs and record official municipal remarks.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-white/5 bg-white/5">
                <MapPin className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">AI Operational Briefing</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Gemini-powered live intelligence summary of workload, hotspots, and critical incidents.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="md:col-span-6 max-w-md mx-auto w-full">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-7 sm:p-9 space-y-6">
              {/* Icon header */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(5,150,105,0.35)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Officer Sign In</h2>
                  <p className="text-xs text-slate-400">Authorised personnel only</p>
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
                  <Label htmlFor="officer-email" className="text-xs font-semibold text-slate-300">
                    Officer Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="officer-email"
                      name="email"
                      type="email"
                      placeholder="officer@municipality.gov"
                      className="pl-10 h-11 text-sm bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-400 focus-visible:bg-slate-900 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="officer-password" className="text-xs font-semibold text-slate-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="officer-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 text-sm bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-400 focus-visible:bg-slate-900 focus-visible:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 font-bold mt-2 text-xs sm:text-sm rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_4px_14px_rgba(5,150,105,0.35)]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Access Officer Portal
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-3 border-t border-white/10 space-y-2 text-center text-xs">
                <div className="text-slate-300">
                  Field technician or maintenance crew?{' '}
                  <Link href="/staff/login" className="font-bold text-blue-400 hover:text-blue-300 hover:underline">
                    Staff & Technician Portal →
                  </Link>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Officer accounts are provisioned by super administrators only.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} AWAZ Municipal Platform. Restricted access — authorised personnel only.
      </footer>
    </div>
  );
}
