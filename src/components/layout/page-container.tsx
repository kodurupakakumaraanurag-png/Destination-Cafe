import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "p-4 md:p-8 max-w-7xl mx-auto space-y-6 w-full animate-in fade-in-0 duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
