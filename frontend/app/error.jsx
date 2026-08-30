'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App Router Uncaught Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#f8f9ff] text-slate-900 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 mb-4 border border-red-200">
        <AlertCircle className="h-6 w-6" />
      </div>

      <div className="text-xs font-mono font-bold text-red-700 uppercase tracking-wider mb-2">
        System Runtime Exception
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Something went wrong
      </h1>

      <p className="mt-2 text-xs text-slate-600 max-w-md">
        {error?.message || 'An unexpected runtime error occurred while processing this municipal portal view.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          size="sm"
          onClick={() => reset()}
          className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 h-9 text-xs"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Link href="/">
          <Button size="sm" variant="outline" className="border-slate-300 bg-white text-slate-800 h-9 text-xs">
            <Home className="h-4 w-4 mr-1.5" />
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
