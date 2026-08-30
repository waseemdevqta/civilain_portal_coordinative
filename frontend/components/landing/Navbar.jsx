'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, X, ArrowRight, LayoutDashboard, LogIn } from 'lucide-react';

export function LandingNavbar() {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight text-foreground">
              HackStack<span className="text-primary">.io</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">Next + Express + Mongo</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#architecture" className="transition-colors hover:text-foreground">Architecture</a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">Workflow</a>
          <a href="#endpoints" className="transition-colors hover:text-foreground">API Docs</a>
        </nav>

        {/* Auth CTA Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="gradient" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/60 bg-card/95 backdrop-blur-xl p-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted"
            >
              Features
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted"
            >
              Architecture
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted"
            >
              Workflow
            </a>
            <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gradient" className="w-full justify-center">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="gradient" className="w-full justify-center">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
