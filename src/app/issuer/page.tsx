"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FilePlus2, FileCheck2, FileX, ArrowRight, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function IssuerDashboard() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [issuer, setIssuer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadIssuerData() {
      try {
        const res = await fetch("/api/issuer/credentials");
        if (!res.ok) throw new Error("Failed to load issuer credentials.");
        const json = await res.json();
        setCredentials(json.data?.credentials || []);
        setIssuer(json.data?.issuer || null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading dashboard");
      } finally {
        setIsLoading(false);
      }
    }
    loadIssuerData();
  }, []);

  const totalIssued = credentials.length;
  const activeCount = credentials.filter((c) => c.status === "ACTIVE").length;
  const revokedCount = credentials.filter((c) => c.status === "REVOKED").length;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Issuer Console", href: "/issuer" }, { label: "Overview" }]}
        title={issuer ? `${issuer.organizationName} Console` : "Issuer Authority Console"}
        description="Issue digitally signed W3C Verifiable Credentials to citizens and manage lifecycle revocations recorded on the simulated ledger."
        actions={
          <Link
            href="/issuer/issue"
            className="px-3.5 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5"
          >
            <FilePlus2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Issue New Credential</span>
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
            <span className="text-xs text-text-muted font-medium">Total Credentials Issued</span>
            <FileCheck2 className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-text mt-2 font-mono tabular-nums">
            {isLoading ? <Skeleton className="w-8 h-7" /> : totalIssued}
          </div>
          <span className="text-[11px] text-text-muted">Recorded on immutable ledger</span>
        </div>

        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Currently Active</span>
            <Shield className="w-4 h-4 text-success" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-text mt-2 font-mono tabular-nums">
            {isLoading ? <Skeleton className="w-8 h-7" /> : activeCount}
          </div>
          <span className="text-[11px] text-text-muted">Eligible for selective disclosure</span>
        </div>

        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Revoked Credentials</span>
            <FileX className="w-4 h-4 text-danger" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-text mt-2 font-mono tabular-nums">
            {isLoading ? <Skeleton className="w-8 h-7" /> : revokedCount}
          </div>
          <span className="text-[11px] text-text-muted">Terminated via reason code</span>
        </div>
      </div>

      {/* Recent Issued Credentials */}
      <div className="border border-border rounded bg-surface p-5">
        <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-text">Recent Issued Credentials</h2>
            <p className="text-xs text-text-muted">
              Credentials issued under authority DID: <code className="font-mono text-primary font-semibold">{issuer?.did}</code>
            </p>
          </div>
          <Link
            href="/issuer/credentials"
            className="text-xs text-primary font-semibold hover:underline"
          >
            View all issued credentials →
          </Link>
        </div>

        {isLoading ? (
          <Skeleton rows={3} />
        ) : credentials.length === 0 ? (
          <EmptyState
            title="No credentials issued yet"
            description="Get started by issuing your first verifiable credential to a synthetic citizen."
            action={
              <Link
                href="/issuer/issue"
                className="px-3.5 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover"
              >
                Issue First Credential
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-bg text-text-muted font-medium">
                <tr>
                  <th className="px-3 py-2">Subject Citizen</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Issued</th>
                  <th className="px-3 py-2">Expires</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {credentials.slice(0, 5).map((cred) => (
                  <tr key={cred.id} className="hover:bg-bg/50">
                    <td className="px-3 py-2.5 font-semibold text-text">
                      {cred.subjectName}
                    </td>
                    <td className="px-3 py-2.5">{cred.type}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={cred.status} expiresAt={cred.expiresAt} />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-text-muted">
                      {new Date(cred.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-text-muted">
                      {new Date(cred.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {cred.status === "ACTIVE" ? (
                        <Link
                          href={`/issuer/revocations`}
                          className="text-danger hover:underline font-semibold"
                        >
                          Revoke
                        </Link>
                      ) : (
                        <span className="text-text-muted italic">Revoked</span>
                      )}
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
