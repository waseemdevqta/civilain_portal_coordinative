'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toaster';
import {
  User,
  Shield,
  Sliders,
  Bell,
  Database,
  Key,
  CheckCircle2,
  Save,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('account');

  // Preferences State with LocalStorage Persistence
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    compactTable: false,
    autoRefresh: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('awaz_preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load preferences from storage:', e);
    }
  }, []);

  const handleSavePreferences = () => {
    try {
      localStorage.setItem('awaz_preferences', JSON.stringify(preferences));
      toast.success('Preferences saved successfully!');
    } catch (e) {
      toast.error('Failed to save preferences.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
        <Navbar />

        <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <Sliders className="h-3.5 w-3.5 text-slate-500" />
              <span>PREFERENCES & CONFIGURATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              System Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure application defaults, visual appearance, and notification policies.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
              <TabsTrigger value="account" className="gap-2 text-xs font-semibold rounded-xl">
                <User className="h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2 text-xs font-semibold rounded-xl">
                <Sliders className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2 text-xs font-semibold rounded-xl">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account">
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 sm:p-8 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Account Configurations</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    General account information associated with your session credentials.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Account Name</Label>
                    <Input value={user?.name || ''} disabled className="bg-slate-50 dark:bg-slate-800/50 text-xs font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Registered Email</Label>
                    <Input value={user?.email || ''} disabled className="bg-slate-50 dark:bg-slate-800/50 text-xs font-mono" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Assigned Role</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
                    Your role determines access permissions across citizen reporting and officer dispatch queues.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold capitalize border border-slate-200 dark:border-slate-700">
                    <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {user?.role || 'Citizen'} Role Access
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 sm:p-8 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Theme & UI Preferences</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Customize appearance and notification behavior.</p>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Theme Appearance</Label>
                  <div className="grid grid-cols-3 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        theme === 'light'
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Sun className="h-4 w-4 text-amber-500" />
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        theme === 'dark'
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Moon className="h-4 w-4 text-blue-400" />
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('system')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        theme === 'system'
                          ? 'border-slate-900 dark:border-slate-100 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Laptop className="h-4 w-4 text-slate-400" />
                      System
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Live Pulse Polling</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Keep community ledger updated in real time</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.autoRefresh}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, autoRefresh: e.target.checked }))
                      }
                      className="h-4 w-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Compact Queue Rows</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Optimize table padding for high ticket volume</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.compactTable}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, compactTable: e.target.checked }))
                      }
                      className="h-4 w-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Toast Notifications</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Show instant alerts on ticket updates and upvotes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.emailAlerts}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, emailAlerts: e.target.checked }))
                      }
                      className="h-4 w-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button onClick={handleSavePreferences} className="gap-2 h-10 px-5 rounded-xl text-xs font-bold">
                    <Save className="h-4 w-4" /> Save Preferences
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-[0_4px_20px_rgba(15,23,42,0.03)] p-6 sm:p-8 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Security & Encryption Policies</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    JSON Web Token (JWT) standards and encryption policies for AWAZ.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-[#F7F8FC] dark:bg-[#182235] p-5 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Key className="h-4 w-4 text-slate-500" /> Token Standard
                    </span>
                    <span className="font-mono text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 font-semibold">
                      JWT HS256 (Rotational Refresh)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Password Hashing
                    </span>
                    <span className="font-mono text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 font-semibold">
                      bcrypt (salt rounds: 10)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Role-Based Access Control
                    </span>
                    <span className="font-mono text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 font-semibold">
                      Strict Citizen / Officer Segregation
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
