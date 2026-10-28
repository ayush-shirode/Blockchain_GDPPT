"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Search, ArrowRight, ShieldCheck, XCircle, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function VerifierDashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVerifierData() {
      try {
        const [histRes, reqsRes] = await Promise.all([
          fetch("/api/verifier/history"),
          fetch("/api/verifier/requests"),
        ]);

        if (!histRes.ok || !reqsRes.ok) {
          throw new Error("Failed to load verifier dashboard data.");
        }

        const histJson = await histRes.json();
        const reqsJson = await reqsRes.json();

        setHistory(histJson.data?.history || []);
        setRequests(reqsJson.data?.requests || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading dashboard");
      } finally {
        setIsLoading(false);
      }
    }
    loadVerifierData();
  }, []);

  const validCount = history.filter((h) => h.outcome === "VALID").length;
  const invalidCount = history.filter((h) => h.outcome === "INVALID" || h.outcome === "REVOKED" || h.outcome === "EXPIRED").length;
  const unavailableCount = history.filter((h) => h.outcome === "UNABLE_TO_VERIFY").length;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Verifier Portal", href: "/verifier" }, { label: "Overview" }]}
        title="Verifier Operations Portal"
        description="Verify verifiable credential presentations against the server-side decision engine, review individual check statuses, and manage proof requests."
        actions={
          <Link
            href="/verifier/verify"
            className="px-3.5 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Start Verification</span>
          </Link>
        }
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Verified Valid</span>
            <ShieldCheck className="w-4 h-4 text-success" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-text mt-2 font-mono tabular-nums">
            {isLoading ? <Skeleton className="w-8 h-7" /> : validCount}
          </div>
          <span className="text-[11px] text-text-muted">All 6 server-side checks passed</span>
        </div>

        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Rejected / Expired / Revoked</span>
            <XCircle className="w-4 h-4 text-danger" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-text mt-2 font-mono tabular-nums">
            {isLoading ? <Skeleton className="w-8 h-7" /> : invalidCount}
          </div>
          <span className="text-[11px] text-text-muted">Cryptographic or policy failure</span>
        </div>

        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Unable to Verify (Outage)</span>
            <AlertTriangle className="w-4 h-4 text-warning" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-text mt-2 font-mono tabular-nums">
            {isLoading ? <Skeleton className="w-8 h-7" /> : unavailableCount}
          </div>
          <span className="text-[11px] text-text-muted">Ledger or key lookup unavailable</span>
        </div>
      </div>

      {/* Verification Actions Box */}
      <div className="border border-border rounded bg-surface p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-text">Launch Verification Console</h2>
          <p className="text-xs text-text-muted max-w-xl leading-relaxed mt-0.5">
            Test and demonstrate all 5 verification outcomes (Valid, Invalid Signature, Untrusted Issuer,
            Expired, Revoked, and Ledger Outage) or verify custom presentations.
          </p>
        </div>
        <Link
          href="/verifier/verify"
          className="shrink-0 px-4 py-2 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5"
        >
          <span>Open Verification Console</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Recent Verification History */}
      <div className="border border-border rounded bg-surface p-5">
        <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-text">Recent Verification Events</h2>
            <p className="text-xs text-text-muted">
              Outcomes recorded without unnecessarily collecting underlying identity attributes.
            </p>
          </div>
          <Link
            href="/verifier/history"
            className="text-xs text-primary font-semibold hover:underline"
          >
            View full history ({history.length}) →
          </Link>
        </div>

        {isLoading ? (
          <Skeleton rows={3} />
        ) : history.length === 0 ? (
          <EmptyState
            title="No verifications executed yet"
            description="Start by executing a verification on the verification console."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-bg text-text-muted font-medium">
                <tr>
                  <th className="px-3 py-2">Subject / Purpose</th>
                  <th className="px-3 py-2">Outcome</th>
                  <th className="px-3 py-2">Reason Code</th>
                  <th className="px-3 py-2">Disclosed Claims</th>
                  <th className="px-3 py-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.slice(0, 5).map((evt) => (
                  <tr key={evt.id} className="hover:bg-bg/50">
                    <td className="px-3 py-2.5 font-semibold text-text">
                      {evt.purpose}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={evt.outcome} />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-text-muted">
                      {evt.reasonCode || "—"}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-text-muted">
                      {Object.keys(evt.disclosedClaims).join(", ") || "None"}
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
