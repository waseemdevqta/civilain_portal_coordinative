'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#f8f9ff] text-slate-900 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-900 text-white shadow-sm mb-4">
        <Building2 className="h-6 w-6" />
      </div>

      <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
        Error 404 • Municipal Record Not Found
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Page Not Found
      </h1>

      <p className="mt-2 text-sm text-slate-600 max-w-md">
        The requested page or ticket URL could not be located in the CivicFix municipal portal registry.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-9 text-xs">
            <Home className="h-4 w-4" />
            Return to Homepage
          </Button>
        </Link>
        <Link href="/complaints">
          <Button size="sm" variant="outline" className="border-slate-300 bg-white text-slate-800 h-9 text-xs">
            Browse Complaints Feed
          </Button>
        </Link>
      </div>
    </div>
  );
}
