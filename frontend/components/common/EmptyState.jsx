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
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 sm:p-12 text-center shadow-xs transition-all',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200">
        <Icon className="h-7 w-7 text-emerald-600" />
      </div>
      <h3 className="mt-4 text-base font-bold text-[#0B1C30]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          variant="default"
          className="mt-5 rounded-xl text-xs font-bold px-5"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
