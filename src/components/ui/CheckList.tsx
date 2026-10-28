import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, MinusCircle } from "lucide-react";
import { VerificationCheck } from "@/layers/policy/verification-engine";

interface CheckListProps {
  checks: VerificationCheck[];
}

export function CheckList({ checks }: CheckListProps) {
  const getStatusBadge = (status: VerificationCheck["status"]) => {
    switch (status) {
      case "PASSED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success-bg px-2 py-0.5 rounded border border-success/30">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            Passed
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-danger bg-danger-bg px-2 py-0.5 rounded border border-danger/30">
            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Failed
          </span>
        );
      case "UNAVAILABLE":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning bg-warning-bg px-2 py-0.5 rounded border border-warning/30">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            Unavailable
          </span>
        );
      case "SKIPPED":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted bg-bg px-2 py-0.5 rounded border border-border">
            <MinusCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Skipped
          </span>
        );
    }
  };

  return (
    <div className="border border-border rounded divide-y divide-border bg-surface">
      {checks.map((check, index) => (
        <div key={check.id || index} className="p-3.5 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-medium text-text-muted">
                Step {index + 1}
              </span>
              <strong className="text-sm font-semibold text-text">
                {check.name}
              </strong>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              {check.message}
            </p>
          </div>
          <div className="shrink-0">{getStatusBadge(check.status)}</div>
        </div>
      ))}
    </div>
  );
}
