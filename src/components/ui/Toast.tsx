"use client";

import React, { createContext, useContext, useState } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
}

interface ToastContextValue {
  showToast: (msg: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (msg: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...msg, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            onOpenChange={(open) => !open && removeToast(t.id)}
            className={`fixed bottom-4 right-4 z-50 w-80 max-w-sm rounded border p-4 shadow-dialog flex items-start gap-3 bg-surface ${
              t.type === "error"
                ? "border-danger/40 text-danger"
                : t.type === "success"
                ? "border-success/40 text-success"
                : "border-border text-text"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-danger" aria-hidden="true" />
              ) : t.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-4 h-4 text-primary" aria-hidden="true" />
              )}
            </div>
            <div className="flex-1">
              <ToastPrimitive.Title className="text-sm font-semibold text-text">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="mt-0.5 text-xs text-text-muted">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="p-1 text-text-muted hover:text-text rounded">
              <X className="w-3.5 h-3.5" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 p-4 pointer-events-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function Toast({
  type = "info",
  title,
  message,
  onClose,
}: {
  type?: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  onClose?: () => void;
}) {
  return (
    <div
      role="status"
      className={`p-4 rounded border flex items-start gap-3 bg-surface ${
        type === "error"
          ? "border-danger/40 text-danger"
          : type === "success"
          ? "border-success/40 text-success"
          : type === "warning"
          ? "border-warning/40 text-warning"
          : "border-border text-text"
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {type === "error" ? (
          <AlertCircle className="w-4 h-4 text-danger" aria-hidden="true" />
        ) : type === "success" ? (
          <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" />
        ) : (
          <AlertCircle className="w-4 h-4 text-primary" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-text">{title}</div>
        {message && <div className="mt-0.5 text-xs text-text-muted">{message}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-text-muted hover:text-text rounded"
          aria-label="Dismiss message"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
