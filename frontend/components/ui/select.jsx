import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full appearance-none rounded-lg border border-border bg-card/60 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors pr-8 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
    </div>
  );
});
Select.displayName = 'Select';

export { Select };
