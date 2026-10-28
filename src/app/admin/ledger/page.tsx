"use client";

import React, { useEffect, useState } from "react";
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FlaskConical,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { CopyableCode } from "@/components/ui/CopyableCode";
import { Callout } from "@/components/ui/Callout";

export default function AdminLedgerPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isOutage, setIsOutage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<any | null>(null);
  const [isTogglingOutage, setIsTogglingOutage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLedgerEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/ledger?pageSize=50");
      if (!res.ok) throw new Error("Failed to load ledger events.");
      const json = await res.json();
      setEvents(json.data?.items || []);
      setIsOutage(json.data?.isOutageSimulated || false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading ledger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLedgerEvents();
  }, []);

  const handleVerifyIntegrity = async () => {
    setIsCheckingIntegrity(true);
    setIntegrityResult(null);
    try {
      const res = await fetch("/api/admin/ledger/integrity");
      if (!res.ok) throw new Error("Failed to execute chain integrity check.");
      const json = await res.json();
      setIntegrityResult(json.data?.integrity);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error checking integrity");
    } finally {
      setIsCheckingIntegrity(false);
    }
  };

  const handleToggleOutage = async () => {
    setIsTogglingOutage(true);
    try {
      const res = await fetch("/api/admin/ledger/simulate-outage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulateOutage: !isOutage }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to toggle outage.");
      setIsOutage(json.data?.simulateOutage || false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error toggling outage");
    } finally {
      setIsTogglingOutage(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: "index",
      header: "Block Index",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-primary">
          #{row.index}
        </span>
      ),
    },
    {
      key: "eventType",
      header: "Event Type",
      sortable: true,
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
            row.eventType === "ISSUANCE"
              ? "bg-success-bg text-success border border-success/30"
              : "bg-danger-bg text-danger border border-danger/30"
          }`}
        >
          {row.eventType}
        </span>
      ),
    },
    {
      key: "recordId",
      header: "Credential Reference ID",
      render: (row) => (
        <CopyableCode value={row.recordId} truncateLength={22} />
      ),
    },
    {
      key: "issuerDid",
      header: "Issuer DID",
      render: (row) => (
        <CopyableCode value={row.issuerDid} truncateLength={26} />
      ),
    },
    {
      key: "prevHash",
      header: "Previous Hash Pointer",
      render: (row) => (
        <code className="font-mono text-[11px] text-text-muted">
          {row.prevHash.slice(0, 12)}...
        </code>
      ),
    },
    {
      key: "hash",
      header: "Block Hash (SHA-256)",
      render: (row) => (
        <CopyableCode value={row.hash} truncateLength={16} />
      ),
    },
    {
      key: "createdAt",
      header: "Timestamp",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {new Date(row.createdAt).toLocaleTimeString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Ledger Activity" },
        ]}
        title="Simulated Ledger Explorer"
        description="Auditable, append-only SHA-256 hash-chained event records for verifiable credential issuances and revocations."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isTogglingOutage}
              onClick={handleToggleOutage}
              className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                isOutage
                  ? "bg-danger text-white border-danger hover:bg-danger/90"
                  : "bg-surface text-text border-border hover:bg-bg"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>{isOutage ? "Outage Simulation Active" : "Simulate Ledger Outage"}</span>
            </button>

            <button
              type="button"
              disabled={isCheckingIntegrity}
              onClick={handleVerifyIntegrity}
              className="px-3.5 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingIntegrity ? "animate-spin" : ""}`} />
              <span>Verify Chain Integrity</span>
            </button>
          </div>
        }
      />

      <Callout type="simulated" title="Simulated Ledger Boundary (FR-10, FR-11)">
        This page inspects the SimulatedLedger hash chain. Notice that NO personal names, addresses, or
        identity records are stored on-chain. Only cryptographic digests and status references are
        committed to blocks.
      </Callout>

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      {/* Outage Banner Alert if Active */}
      {isOutage && (
        <div
          role="alert"
          className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-xs font-medium mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Outage Simulation Enabled:</strong> The ledger adapter is artificially returning
              outage errors. Any verification executed while this toggle is active will return{" "}
              <strong>&quot;Unable to verify&quot;</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleOutage}
            className="underline font-bold text-xs shrink-0 ml-3"
          >
            Turn Off Outage
          </button>
        </div>
      )}

      {/* Integrity Verification Result Banner */}
      {integrityResult && (
        <div
          role="status"
          className={`p-4 rounded border text-xs font-medium mb-6 flex items-center justify-between ${
            integrityResult.ok
              ? "border-success/40 bg-success-bg text-success"
              : "border-danger/40 bg-danger-bg text-danger"
          }`}
        >
          <div className="flex items-center gap-2">
            {integrityResult.ok ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>
              <strong>Ledger Integrity Check:</strong>{" "}
              {integrityResult.ok
                ? `Cryptographic recalculation passed. All ${integrityResult.checked} block hashes and previous-hash pointers match perfectly.`
                : `Tampering detected at block #${integrityResult.firstBrokenIndex}! Recomputed SHA-256 does not match recorded block hash.`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIntegrityResult(null)}
            className="underline font-bold text-xs shrink-0 ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={events}
        searchKey="recordId"
        searchPlaceholder="Filter by credential reference ID..."
        isLoading={isLoading}
        emptyTitle="No ledger events found"
        emptyDescription="The simulated ledger has not recorded any transactions yet."
      />
    </div>
  );
}
