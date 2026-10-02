"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Home className="w-3.5 h-3.5 text-foreground" />
        <span className="font-semibold text-foreground">Dashboard</span>
      </div>
    );
  }

  const formatSegment = (segment: string) => {
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
      <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
      </Link>
      <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />

      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const formattedName = formatSegment(segment);

        return (
          <div key={href} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="font-semibold text-foreground">{formattedName}</span>
            ) : (
              <>
                <Link href={href} className="hover:text-foreground transition-colors">
                  {formattedName}
                </Link>
                <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
