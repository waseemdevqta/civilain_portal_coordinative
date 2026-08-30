import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-[0_2px_8px_rgba(15,23,42,0.12)]',
        forest:
          'bg-[#1F6C3A] hover:bg-[#16562E] text-white shadow-[0_2px_8px_rgba(31,108,58,0.15)]',
        success:
          'bg-[#1F6C3A] hover:bg-[#16562E] text-white shadow-[0_2px_8px_rgba(31,108,58,0.15)]',
        destructive:
          'bg-[#BA1A1A] hover:bg-[#961515] text-white shadow-[0_2px_8px_rgba(186,26,26,0.15)]',
        outline:
          'border border-slate-200 bg-white text-slate-800 hover:bg-[#F8F9FF] hover:border-slate-300 shadow-2xs',
        secondary:
          'bg-[#EFF4FF] text-[#1E40AF] hover:bg-[#DBEAFE]',
        ghost:
          'hover:bg-[#EFF4FF] text-slate-700 hover:text-[#0B1C30]',
        link: 'text-[#0B1C30] underline-offset-4 hover:underline',
        gradient:
          'bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-[0_2px_8px_rgba(15,23,42,0.12)]',
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
