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
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF4FF] text-[#0B1C30] shadow-xs border border-[#BFDBFE]">
        <Icon className="h-7 w-7 text-[#0F172A]" />
      </div>
      <h3 className="mt-4 text-base font-bold text-[#0B1C30]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs sm:text-sm text-slate-500 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="mt-5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold px-4 shadow-sm hover:-translate-y-0.5 transition-all"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
