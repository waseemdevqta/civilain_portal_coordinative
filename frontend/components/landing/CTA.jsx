'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Shield } from 'lucide-react';

export function LandingCTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-blue-950/40 via-card to-indigo-950/40 p-8 md:p-14 text-center max-w-4xl mx-auto shadow-2xl backdrop-blur-xl">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Ready to Ace Your Hackathon?
          </h2>

          <p className="max-w-xl mx-auto mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Stop wasting the first 4 hours writing auth boilers and routing plumbing. Start coding your winning hackathon features right away.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" variant="gradient" className="gap-2 h-12 px-8 text-base">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            100% compliant with university guidelines. No Firebase or Supabase lock-in.
          </p>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/90 py-12 text-sm text-muted-foreground">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
              H
            </div>
            <span className="font-semibold text-foreground">HackStack Boilerplate</span>
            <span className="text-xs text-muted-foreground">— Built for University Hackathons</span>
          </div>

          <div className="flex items-center space-x-6 text-xs sm:text-sm">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#architecture" className="hover:text-foreground transition-colors">Architecture</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">Workflow</a>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>

          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hackathon Starter Template. MIT Licensed.
          </div>
        </div>
      </div>
    </footer>
  );
}
