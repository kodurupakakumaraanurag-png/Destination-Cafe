"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Lock, ArrowRight } from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "ADMIN",
    email: "admin@destinationcafe.com",
    title: "System Administrator",
    badge: "Full Access",
    desc: "Unrestricted access to all CRM entities, user management, and system logs.",
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  {
    role: "MANAGER",
    email: "manager@destinationcafe.com",
    title: "Operations Manager",
    badge: "Manager Access",
    desc: "Lead pipeline, team oversight, opportunity, and audit access.",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    role: "SALES",
    email: "sales@destinationcafe.com",
    title: "Sales Representative",
    badge: "Sales Access",
    desc: "Lead tracking, pipeline opportunities, scoring, and task management.",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    role: "ANALYST",
    email: "analyst@destinationcafe.com",
    title: "Data Analyst",
    badge: "Analyst Access",
    desc: "Lead viewing, analytical reporting, scoring, and CSV batch ingestion.",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  {
    role: "VIEWER",
    email: "viewer@destinationcafe.com",
    title: "Read-Only Viewer",
    badge: "Read Only",
    desc: "Read-only access to leads and analytics reporting views.",
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (email: string) => {
    setLoadingEmail(email);
    setErrorMsg(null);
    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setErrorMsg("Failed to sign in. Please verify your connection or try again.");
        setLoadingEmail(null);
      }
    } catch {
      setErrorMsg("An unexpected error occurred during sign in.");
      setLoadingEmail(null);
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 font-medium">
          {errorMsg}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
          Select Demo Role
        </h2>
        <span className="text-xs text-muted-foreground">One-click sign in</span>
      </div>

      <div className="space-y-3">
        {DEMO_ACCOUNTS.map((account) => {
          const isLoading = loadingEmail === account.email;
          return (
            <button
              key={account.role}
              onClick={() => handleSignIn(account.email)}
              disabled={loadingEmail !== null}
              className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group flex items-center justify-between gap-4 disabled:opacity-50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {account.title}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${account.badgeColor}`}>
                    {account.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{account.desc}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground group-hover:text-primary">
                {isLoading ? (
                  <span className="text-xs font-semibold animate-pulse">Signing in...</span>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom email login fallback */}
      <div className="pt-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customEmail) handleSignIn(customEmail);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="email"
            placeholder="Or enter custom email..."
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-lg bg-card border border-border focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!customEmail || loadingEmail !== null}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-background text-foreground">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left column info */}
        <div className="md:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Shield className="w-4 h-4" />
            <span>Auth.js &amp; RBAC Framework</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Destination Cafe</h1>
            <p className="text-sm text-muted-foreground">
              Enterprise CRM &amp; Lead Management Platform. Authenticate with a demo role to test server-side authorization.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Lock className="w-4 h-4 text-primary" />
              <span>Role-Based Access Control</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Permissions cover 12 granular access scopes enforced via server-side authorization checks and route protection middleware.
            </p>
          </div>
        </div>

        {/* Right column accounts with Suspense */}
        <div className="md:col-span-7">
          <Suspense fallback={<div className="p-4 text-xs text-muted-foreground">Loading login form...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
