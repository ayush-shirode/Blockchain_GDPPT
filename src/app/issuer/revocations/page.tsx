"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Ban, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField } from "@/components/ui/FormField";
import { Receipt } from "@/components/ui/Receipt";

export default function IssuerRevocationsPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [selectedCred, setSelectedCred] = useState<any | null>(null);
  const [reasonCode, setReasonCode] = useState("SUSPECTED_COMPROMISE");
  const [customReason, setCustomReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revocationReceipt, setRevocationReceipt] = useState<any | null>(null);

  useEffect(() => {
    async function loadCreds() {
      try {
        const res = await fetch("/api/issuer/credentials");
        if (!res.ok) throw new Error("Failed to load credentials.");
        const json = await res.json();
        setCredentials(json.data?.credentials || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading credentials");
      } finally {
        setIsLoading(false);
      }
    }
    loadCreds();
  }, []);

  const handleOpenRevoke = (cred: any) => {
    setSelectedCred(cred);
    setReasonCode("SUSPECTED_COMPROMISE");
    setCustomReason("");
    setDialogOpen(true);
    setError(null);
  };

  const handleConfirmRevoke = async () => {
    if (!selectedCred) return;
    setIsRevoking(true);
    setError(null);

    const finalReason =
      reasonCode === "OTHER"
        ? customReason.trim() || "OTHER_UNSPECIFIED"
        : reasonCode;

    try {
      const res = await fetch(`/api/issuer/credentials/${encodeURIComponent(selectedCred.id)}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reasonCode: finalReason }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to revoke credential.");
      }

      setRevocationReceipt(json.data);
      setDialogOpen(false);

      // Update local state
      setCredentials((prev) =>
        prev.map((c) =>
          c.id === selectedCred.id
            ? { ...c, status: "REVOKED", revocationReason: finalReason }
            : c
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error revoking credential");
    } finally {
      setIsRevoking(false);
    }
  };

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
      header: "Current Status",
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.status} expiresAt={row.expiresAt} />
      ),
    },
    {
      key: "revocationReason",
      header: "Revocation Reason",
      render: (row) => (
        <span className="text-xs text-text-muted">
          {row.revocationReason || "—"}
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
            <button
              type="button"
              onClick={() => handleOpenRevoke(row)}
              className="px-3 py-1 rounded bg-danger-bg border border-danger/30 text-danger text-xs font-semibold hover:bg-danger hover:text-white transition-colors"
            >
              Revoke Credential
            </button>
          ) : (
            <span className="text-xs text-danger font-semibold font-mono">
              REVOKED ON LEDGER
            </span>
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
          { label: "Revocations" },
        ]}
        title="Credential Revocation Management"
        description="Permanently revoke verifiable credentials by recording a revocation event and reason code onto the simulated ledger."
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      {revocationReceipt && (
        <div className="mb-6 p-4 rounded border border-success/40 bg-success-bg text-success text-xs font-semibold">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Revocation committed to simulated ledger!
            </span>
            <button
              type="button"
              onClick={() => setRevocationReceipt(null)}
              className="text-xs underline"
            >
              Dismiss
            </button>
          </div>
          <Receipt
            title="Credential Revocation Official Receipt"
            receiptNumber={revocationReceipt.receipt?.transactionId || "tx-ref"}
            timestamp={revocationReceipt.receipt?.timestamp || new Date().toISOString()}
            status="REVOKED_ON_LEDGER"
            items={[
              { label: "Revoked Credential ID", value: revocationReceipt.receipt?.credentialId, isMono: true },
              { label: "Issuing Authority DID", value: revocationReceipt.receipt?.issuerDid, isMono: true },
              { label: "Mandatory Reason Code", value: revocationReceipt.receipt?.reasonCode },
              { label: "Simulated Block Hash", value: revocationReceipt.receipt?.blockHash, isMono: true },
            ]}
            footerNote="Any future verification of this credential will return 'Revoked'."
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={credentials}
        searchKey="subjectName"
        searchPlaceholder="Filter credentials by subject..."
        isLoading={isLoading}
        emptyTitle="No credentials found"
        emptyDescription="There are no credentials issued by this authority to revoke."
      />

      {/* Revocation Confirmation Dialog */}
      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Confirm Credential Revocation"
        description={`Are you sure you want to revoke ${selectedCred?.type} for ${selectedCred?.subjectName}? This action is irreversible and will commit an immutable revocation event to the ledger.`}
        confirmLabel="Revoke Credential"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isRevoking}
        onConfirm={handleConfirmRevoke}
      >
        <div className="space-y-3 pt-2">
          <FormField id="reason" label="Mandatory Revocation Reason Code" required>
            <select
              id="reason"
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-danger"
            >
              <option value="SUSPECTED_COMPROMISE">SUSPECTED_COMPROMISE (Key or identity compromised)</option>
              <option value="SUPERSEDED_BY_NEW_CREDENTIAL">SUPERSEDED_BY_NEW_CREDENTIAL (Replaced by newer version)</option>
              <option value="AFFILIATION_TERMINATED">AFFILIATION_TERMINATED (Graduated or employment ended)</option>
              <option value="ADMINISTRATIVE_ERROR">ADMINISTRATIVE_ERROR (Issued with incorrect attributes)</option>
              <option value="OTHER">OTHER (Specify reason code)</option>
            </select>
          </FormField>

          {reasonCode === "OTHER" && (
            <FormField id="customReason" label="Specify Custom Reason Code" required>
              <input
                id="customReason"
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="E.g., FRAUDULENT_DOCUMENTATION"
                className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded"
              />
            </FormField>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
