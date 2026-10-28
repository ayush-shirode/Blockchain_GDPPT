"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Share2,
  History,
  Shield,
  FileCheck2,
  FileX,
  FilePlus2,
  Search,
  CheckCircle2,
  Layers,
  Users,
  Activity,
  HeartPulse,
  Settings,
  X,
} from "lucide-react";
import { Role } from "@/layers/policy/access-control";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: Role;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const getNavItems = (): { section: string; items: NavItem[] }[] => {
    switch (role) {
      case "CITIZEN":
        return [
          {
            section: "Citizen Wallet",
            items: [
              {
                label: "Overview",
                href: "/citizen",
                icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "My Credentials",
                href: "/citizen/credentials",
                icon: <Wallet className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Share a Proof",
                href: "/citizen/share",
                icon: <Share2 className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Sharing History",
                href: "/citizen/history",
                icon: <History className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Account & Security",
                href: "/citizen/account",
                icon: <Shield className="w-4 h-4" aria-hidden="true" />,
              },
            ],
          },
        ];

      case "ISSUER":
        return [
          {
            section: "Issuer Console",
            items: [
              {
                label: "Overview",
                href: "/issuer",
                icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Issue Credential",
                href: "/issuer/issue",
                icon: <FilePlus2 className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Issued Credentials",
                href: "/issuer/credentials",
                icon: <FileCheck2 className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Revocations",
                href: "/issuer/revocations",
                icon: <FileX className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Issuance History",
                href: "/issuer/history",
                icon: <History className="w-4 h-4" aria-hidden="true" />,
              },
            ],
          },
        ];

      case "VERIFIER":
        return [
          {
            section: "Verifier Portal",
            items: [
              {
                label: "Overview",
                href: "/verifier",
                icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Verify Credential",
                href: "/verifier/verify",
                icon: <CheckCircle2 className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Verification Requests",
                href: "/verifier/requests",
                icon: <Search className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Verification History",
                href: "/verifier/history",
                icon: <History className="w-4 h-4" aria-hidden="true" />,
              },
            ],
          },
        ];

      case "ADMIN":
        return [
          {
            section: "Administration",
            items: [
              {
                label: "System Overview",
                href: "/admin",
                icon: <LayoutDashboard className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Ledger Activity",
                href: "/admin/ledger",
                icon: <Layers className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Users & Roles",
                href: "/admin/users",
                icon: <Users className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Audit Logs",
                href: "/admin/audit",
                icon: <Activity className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Integration Health",
                href: "/admin/health",
                icon: <HeartPulse className="w-4 h-4" aria-hidden="true" />,
              },
              {
                label: "Settings",
                href: "/admin/settings",
                icon: <Settings className="w-4 h-4" aria-hidden="true" />,
              },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const navGroups = getNavItems();

  const sidebarContent = (
    <div className="w-60 h-full bg-surface border-r border-border flex flex-col justify-between py-4 text-sm">
      <div className="space-y-6 px-3">
        {onClose && (
          <div className="flex items-center justify-between lg:hidden mb-2 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Menu
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-text-muted hover:text-text"
              aria-label="Close navigation drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h2 className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
              {group.section}
            </h2>
            <nav aria-label={group.section} className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-white font-semibold"
                        : "text-text-muted hover:text-text hover:bg-bg"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="px-4 pt-3 border-t border-border text-[11px] text-text-muted leading-relaxed">
        <p className="font-semibold text-text">Prototype Mode</p>
        <p>Offline simulated ledger & local Ed25519 cryptography.</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:block shrink-0 no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden no-print">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
