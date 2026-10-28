"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Activity, Download, RefreshCw, AlertCircle, Filter, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Callout } from "@/components/ui/Callout";
import { CopyableCode } from "@/components/ui/CopyableCode";

interface AuditEventItem {
  id: string;
  actorName: string;
  actorEmail: string | null;
  actorRole: string | null;
  action: string;
  targetRef: string | null;
  result: "SUCCESS" | "FAILURE";
  correlationId: string;
  createdAt: string;
}

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAuditLogs = useCallback(async (actionParam?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = "/api/admin/audit?limit=100";
      const act = actionParam !== undefined ? actionParam : filterAction;
      if (act !== "ALL") {
        url += `&action=${encodeURIComponent(act)}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to retrieve audit log records.");
      }
      const data = await res.json();
      setEvents(data.data.events || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading audit records");
    } finally {
      setIsLoading(false);
    }
  }, [filterAction]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  function handleFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setFilterAction(val);
    loadAuditLogs(val);
  }

  function handleExportCsv() {
    let url = "/api/admin/audit?format=csv&limit=200";
    if (filterAction !== "ALL") {
      url += `&action=${encodeURIComponent(filterAction)}`;
    }
    window.open(url, "_blank");
  }

  const columns = [
    {
      key: "timestamp",
      header: "Timestamp",
      render: (e: AuditEventItem) => (
        <span className="font-mono text-xs text-text-muted whitespace-nowrap">
          {new Date(e.createdAt).toISOString().replace("T", " ").substring(0, 19)}
        </span>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      render: (e: AuditEventItem) => (
        <div>
          <div className="font-medium text-xs text-text">{e.actorName}</div>
          {e.actorEmail && <div className="text-[11px] text-text-muted font-mono">{e.actorEmail}</div>}
          {e.actorRole && (
            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono border border-border bg-surface-subtle text-text-secondary">
              {e.actorRole}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "action",
      header: "Action / Event",
      render: (e: AuditEventItem) => (
        <div className="font-mono text-xs text-text font-medium">
          {e.action}
        </div>
      ),
    },
    {
      key: "targetRef",
      header: "Target Ref",
      render: (e: AuditEventItem) => (
        <span className="font-mono text-xs text-text-muted">
          {e.targetRef ? e.targetRef.substring(0, 24) : "—"}
        </span>
      ),
    },
    {
      key: "result",
      header: "Result",
      render: (e: AuditEventItem) => (
        <StatusBadge
          status={e.result === "SUCCESS" ? "VALID" : "INVALID"}
          customLabel={e.result}
        />
      ),
    },
    {
      key: "correlationId",
      header: "Correlation ID",
      render: (e: AuditEventItem) => (
        <span className="font-mono text-[11px] text-text-muted">
          {e.correlationId ? e.correlationId.substring(0, 16) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Audit Logs" },
        ]}
        title="Immutable Audit & Security Trail"
        description="Comprehensive audit log recording system access, credential life cycle transitions, and policy compliance events."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded border border-border bg-surface text-text text-xs font-medium hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => loadAuditLogs()}
              disabled={isLoading}
              className="px-3 py-1.5 rounded border border-border bg-surface text-text text-xs font-medium hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <Callout type="note" title="Privacy-Preserving Audit Compliance">
        In strict adherence to the Section 9 specification, audit records contain actor IDs, operation codes, and target references only. No raw personal attributes, plaintext claims, or decrypted cryptographic payloads are recorded off-chain or in server logs.
      </Callout>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
          <label htmlFor="action-filter" className="text-xs font-semibold text-text-secondary">
            Filter Action:
          </label>
          <select
            id="action-filter"
            value={filterAction}
            onChange={handleFilterChange}
            className="px-2.5 py-1.5 text-xs rounded border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          >
            <option value="ALL">All Actions</option>
            <option value="AUTH_LOGIN">AUTH_LOGIN</option>
            <option value="CREDENTIAL_ISSUED">CREDENTIAL_ISSUED</option>
            <option value="CREDENTIAL_REVOKED">CREDENTIAL_REVOKED</option>
            <option value="CREDENTIAL_VERIFIED">CREDENTIAL_VERIFIED</option>
            <option value="VERIFICATION_REQUEST_CREATED">VERIFICATION_REQUEST_CREATED</option>
            <option value="CONSENT_RESPONSE">CONSENT_RESPONSE</option>
            <option value="LEDGER_INTEGRITY_CHECK">LEDGER_INTEGRITY_CHECK</option>
            <option value="LEDGER_OUTAGE_TOGGLED">LEDGER_OUTAGE_TOGGLED</option>
          </select>
        </div>

        <span className="text-xs text-text-muted font-mono">
          Showing {events.length} records
        </span>
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
          data={events}
          emptyTitle="No audit log entries found"
          emptyDescription="There are no audit events matching the selected filter."
        />
      )}
    </div>
  );
}
