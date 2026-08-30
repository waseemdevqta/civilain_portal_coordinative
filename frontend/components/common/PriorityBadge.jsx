import React from 'react';
import { Flame, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PriorityBadge({ priority, score, showScore = false, className }) {
  const normalizedPriority = (priority || 'low').toLowerCase();

  switch (normalizedPriority) {
    case 'critical':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-800',
            className
          )}
        >
          <Flame className="h-3 w-3 text-red-600" />
          Critical{showScore && typeof score === 'number' ? ` (${score})` : ''}
        </span>
      );
    case 'high':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-800',
            className
          )}
        >
          <AlertCircle className="h-3 w-3 text-orange-600" />
          High{showScore && typeof score === 'number' ? ` (${score})` : ''}
        </span>
      );
    case 'medium':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800',
            className
          )}
        >
          <AlertTriangle className="h-3 w-3 text-amber-600" />
          Medium{showScore && typeof score === 'number' ? ` (${score})` : ''}
        </span>
      );
    case 'low':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700',
            className
          )}
        >
          Low{showScore && typeof score === 'number' ? ` (${score})` : ''}
        </span>
      );
  }
}
