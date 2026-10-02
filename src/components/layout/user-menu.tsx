"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Shield, ChevronDown } from "lucide-react";
import { UserRole } from "@prisma/client";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userRole = (session?.user?.role as UserRole) || "VIEWER";
  const userEmail = session?.user?.email || "user@destinationcafe.com";
  const userName = session?.user?.name || "CRM User";

  const roleBadgeColors: Record<string, string> = {
    ADMIN: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
    MANAGER: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400",
    SALES: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
    ANALYST: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
    VIEWER: "bg-slate-500/10 text-slate-700 border-slate-500/20 dark:text-slate-400",
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-secondary transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
          {userName.charAt(0)}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold leading-tight">{userName}</span>
          <span className="text-[10px] text-muted-foreground leading-tight">{userRole}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg p-2 z-50 text-card-foreground animate-in fade-in-0 duration-150 space-y-2">
          <div className="px-3 py-2 border-b border-border space-y-1">
            <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
            <div className="pt-1">
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadgeColors[userRole] || roleBadgeColors.VIEWER}`}>
                Role: {userRole}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <a
              href="/admin/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-foreground hover:bg-secondary transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Account Settings</span>
            </a>
          </div>

          <div className="pt-1 border-t border-border">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
