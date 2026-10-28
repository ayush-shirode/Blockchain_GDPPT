"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CopyableCode } from "@/components/ui/CopyableCode";

export default function IssuerHistoryPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/issuer/credentials");
        if (!res.ok) throw new Error("Failed to load history.");
        const json = await res.json();
        setCredentials(json.data?.credentials || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading history");
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const columns: Column<any>[] = [
    {
      key: "type",
      header: "Credential / Subject",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text">{row.type}</span>
          <p className="text-[11px] text-text-muted">Subject: {row.subjectName}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Lifecycle Status",
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.status} expiresAt={row.expiresAt} />
      ),
    },
    {
      key: "ledgerTxRef",
      header: "Ledger Transaction Reference",
      render: (row) => (
        <code className="font-mono text-xs bg-bg px-2 py-0.5 rounded border border-border text-text">
          {row.ledgerTxRef || "Unconfirmed"}
        </code>
      ),
    },
    {
      key: "issuedAt",
      header: "Event Timestamp",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {row.status === "REVOKED" && row.revokedAt
            ? `Revoked: ${new Date(row.revokedAt).toLocaleString()}`
            : `Issued: ${new Date(row.issuedAt).toLocaleString()}`}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Issuer Console", href: "/issuer" },
          { label: "Issuance History" },
        ]}
        title="Issuance & Lifecycle History"
        description="Comprehensive audit record of all credential issuances and revocations committed to the simulated ledger."
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={credentials}
        searchKey="subjectName"
        searchPlaceholder="Filter history by subject name..."
        isLoading={isLoading}
        emptyTitle="No history found"
        emptyDescription="No issuance or revocation events found."
      />
    </div>
  );
}
