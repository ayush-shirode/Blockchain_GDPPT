"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Callout } from "@/components/ui/Callout";
import { KeyRound, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function CitizenAccountPage() {
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleSimulateRecovery = () => {
    setRecoveryModalOpen(false);
    setRecoverySuccess(true);
    setTimeout(() => setRecoverySuccess(false), 5000);
  };

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Citizen Wallet", href: "/citizen" },
          { label: "Account & Security" },
        ]}
        title="Account & Cryptographic Security"
        description="Inspect account custody settings, security boundaries, and simulated key recovery protocols."
      />

      <Callout type="simulated" title="Simulated Key Recovery Demonstration">
        In production decentralized SSI wallets, private keys reside in secure enclaves (e.g. Apple Secure
        Enclave, Android Keystore) or social recovery smart contracts. This prototype demonstrates key
        recovery policy without risking real private keys.
      </Callout>

      {recoverySuccess && (
        <div
          role="alert"
          className="p-4 rounded border border-success/40 bg-success-bg text-success text-xs font-semibold mb-6 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Simulated wallet key recovery drill completed successfully. Simulated DID backup verified.
          </span>
        </div>
      )}

      <div className="space-y-6">
        {/* Security Summary */}
        <div className="border border-border rounded bg-surface p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-bold text-text">Key Custody Principles</h2>
          </div>
          <ul className="list-disc pl-5 space-y-2 text-xs text-text-muted leading-relaxed">
            <li>
              <strong>No Plaintext Key Storage:</strong> Citizen private keys are never transmitted to the
              server, never logged in audit files, and never displayed in the user interface.
            </li>
            <li>
              <strong>Off-Chain Attribute Custody:</strong> Identity records and attribute salts are held in
              local wallet custody and revealed only upon explicit, granular user consent.
            </li>
            <li>
              <strong>Verifiable Cryptographic Proofs:</strong> Verifications test signatures and ledger status
              without verifiers requiring access to citizen keys.
            </li>
          </ul>
        </div>

        {/* Simulated Key Recovery Action */}
        <div className="border border-border rounded bg-surface p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" aria-hidden="true" />
              <h2 className="text-base font-bold text-text">Simulated Key Recovery Drill</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-info-bg text-info font-mono font-medium">
              Demo Simulation
            </span>
          </div>
          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            Trigger a simulated identity backup drill to demonstrate how an SSI citizen could reconstruct
            their decentralized identifier (DID) binding in the event of device replacement.
          </p>
          <button
            type="button"
            onClick={() => setRecoveryModalOpen(true)}
            className="px-4 py-2 rounded bg-surface border border-border text-xs font-semibold text-text hover:bg-bg hover:border-primary transition-colors"
          >
            Run Simulated Recovery Drill
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={recoveryModalOpen}
        onOpenChange={setRecoveryModalOpen}
        title="Simulate Key Recovery Drill"
        description="This will simulate a social/multi-sig recovery drill for your demo citizen wallet. No actual cryptographic keys will be modified."
        confirmLabel="Execute Simulated Recovery"
        onConfirm={handleSimulateRecovery}
      />
    </div>
  );
}
