import React from 'react';
import { Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }) {
  switch (status) {
    case 'resolved':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 dark:border-emerald-900/60 bg-emerald-50/90 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 capitalize transition-colors',
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Resolved
        </span>
      );
    case 'in-progress':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-blue-200/90 dark:border-blue-900/60 bg-blue-50/90 dark:bg-blue-950/50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 capitalize transition-colors',
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          In Progress
        </span>
      );
    case 'pending':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 capitalize transition-colors',
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Pending
        </span>
      );
  }
}

export default StatusBadge;
