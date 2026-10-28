"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CopyableCode } from "@/components/ui/CopyableCode";

export default function IssuerCredentialsPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [issuer, setIssuer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCreds() {
      try {
        const res = await fetch("/api/issuer/credentials");
        if (!res.ok) throw new Error("Failed to load issued credentials.");
        const json = await res.json();
        setCredentials(json.data?.credentials || []);
        setIssuer(json.data?.issuer || null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading credentials");
      } finally {
        setIsLoading(false);
      }
    }
    loadCreds();
  }, []);

  const columns: Column<any>[] = [
    {
      key: "type",
      header: "Credential Type",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text">{row.type}</span>
          <div className="text-[11px] font-mono text-text-muted">
            {row.id.slice(0, 24)}...
          </div>
        </div>
      ),
    },
    {
      key: "subjectName",
      header: "Citizen Subject",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text">{row.subjectName}</span>
          <span className="block text-[11px] text-text-muted">{row.subjectEmail}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.status} expiresAt={row.expiresAt} />
      ),
    },
    {
      key: "credentialHash",
      header: "Ledger Digest (SHA-256)",
      render: (row) => (
        <CopyableCode value={row.credentialHash} truncateLength={16} />
      ),
    },
    {
      key: "issuedAt",
      header: "Issued",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {new Date(row.issuedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div>
          {row.status === "ACTIVE" ? (
            <Link
              href="/issuer/revocations"
              className="px-2.5 py-1 rounded border border-danger/30 text-danger bg-danger-bg text-xs font-semibold hover:bg-danger hover:text-white transition-colors"
            >
              Revoke
            </Link>
          ) : (
            <span className="text-xs text-text-muted italic">Revoked</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Issuer Console", href: "/issuer" },
          { label: "Issued Credentials" },
        ]}
        title="Issued Credentials Directory"
        description={
          issuer
            ? `All verifiable credentials issued by ${issuer.organizationName} (${issuer.did}).`
            : "All verifiable credentials issued by this authority."
        }
        actions={
          <Link
            href="/issuer/issue"
            className="px-3.5 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
          >
            Issue New Credential
          </Link>
        }
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
        searchPlaceholder="Search by citizen subject name..."
        isLoading={isLoading}
        emptyTitle="No credentials issued"
        emptyDescription="This issuing authority has not yet issued any credentials."
      />
    </div>
  );
}
