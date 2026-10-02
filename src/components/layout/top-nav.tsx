"use client";

import { Menu, Search, Bell } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { UserMenu } from "@/components/layout/user-menu";

interface TopNavProps {
  onMobileMenuToggle: () => void;
}

export function TopNav({ onMobileMenuToggle }: TopNavProps) {
  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xs sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle menu</span>
        </button>

        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search trigger placeholder */}
        <div className="relative hidden sm:block w-48 md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search CRM (Ctrl+K)..."
            readOnly
            className="w-full h-8 pl-8 pr-3 text-xs rounded-md bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground cursor-pointer focus:outline-none"
          />
        </div>

        {/* Notifications Icon */}
        <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-primary absolute top-1 right-1" />
        </button>

        <div className="h-4 w-px bg-border hidden sm:block" />

        <UserMenu />
      </div>
    </header>
  );
}
