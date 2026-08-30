import React from 'react';
import { Route, Trash2, Droplets, Zap, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CategoryBadge({ category, className }) {
  const normalized = (category || 'other').toLowerCase();

  const getDetails = () => {
    switch (normalized) {
      case 'road':
        return {
          label: 'Roads & Transport',
          icon: Route,
          wrapperClass: 'bg-blue-50/90 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/60',
          iconColor: 'text-blue-600 dark:text-blue-400',
        };
      case 'garbage':
        return {
          label: 'Garbage & Sanitation',
          icon: Trash2,
          wrapperClass: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'water':
        return {
          label: 'Water Supply',
          icon: Droplets,
          wrapperClass: 'bg-sky-50/90 text-sky-700 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900/60',
          iconColor: 'text-sky-600 dark:text-sky-400',
        };
      case 'electricity':
        return {
          label: 'Electricity & Power',
          icon: Zap,
          wrapperClass: 'bg-amber-50/90 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60',
          iconColor: 'text-amber-600 dark:text-amber-400',
        };
      case 'other':
      default:
        return {
          label: 'General Civic',
          icon: FileText,
          wrapperClass: 'bg-slate-100/90 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          iconColor: 'text-slate-600 dark:text-slate-400',
        };
    }
  };

  const { label, icon: Icon, wrapperClass, iconColor } = getDetails();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        wrapperClass,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', iconColor)} />
      <span>{label}</span>
    </span>
  );
}

export default CategoryBadge;
