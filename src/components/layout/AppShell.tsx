"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { SkipLink } from "./SkipLink";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { Banner } from "../ui/Banner";
import { ToastProvider } from "../ui/Toast";
import { SessionUser } from "@/layers/policy/access-control";

interface AppShellProps {
  user: SessionUser | null;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLedgerPage = pathname?.includes("/admin/ledger") ?? false;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg flex flex-col font-sans">
        <SkipLink targetId="main-content" />
        <Banner isLedgerPage={isLedgerPage} />
        <TopBar user={user} onToggleSidebar={() => setSidebarOpen((v) => !v)} />

        <div className="flex-1 flex overflow-hidden">
          {user && (
            <Sidebar
              role={user.role}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}

          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 focus:outline-none"
          >
            <div className="max-w-portal mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
