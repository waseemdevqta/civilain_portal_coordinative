'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  // Preferences State
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    compactTable: false,
    autoRefresh: true,
    theme: 'dark',
  });

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          System Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure application defaults, security configurations, and development options.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="account" className="gap-2 text-xs sm:text-sm">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs sm:text-sm">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2 text-xs sm:text-sm">
            <Sliders className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Account Configurations</CardTitle>
              <CardDescription>
                General settings associated with your workspace credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Current Account Name</Label>
                  <Input value={user?.name || ''} disabled className="bg-muted/40" />
                </div>
                <div className="space-y-1">
                  <Label>Registered Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted/40 font-mono text-xs" />
                </div>
              </div>

              <div className="pt-4 border-t border-border/60">
                <Label>Assigned Role Level</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Role determines permissions across user and resource endpoints.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                  <Shield className="h-4 w-4" /> {user?.role || 'user'} Access Level
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Security & Token Policies</CardTitle>
              <CardDescription>
                JSON Web Token (JWT) standards and encryption policies for this hackathon build.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" /> JWT Algorithm
                  </span>
                  <span className="font-mono text-xs bg-card px-2.5 py-1 rounded border border-border">
                    HS256 (30d expiry)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-400" /> Password Hashing
                  </span>
                  <span className="font-mono text-xs bg-card px-2.5 py-1 rounded border border-border">
                    bcrypt (salt rounds: 10)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-400" /> CORS Allowed Origin
                  </span>
                  <span className="font-mono text-xs bg-card px-2.5 py-1 rounded border border-border">
                    http://localhost:3000
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">UI & Developer Preferences</CardTitle>
              <CardDescription>Customize your frontend developer experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <div>
                  <p className="text-sm font-semibold text-foreground">Automatic Refresh Polling</p>
                  <p className="text-xs text-muted-foreground">Keep resources synced in real time</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.autoRefresh}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, autoRefresh: e.target.checked }))
                  }
                  className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <div>
                  <p className="text-sm font-semibold text-foreground">Compact Data Tables</p>
                  <p className="text-xs text-muted-foreground">Reduce row padding for dense datasets</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.compactTable}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, compactTable: e.target.checked }))
                  }
                  className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">Toast CRUD Notifications</p>
                  <p className="text-xs text-muted-foreground">Show sonner toast notifications on API mutations</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailAlerts}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, emailAlerts: e.target.checked }))
                  }
                  className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-border/60 pt-4">
              <Button variant="gradient" onClick={handleSavePreferences} className="gap-2">
                <Save className="h-4 w-4" /> Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
