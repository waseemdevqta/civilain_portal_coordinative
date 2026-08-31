'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function AwazLogo({
  size = 'md',
  className = '',
  showText = false,
  badgeText = '',
  subtitle = '',
  priority = false,
}) {
  const sizeMap = {
    xs: { dim: 24, class: 'h-6 w-6 rounded-lg' },
    sm: { dim: 32, class: 'h-8 w-8 rounded-xl' },
    md: { dim: 40, class: 'h-10 w-10 rounded-2xl' },
    lg: { dim: 48, class: 'h-12 w-12 rounded-2xl' },
    xl: { dim: 64, class: 'h-16 w-16 rounded-3xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative overflow-hidden bg-slate-900 border border-slate-200/80 shadow-[0_4px_12px_rgba(5,150,105,0.2)] shrink-0 transition-transform duration-300 group-hover:scale-105',
          currentSize.class
        )}
      >
        <Image
          src="/awaz_logo.jpeg"
          alt="AWAZ Logo"
          width={currentSize.dim}
          height={currentSize.dim}
          className="h-full w-full object-cover object-center"
          priority={priority}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xl tracking-tight text-[#0B1C30]">
              AWAZ
            </span>
            {badgeText && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-extrabold text-emerald-800 border border-emerald-200 tracking-wider uppercase">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default AwazLogo;
