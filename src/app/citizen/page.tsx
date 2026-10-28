"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Clock,
  Ban,
  Share2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CitizenDashboard() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [credsRes, reqsRes] = await Promise.all([
          fetch("/api/wallet/credentials"),
          fetch("/api/wallet/requests"),
        ]);

        if (!credsRes.ok || !reqsRes.ok) {
          throw new Error("Failed to load wallet dashboard data.");
        }

        const credsData = await credsRes.json();
        const reqsData = await reqsRes.json();

        setCredentials(credsData.data?.credentials || []);
        setRequests(reqsData.data?.requests || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeCount = credentials.filter((c) => c.status === "ACTIVE").length;
  const revokedCount = credentials.filter((c) => c.status === "REVOKED").length;
  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Citizen Wallet", href: "/citizen" }, { label: "Overview" }]}
        title="Citizen Credential Wallet"
        description="Manage your digitally signed identity credentials, inspect cryptographic digests, and consent to selective disclosure requests."
        actions={
          <Link
            href="/citizen/credentials"
            className="px-3.5 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
            <span>View All Credentials</span>
          </Link>
        }
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Active Credentials</span>
            <ShieldCheck className="w-4 h-4 text-success" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-text mt-2 font-mono tabular-nums">
            {isLoading ? <Skeleton className="w-8 h-7" /> : activeCount}
          </div>
          <span className="text-[11px] text-text-muted">Verified by trusted authorities</span>
        </div>

        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Pending Requests</span>
            <Share2 className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-text mt-2 font-mono tabular-nums">
            {isLoading ? <Skeleton className="w-8 h-7" /> : pendingRequests.length}
          </div>
          <span className="text-[11px] text-text-muted">Requires your explicit consent</span>
        </div>

        <div className="border border-border rounded bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Revoked / Inactive</span>
            <Ban className="w-4 h-4 text-danger" aria-hidden="true" />
          </div>
          <div className="text-2xl font-bold text-text mt-2 font-mono tabular-nums">
            {isLoading ? <Skeleton className="w-8 h-7" /> : revokedCount}
          </div>
          <span className="text-[11px] text-text-muted">Revocation recorded on ledger</span>
        </div>
      </div>

      {/* Pending Proof Requests (Actionable) */}
      <div className="border border-border rounded bg-surface p-5 mb-8">
        <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-text">Pending Sharing Requests</h2>
            <p className="text-xs text-text-muted">
              Service providers requesting proof of specific attributes. You must explicitly approve or decline.
            </p>
          </div>
          <Link
            href="/citizen/share"
            className="text-xs text-primary font-semibold hover:underline"
          >
            Review in Sharing Console →
          </Link>
        </div>

        {isLoading ? (
          <Skeleton rows={2} />
        ) : pendingRequests.length === 0 ? (
          <EmptyState
            title="No pending requests"
            description="You have no outstanding proof requests requiring your consent."
          />
        ) : (
          <div className="divide-y divide-border">
            {pendingRequests.map((req) => (
              <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-text text-sm">{req.verifierName}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-text-muted">{req.purpose}</p>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-text-muted">Requested attributes:</span>
                    {req.requestedAttributes.map((attr: string) => (
                      <span key={attr} className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-bg border border-border text-text">
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href="/citizen/share"
                  className="shrink-0 px-3 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors inline-flex items-center gap-1"
                >
                  <span>Review & Respond</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Credentials Table */}
      <div className="border border-border rounded bg-surface p-5">
        <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-text">Recent Credentials in Wallet</h2>
            <p className="text-xs text-text-muted">
              Digitally signed verifiable credentials held in your device custody.
            </p>
          </div>
          <Link
            href="/citizen/credentials"
            className="text-xs text-primary font-semibold hover:underline"
          >
            View all {credentials.length} credentials →
          </Link>
        </div>

        {isLoading ? (
          <Skeleton rows={3} />
        ) : credentials.length === 0 ? (
          <EmptyState
            title="No credentials found"
            description="Your wallet is currently empty. Request a credential from an authorized issuer."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-bg text-text-muted font-medium">
                <tr>
                  <th className="px-3 py-2">Credential Type</th>
                  <th className="px-3 py-2">Issuing Authority</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Expires</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {credentials.slice(0, 5).map((cred) => (
                  <tr key={cred.id} className="hover:bg-bg/50">
                    <td className="px-3 py-2.5 font-semibold text-text">{cred.type}</td>
                    <td className="px-3 py-2.5 text-text-muted">{cred.issuer.organizationName}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={cred.status} expiresAt={cred.expiresAt} />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-text-muted">
                      {new Date(cred.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/citizen/credentials/${cred.id}`}
                        className="text-primary hover:underline font-semibold"
                      >
                        Inspect Details
                      </Link>
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
