import React from 'react';
import { Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusBadge({ status, className }) {
  switch (status) {
    case 'resolved':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-[#A4F1B2] bg-[#E8F9ED] px-2.5 py-0.5 text-xs font-bold text-[#1F6C3A] capitalize shadow-2xs transition-all',
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#1F6C3A] animate-pulse" />
          Resolved
        </span>
      );
    case 'in-progress':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-[#EFF4FF] px-2.5 py-0.5 text-xs font-bold text-[#1E40AF] capitalize shadow-2xs transition-all',
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          In Progress
        </span>
      );
    case 'pending':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 capitalize shadow-2xs transition-all',
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
