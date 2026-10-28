"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CopyableCode } from "@/components/ui/CopyableCode";

export default function CitizenCredentialsPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const res = await fetch("/api/wallet/credentials");
        if (!res.ok) throw new Error("Failed to load credentials.");
        const data = await res.json();
        setCredentials(data.data?.credentials || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading credentials");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCredentials();
  }, []);

  const columns: Column<any>[] = [
    {
      key: "type",
      header: "Credential Type",
      sortable: true,
      render: (row) => (
        <div>
          <Link
            href={`/citizen/credentials/${row.id}`}
            className="font-semibold text-primary hover:underline"
          >
            {row.type}
          </Link>
          <div className="text-[11px] text-text-muted font-mono">
            {row.id.slice(0, 24)}...
          </div>
        </div>
      ),
    },
    {
      key: "issuerName",
      header: "Issuing Authority",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-text">{row.issuer.organizationName}</div>
          <div className="text-[11px] font-mono text-text-muted">
            {row.issuer.did.slice(0, 28)}...
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.status} expiresAt={row.expiresAt} />
      ),
    },
    {
      key: "issuedAt",
      header: "Issued",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {new Date(row.issuedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "expiresAt",
      header: "Expires",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {new Date(row.expiresAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <Link
          href={`/citizen/credentials/${row.id}`}
          className="px-2.5 py-1 rounded border border-border bg-surface text-xs font-medium text-text hover:bg-bg hover:border-primary transition-colors"
        >
          View Details
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Citizen Wallet", href: "/citizen" },
          { label: "My Credentials" },
        ]}
        title="My Verifiable Credentials"
        description="Inspect all digitally signed credentials in your custody, including active, expired, and revoked credentials."
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={credentials}
        searchKey="type"
        searchPlaceholder="Filter credentials by type..."
        isLoading={isLoading}
        emptyTitle="No credentials in wallet"
        emptyDescription="You do not currently hold any verifiable credentials in this wallet."
      />
    </div>
  );
}
