import React from 'react';
import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching this criteria at this time.',
  actionText,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-10 sm:p-12 text-center transition-all',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200/80 dark:border-slate-700">
        <Icon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
      </div>
      <h3 className="mt-3.5 text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 max-w-sm text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="mt-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 text-xs font-semibold px-4"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
