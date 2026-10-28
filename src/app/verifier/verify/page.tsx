"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldAlert, ArrowLeft, RefreshCw, Printer, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CheckList } from "@/components/ui/CheckList";
import { Receipt } from "@/components/ui/Receipt";
import { FormField } from "@/components/ui/FormField";
import { Callout } from "@/components/ui/Callout";

export default function VerifyConsolePage() {
  const [demoScenarios, setDemoScenarios] = useState<any[]>([]);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [customJwt, setCustomJwt] = useState("");
  const [customDisclosures, setCustomDisclosures] = useState("");
  const [inputMode, setInputMode] = useState<"scenario" | "custom">("scenario");

  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load seeded credentials to populate realistic scenarios
  useEffect(() => {
    async function loadTestCredentials() {
      try {
        const res = await fetch("/api/wallet/credentials");
        // Note: As verifier, we can fetch all public demo test tokens or synthetic presets
        const presets = [
          {
            id: "scenario-valid",
            title: "1. Valid Credential",
            description: "Active Identity Credential from trusted Demo Municipal Corporation.",
            expectedOutcome: "VALID",
            type: "IdentityCredential",
          },
          {
            id: "scenario-bad-sig",
            title: "2. Tampered Signature",
            description: "Payload or signature modified to test cryptographic signature rejection.",
            expectedOutcome: "INVALID (BAD_SIGNATURE)",
            type: "IdentityCredential",
          },
          {
            id: "scenario-untrusted",
            title: "3. Untrusted Issuer",
            description: "Credential issued by Untrusted Rogue Authority (not active in registry).",
            expectedOutcome: "INVALID (UNTRUSTED_ISSUER)",
            type: "IdentityCredential",
          },
          {
            id: "scenario-expired",
            title: "4. Expired Credential",
            description: "Student Credential with expiration date in the past.",
            expectedOutcome: "EXPIRED",
            type: "StudentCredential",
          },
          {
            id: "scenario-revoked",
            title: "5. Revoked Credential",
            description: "Identity Credential recorded as revoked on the simulated ledger.",
            expectedOutcome: "REVOKED",
            type: "IdentityCredential",
          },
          {
            id: "scenario-outage",
            title: "6. Ledger Outage Simulation",
            description: "Simulates network partition or unavailable ledger state.",
            expectedOutcome: "UNABLE_TO_VERIFY",
            type: "IdentityCredential",
          },
        ];

        setDemoScenarios(presets);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error initializing scenarios");
      } finally {
        setIsLoadingScenarios(false);
      }
    }
    loadTestCredentials();
  }, []);

  const handleRunVerification = async () => {
    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      let jwtToSend = "";
      let disclosuresToSend: any[] = [];

      if (inputMode === "scenario") {
        const scenario = demoScenarios[selectedScenarioIndex];

        // Fetch synthetic payload based on scenario from backend test helper or DB
        const testPayloadRes = await fetch(
          `/api/verifier/requests?scenario=${scenario.id}`
        );

        // Alternatively query seed data via verifier API or generate exact test token
        // Let's call /api/verifier/verify with scenario preset trigger or test token
        if (scenario.id === "scenario-outage") {
          // Enable simulated outage
          await fetch("/api/admin/ledger/simulate-outage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ simulateOutage: true }),
          });
        } else {
          // Ensure outage is disabled for other scenarios
          await fetch("/api/admin/ledger/simulate-outage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ simulateOutage: false }),
          });
        }

        // Fetch corresponding credential from database via specialized verifier test route
        const prepRes = await fetch("/api/wallet/credentials");
        // For demonstration, fetch test preset credentials
        const testRes = await fetch(`/api/verifier/verify/preset?scenario=${scenario.id}`);
        const testJson = await testRes.json();

        if (testJson.data) {
          jwtToSend = testJson.data.jwtRaw;
          disclosuresToSend = testJson.data.disclosures || [];
        }
      } else {
        jwtToSend = customJwt.trim();
        if (customDisclosures.trim()) {
          disclosuresToSend = JSON.parse(customDisclosures.trim());
        }
      }

      if (!jwtToSend) {
        throw new Error("No verifiable credential token provided for verification.");
      }

      const res = await fetch("/api/verifier/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jwtRaw: jwtToSend,
          disclosures: disclosuresToSend,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Verification request failed.");
      }

      setVerificationResult(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error executing verification");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Verifier Portal", href: "/verifier" },
          { label: "Verify Credential" },
        ]}
        title="Verifiable Credential Verification Console"
        description="Verify cryptographic proofs using the 6-step server-side decision engine. Test all 5 verification outcomes or verify arbitrary presentations."
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      {/* Input Selection Panel */}
      <div className="border border-border rounded bg-surface p-6 mb-8">
        <div className="flex items-center gap-4 border-b border-border pb-3 mb-4">
          <button
            type="button"
            onClick={() => setInputMode("scenario")}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-colors ${
              inputMode === "scenario"
                ? "text-primary border-b-2 border-primary font-semibold"
                : "text-text-muted hover:text-text"
            }`}
          >
            Demo Scenarios (5 Outcomes)
          </button>
          <button
            type="button"
            onClick={() => setInputMode("custom")}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-colors ${
              inputMode === "custom"
                ? "text-primary border-b-2 border-primary font-semibold"
                : "text-text-muted hover:text-text"
            }`}
          >
            Custom Presentation (Raw VC-JWT)
          </button>
        </div>

        {inputMode === "scenario" ? (
          <div>
            <p className="text-xs text-text-muted mb-3">
              Select one of the pre-seeded demonstration scenarios to test the exact decision table rules:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {demoScenarios.map((sc, idx) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedScenarioIndex(idx)}
                  className={`text-left p-3 rounded border text-xs transition-colors ${
                    selectedScenarioIndex === idx
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-bg hover:bg-surface"
                  }`}
                >
                  <strong className="block text-text font-bold mb-0.5">{sc.title}</strong>
                  <p className="text-[11px] text-text-muted mb-2 leading-relaxed">{sc.description}</p>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text font-semibold">
                    Expected: {sc.expectedOutcome}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <FormField id="customJwt" label="Raw VC-JWT (Base64url)" required hint="Paste a digitally signed W3C Verifiable Credential JWT.">
              <textarea
                id="customJwt"
                rows={4}
                value={customJwt}
                onChange={(e) => setCustomJwt(e.target.value)}
                placeholder="eyJhbGciOiJFZERTQSI..."
                className="w-full p-2.5 font-mono text-xs bg-bg border border-border rounded text-text focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField id="disclosures" label="Selective Disclosures JSON (Optional)" hint="Array of { key, value, salt } proofs.">
              <textarea
                id="disclosures"
                rows={3}
                value={customDisclosures}
                onChange={(e) => setCustomDisclosures(e.target.value)}
                placeholder='[{"key":"isOver18","value":true,"salt":"a1b2c3..."}]'
                className="w-full p-2.5 font-mono text-xs bg-bg border border-border rounded text-text focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-text-muted font-mono">
            Verification Engine: Spec 5.1 & 5.2 Server-Side
          </span>
          <button
            type="button"
            disabled={isVerifying}
            onClick={handleRunVerification}
            className="px-5 py-2 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
            <span>{isVerifying ? "Executing 6 Checks..." : "Execute Verification"}</span>
          </button>
        </div>
      </div>

      {/* Verification Results Panel */}
      {verificationResult && (
        <div className="border border-border rounded bg-surface p-6 mb-8">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wider block">
                Verification Outcome
              </span>
              <div className="flex items-center gap-3 mt-1">
                <StatusBadge status={verificationResult.outcome} className="text-sm px-3 py-1" />
                {verificationResult.reasonCode && (
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-bg border border-border text-text">
                    Reason: {verificationResult.reasonCode}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-mono text-text-muted">
              ID: {verificationResult.verificationId?.slice(0, 16)}...
            </span>
          </div>

          {/* Canonical Result Banner (Spec 7.6) */}
          <div className="mb-6">
            {verificationResult.outcome === "VALID" ? (
              <div className="p-4 rounded border border-success/40 bg-success-bg text-success text-xs font-medium">
                <strong>Credential verified.</strong> The signature is valid, the issuer is trusted,
                and the credential is not expired or revoked.
              </div>
            ) : verificationResult.outcome === "REVOKED" ? (
              <div className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-xs font-medium">
                <strong>Credential revoked.</strong> This credential is no longer valid. Contact the
                issuing organization if you believe this is incorrect.
              </div>
            ) : verificationResult.outcome === "EXPIRED" ? (
              <div className="p-4 rounded border border-warning/40 bg-warning-bg text-warning text-xs font-medium">
                <strong>Credential expired.</strong> This credential has passed its validity expiration date.
              </div>
            ) : verificationResult.outcome === "UNABLE_TO_VERIFY" ? (
              <div className="p-4 rounded border border-info/40 bg-info-bg text-info text-xs font-medium">
                <strong>Verification temporarily unavailable.</strong> We could not check the credential
                status. No decision has been made. Try again later.
              </div>
            ) : (
              <div className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-xs font-medium">
                <strong>Invalid presentation.</strong> Cryptographic signature, structure, or issuer trust check failed.
              </div>
            )}
          </div>

          {/* 6-Step Checklist Component */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
              Individual Cryptographic & Ledger Checks (Spec 5.1)
            </h3>
            <CheckList checks={verificationResult.checks || []} />
          </div>

          {/* Disclosed Attributes Only */}
          <div className="mb-6 border border-border rounded p-4 bg-bg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text mb-2">
              Disclosed Claims to Verifier (Data Minimization)
            </h3>
            {Object.keys(verificationResult.disclosedAttributes || {}).length === 0 ? (
              <p className="text-xs text-text-muted italic">
                No personal attributes were disclosed to the verifier for this presentation.
              </p>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(verificationResult.disclosedAttributes).map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded bg-surface border border-border">
                    <dt className="text-text-muted capitalize font-medium mb-0.5">
                      {k.replace(/([A-Z])/g, " $1")}
                    </dt>
                    <dd className="font-semibold text-text text-sm">
                      {typeof v === "boolean" ? (v ? "Yes (True)" : "No (False)") : String(v)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Formal Printable Verification Receipt */}
          {verificationResult.receipt && (
            <Receipt
              title="Official Verification Audit Receipt"
              receiptNumber={verificationResult.receipt.verificationId || "ver-tx"}
              timestamp={verificationResult.receipt.timestamp}
              status={verificationResult.outcome}
              items={[
                { label: "Outcome", value: verificationResult.outcome },
                { label: "Reason Code", value: verificationResult.receipt.reasonCode || "NONE" },
                { label: "Verifier Identity", value: verificationResult.receipt.verifier },
                { label: "Issuer DID Reference", value: verificationResult.receipt.issuerDid, isMono: true },
                { label: "Credential ID Reference", value: verificationResult.receipt.credentialId, isMono: true },
              ]}
              footerNote="Cryptographic proof verified against server-side policy and ledger state."
            />
          )}
        </div>
      )}
    </div>
  );
}
