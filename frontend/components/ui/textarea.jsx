import React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[85px] w-full rounded-xl border border-slate-200 bg-[#F8F9FF] px-3.5 py-2.5 text-xs sm:text-sm text-[#0B1C30] placeholder:text-slate-400 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:bg-white focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
