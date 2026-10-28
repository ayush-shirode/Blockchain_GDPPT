"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, BookOpen, LogOut, User as UserIcon, Menu } from "lucide-react";
import { SessionUser } from "@/layers/policy/access-control";

interface TopBarProps {
  user: SessionUser | null;
  onToggleSidebar?: () => void;
}

export function TopBar({ user, onToggleSidebar }: TopBarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/sign-in");
      router.refresh();
    } catch {
      router.push("/sign-in");
    }
  };

  return (
    <header className="h-12 border-b border-border bg-surface px-4 flex items-center justify-between z-30 no-print">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1 rounded text-text-muted hover:text-text lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link
          href="/"
          className="flex items-center gap-2 text-text font-bold text-sm tracking-tight hover:text-primary transition-colors"
        >
          <Shield className="w-4 h-4 text-primary" aria-hidden="true" />
          <span>Digital Identity & E-Governance</span>
        </Link>

        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-warning-bg text-warning border border-warning/40">
          DEMO
        </span>
      </div>

      <nav aria-label="Quick links" className="flex items-center gap-3 text-xs">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-text-muted hover:text-text hover:bg-bg border border-transparent hover:border-border transition-colors font-medium"
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Documentation</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <span className="hidden sm:inline-flex items-center gap-1 text-text font-medium">
              <UserIcon className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
              {user.displayName}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-bg text-text-muted border border-border">
              {user.role}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-danger hover:bg-danger-bg transition-colors font-medium"
              title="Sign out of demonstration session"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="px-3 py-1 rounded bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
