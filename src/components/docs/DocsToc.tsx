"use client";

import React, { useEffect, useState } from "react";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function DocsToc({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -70% 0%" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block w-56 shrink-0 py-6 pl-4 text-xs space-y-3 sticky top-12 self-start max-h-[calc(100vh-3rem)] overflow-y-auto no-print"
    >
      <h2 className="font-semibold text-text uppercase tracking-wider text-[11px]">
        On this page
      </h2>
      <ul className="space-y-1.5 border-l border-border pl-2.5">
        {headings.map((h) => (
          <li key={h.id} style={{ marginLeft: `${(h.level - 2) * 8}px` }}>
            <a
              href={`#${h.id}`}
              className={`block py-0.5 leading-snug transition-colors ${
                activeId === h.id
                  ? "text-primary font-semibold -ml-[11px] pl-[10px] border-l-2 border-primary"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
