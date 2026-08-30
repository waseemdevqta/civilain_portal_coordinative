'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/toaster';
import { Building2, Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

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
    <Card className="w-full max-w-md border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
          Sign In to CivicFix
        </CardTitle>
        <CardDescription className="text-xs text-slate-600">
          Enter your registered email and password to access the portal
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                className="pl-9 h-9 text-xs"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Password
              </Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-9 pr-10 h-9 text-xs"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm mt-3 text-xs"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Demo Fast-Fill Section */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium mb-2">
            <KeyRound className="h-3 w-3 text-slate-400" />
            <span>Evaluation Demo Accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 gap-1.5 h-8 font-normal"
              onClick={() => fillDemoAccount('officer')}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-slate-700" />
              Officer Waseem
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 gap-1.5 h-8 font-normal"
              onClick={() => fillDemoAccount('citizen')}
            >
              <UserCheck className="h-3.5 w-3.5 text-slate-700" />
              Citizen Ahmed
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2 leading-tight">
            Role is verified securely on the server upon authentication.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
        <div>
          New citizen?{' '}
          <Link href="/signup" className="font-semibold text-slate-900 hover:underline">
            Register as Citizen
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-[#f8f9ff]">
      {/* Brand logo link */}
      <Link href="/" className="flex items-center space-x-2.5 mb-6 group">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-900 text-white shadow-sm transition-colors group-hover:bg-slate-800">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight tracking-tight text-slate-900">
            CivicFix
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Citizen Complaint Portal</span>
        </div>
      </Link>

      <Suspense fallback={<div className="h-80 w-full max-w-md animate-pulse rounded-lg bg-slate-200" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
