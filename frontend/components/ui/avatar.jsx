import React from 'react';
import { cn } from '@/lib/utils';

export function Avatar({ className, name, src, size = 'default' }) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    default: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl',
  };

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold shadow-inner ring-2 ring-border/40 select-none',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="aspect-square h-full w-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/60', className)}
      {...props}
    />
  );
}

export function Separator({ className, orientation = 'horizontal', ...props }) {
  return (
    <div
      role="none"
      className={cn(
        'shrink-0 bg-border/60',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  );
}
