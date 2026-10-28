"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Share2, Shield, Check, X, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Receipt } from "@/components/ui/Receipt";
import { Callout } from "@/components/ui/Callout";

export default function CitizenSharePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedResult, setCompletedResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRequests() {
      try {
        const res = await fetch("/api/wallet/requests");
        if (!res.ok) throw new Error("Failed to load verification requests.");
        const data = await res.json();
        const reqList = data.data?.requests || [];
        setRequests(reqList);

        const pending = reqList.find((r: any) => r.status === "PENDING");
        if (pending) {
          setSelectedRequest(pending);
          setSelectedAttributes(pending.requestedAttributes);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading requests");
      } finally {
        setIsLoading(false);
      }
    }
    loadRequests();
  }, []);

  const handleSelectRequest = (req: any) => {
    setSelectedRequest(req);
    setSelectedAttributes(req.requestedAttributes || []);
    setCompletedResult(null);
    setError(null);
  };

  const handleToggleAttribute = (attr: string) => {
    setSelectedAttributes((prev) =>
      prev.includes(attr) ? prev.filter((a) => a !== attr) : [...prev, attr]
    );
  };

  const handleRespond = async (decision: "APPROVED" | "DECLINED") => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/wallet/requests/${selectedRequest.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          selectedAttributes: decision === "APPROVED" ? selectedAttributes : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to submit sharing consent.");
      }

      setCompletedResult(data.data);

      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: decision === "APPROVED" ? "APPROVED" : "DECLINED" }
            : r
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error submitting consent");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Citizen Wallet", href: "/citizen" },
          { label: "Share a Proof" },
        ]}
        title="Consent & Selective Disclosure Sharing"
        description="Review incoming proof requests from services, choose which attributes to disclose, and grant or decline explicit consent."
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      {/* Completed Result View */}
      {completedResult && (
        <div className="mb-8 border border-border rounded bg-surface p-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                completedResult.decision === "APPROVED"
                  ? "bg-success-bg text-success border border-success/30"
                  : "bg-danger-bg text-danger border border-danger/30"
              }`}
            >
              {completedResult.decision === "APPROVED" ? "Proof Shared with Verifier" : "Sharing Request Declined"}
            </span>
          </div>

          <h2 className="text-lg font-bold text-text mb-2">
            {completedResult.decision === "APPROVED"
              ? "Selective Disclosure Proof Generated"
              : "No Information Shared"}
          </h2>
          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            {completedResult.message ||
              `You approved sharing ${completedResult.approvedAttributes?.length || 0} attributes with ${completedResult.verifierName}.`}
          </p>

          {completedResult.receipt && (
            <Receipt
              title="Proof Sharing Transaction Receipt"
              receiptNumber={completedResult.receipt.transactionId}
              timestamp={completedResult.receipt.timestamp}
              status="CONSENT_RECORDED"
              items={[
                { label: "Verifier Recipient", value: completedResult.receipt.sharedWith },
                { label: "Stated Verification Purpose", value: completedResult.receipt.purpose },
                {
                  label: "Attributes Disclosed",
                  value: completedResult.receipt.attributesShared.join(", ") || "None",
                },
                { label: "Privacy Mechanism", value: "Salted-Hash Selective Disclosure (SD-JWT)" },
              ]}
              footerNote="Recorded in private audit log. Only unblinded salts for approved attributes were disclosed."
            />
          )}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setCompletedResult(null);
                setSelectedRequest(null);
              }}
              className="px-3.5 py-1.5 rounded border border-border bg-bg text-xs font-semibold text-text hover:bg-surface"
            >
              Select Another Request
            </button>
            <Link
              href="/citizen/history"
              className="px-3.5 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover"
            >
              View Sharing History →
            </Link>
          </div>
        </div>
      )}

      {!completedResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="border border-border rounded bg-surface p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
              Incoming Proof Requests
            </h2>

            {isLoading ? (
              <Skeleton rows={3} />
            ) : requests.length === 0 ? (
              <EmptyState
                title="No requests"
                description="No organizations have requested credentials from you."
              />
            ) : (
              <div className="space-y-2">
                {requests.map((req) => (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => handleSelectRequest(req)}
                    className={`w-full text-left p-3 rounded border text-xs transition-colors ${
                      selectedRequest?.id === req.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-bg hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-text">{req.verifierName}</span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-[11px] text-text-muted line-clamp-2">{req.purpose}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Consent Details & Disclosure Selection */}
          <div className="lg:col-span-2 border border-border rounded bg-surface p-6">
            {!selectedRequest ? (
              <EmptyState
                title="Select a request"
                description="Select a proof request from the left column to review the requested attributes and provide consent."
              />
            ) : (
              <div>
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div>
                    <span className="text-[11px] text-text-muted uppercase tracking-wider block">
                      Verification Purpose
                    </span>
                    <h2 className="text-base font-bold text-text mt-0.5">
                      {selectedRequest.verifierName}
                    </h2>
                  </div>
                  <StatusBadge status={selectedRequest.status} />
                </div>

                {/* Canonical Copy Box (Spec 7.6) */}
                <div className="border border-info/40 bg-info-bg rounded p-4 mb-6 text-xs text-text leading-relaxed">
                  <strong className="block text-info font-bold text-sm mb-1">
                    Share your credential?
                  </strong>
                  <p>
                    <strong>{selectedRequest.verifierName}</strong> is requesting proof of{" "}
                    <strong>{selectedRequest.requestedAttributes.join(", ")}</strong> for{" "}
                    <em>&quot;{selectedRequest.purpose}&quot;</em>. Only the items selected below will
                    be shared. You can decline without sharing anything.
                  </p>
                </div>

                {/* Selective Disclosure Attribute Checkboxes */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Attributes to Disclose (Selective Disclosure)
                  </h3>
                  <p className="text-xs text-text-muted mb-3">
                    Unselected attributes remain blinded with their cryptographic salts and will not be
                    revealed to the verifier.
                  </p>

                  <div className="space-y-2 border border-border rounded p-3 bg-bg">
                    {selectedRequest.requestedAttributes.map((attr: string) => {
                      const isChecked = selectedAttributes.includes(attr);
                      const isResolved = selectedRequest.status !== "PENDING";

                      return (
                        <label
                          key={attr}
                          className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                            isChecked ? "bg-surface border border-border" : "hover:bg-surface/50"
                          } ${isResolved ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                          <input
                            type="checkbox"
                            disabled={isResolved}
                            checked={isChecked}
                            onChange={() => handleToggleAttribute(attr)}
                            className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                          />
                          <div>
                            <span className="text-sm font-semibold text-text capitalize">
                              {attr.replace(/([A-Z])/g, " $1")}
                            </span>
                            <span className="block font-mono text-[10px] text-text-muted">
                              attributeKey: {attr}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedRequest.status === "PENDING" ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleRespond("DECLINED")}
                      className="w-full sm:w-auto px-4 py-2 rounded border border-danger/40 bg-danger-bg text-danger text-xs font-semibold hover:bg-danger hover:text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline Request (Shares Nothing)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting || selectedAttributes.length === 0}
                      onClick={() => handleRespond("APPROVED")}
                      className="w-full sm:w-auto px-5 py-2 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve and Share ({selectedAttributes.length} Attributes)</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-bg rounded border border-border text-xs text-text-muted text-center">
                    This request was already finalized with status:{" "}
                    <strong className="text-text">{selectedRequest.status}</strong>.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
