'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, Zap, Database, Terminal, CheckCircle2, Code2 } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
      {/* Background glowing gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-purple-600/20 blur-[130px] -z-10 pointer-events-none rounded-full" />

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium backdrop-blur-md animate-in fade-in duration-500">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            <span>Ready-to-Deploy Full Stack University Hackathon Template</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Build Any Hackathon App in{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Hours, Not Days
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
            A production-ready decoupled boilerplate powered by <strong>Next.js App Router</strong>,{' '}
            <strong>Express.js REST APIs</strong>, and <strong>MongoDB Mongoose</strong>. Equipped with JWT auth, CRUD abstractions, and responsive UI components.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link href="/signup">
              <Button size="lg" variant="gradient" className="gap-2 text-base px-8 h-12 shadow-xl shadow-blue-500/20">
                Launch Live App
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#architecture">
              <Button size="lg" variant="outline" className="gap-2 h-12 border-border/80 bg-card/60 backdrop-blur-md">
                <Terminal className="h-4 w-4 text-primary" />
                Explore Architecture
              </Button>
            </a>
          </div>

          {/* Feature Highlights Pills */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl border-t border-border/40 text-left">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>JWT + bcrypt Auth</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Generic CRUD Engine</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
              <Database className="h-4 w-4 text-blue-400 shrink-0" />
              <span>MongoDB Atlas Ready</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
              <Code2 className="h-4 w-4 text-purple-400 shrink-0" />
              <span>Tailwind & shadcn UI</span>
            </div>
          </div>
        </div>

        {/* Product Visual Mockup */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-border/80 bg-card/80 p-2 sm:p-4 shadow-2xl backdrop-blur-xl shadow-blue-500/10">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 mb-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="text-xs text-muted-foreground font-mono bg-background/80 px-4 py-1 rounded-md border border-border/50">
              http://localhost:3000/dashboard
            </div>
            <div className="text-xs text-muted-foreground font-mono hidden sm:block">
              REST: /api
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
            <div className="rounded-xl border border-border/50 bg-background/60 p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Resources</div>
              <div className="text-2xl font-bold mt-1 text-foreground">1,248</div>
              <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Fully synced with Express
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/60 p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">API Latency</div>
              <div className="text-2xl font-bold mt-1 text-primary">&lt; 45ms</div>
              <div className="text-xs text-muted-foreground mt-1">Direct REST communication</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/60 p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Database Status</div>
              <div className="text-2xl font-bold mt-1 text-emerald-400">Connected</div>
              <div className="text-xs text-muted-foreground mt-1">Mongoose ODM 8.6+</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
