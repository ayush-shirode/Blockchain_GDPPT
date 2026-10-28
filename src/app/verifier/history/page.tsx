"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CheckList } from "@/components/ui/CheckList";
import { Receipt } from "@/components/ui/Receipt";

export default function VerifierHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/verifier/history");
        if (!res.ok) throw new Error("Failed to load verification history.");
        const json = await res.json();
        setHistory(json.data?.history || []);
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
      key: "purpose",
      header: "Verification Context",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text">{row.purpose}</span>
          <span className="block text-[11px] text-text-muted">{row.subjectName}</span>
        </div>
      ),
    },
    {
      key: "outcome",
      header: "Outcome",
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.outcome} />
      ),
    },
    {
      key: "reasonCode",
      header: "Reason Code",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {row.reasonCode || "—"}
        </span>
      ),
    },
    {
      key: "disclosedClaims",
      header: "Disclosed Claims",
      render: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {Object.keys(row.disclosedClaims).join(", ") || "None"}
        </span>
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
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedEvent(row)}
          className="px-2.5 py-1 rounded border border-border bg-surface text-xs font-medium text-text hover:bg-bg hover:border-primary transition-colors"
        >
          Inspect Checks
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Verifier Portal", href: "/verifier" },
          { label: "Verification History" },
        ]}
        title="Verification History & Audit Log"
        description="Inspect past verification runs, individual check outcomes (Spec 5.1), and disclosed attribute scopes."
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      {selectedEvent && (
        <div className="border border-border rounded bg-surface p-6 mb-8">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-text">
                Verification Details: {selectedEvent.purpose}
              </h2>
              <span className="text-xs text-text-muted">
                Executed on {new Date(selectedEvent.createdAt).toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="text-xs text-primary font-semibold underline"
            >
              Close Details
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
              Individual Checks Performed (Decision Table)
            </h3>
            <CheckList checks={selectedEvent.checks || []} />
          </div>

          <Receipt
            title="Verification Event Receipt"
            receiptNumber={selectedEvent.id.slice(0, 16)}
            timestamp={new Date(selectedEvent.createdAt).toUTCString()}
            status={selectedEvent.outcome}
            items={[
              { label: "Outcome", value: selectedEvent.outcome },
              { label: "Reason Code", value: selectedEvent.reasonCode || "NONE" },
              {
                label: "Disclosed Claims",
                value: Object.entries(selectedEvent.disclosedClaims)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ") || "None",
              },
            ]}
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={history}
        searchKey="purpose"
        searchPlaceholder="Filter history by verification context..."
        isLoading={isLoading}
        emptyTitle="No verification history"
        emptyDescription="Your organization has not yet performed any credential verifications."
      />
    </div>
  );
}
