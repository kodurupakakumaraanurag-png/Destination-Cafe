import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { getServerAuthSession } from "@/lib/auth";

export default async function UnauthorizedPage() {
  const session = await getServerAuthSession();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">403 — Unauthorized Access</h1>
          <p className="text-sm text-muted-foreground">
            You do not have the required role permissions to perform this action or view this resource.
          </p>
        </div>

        {session?.user && (
          <div className="p-4 rounded-lg bg-card border border-border text-xs text-left space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Lock className="w-3.5 h-3.5 text-warning" />
              <span>Current Session Details</span>
            </div>
            <p className="text-muted-foreground">User: {session.user.email}</p>
            <p className="text-muted-foreground">Role: <span className="font-semibold text-foreground">{session.user.role}</span></p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
          >
            <span>Switch Role / Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
