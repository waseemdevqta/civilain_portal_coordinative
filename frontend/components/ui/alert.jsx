import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-2xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
  {
    variants: {
      variant: {
        default: 'bg-white text-[#0B1C30] border-slate-200 shadow-2xs',
        destructive:
          'border-red-200 bg-red-50 text-[#BA1A1A] [&>svg]:text-[#BA1A1A]',
        warning:
          'border-amber-200 bg-amber-50 text-amber-800 [&>svg]:text-amber-600',
        info:
          'border-blue-200 bg-[#EFF4FF] text-[#1E40AF] [&>svg]:text-blue-600',
        success:
          'border-[#A4F1B2] bg-[#E8F9ED] text-[#1F6C3A] [&>svg]:text-[#1F6C3A]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-bold text-xs sm:text-sm leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-xs [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
