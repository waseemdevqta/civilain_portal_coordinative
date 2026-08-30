import React from 'react';
import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground shadow-sm">
        <Icon className="h-7 w-7 text-primary/80" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} className="mt-5" variant="gradient">
          {actionText}
        </Button>
      )}
    </div>
  );
}
