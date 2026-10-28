"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Stepper, StepItem } from "@/components/ui/Stepper";
import { FormField } from "@/components/ui/FormField";
import { Receipt } from "@/components/ui/Receipt";
import { Skeleton } from "@/components/ui/Skeleton";

const STEPS: StepItem[] = [
  { id: "subject", title: "Choose Subject", description: "Select synthetic citizen" },
  { id: "type", title: "Credential & Attributes", description: "Define identity claims" },
  { id: "review", title: "Review & Validate", description: "Confirm issuance data" },
  { id: "complete", title: "Issuance Receipt", description: "Cryptographic confirmation" },
];

export default function IssueCredentialWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [credentialType, setCredentialType] = useState("IdentityCredential");
  const [validityDays, setValidityDays] = useState(365);
  const [attributes, setAttributes] = useState<Record<string, any>>({
    fullName: "",
    nationalId: "",
    district: "Metro City",
    citizenshipVerified: true,
  });

  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedReceipt, setIssuedReceipt] = useState<any | null>(null);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch("/api/issuer/subjects");
        if (!res.ok) throw new Error("Failed to load subject citizens.");
        const json = await res.json();
        const subs = json.data?.subjects || [];
        setSubjects(subs);
        if (subs.length > 0) {
          setSelectedSubjectId(subs[0].id);
          setAttributes((prev) => ({
            ...prev,
            fullName: subs[0].displayName,
            nationalId: `NAT-${Math.floor(100000 + Math.random() * 900000)}`,
          }));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading subjects");
      } finally {
        setIsLoadingSubjects(false);
      }
    }
    loadSubjects();
  }, []);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const sub = subjects.find((s) => s.id === subjectId);
    if (sub) {
      setAttributes((prev) => ({
        ...prev,
        fullName: sub.displayName,
      }));
    }
  };

  const handleTypeChange = (type: string) => {
    setCredentialType(type);
    const selectedSub = subjects.find((s) => s.id === selectedSubjectId);
    const name = selectedSub?.displayName || "Asha Patil";

    if (type === "IdentityCredential") {
      setAttributes({
        fullName: name,
        nationalId: `NAT-${Math.floor(100000 + Math.random() * 900000)}`,
        district: "Metro City",
        citizenshipVerified: true,
      });
    } else if (type === "AgeCredential") {
      setAttributes({
        subjectName: name,
        isOver18: true,
        isOver21: true,
        jurisdiction: "State E-Services",
      });
    } else if (type === "StudentCredential") {
      setAttributes({
        studentName: name,
        university: "Demo State University",
        program: "Computer Science & Engineering",
        graduationYear: 2026,
        studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    } else if (type === "AddressCredential") {
      setAttributes({
        fullName: name,
        addressLine1: "Flat 101, Civil Lines",
        city: "Metro City",
        postalCode: "400001",
        residencyVerified: true,
      });
    }
  };

  const handleAttributeChange = (key: string, val: any) => {
    setAttributes((prev) => ({ ...prev, [key]: val }));
  };

  const handleConfirmIssue = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/issuer/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectUserId: selectedSubjectId,
          type: credentialType,
          attributes,
          validityDays: Number(validityDays),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to issue credential.");
      }

      setIssuedReceipt(json.data);
      setCurrentStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error issuing credential");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Issuer Console", href: "/issuer" },
          { label: "Issue Credential" },
        ]}
        title="Issue Verifiable Credential Wizard"
        description="Verify citizen data, cryptographically sign a W3C VC-JWT with Ed25519, and commit the credential hash to the simulated ledger."
      />

      <Stepper steps={STEPS} currentStepIndex={currentStep} />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      {/* STEP 1: Choose Subject */}
      {currentStep === 0 && (
        <div className="border border-border rounded bg-surface p-6 max-w-2xl">
          <h2 className="text-sm font-bold text-text mb-1">Step 1: Select Synthetic Citizen Subject</h2>
          <p className="text-xs text-text-muted mb-4">
            Select an authorized test persona registered in the demonstration database.
          </p>

          {isLoadingSubjects ? (
            <Skeleton rows={3} />
          ) : (
            <div className="space-y-3">
              {subjects.map((sub) => (
                <label
                  key={sub.id}
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                    selectedSubjectId === sub.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-bg"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="subject"
                      value={sub.id}
                      checked={selectedSubjectId === sub.id}
                      onChange={() => handleSubjectChange(sub.id)}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <div>
                      <span className="font-semibold text-text text-sm">{sub.displayName}</span>
                      <span className="block text-xs text-text-muted">{sub.email}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-text-muted">
                    id: {sub.id.slice(0, 16)}...
                  </span>
                </label>
              ))}

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedSubjectId}
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover flex items-center gap-1.5"
                >
                  <span>Continue to Attributes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Choose Credential Type & Attributes */}
      {currentStep === 1 && (
        <div className="border border-border rounded bg-surface p-6 max-w-2xl space-y-4">
          <h2 className="text-sm font-bold text-text mb-1">Step 2: Choose Credential Type & Attribute Values</h2>
          <p className="text-xs text-text-muted mb-4">
            Subject: <strong>{selectedSubject?.displayName}</strong> ({selectedSubject?.email})
          </p>

          <FormField id="credType" label="Credential Type" required>
            <select
              id="credType"
              value={credentialType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="IdentityCredential">IdentityCredential (Full Identity)</option>
              <option value="AgeCredential">AgeCredential (Eligibility / Over 18/21)</option>
              <option value="StudentCredential">StudentCredential (University Academic)</option>
              <option value="AddressCredential">AddressCredential (Proof of Residency)</option>
            </select>
          </FormField>

          <FormField id="validityDays" label="Validity Duration (Days)" required>
            <input
              id="validityDays"
              type="number"
              min={1}
              max={3650}
              value={validityDays}
              onChange={(e) => setValidityDays(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>

          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text mb-3">
              Attribute Claims (Blinded with Salts at Issuance)
            </h3>
            <div className="space-y-3">
              {Object.entries(attributes).map(([key, val]) => (
                <FormField key={key} id={key} label={key.replace(/([A-Z])/g, " $1")}>
                  {typeof val === "boolean" ? (
                    <select
                      id={key}
                      value={val ? "true" : "false"}
                      onChange={(e) => handleAttributeChange(key, e.target.value === "true")}
                      className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded"
                    >
                      <option value="true">True (Yes)</option>
                      <option value="false">False (No)</option>
                    </select>
                  ) : (
                    <input
                      id={key}
                      type="text"
                      value={String(val)}
                      onChange={(e) => handleAttributeChange(key, e.target.value)}
                      className="w-full px-3 py-1.5 text-sm bg-surface border border-border rounded"
                    />
                  )}
                </FormField>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border">
            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              className="px-3.5 py-1.5 rounded border border-border bg-surface text-xs font-semibold text-text hover:bg-bg flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover flex items-center gap-1.5"
            >
              <span>Review & Confirm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Confirm */}
      {currentStep === 2 && (
        <div className="border border-border rounded bg-surface p-6 max-w-2xl space-y-4">
          <h2 className="text-sm font-bold text-text mb-1">Step 3: Review Credential Details Before Signing</h2>
          <p className="text-xs text-text-muted mb-4">
            Verify data accuracy. Confirming will generate a cryptographic Ed25519 signature and write an immutable issuance record to the simulated ledger.
          </p>

          <div className="bg-bg border border-border rounded p-4 text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-text-muted font-medium">Subject Citizen:</span>
              <span className="font-semibold text-text">{selectedSubject?.displayName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-text-muted font-medium">Credential Standard:</span>
              <span className="font-semibold text-text">W3C VC-JWT ({credentialType})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/60">
              <span className="text-text-muted font-medium">Validity Window:</span>
              <span className="font-semibold text-text">{validityDays} Days</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-muted font-medium">Signing Algorithm:</span>
              <span className="font-mono text-primary font-semibold">EdDSA (Ed25519)</span>
            </div>
          </div>

          <div className="border border-border rounded p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
              Attribute Claims Summary
            </h3>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              {Object.entries(attributes).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-text-muted capitalize">{k.replace(/([A-Z])/g, " $1")}:</dt>
                  <dd className="font-semibold text-text">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setCurrentStep(1)}
              className="px-3.5 py-1.5 rounded border border-border bg-surface text-xs font-semibold text-text hover:bg-bg flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmIssue}
              className="px-5 py-2 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover flex items-center gap-1.5 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? "Signing & Committing..." : "Confirm & Issue Credential"}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Issuance Receipt */}
      {currentStep === 3 && issuedReceipt && (
        <div className="max-w-2xl">
          <div className="p-4 rounded border border-success/40 bg-success-bg text-success text-xs font-semibold mb-4 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Credential successfully issued and registered on the simulated ledger!</span>
          </div>

          <Receipt
            title="Credential Issuance Official Receipt"
            receiptNumber={issuedReceipt.receipt?.transactionId || "tx-ref"}
            timestamp={issuedReceipt.receipt?.timestamp || new Date().toISOString()}
            status="ISSUED_AND_COMMITTED"
            items={[
              { label: "Credential Type", value: issuedReceipt.credential?.type },
              { label: "Subject Recipient", value: issuedReceipt.credential?.subjectName },
              { label: "Credential Identifier", value: issuedReceipt.receipt?.credentialId, isMono: true },
              { label: "Issuer Authority DID", value: issuedReceipt.receipt?.issuerDid, isMono: true },
              { label: "Credential SHA-256 Digest", value: issuedReceipt.receipt?.credentialHash, isMono: true },
              { label: "Simulated Block Hash", value: issuedReceipt.receipt?.blockHash, isMono: true },
            ]}
            footerNote="Digitally signed with authorized Ed25519 issuer private key. Audit event recorded."
          />

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(0);
                setIssuedReceipt(null);
              }}
              className="px-3.5 py-1.5 rounded border border-border bg-surface text-xs font-semibold text-text hover:bg-bg"
            >
              Issue Another Credential
            </button>
            <Link
              href="/issuer/credentials"
              className="px-4 py-2 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover"
            >
              View in Issued Credentials →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
