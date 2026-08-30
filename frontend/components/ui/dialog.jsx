import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => onOpenChange && onOpenChange(false)}
      />
      {/* Modal Dialog Content Container */}
      <div className="relative z-50 w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {children}
        <button
          onClick={() => onOpenChange && onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
};

const DialogContent = ({ className, children, ...props }) => (
  <div className={cn('w-full', className)} {...props}>
    {children}
  </div>
);

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-5', className)}
    {...props}
  />
);

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 gap-2 sm:gap-0', className)}
    {...props}
  />
);

const DialogTitle = ({ className, ...props }) => (
  <h2
    className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)}
    {...props}
  />
);

const DialogDescription = ({ className, ...props }) => (
  <p
    className={cn('text-sm text-muted-foreground mt-1', className)}
    {...props}
  />
);

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
