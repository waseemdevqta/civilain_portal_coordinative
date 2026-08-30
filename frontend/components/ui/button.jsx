import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-slate-900',
        forest: 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm border border-emerald-800',
        success: 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm border border-emerald-800',
        destructive: 'bg-red-700 text-white hover:bg-red-800 shadow-sm border border-red-700',
        outline: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-sm',
        secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80',
        ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900',
        link: 'text-slate-900 underline-offset-4 hover:underline',
        gradient: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-slate-900', // legacy alias mapped to Deep Navy
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-sm font-semibold',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
