'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/toaster';
import { Building2, Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated, isOfficer } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Role-based redirect if authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      if (isOfficer) {
        router.replace('/officer/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isOfficer, router]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await signup(
      formData.name.trim(),
      formData.email.trim(),
      formData.password
    );

    if (res.success) {
      toast.success(`Account created! Welcome, ${res.user.name}.`);
      router.replace('/dashboard');
    } else {
      setError(res.message);
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-[#f8f9ff]">
      {/* Brand Header */}
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

      <Card className="w-full max-w-md border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-1 text-center pb-3">
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
            Register Citizen Account
          </CardTitle>
          <CardDescription className="text-xs text-slate-600">
            File complaints, track municipal resolutions, and upvote local issues
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Institutional Role Notice */}
          <div className="mb-4 rounded border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-700 shrink-0 mt-0.5" />
            <span>
              Public registration creates <strong>Citizen</strong> accounts. Government officer accounts are provisioned internally by authorized administrators.
            </span>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Ahmed Khan"
                  className="pl-9 h-9 text-xs"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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
                  placeholder="ahmed@example.com"
                  className="pl-9 h-9 text-xs"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  className="pl-9 pr-10 h-9 text-xs"
                  value={formData.password}
                  onChange={handleChange}
                  required
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

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  className="pl-9 pr-10 h-9 text-xs"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
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
                  Creating Account...
                </>
              ) : (
                'Create Citizen Account'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          <div>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-slate-900 hover:underline">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
