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
            'inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-[#FFDAD6]/60 px-2.5 py-0.5 text-xs font-bold text-[#BA1A1A] shadow-2xs transition-all',
            className
          )}
        >
          <Flame className="h-3 w-3 text-[#BA1A1A] animate-pulse" />
          Critical{showScore && typeof score === 'number' ? ` (${score})` : ''}
        </span>
      );
    case 'high':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-800 shadow-2xs transition-all',
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
            'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 shadow-2xs transition-all',
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
            'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-2xs transition-all',
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Low{showScore && typeof score === 'number' ? ` (${score})` : ''}
        </span>
      );
  }
}

export default PriorityBadge;
