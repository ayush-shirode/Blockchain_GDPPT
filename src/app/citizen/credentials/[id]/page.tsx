"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, FileText, CheckCircle, Ban, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CopyableCode } from "@/components/ui/CopyableCode";
import { Receipt } from "@/components/ui/Receipt";
import { Skeleton } from "@/components/ui/Skeleton";
import { Callout } from "@/components/ui/Callout";

export default function CredentialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [credential, setCredential] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCredential() {
      try {
        const res = await fetch(`/api/wallet/credentials/${encodeURIComponent(id)}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error?.message || "Failed to load credential details.");
        }
        const json = await res.json();
        setCredential(json.data?.credential);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading credential");
      } finally {
        setIsLoading(false);
      }
    }
    loadCredential();
  }, [id]);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          breadcrumbs={[
            { label: "Citizen Wallet", href: "/citizen" },
            { label: "Credentials", href: "/citizen/credentials" },
            { label: "Loading..." },
          ]}
          title="Credential Details"
          description="Retrieving cryptographic verifiable credential..."
        />
        <Skeleton rows={6} className="h-10" />
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div>
        <PageHeader
          breadcrumbs={[
            { label: "Citizen Wallet", href: "/citizen" },
            { label: "Credentials", href: "/citizen/credentials" },
            { label: "Error" },
          ]}
          title="Access Denied or Not Found"
          description="Could not load the requested credential record."
        />
        <div role="alert" className="p-6 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          <strong>Error:</strong> {error || "Credential not found in your wallet."}
        </div>
        <Link
          href="/citizen/credentials"
          className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Credentials
        </Link>
      </div>
    );
  }

  const receiptItems = [
    { label: "Credential Type", value: credential.type },
    { label: "Credential Identifier", value: credential.id, isMono: true },
    { label: "Issuing Authority", value: credential.issuer.organizationName },
    { label: "Issuer DID", value: credential.issuer.did, isMono: true },
    { label: "Cryptographic Digest (SHA-256)", value: credential.credentialHash, isMono: true },
    { label: "Simulated Ledger Transaction", value: credential.ledgerTxRef || "Pending", isMono: true },
    { label: "Issue Date", value: new Date(credential.issuedAt).toUTCString() },
    { label: "Expiration Date", value: new Date(credential.expiresAt).toUTCString() },
  ];

  if (credential.status === "REVOKED") {
    receiptItems.push(
      { label: "Revocation Reason", value: credential.revocationReason || "Revoked by issuer" },
      { label: "Revocation Date", value: credential.revokedAt ? new Date(credential.revokedAt).toUTCString() : "Recorded" }
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Citizen Wallet", href: "/citizen" },
          { label: "My Credentials", href: "/citizen/credentials" },
          { label: credential.type },
        ]}
        title={`${credential.type} Details`}
        description="Detailed view of identity attributes, cryptographic signatures, and status recorded on the simulated ledger."
        actions={
          <StatusBadge status={credential.status} expiresAt={credential.expiresAt} />
        }
      />

      {credential.status === "REVOKED" && (
        <Callout type="warning" title="Credential Revoked">
          This credential has been revoked by the issuing authority ({credential.revocationReason || "Revoked"}).
          Future verifications against the ledger will return <strong>Revoked</strong>.
        </Callout>
      )}

      {/* Attribute Claims Table */}
      <div className="border border-border rounded bg-surface p-6 mb-6">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold text-text">Private Identity Attributes (Off-Chain)</h2>
          </div>
          <span className="text-[11px] text-text-muted">
            Stored only in your wallet; not exposed to blockchain
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {Object.entries(credential.attributes).map(([key, val]) => (
            <div key={key} className="border border-border/60 rounded p-3 bg-bg">
              <dt className="text-text-muted font-medium mb-1 capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </dt>
              <dd className="font-semibold text-text text-sm">
                {typeof val === "boolean" ? (val ? "Yes (True)" : "No (False)") : String(val)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Cryptographic Identifiers */}
      <div className="border border-border rounded bg-surface p-6 mb-6">
        <h2 className="text-sm font-bold text-text mb-3">Cryptographic Metadata</h2>
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-text-muted block mb-1">Credential ID:</span>
            <CopyableCode value={credential.id} truncateLength={40} />
          </div>
          <div>
            <span className="text-text-muted block mb-1">Issuer Decentralized Identifier (DID):</span>
            <CopyableCode value={credential.issuer.did} truncateLength={48} />
          </div>
          <div>
            <span className="text-text-muted block mb-1">Credential Hash (SHA-256):</span>
            <CopyableCode value={credential.credentialHash} truncateLength={48} />
          </div>
          <div>
            <span className="text-text-muted block mb-1">Simulated Ledger Reference:</span>
            <code className="font-mono bg-bg px-2 py-0.5 rounded border border-border text-text">
              {credential.ledgerTxRef || "Unconfirmed"}
            </code>
          </div>
        </div>
      </div>

      {/* Official Transaction Receipt */}
      <Receipt
        title="Verifiable Credential Custody Receipt"
        receiptNumber={credential.id.slice(0, 18)}
        timestamp={new Date(credential.issuedAt).toUTCString()}
        status={credential.status}
        items={receiptItems}
        footerNote="Signed with W3C VC Data Model Ed25519 signature. Status auditable via Simulated Ledger."
      />

      <div className="mt-6 flex items-center justify-between">
        <Link
          href="/citizen/credentials"
          className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Credentials
        </Link>
        <Link
          href="/citizen/share"
          className="px-3.5 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
        >
          Share as Selective Disclosure Proof →
        </Link>
      </div>
    </div>
  );
}
