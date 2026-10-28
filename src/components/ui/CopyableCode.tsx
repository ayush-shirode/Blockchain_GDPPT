"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyableCodeProps {
  value: string;
  truncateLength?: number;
  className?: string;
  label?: string;
}

export function CopyableCode({
  value,
  truncateLength,
  className = "",
  label,
}: CopyableCodeProps) {
  const [copied, setCopied] = useState(false);

  const displayValue =
    truncateLength && value.length > truncateLength
      ? `${value.slice(0, truncateLength / 2)}...${value.slice(-truncateLength / 2)}`
      : value;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {label && <span className="text-xs text-text-muted">{label}:</span>}
      <code className="px-2 py-0.5 rounded bg-bg border border-border font-mono text-xs text-text select-all">
        {displayValue}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
        title={copied ? "Copied!" : "Copy"}
        className="p-1 rounded text-text-muted hover:text-text hover:bg-bg border border-transparent hover:border-border transition-colors"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-success" aria-hidden="true" />
        ) : (
          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
