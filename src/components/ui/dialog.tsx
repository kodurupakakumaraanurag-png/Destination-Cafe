"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  maxWidth?: string;
}

export function Dialog({
  open,
  onOpenChange,
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  maxWidth,
}: DialogProps) {
  const isVisible = open !== undefined ? open : (isOpen ?? false);
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div
        className={cn(
          "relative w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl text-card-foreground",
          maxWidth,
          className
        )}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none cursor-pointer"
        >
          <X className="w-4 h-4 text-muted-foreground" />
          <span className="sr-only">Close</span>
        </button>

        {(title || description) && (
          <div className="mb-4 space-y-1">
            {title && <h2 className="text-base font-bold tracking-tight text-foreground">{title}</h2>}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}
