"use client";

import React, { useEffect, useState } from "react";
import {
  HeartPulse,
  RefreshCw,
  AlertCircle,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Server,
  Layers,
  Database,
  KeyRound,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Callout } from "@/components/ui/Callout";
import { Toast } from "@/components/ui/Toast";

interface HealthService {
  name: string;
  layer: string;
  status: "up" | "down";
  latencyMs: number;
  lastChecked: string;
  notes: string;
}

interface HealthResponseData {
  status: "healthy" | "degraded";
  timestamp: string;
  services: HealthService[];
  ledgerSimulationActive: boolean;
}

export default function AdminHealthPage() {
  const [data, setData] = useState<HealthResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingOutage, setIsTogglingOutage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function loadHealth() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/health");
      if (!res.ok) {
        throw new Error("Failed to check integration service health.");
      }
      const json = await res.json();
      setData(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error checking health");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHealth();
  }, []);

  async function handleToggleOutage() {
    if (!data) return;
    setIsTogglingOutage(true);
    const targetState = !data.ledgerSimulationActive;

    try {
      const res = await fetch("/api/admin/ledger/simulate-outage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulateOutage: targetState }),
      });

      if (!res.ok) {
        throw new Error("Failed to update ledger outage simulation setting.");
      }

      setToastMessage(
        targetState
          ? "Ledger outage simulation ENABLED. Verification requests will now fail safe as 'Unable to verify'."
          : "Ledger connectivity RESTORED. Normal verification pipeline active."
      );

      await loadHealth();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error toggling outage");
    } finally {
      setIsTogglingOutage(false);
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Integration Health" },
        ]}
        title="Integration Health & Fault Injection"
        description="Monitor connectivity to off-chain data stores, cryptographic signing infrastructure, and simulated blockchain adapters."
        actions={
          <button
            type="button"
            onClick={loadHealth}
            disabled={isLoading}
            className="px-3 py-1.5 rounded border border-border bg-surface text-text text-xs font-medium hover:bg-surface-subtle transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>Check Now</span>
          </button>
        }
      />

      {toastMessage && (
        <div className="mb-6">
          <Toast
            type={data?.ledgerSimulationActive ? "warning" : "success"}
            title="Outage State Changed"
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Outage Simulation Box */}
      <div className="border border-border rounded bg-surface p-5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-info" aria-hidden="true" />
              <h2 className="text-sm font-bold text-text">Fault Injection: Ledger Outage Simulation</h2>
            </div>
            <p className="text-xs text-text-secondary mt-1 max-w-2xl">
              Forces all ledger queries and revocation status checks to fail immediately with an intentional network/ledger fault. In accordance with the verification decision table (Spec Section 5.2), verifiers will receive <strong>UNABLE_TO_VERIFY</strong> rather than an erroneous valid state.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold ${
                data?.ledgerSimulationActive
                  ? "bg-warning-bg text-warning border border-warning/40"
                  : "bg-success-bg text-success border border-success/40"
              }`}
            >
              {data?.ledgerSimulationActive ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>SIMULATED OUTAGE ACTIVE</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>LEDGER ONLINE</span>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={handleToggleOutage}
              disabled={isTogglingOutage || isLoading}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                data?.ledgerSimulationActive
                  ? "bg-success text-white hover:bg-success/90"
                  : "bg-warning text-white hover:bg-warning/90"
              }`}
            >
              {isTogglingOutage ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>
                {data?.ledgerSimulationActive ? "Restore Ledger Connectivity" : "Simulate Ledger Outage"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="border border-border rounded bg-surface overflow-hidden">
        <div className="px-4 py-3 bg-surface-subtle border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold text-text uppercase tracking-wider">Subsystem Health Matrix</span>
          <span className="text-xs text-text-muted font-mono">
            {data ? `Report generated: ${new Date(data.timestamp).toISOString().replace("T", " ").substring(0, 19)} UTC` : ""}
          </span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-subtle/50 text-text-secondary">
                <th className="py-2.5 px-4 font-semibold">Service Name</th>
                <th className="py-2.5 px-4 font-semibold">Architecture Layer</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold">Round-Trip Latency</th>
                <th className="py-2.5 px-4 font-semibold">Diagnostic Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.services.map((svc) => (
                <tr key={svc.name} className="hover:bg-surface-subtle/40">
                  <td className="py-3 px-4 font-medium text-text">
                    <div className="flex items-center gap-2">
                      {svc.name.includes("API") && <Server className="w-4 h-4 text-text-muted" aria-hidden="true" />}
                      {svc.name.includes("Database") && <Database className="w-4 h-4 text-text-muted" aria-hidden="true" />}
                      {svc.name.includes("Blockchain") && <Layers className="w-4 h-4 text-text-muted" aria-hidden="true" />}
                      {svc.name.includes("Signing") && <KeyRound className="w-4 h-4 text-text-muted" aria-hidden="true" />}
                      <span>{svc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-text-muted">{svc.layer}</td>
                  <td className="py-3 px-4">
                    <StatusBadge
                      status={svc.status === "up" ? "VALID" : "UNABLE_TO_VERIFY"}
                      customLabel={svc.status === "up" ? "Operational" : "Fault / Degraded"}
                    />
                  </td>
                  <td className="py-3 px-4 font-mono text-text-muted">
                    {svc.status === "up" ? `${svc.latencyMs} ms` : "—"}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{svc.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
