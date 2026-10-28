"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  onConfirm,
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none z-40 transition-opacity" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-border rounded p-6 shadow-dialog z-50 focus:outline-none">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              {isDestructive && (
                <AlertTriangle className="w-5 h-5 text-danger shrink-0" aria-hidden="true" />
              )}
              <Dialog.Title className="text-base font-bold text-text">
                {title}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1 rounded text-text-muted hover:text-text hover:bg-bg"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-sm text-text-muted leading-relaxed mb-4">
            {description}
          </Dialog.Description>

          {children && <div className="mb-4">{children}</div>}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded border border-border text-sm font-medium text-text bg-surface hover:bg-bg transition-colors"
              >
                {cancelLabel}
              </button>
            </Dialog.Close>
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`px-3.5 py-1.5 rounded text-sm font-medium text-white transition-colors flex items-center gap-1.5 ${
                isDestructive
                  ? "bg-danger hover:bg-danger/90"
                  : "bg-primary hover:bg-primary-hover"
              } disabled:opacity-50`}
            >
              {isLoading ? "Processing..." : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
