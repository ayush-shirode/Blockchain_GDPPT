"use client";

import React, { useEffect, useState } from "react";
import { Users, Search, Shield, Building2, UserCheck, AlertCircle, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Callout } from "@/components/ui/Callout";
import { Skeleton } from "@/components/ui/Skeleton";

interface UserItem {
  id: string;
  displayName: string;
  email: string;
  role: "CITIZEN" | "ISSUER" | "VERIFIER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  issuer?: {
    organizationName: string;
    did: string;
    trustStatus: string;
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        throw new Error("Failed to load user accounts from directory.");
      }
      const data = await res.json();
      setUsers(data.data.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading users");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (filterRole !== "ALL" && u.role !== filterRole) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.issuer?.organizationName.toLowerCase().includes(q) ?? false) ||
        (u.issuer?.did.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const columns = [
    {
      key: "user",
      header: "User Identity",
      render: (u: UserItem) => (
        <div>
          <div className="font-medium text-text text-sm">{u.displayName}</div>
          <div className="text-xs text-text-muted font-mono">{u.email}</div>
          {u.issuer && (
            <div className="text-[11px] text-text-secondary mt-0.5 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-text-muted" aria-hidden="true" />
              <span>{u.issuer.organizationName}</span>
              <span className="font-mono text-[10px] text-text-muted">({u.issuer.trustStatus})</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "role",
      header: "System Role",
      render: (u: UserItem) => {
        let badgeStatus: "VALID" | "PENDING" | "NEUTRAL" = "NEUTRAL";
        if (u.role === "ADMIN") badgeStatus = "PENDING";
        if (u.role === "ISSUER" || u.role === "VERIFIER") badgeStatus = "VALID";

        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono border border-border bg-surface-subtle font-semibold">
            <Shield className="w-3 h-3 text-text-muted" aria-hidden="true" />
            {u.role}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (u: UserItem) => (
        <StatusBadge
          status={u.status === "ACTIVE" ? "VALID" : "REVOKED"}
          customLabel={u.status === "ACTIVE" ? "Active" : "Suspended"}
        />
      ),
    },
    {
      key: "registered",
      header: "Created At",
      render: (u: UserItem) => (
        <span className="text-xs text-text-muted font-mono">
          {new Date(u.createdAt).toISOString().replace("T", " ").substring(0, 19)}
        </span>
      ),
    },
    {
      key: "id",
      header: "Subject ID",
      render: (u: UserItem) => (
        <span className="font-mono text-xs text-text-muted" title={u.id}>
          {u.id.substring(0, 12)}...
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users & Roles" },
        ]}
        title="Users and Roles Management"
        description="Inspect synthetic accounts, role assignments, authority profiles, and access control bindings."
        actions={
          <button
            type="button"
            onClick={loadUsers}
            disabled={isLoading}
            className="px-3 py-1.5 rounded border border-border bg-surface text-text text-xs font-medium hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        }
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Role explanation */}
      <Callout type="note" title="Role-Based Access Control (RBAC)">
        Roles are strictly verified server-side on every API handler and page transition. Citizens may only access their own credentials (IDOR-protected), Issuers may only sign under their registered DID, and Admins can view audit trails and ledger integrity.
      </Callout>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="role-filter" className="text-xs font-semibold text-text-secondary">
            Role:
          </label>
          <select
            id="role-filter"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Roles</option>
            <option value="CITIZEN">Citizen</option>
            <option value="ISSUER">Issuer</option>
            <option value="VERIFIER">Verifier</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by name, email, or organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-14" />
          <Skeleton className="w-full h-14" />
          <Skeleton className="w-full h-14" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          emptyTitle="No users found"
          emptyDescription="No users found matching the selected filter criteria."
        />
      )}
    </div>
  );
}
