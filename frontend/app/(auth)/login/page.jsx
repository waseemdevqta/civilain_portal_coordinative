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
  Megaphone,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect');
  const { login, isAuthenticated, user, isOfficer } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Role-based redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isOfficer) {
        router.replace('/officer/dashboard');
      } else {
        router.replace(redirectUrl || '/dashboard');
      }
    }
  }, [isAuthenticated, user, isOfficer, router, redirectUrl]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
      } else {
        router.replace(redirectUrl || '/dashboard');
      }
    } else {
      setError(res.message);
      toast.error(res.message);
    }
    setLoading(false);
  };

  // Demo user quick autofill
  const fillDemoAccount = (role = 'officer') => {
    if (role === 'officer') {
      setFormData({
        email: 'waseemahmedbaloch2004@gmail.com',
        password: 'Officer123!',
      });
    } else {
      setFormData({
        email: 'ahmed@civicfix.demo',
        password: 'Citizen123!',
      });
    }
    setError('');
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(11,28,48,0.06)] p-7 sm:p-9 space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1C30]">
          Sign In to AWAZ
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your registered credentials to access your civic account.
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
              className="pl-10 h-10 text-xs bg-[#F8F9FF] border-slate-200"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
              Password
            </Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10 h-10 text-xs bg-[#F8F9FF] border-slate-200"
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
          className="w-full h-11 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold shadow-[0_4px_14px_rgba(15,23,42,0.15)] mt-2 text-xs sm:text-sm rounded-xl hover:-translate-y-0.5 transition-all"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            'Sign In to Account'
          )}
        </Button>
      </form>

      {/* Demo Fast-Fill Section */}
      <div className="pt-4 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-semibold">
            <KeyRound className="h-3.5 w-3.5 text-slate-400" />
            Evaluation Fast-Fill
          </span>
          <span className="text-[10px]">Auto server-verified role</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs border-slate-200 bg-[#F8F9FF] text-slate-800 hover:bg-[#EFF4FF] hover:border-slate-300 gap-1.5 h-9 font-semibold rounded-xl transition-all"
            onClick={() => fillDemoAccount('officer')}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#1F6C3A]" />
            Officer Waseem
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs border-slate-200 bg-[#F8F9FF] text-slate-800 hover:bg-[#EFF4FF] hover:border-slate-300 gap-1.5 h-9 font-semibold rounded-xl transition-all"
            onClick={() => fillDemoAccount('citizen')}
          >
            <UserCheck className="h-3.5 w-3.5 text-[#1E40AF]" />
            Citizen Ahmed
          </Button>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
        Need a citizen account?{' '}
        <Link href="/signup" className="font-bold text-[#0B1C30] hover:underline">
          Register Here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col justify-between transition-colors">
      {/* Top Header */}
      <header className="container mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F172A] text-white shadow-sm transition-transform group-hover:scale-105">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xl tracking-tight text-[#0B1C30]">
              AWAZ
            </span>
            <span className="rounded-full bg-[#EFF4FF] px-2.5 py-0.5 text-[9px] font-extrabold text-[#1F6C3A] border border-[#A4F1B2]">
              CIVIC
            </span>
          </div>
        </Link>
      </header>

      {/* Main 2-Column Split */}
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left Context Side */}
          <div className="hidden md:block md:col-span-6 space-y-6 text-left pr-4">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1F6C3A] bg-[#E8F9ED] border border-[#A4F1B2] px-2.5 py-1 rounded-full">
                SECURE PORTAL ACCESS
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B1C30] leading-tight">
                Civic accountability starts with your voice.
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Log in to file neighborhood reports, monitor official municipal dispatch responses, and participate in community priority decisions.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#1F6C3A] shrink-0 mt-0.5" />
                <span>Track real-time resolution remarks and field crew deployments.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#1F6C3A] shrink-0 mt-0.5" />
                <span>Rate municipal work quality with official 1–5 star reviews.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#1F6C3A] shrink-0 mt-0.5" />
                <span>Full end-to-end token security and citizen privacy preservation.</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="md:col-span-6 max-w-md mx-auto w-full">
            <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-3xl bg-slate-200" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} AWAZ. Your voice. Your city. Your change.
      </footer>
    </div>
  );
}
