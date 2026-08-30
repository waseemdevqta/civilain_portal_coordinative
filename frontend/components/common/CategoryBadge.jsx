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
          wrapperClass: 'bg-[#EFF4FF] text-[#1E40AF] border-[#BFDBFE]',
          iconColor: 'text-blue-600',
        };
      case 'garbage':
        return {
          label: 'Garbage & Sanitation',
          icon: Trash2,
          wrapperClass: 'bg-[#E8F9ED] text-[#1F6C3A] border-[#A4F1B2]',
          iconColor: 'text-emerald-600',
        };
      case 'water':
        return {
          label: 'Water Supply',
          icon: Droplets,
          wrapperClass: 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]',
          iconColor: 'text-sky-600',
        };
      case 'electricity':
        return {
          label: 'Electricity & Power',
          icon: Zap,
          wrapperClass: 'bg-[#FEFCE8] text-[#A16207] border-[#FEF08A]',
          iconColor: 'text-amber-600',
        };
      case 'other':
      default:
        return {
          label: 'General Civic',
          icon: FileText,
          wrapperClass: 'bg-slate-100 text-slate-700 border-slate-200',
          iconColor: 'text-slate-600',
        };
    }
  };

  const { label, icon: Icon, wrapperClass, iconColor } = getDetails();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold transition-all shadow-2xs',
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
