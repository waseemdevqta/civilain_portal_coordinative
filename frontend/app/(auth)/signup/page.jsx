'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  User,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

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

    const res = await signup(formData.name.trim(), formData.email.trim(), formData.password);

    if (res.success) {
      toast.success(`Account created! Welcome to AWAZ, ${res.user.name}.`);
      router.replace('/dashboard');
    } else {
      setError(res.message);
      toast.error(res.message);
    }
    setLoading(false);
  };

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
              CITIZEN
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
                JOIN YOUR NEIGHBORS
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0B1C30] leading-tight">
                Empower your community. Track verified fixes.
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Registering a citizen account allows you to lodge municipal complaints, track official dispatch status, and rally community upvotes.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#1F6C3A] shrink-0 mt-0.5" />
                <span>Instant ticket tracking ID and duplicate detection protection.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#1F6C3A] shrink-0 mt-0.5" />
                <span>Official resolution verification and municipal quality scoring.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#1F6C3A] shrink-0 mt-0.5" />
                <span>Zero unsolicited marketing. Strictly civic and municipal use.</span>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="md:col-span-6 max-w-md mx-auto w-full">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(11,28,48,0.06)] p-7 sm:p-9 space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1C30]">
                  Register Citizen Account
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Fill in your details to begin submitting neighborhood issues.
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
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g. Fatima Ali"
                      className="pl-10 h-10 text-xs bg-[#F8F9FF] border-slate-200"
                      value={formData.name}
                      onChange={handleChange}
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
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Password (min 6 characters)
                  </Label>
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
                      autoComplete="new-password"
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

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 h-10 text-xs bg-[#F8F9FF] border-slate-200"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
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
                      Creating Account...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </form>

              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-[#0B1C30] hover:underline">
                  Sign In Here
                </Link>
              </div>
            </div>
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
