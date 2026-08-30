import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  const [selectedTab, setSelectedTab] = useState(defaultValue);
  const currentTab = value !== undefined ? value : selectedTab;

  const handleTabChange = (newTab) => {
    if (value === undefined) setSelectedTab(newTab);
    if (onValueChange) onValueChange(newTab);
  };

  return (
    <div className={cn('w-full', className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { currentTab, handleTabChange });
      })}
    </div>
  );
};

const TabsList = ({ className, children, currentTab, handleTabChange }) => (
  <div
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-lg bg-muted/60 p-1 text-muted-foreground border border-border/40',
      className
    )}
  >
    {React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      return React.cloneElement(child, { currentTab, handleTabChange });
    })}
  </div>
);

const TabsTrigger = ({ value, className, children, currentTab, handleTabChange }) => {
  const isActive = currentTab === value;
  return (
    <button
      type="button"
      onClick={() => handleTabChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-card text-foreground shadow-sm font-semibold'
          : 'hover:text-foreground text-muted-foreground',
        className
      )}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className, children, currentTab }) => {
  if (currentTab !== value) return null;
  return (
    <div className={cn('mt-4 focus-visible:outline-none animate-in fade-in duration-150', className)}>
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
