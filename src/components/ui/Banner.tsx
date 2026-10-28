import React from "react";
import { AlertCircle, FlaskConical } from "lucide-react";

interface BannerProps {
  isLedgerPage?: boolean;
}

export function Banner({ isLedgerPage = false }: BannerProps) {
  return (
    <div
      role="region"
      aria-label="Demonstration system announcement"
      className="bg-info-bg text-info border-b border-border px-4 py-2 text-sm font-medium flex items-center justify-between no-print"
    >
      <div className="flex items-center gap-2 max-w-portal mx-auto w-full">
        <AlertCircle className="w-4 h-4 shrink-0 text-info" aria-hidden="true" />
        <span>
          <strong>Notice:</strong> Demonstration system. Synthetic data only.
        </span>
        {isLedgerPage && (
          <span className="inline-flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded bg-surface border border-border text-text font-mono text-xs">
            <FlaskConical className="w-3.5 h-3.5 text-info" aria-hidden="true" />
            Simulated Ledger
          </span>
        )}
      </div>
    </div>
  );
}
