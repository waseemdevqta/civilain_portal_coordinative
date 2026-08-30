'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ThemeToggle from '@/components/common/ThemeToggle';
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
    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] p-7 sm:p-9 space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Sign In to AWAZ
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Enter your registered credentials to access your civic account.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200/90 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/40 p-3.5 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              className="pl-10 h-10 text-xs"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
              className="pl-10 pr-10 h-10 text-xs"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-bold shadow-[0_2px_10px_rgba(15,23,42,0.1)] mt-2 text-xs sm:text-sm rounded-xl"
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
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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
            className="text-xs border-slate-200 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#182235] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 h-9 font-semibold rounded-xl"
            onClick={() => fillDemoAccount('officer')}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Officer Waseem
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs border-slate-200 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#182235] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 h-9 font-semibold rounded-xl"
            onClick={() => fillDemoAccount('citizen')}
          >
            <UserCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            Citizen Ahmed
          </Button>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        Need a citizen account?{' '}
        <Link href="/signup" className="font-bold text-slate-900 dark:text-slate-100 hover:underline">
          Register Here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between transition-colors">
      {/* Top Header */}
      <header className="container mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-sm transition-transform group-hover:scale-105">
            <Megaphone className="h-4.5 w-4.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-50">
              AWAZ
            </span>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              CIVIC
            </span>
          </div>
        </Link>

        <ThemeToggle />
      </header>

      {/* Main 2-Column Split */}
      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left Context Side */}
          <div className="hidden md:block md:col-span-6 space-y-6 text-left pr-4">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                SECURE PORTAL ACCESS
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                Civic accountability starts with your voice.
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Log in to file neighborhood reports, monitor official municipal dispatch responses, and participate in community priority decisions.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Track real-time resolution remarks and field crew deployments.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Rate municipal work quality with official 1–5 star reviews.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Full end-to-end token security and citizen privacy preservation.</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="md:col-span-6 max-w-md mx-auto w-full">
            <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />}>
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
