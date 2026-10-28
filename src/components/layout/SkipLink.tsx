import React from "react";

export function SkipLink({ targetId = "main-content" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:font-medium focus:rounded focus:outline focus:outline-3 focus:outline-focus"
    >
      Skip to main content
    </a>
  );
}
