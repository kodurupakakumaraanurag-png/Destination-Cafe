import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <FolderOpen className="w-8 h-8 text-muted-foreground" />,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-lg border border-dashed border-border bg-card/50 space-y-4",
        className
      )}
    >
      <div className="p-3 rounded-full bg-secondary/80 border border-border">
        {icon}
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
