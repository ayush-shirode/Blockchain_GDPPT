"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function CitizenHistoryPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/wallet/requests");
        if (!res.ok) throw new Error("Failed to load sharing history.");
        const data = await res.json();
        setRequests(data.data?.requests || []);
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
      key: "verifierName",
      header: "Service Requester",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text">{row.verifierName}</span>
          <p className="text-[11px] text-text-muted">{row.purpose}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Consent Decision",
      sortable: true,
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            row.status === "APPROVED"
              ? "bg-success-bg text-success border border-success/30"
              : row.status === "DECLINED"
              ? "bg-danger-bg text-danger border border-danger/30"
              : "bg-bg text-text-muted border border-border"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "disclosed",
      header: "Disclosed Attributes",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.consentRecord?.approvedAttributes?.length > 0 ? (
            row.consentRecord.approvedAttributes.map((attr: string) => (
              <span
                key={attr}
                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg border border-border text-text"
              >
                {attr}
              </span>
            ))
          ) : (
            <span className="text-text-muted text-xs italic">None (Declined / Pending)</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Timestamp",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Citizen Wallet", href: "/citizen" },
          { label: "Sharing History" },
        ]}
        title="Sharing History & Audit Receipts"
        description="Review past proof requests, your explicit consent decisions, and which attributes were disclosed to third-party services."
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={requests}
        searchKey="verifierName"
        searchPlaceholder="Filter history by service name..."
        isLoading={isLoading}
        emptyTitle="No sharing history"
        emptyDescription="You have not yet approved or declined any credential sharing requests."
      />
    </div>
  );
}
