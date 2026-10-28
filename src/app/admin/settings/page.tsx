"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Callout } from "@/components/ui/Callout";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";

interface SettingsData {
  dataRetentionDays: number;
  requireConsentSignature: boolean;
  ledgerOutageSimulated: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [retentionDays, setRetentionDays] = useState<number>(365);
  const [requireConsent, setRequireConsent] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadSettings() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        throw new Error("Failed to load governance configuration settings.");
      }
      const data = await res.json();
      const s = data.data.settings;
      setSettings(s);
      setRetentionDays(s.dataRetentionDays);
      setRequireConsent(s.requireConsentSignature);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading settings");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataRetentionDays: Number(retentionDays),
          requireConsentSignature: Boolean(requireConsent),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Failed to save configuration settings.");
      }

      setSuccessMessage("System configuration parameters updated successfully.");
      await loadSettings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving settings");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
        title="System Settings & Governance Parameters"
        description="Configure off-chain data retention cycles, privacy enforcement constraints, and selective disclosure requirements."
      />

      {successMessage && (
        <div className="mb-6">
          <Toast
            type="success"
            title="Configuration Saved"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        </div>
      )}

      {error && (
        <div role="alert" className="p-4 rounded border border-danger/40 bg-danger-bg text-danger text-sm mb-6 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <Callout type="note" title="Privacy-First Retention Policies">
        In accordance with Section 9 data protection principles, off-chain audit logs and verification requests expire automatically according to the configured retention window. On-chain ledger entries remain immutable but contain zero personal data or plaintext claims.
      </Callout>

      <div className="border border-border rounded bg-surface p-6 max-w-2xl">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-32 h-10" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label htmlFor="retentionDays" className="block text-xs font-bold text-text uppercase tracking-wider mb-1">
                Audit Record Retention Period (Days)
              </label>
              <p className="text-xs text-text-muted mb-2">
                Off-chain audit events older than this interval are queued for automated pruning. Must be between 30 and 3650 days.
              </p>
              <input
                id="retentionDays"
                type="number"
                min="30"
                max="3650"
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value, 10))}
                className="w-48 px-3 py-1.5 text-xs rounded border border-border bg-surface text-text font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="border-t border-border pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireConsent}
                  onChange={(e) => setRequireConsent(e.target.checked)}
                  className="mt-0.5 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold text-text">Enforce Signed Citizen Consent for Selective Disclosure</span>
                  <p className="text-xs text-text-muted mt-0.5">
                    When enabled, verification requests cannot be fulfilled without the explicit, cryptographic authorization token signed by the citizen&apos;s identity key.
                  </p>
                </div>
              </label>
            </div>

            <div className="border-t border-border pt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>Save Configuration</span>
              </button>

              <button
                type="button"
                onClick={loadSettings}
                disabled={isLoading || isSaving}
                className="px-3 py-2 rounded border border-border bg-surface text-text text-xs font-medium hover:bg-surface-subtle transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
