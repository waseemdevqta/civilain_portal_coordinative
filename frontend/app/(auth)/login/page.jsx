'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { AwazLogo } from '@/components/common/AwazLogo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect');
  const { login, isAuthenticated, user, isOfficer, isTechnician } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (isOfficer) {
        router.replace('/officer/dashboard');
      } else if (isTechnician || user.role === 'technician') {
        router.replace('/staff/dashboard');
      } else {
        router.replace(redirectUrl || '/dashboard');
      }
    }
  }, [isAuthenticated, user, isOfficer, isTechnician, router, redirectUrl]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await login(formData.email.trim(), formData.password);
    if (res.success) {
      toast.success(`Welcome back, ${res.user.name}!`);
      if (res.user.role === 'officer') {
        router.replace('/officer/dashboard');
      } else if (res.user.role === 'technician') {
        router.replace('/staff/dashboard');
      } else {
        router.replace(redirectUrl || '/dashboard');
      }
    } else {
      setError(res.message);
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(11,28,48,0.06)] p-7 sm:p-9 space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1C30]">
          Citizen Sign In
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your registered email and password to access your civic account.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-[#BA1A1A]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="name@example.com"
              className="pl-10 h-10 text-xs bg-[#F8F9FF] border-slate-200 focus-visible:ring-emerald-600"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10 h-10 text-xs bg-[#F8F9FF] border-slate-200 focus-visible:ring-emerald-600"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          variant="default"
          className="w-full h-11 font-bold mt-2 text-xs sm:text-sm rounded-xl"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline">
          Register Here
        </Link>
      </div>

      {/* Officer redirect */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
          <span>Are you a municipal officer?</span>
        </div>
        <Link href="/officer/login">
          <Button variant="outline" size="sm" className="text-xs h-8 rounded-xl font-semibold border-slate-300 hover:border-emerald-400 hover:text-emerald-800 hover:bg-emerald-50 shrink-0">
            Officer Portal →
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col justify-between transition-colors">
      <header className="container mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <Link href="/" className="group">
          <AwazLogo
            size="md"
            showText={true}
            badgeText="CITIZEN"
            subtitle="Your voice. Your city."
          />
        </Link>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left side */}
          <div className="hidden md:block md:col-span-6 space-y-6 text-left pr-4">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                CITIZEN PORTAL
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B1C30] leading-tight">
                Your neighborhood. Your voice. Your city.
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sign in to file neighborhood reports, rally community support, and track verified municipal resolutions in real time.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Real-time complaint tracking with public ticket numbers.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Upload photo evidence and get AI-assisted triage.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Rally community upvotes to escalate municipal priority.</span>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="md:col-span-6 max-w-md mx-auto w-full">
            <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading form...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>

      <footer className="container mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} AWAZ. Your voice. Your city. Your change.
      </footer>
    </div>
  );
}
