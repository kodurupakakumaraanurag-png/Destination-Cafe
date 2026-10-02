"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  type?: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export function Toast({ type = "info", title, message, onClose, className }: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-lg border border-border bg-card shadow-md text-card-foreground max-w-sm w-full animate-in slide-in-from-top-2 duration-200",
        className
      )}
    >
      {icons[type]}
      <div className="flex-1 space-y-0.5">
        <h4 className="text-xs font-semibold text-foreground">{title}</h4>
        {message && <p className="text-[11px] text-muted-foreground leading-relaxed">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState<{ title: string; message?: string; type: ToastType } | null>(null);

  const addToast = React.useCallback((messageOrTitle: string, typeOrMessage?: string, type?: ToastType) => {
    if (typeOrMessage === "success" || typeOrMessage === "error" || typeOrMessage === "info") {
      setToast({ title: messageOrTitle, type: typeOrMessage as ToastType });
    } else {
      setToast({ title: messageOrTitle, message: typeOrMessage, type: type || "info" });
    }

    setTimeout(() => setToast(null), 4000);
  }, []);

  return { toast, addToast, setToast };
}
