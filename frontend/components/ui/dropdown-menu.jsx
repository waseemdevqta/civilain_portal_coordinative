import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

const DropdownContext = createContext({
  isOpen: false,
  setIsOpen: () => {},
});

const DropdownMenu = ({ trigger, children, align = 'right', className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignClasses = {
    right: 'right-0',
    left: 'left-0',
  };

  // If trigger prop was passed
  if (trigger) {
    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className={cn(
              'absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-border/80 bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150',
              alignClasses[align],
              className
            )}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  // Compound component usage
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, align }}>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownMenuTrigger = ({ asChild, children, className, ...props }) => {
  const { isOpen, setIsOpen } = useContext(DropdownContext);
  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className={cn('inline-block cursor-pointer', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuContent = ({ align: propAlign, className, children, ...props }) => {
  const { isOpen, setIsOpen, align: contextAlign } = useContext(DropdownContext);
  const align = propAlign || contextAlign || 'right';

  if (!isOpen) return null;

  return (
    <div
      onClick={() => setIsOpen(false)}
      className={cn(
        'absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-border/80 bg-card p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150',
        align === 'left' ? 'left-0' : 'right-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ className, asChild, children, onClick, destructive = false, ...props }) => {
  const { setIsOpen } = useContext(DropdownContext);

  const handleClick = (e) => {
    if (onClick) onClick(e);
    setIsOpen(false);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-150 hover:bg-accent hover:text-accent-foreground text-left text-foreground/90 font-medium',
        destructive && 'text-red-400 hover:bg-red-500/10 hover:text-red-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuSeparator = ({ className }) => (
  <div className={cn('-mx-1 my-1 h-px bg-border/60', className)} />
);

const DropdownMenuLabel = ({ className, children }) => (
  <div className={cn('px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider', className)}>
    {children}
  </div>
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
