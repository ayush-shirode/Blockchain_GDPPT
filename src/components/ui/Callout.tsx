import React from "react";
import { Info, AlertTriangle, FlaskConical } from "lucide-react";

interface CalloutProps {
  type?: "note" | "warning" | "simulated";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Callout({
  type = "note",
  title,
  children,
  className = "",
}: CalloutProps) {
  const configs = {
    note: {
      border: "border-info/40 bg-info-bg",
      text: "text-text",
      titleColor: "text-info",
      icon: <Info className="w-4 h-4 text-info shrink-0 mt-0.5" aria-hidden="true" />,
      defaultTitle: "Note",
    },
    warning: {
      border: "border-warning/40 bg-warning-bg",
      text: "text-text",
      titleColor: "text-warning",
      icon: <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />,
      defaultTitle: "Important",
    },
    simulated: {
      border: "border-border bg-surface",
      text: "text-text-muted",
      titleColor: "text-text font-semibold",
      icon: <FlaskConical className="w-4 h-4 text-info shrink-0 mt-0.5" aria-hidden="true" />,
      defaultTitle: "Simulated Component Notice",
    },
  }[type];

  return (
    <div
      role="note"
      className={`border rounded p-3.5 my-3 flex items-start gap-3 ${configs.border} ${className}`}
    >
      {configs.icon}
      <div className="flex-1 text-sm leading-relaxed">
        <strong className={`block mb-0.5 font-medium ${configs.titleColor}`}>
          {title || configs.defaultTitle}
        </strong>
        <div className={configs.text}>{children}</div>
      </div>
    </div>
  );
}
