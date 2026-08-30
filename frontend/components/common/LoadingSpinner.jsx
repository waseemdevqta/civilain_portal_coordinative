import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className, size = 'default', text }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-10 w-10',
    xl: 'h-16 w-16',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3 py-6', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <p className="text-sm font-medium text-muted-foreground">{text}</p>}
    </div>
  );
}
