import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = ({ open, onOpenChange, children, side = 'left' }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const sideClasses = {
    left: 'left-0 top-0 bottom-0 w-72 sm:w-80 border-r animate-in slide-in-from-left duration-300',
    right: 'right-0 top-0 bottom-0 w-72 sm:w-80 border-l animate-in slide-in-from-right duration-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Sheet panel */}
      <div
        className={cn(
          'fixed z-50 flex h-full flex-col bg-card p-6 shadow-2xl border-border/80',
          sideClasses[side]
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
};

export { Sheet };
