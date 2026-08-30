import React from 'react';
import { Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }) {
  switch (status) {
    case 'resolved':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 capitalize',
            className
          )}
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-700" />
          Resolved
        </span>
      );
    case 'in-progress':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800 capitalize',
            className
          )}
        >
          <RefreshCw className="h-3 w-3 text-blue-700" />
          In Progress
        </span>
      );
    case 'pending':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 capitalize',
            className
          )}
        >
          <Clock className="h-3 w-3 text-amber-700" />
          Pending
        </span>
      );
  }
}
