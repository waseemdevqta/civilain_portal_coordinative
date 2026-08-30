import React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Are you absolutely sure?',
  description = 'This action cannot be undone. This will permanently delete the selected item.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  loading = false,
  variant = 'destructive',
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-start space-x-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <DialogHeader className="text-left mb-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      </div>

      <DialogFooter className="mt-4">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
