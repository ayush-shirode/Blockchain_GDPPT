import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
  XCircle,
  AlertTriangle,
  Loader2,
  FlaskConical,
} from "lucide-react";
import { getStatusDisplay } from "@/layers/ui-adapters/credential-mapper";

interface StatusBadgeProps {
  status: string;
  expiresAt?: string | Date;
  className?: string;
  customLabel?: string;
}

export function StatusBadge({ status, expiresAt, className = "", customLabel }: StatusBadgeProps) {
  const display = getStatusDisplay(status, expiresAt);

  const toneClasses = {
    success: "bg-success-bg text-success border-success/30",
    warning: "bg-warning-bg text-warning border-warning/30",
    danger: "bg-danger-bg text-danger border-danger/30",
    info: "bg-info-bg text-info border-info/30",
    neutral: "bg-bg text-text-muted border-border",
  }[display.tone];

  const renderIcon = () => {
    switch (display.iconName) {
      case "check-circle":
        return <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      case "clock":
        return <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      case "clock-alert":
        return <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      case "ban":
        return <Ban className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      case "x-circle":
        return <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      case "alert-triangle":
        return <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      case "flask":
        return <FlaskConical className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
      case "circle-dashed":
      default:
        return <Loader2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${toneClasses} ${className}`}
    >
      {renderIcon()}
      <span>{customLabel || display.label}</span>
    </span>
  );
}
