import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="text-xs font-medium text-foreground tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type="date"
            className={cn(
              "flex h-9 w-full rounded-md border border-border bg-card px-3 py-1.5 pr-8 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          />
          <Calendar className="absolute right-2.5 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput };
