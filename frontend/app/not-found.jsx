'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Megaphone, Home, Layers } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground text-center transition-colors">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-[0_4px_16px_rgba(15,23,42,0.1)] mb-4">
        <Megaphone className="h-7 w-7" />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
        Error 404 • Record Not Located
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
        Page Not Found
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
        The requested page or complaint ticket could not be located in the AWAZ civic ledger.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 gap-1.5 h-10 px-4 text-xs font-bold rounded-xl shadow-sm">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
        <Link href="/complaints">
          <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182235] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 h-10 px-4 text-xs font-semibold rounded-xl gap-1.5">
            <Layers className="h-4 w-4" />
            Browse Community Ledger
          </Button>
        </Link>
      </div>
    </div>
  );
}
