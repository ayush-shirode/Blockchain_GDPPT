import React from "react";

export function Skeleton({
  className = "",
  rows = 1,
}: {
  className?: string;
  rows?: number;
}) {
  if (rows === 1) {
    return (
      <div
        className={`bg-border/60 rounded animate-pulse h-4 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`bg-border/60 rounded animate-pulse h-4 ${className}`}
        />
      ))}
    </div>
  );
}
