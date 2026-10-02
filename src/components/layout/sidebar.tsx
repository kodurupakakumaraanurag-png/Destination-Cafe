"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GitPullRequest,
  Contact,
  Activity,
  CheckSquare,
  Clock,
  TrendingUp,
  FolderKanban,
  PieChart,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  History,
  UserCheck,
  ShieldCheck,
  FileText,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "CRM",
    items: [
      { title: "Leads", href: "/crm/leads", icon: Users },
      { title: "Pipeline", href: "/crm/pipeline", icon: GitPullRequest },
      { title: "Contacts", href: "/crm/contacts", icon: Contact },
      { title: "Activities", href: "/crm/activities", icon: Activity },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Tasks", href: "/operations/tasks", icon: CheckSquare },
      { title: "Follow-ups", href: "/operations/follow-ups", icon: Clock },
      { title: "Opportunities", href: "/operations/opportunities", icon: TrendingUp },
      { title: "Projects", href: "/operations/projects", icon: FolderKanban },
    ],
  },
  {
    title: "Analytics",
    items: [
      { title: "Overview", href: "/analytics/overview", icon: PieChart },
      { title: "Lead Analytics", href: "/analytics/lead-analytics", icon: BarChart3 },
      { title: "Data Quality", href: "/analytics/data-quality", icon: CheckCircle2 },
    ],
  },
  {
    title: "Data",
    items: [
      { title: "Import", href: "/data/import", icon: FileSpreadsheet },
      { title: "Import History", href: "/data/import-history", icon: History },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Users", href: "/admin/users", icon: UserCheck },
      { title: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    CRM: true,
    Operations: true,
    Analytics: true,
    Data: true,
    Administration: true,
  });

  const toggleSection = (sectionTitle: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const isDashboardActive = pathname === "/";

  return (
    <aside
      className={cn(
        "fixed top-0 bottom-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-accent/50 flex flex-col transition-transform duration-200 md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Brand Header */}
      <div className="h-14 px-5 flex items-center gap-3 border-b border-sidebar-accent/60 shrink-0">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-xs">
          DC
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-tight text-white leading-none">Destination Cafe</span>
          <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Enterprise CRM</span>
        </div>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Single Item: Dashboard */}
        <div>
          <Link
            href="/"
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors",
              isDashboardActive
                ? "bg-primary text-white font-semibold"
                : "text-slate-300 hover:bg-sidebar-accent hover:text-white"
            )}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Categorized Sections */}
        {NAV_SECTIONS.map((section) => {
          const isOpen = openSections[section.title] ?? true;
          return (
            <div key={section.title} className="space-y-1">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
              >
                <span>{section.title}</span>
                <ChevronDown
                  className={cn(
                    "w-3 h-3 text-slate-400 transition-transform duration-200",
                    isOpen ? "transform rotate-0" : "transform -rotate-90"
                  )}
                />
              </button>

              {isOpen && (
                <div className="space-y-0.5 pt-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                          isActive
                            ? "bg-primary/90 text-white font-semibold shadow-2xs"
                            : "text-slate-300 hover:bg-sidebar-accent hover:text-white"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Version Info */}
      <div className="p-3 border-t border-sidebar-accent/60 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
        <span>Destination Cafe CRM</span>
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-sidebar-accent text-slate-300">v1.0.0</span>
      </div>
    </aside>
  );
}
