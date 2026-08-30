import React from 'react';
import { Truck, Trash2, Droplets, Zap, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CategoryBadge({ category, className }) {
  const normalized = (category || 'other').toLowerCase();

  const getDetails = () => {
    switch (normalized) {
      case 'road':
        return { label: 'Road & Transport', icon: Truck, color: 'text-slate-700' };
      case 'garbage':
        return { label: 'Garbage & Sanitation', icon: Trash2, color: 'text-emerald-700' };
      case 'water':
        return { label: 'Water Supply', icon: Droplets, color: 'text-blue-700' };
      case 'electricity':
        return { label: 'Electricity & Power', icon: Zap, color: 'text-amber-700' };
      case 'other':
      default:
        return { label: 'General Civic', icon: HelpCircle, color: 'text-slate-600' };
    }
  };

  const { label, icon: Icon, color } = getDetails();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-800',
        className
      )}
    >
      <Icon className={cn('h-3 w-3', color)} />
      <span>{label}</span>
    </span>
  );
}
