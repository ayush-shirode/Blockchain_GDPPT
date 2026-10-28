"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Shield, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FormField } from "@/components/ui/FormField";

export default function VerifierRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [attributeInput, setAttributeInput] = useState("fullName, isOver18");
  const [validitySeconds, setValiditySeconds] = useState(3600);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [reqsRes, subsRes] = await Promise.all([
          fetch("/api/verifier/requests"),
          fetch("/api/issuer/subjects"),
        ]);

        if (!reqsRes.ok) throw new Error("Failed to load requests.");
        const reqsJson = await reqsRes.json();
        const subsJson = await subsRes.json();

        setRequests(reqsJson.data?.requests || []);
        const subs = subsJson.data?.subjects || [];
        setSubjects(subs);
        if (subs.length > 0) setSelectedSubjectId(subs[0].id);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const attributes = attributeInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/verifier/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectUserId: selectedSubjectId,
          purpose,
          requestedAttributes: attributes,
          validitySeconds: Number(validitySeconds),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to create request.");
      }

      setSuccessMsg("Verification request created and delivered to citizen wallet.");
      setPurpose("");
      setShowCreateForm(false);

      // Refresh list
      const updatedRes = await fetch("/api/verifier/requests");
      const updatedJson = await updatedRes.json();
      setRequests(updatedJson.data?.requests || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<any>[] = [
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
      key: "purpose",
      header: "Verification Purpose",
      sortable: true,
      render: (row) => (
        <div>
          <span className="text-text">{row.purpose}</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {row.requestedAttributes.map((attr: string) => (
              <span
                key={attr}
                className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-bg border border-border text-text"
              >
                {attr}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Consent Status",
      sortable: true,
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            row.status === "APPROVED"
              ? "bg-success-bg text-success border border-success/30"
              : row.status === "DECLINED"
              ? "bg-danger-bg text-danger border border-danger/30"
              : "bg-warning-bg text-warning border border-warning/30"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-text-muted">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Verifier Portal", href: "/verifier" },
          { label: "Verification Requests" },
        ]}
        title="Verification Requests Management"
        description="Issue formal proof requests with specified purposes and requested attributes to citizen wallets."
        actions={
          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className="px-3.5 py-1.5 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showCreateForm ? "Close Form" : "Create Request"}</span>
          </button>
        }
      />

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6">
          {error}
        </div>
      )}

      {successMsg && (
        <div role="status" className="p-4 rounded border border-success/40 bg-success-bg text-success text-xs font-semibold mb-6">
          {successMsg}
        </div>
      )}

      {showCreateForm && (
        <div className="border border-border rounded bg-surface p-6 mb-8 max-w-2xl">
          <h2 className="text-sm font-bold text-text mb-1">Create Verification Request</h2>
          <p className="text-xs text-text-muted mb-4">
            State your organization&apos;s identity, required attributes, and specific purpose. The citizen must grant consent.
          </p>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <FormField id="subject" label="Target Citizen Subject" required>
              <select
                id="subject"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.displayName} ({s.email})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="purpose" label="Stated Verification Purpose" required hint="Explain why your service requires this proof (e.g. KYC, admission).">
              <input
                id="purpose"
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="E.g., Patient hospital admission identity & age verification"
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField id="attrs" label="Requested Attributes (Comma-separated)" required hint="Only request attributes necessary for task completion.">
              <input
                id="attrs"
                type="text"
                required
                value={attributeInput}
                onChange={(e) => setAttributeInput(e.target.value)}
                placeholder="fullName, isOver18, dateOfBirth"
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3.5 py-1.5 rounded border border-border bg-surface text-xs font-semibold text-text hover:bg-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover disabled:opacity-50"
              >
                {isSubmitting ? "Delivering..." : "Submit Request to Citizen Wallet"}
              </button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        columns={columns}
        data={requests}
        searchKey="purpose"
        searchPlaceholder="Filter requests by purpose..."
        isLoading={isLoading}
        emptyTitle="No verification requests"
        emptyDescription="Your organization has not yet created any proof requests."
      />
    </div>
  );
}
