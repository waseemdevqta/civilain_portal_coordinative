import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-[0_4px_14px_rgba(5,150,105,0.22)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.35)] hover:-translate-y-0.5 active:translate-y-0',
        emerald:
          'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-[0_4px_16px_rgba(5,150,105,0.25)] hover:shadow-[0_6px_22px_rgba(5,150,105,0.38)] hover:-translate-y-0.5 active:translate-y-0',
        blue:
          'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-[0_4px_14px_rgba(37,99,235,0.22)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 active:translate-y-0',
        forest:
          'bg-[#1F6C3A] hover:bg-[#16562E] text-white shadow-[0_4px_14px_rgba(31,108,58,0.2)] hover:shadow-[0_6px_18px_rgba(31,108,58,0.3)] hover:-translate-y-0.5 active:translate-y-0',
        success:
          'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_14px_rgba(5,150,105,0.22)] hover:shadow-[0_6px_18px_rgba(5,150,105,0.32)] hover:-translate-y-0.5 active:translate-y-0',
        destructive:
          'bg-[#BA1A1A] hover:bg-[#961515] text-white shadow-[0_4px_14px_rgba(186,26,26,0.2)] hover:shadow-[0_6px_18px_rgba(186,26,26,0.3)] hover:-translate-y-0.5 active:translate-y-0',
        outline:
          'border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-950 hover:border-emerald-400/80 shadow-2xs hover:shadow-[0_4px_12px_rgba(5,150,105,0.12)] hover:-translate-y-0.5 active:translate-y-0',
        secondary:
          'bg-emerald-50 text-emerald-800 border border-emerald-200/70 hover:bg-emerald-100 hover:text-emerald-950 hover:border-emerald-300 shadow-2xs hover:-translate-y-0.5 active:translate-y-0',
        ghost:
          'text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-950 hover:-translate-y-0.5 active:translate-y-0',
        link: 'text-emerald-700 hover:text-emerald-900 underline-offset-4 hover:underline transition-colors',
        gradient:
          'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-700 text-white shadow-[0_4px_16px_rgba(5,150,105,0.28)] hover:shadow-[0_8px_24px_rgba(5,150,105,0.4)] hover:-translate-y-0.5 active:translate-y-0',
      },
      size: {
        default: 'h-10 px-4 py-2 text-xs sm:text-sm',
        sm: 'h-8 px-3 text-xs rounded-lg',
        lg: 'h-11 px-6 text-sm font-semibold rounded-xl',
        icon: 'h-9 w-9 p-0 rounded-lg',
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
