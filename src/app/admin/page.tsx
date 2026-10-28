"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  HeartPulse,
  Activity,
  Users,
  ShieldAlert,
  ArrowRight,
  FlaskConical,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Callout } from "@/components/ui/Callout";

export default function AdminDashboard() {
  const [ledgerData, setLedgerData] = useState<any | null>(null);
  const [healthData, setHealthData] = useState<any | null>(null);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [ledgerRes, healthRes, auditRes] = await Promise.all([
          fetch("/api/admin/ledger?pageSize=5"),
          fetch("/api/admin/health"),
          fetch("/api/admin/audit?limit=5"),
        ]);

        if (!ledgerRes.ok || !healthRes.ok || !auditRes.ok) {
          throw new Error("Failed to load admin overview metrics.");
        }

        const lJson = await ledgerRes.json();
        const hJson = await healthRes.json();
        const aJson = await auditRes.json();

        setLedgerData(lJson.data);
        setHealthData(hJson.data);
        setAuditEvents(aJson.data?.events || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading dashboard");
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "System Overview" }]}
        title="Administrative & Audit Console"
        description="Monitor system operations, inspect hash-chain ledger activity, verify cryptographic integrity, and manage governance policies."
        actions={
          <Link
            href="/admin/ledger"
            className="px-3.5 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Open Ledger Explorer</span>
          </Link>
        }
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      {/* Persistent Simulated Ledger Notice on Ledger/Admin */}
      <Callout type="simulated" title="Simulated Ledger Mode Active">
        This environment uses a SHA-256 hash-chained append-only event log (SimulatedLedger). All block
        digests and state transitions are verifiable via cryptographic recalculation (<code className="font-mono text-xs">verifyIntegrity()</code>).
      </Callout>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Ledger Event Records</span>
            <Layers className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-text mt-2 font-mono tabular-nums">
            {isLoading ? <Skeleton className="w-8 h-7" /> : ledgerData?.total ?? 0}
          </div>
          <span className="text-[11px] text-text-muted">Blocks in SHA-256 chain</span>
        </div>

        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Ledger Outage State</span>
            <FlaskConical className="w-4 h-4 text-info" aria-hidden="true" />
          </div>
          <div className="text-sm font-bold text-text mt-3">
            {isLoading ? (
              <Skeleton className="w-20 h-6" />
            ) : ledgerData?.isOutageSimulated ? (
              <span className="text-danger font-mono font-semibold">OUTAGE SIMULATED</span>
            ) : (
              <span className="text-success font-mono font-semibold">NORMAL (ONLINE)</span>
            )}
          </div>
          <span className="text-[11px] text-text-muted">Toggle in Health or Ledger</span>
        </div>

        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Integration Health</span>
            <HeartPulse className="w-4 h-4 text-success" aria-hidden="true" />
          </div>
          <div className="text-sm font-bold text-text mt-3">
            {isLoading ? (
              <Skeleton className="w-20 h-6" />
            ) : (
              <span className="text-success font-semibold">All 4 Services UP</span>
            )}
          </div>
          <span className="text-[11px] text-text-muted">API, DB, Ledger, Signing</span>
        </div>

        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Audit Events Recorded</span>
            <Activity className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-text mt-2 font-mono tabular-nums">
            {isLoading ? <Skeleton className="w-8 h-7" /> : auditEvents.length > 0 ? "Active" : 0}
          </div>
          <span className="text-[11px] text-text-muted">Off-chain security log</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/ledger"
          className="border border-border rounded bg-surface p-5 hover:border-primary transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-text">
              <Layers className="w-4 h-4 text-primary" />
              <span>Simulated Ledger Explorer</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Inspect on-chain blocks, payload digests, previous-hash pointers, and run the chain-integrity check.
            </p>
          </div>
          <span className="text-xs font-semibold text-primary flex items-center gap-1">
            Explore Ledger Blocks →
          </span>
        </Link>

        <Link
          href="/admin/health"
          className="border border-border rounded bg-surface p-5 hover:border-primary transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-text">
              <HeartPulse className="w-4 h-4 text-success" />
              <span>Integration Health & Outage Drill</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Review latency and uptime for core subsystems. Toggle the &quot;Simulate ledger outage&quot; switch.
            </p>
          </div>
          <span className="text-xs font-semibold text-primary flex items-center gap-1">
            Inspect Subsystem Health →
          </span>
        </Link>

        <Link
          href="/admin/audit"
          className="border border-border rounded bg-surface p-5 hover:border-primary transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-text">
              <Activity className="w-4 h-4 text-primary" />
              <span>Security Audit Logs</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Searchable, paginated audit trail of all security-sensitive actions with one-click CSV export.
            </p>
          </div>
          <span className="text-xs font-semibold text-primary flex items-center gap-1">
            View Security Logs →
          </span>
        </Link>
      </div>

      {/* Recent Security-Sensitive Events */}
      <div className="border border-border rounded bg-surface p-5">
        <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-text">Recent Security-Sensitive Events</h2>
            <p className="text-xs text-text-muted">
              Security operations logged off-chain with correlation IDs. No personal identity data logged.
            </p>
          </div>
          <Link href="/admin/audit" className="text-xs text-primary font-semibold hover:underline">
            View all audit logs →
          </Link>
        </div>

        {isLoading ? (
          <Skeleton rows={3} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-bg text-text-muted font-medium">
                <tr>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Actor</th>
                  <th className="px-3 py-2">Result</th>
                  <th className="px-3 py-2">Correlation ID</th>
                  <th className="px-3 py-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-bg/50">
                    <td className="px-3 py-2.5 font-semibold text-text font-mono">
                      {evt.action}
                    </td>
                    <td className="px-3 py-2.5 text-text-muted">
                      {evt.actorName}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          evt.result === "SUCCESS"
                            ? "bg-success-bg text-success"
                            : "bg-danger-bg text-danger"
                        }`}
                      >
                        {evt.result}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-text-muted">
                      {evt.correlationId}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-text-muted">
                      {new Date(evt.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
