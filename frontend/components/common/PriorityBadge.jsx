import React from 'react';
import { Flame, AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PriorityBadge({ priority, score, showScore = false, className }) {
  const normalizedPriority = (priority || 'low').toLowerCase();

  switch (normalizedPriority) {
    case 'critical':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-red-200/90 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300 transition-colors',
            className
          )}
        >
          <Flame className="h-3 w-3 text-red-600 dark:text-red-400" />
          Critical{showScore && typeof score === 'number' ? ` (${score})` : ''}
        </span>
      );
    case 'high':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-orange-200/90 dark:border-orange-900/60 bg-orange-50/90 dark:bg-orange-950/50 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-300 transition-colors',
            className
          )}
        >
          <AlertCircle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
          High{showScore && typeof score === 'number' ? ` (${score})` : ''}
        </span>
      );
    case 'medium':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 transition-colors',
            className
          )}
        >
          <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          Medium{showScore && typeof score === 'number' ? ` (${score})` : ''}
        </span>
      );
    case 'low':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors',
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
          Low{showScore && typeof score === 'number' ? ` (${score})` : ''}
        </span>
      );
  }
}

export default PriorityBadge;
