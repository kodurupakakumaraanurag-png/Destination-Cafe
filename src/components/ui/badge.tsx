import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide border transition-colors select-none",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/10 text-primary",
        secondary: "border-border bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground bg-transparent",
        success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        destructive: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function getPriorityBadgeVariant(priority?: string | null) {
  switch (priority) {
    case "URGENT":
      return "destructive";
    case "HIGH":
      return "warning";
    case "MEDIUM":
      return "default";
    case "LOW":
    default:
      return "secondary";
  }
}

export function getStatusBadgeVariant(status?: string | null) {
  switch (status) {
    case "NEW":
      return "default";
    case "CONTACTED":
      return "secondary";
    case "IN_PROGRESS":
      return "warning";
    case "QUALIFIED":
    case "CONVERTED":
      return "success";
    case "ARCHIVED":
      return "outline";
    case "UNQUALIFIED":
    default:
      return "secondary";
  }
}

export { Badge, badgeVariants };
