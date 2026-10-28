"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, FileText, ChevronRight, X } from "lucide-react";

export interface SearchIndexItem {
  title: string;
  slug: string;
  section: string;
  headings: { id: string; text: string }[];
}

export function DocsSearch({ index }: { index: SearchIndexItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = query.trim()
    ? index.flatMap((item) => {
        const matches: { title: string; href: string; parent: string }[] = [];
        const q = query.toLowerCase();

        if (item.title.toLowerCase().includes(q)) {
          matches.push({
            title: item.title,
            href: `/docs/${item.slug}`,
            parent: item.section,
          });
        }

        item.headings.forEach((h) => {
          if (h.text.toLowerCase().includes(q)) {
            matches.push({
              title: `${item.title} → ${h.text}`,
              href: `/docs/${item.slug}#${h.id}`,
              parent: item.section,
            });
          }
        });

        return matches;
      })
    : [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-text-muted bg-surface border border-border rounded hover:border-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <span className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Search documentation...</span>
        </span>
        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg border border-border text-text-muted">
          ⌘K
        </kbd>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg bg-surface border border-border rounded shadow-dialog z-50 overflow-hidden focus:outline-none">
            <div className="flex items-center px-4 border-b border-border">
              <Search className="w-4 h-4 text-text-muted shrink-0 mr-2" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, concepts, guides..."
                autoFocus
                className="w-full py-3 text-sm bg-transparent focus:outline-none placeholder:text-text-muted text-text"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 text-text-muted hover:text-text rounded"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {query && results.length === 0 && (
                <div className="p-6 text-center text-xs text-text-muted">
                  No documentation matches found for &quot;{query}&quot;
                </div>
              )}

              {results.map((res, i) => (
                <Link
                  key={i}
                  href={res.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs rounded hover:bg-bg transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-text-muted group-hover:text-primary shrink-0" />
                    <div>
                      <span className="font-medium text-text group-hover:text-primary">
                        {res.title}
                      </span>
                      <span className="block text-[10px] text-text-muted">
                        {res.parent}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted/60 shrink-0" />
                </Link>
              ))}

              {!query && (
                <div className="p-4 text-xs text-text-muted">
                  <p className="font-semibold text-text mb-2">Quick Navigation:</p>
                  <ul className="space-y-1">
                    {index.slice(0, 5).map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/docs/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="hover:text-primary flex items-center gap-1.5 py-0.5"
                        >
                          <ChevronRight className="w-3 h-3 text-text-muted/60" />
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
