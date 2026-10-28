"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, X, ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "../layout/Breadcrumbs";
import { SkipLink } from "../layout/SkipLink";
import { TopBar } from "../layout/TopBar";
import { DocsToc, TocHeading } from "./DocsToc";
import { DocsSearch, SearchIndexItem } from "./DocsSearch";

export interface DocPageMeta {
  title: string;
  slug: string;
  section: string;
  order: number;
}

interface DocsLayoutProps {
  pages: DocPageMeta[];
  currentPageSlug: string;
  headings: TocHeading[];
  lastUpdated?: string;
  children: React.ReactNode;
}

export function DocsLayout({
  pages,
  currentPageSlug,
  headings,
  lastUpdated = "October 2026",
  children,
}: DocsLayoutProps) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  // Group pages by section
  const sections = Array.from(new Set(pages.map((p) => p.section)));

  // Current page index for previous/next
  const sortedPages = [...pages].sort((a, b) => a.order - b.order);
  const currentIndex = sortedPages.findIndex((p) => p.slug === currentPageSlug);
  const prevPage = currentIndex > 0 ? sortedPages[currentIndex - 1] : null;
  const nextPage =
    currentIndex >= 0 && currentIndex < sortedPages.length - 1
      ? sortedPages[currentIndex + 1]
      : null;

  // Search index
  const searchIndex: SearchIndexItem[] = pages.map((p) => ({
    title: p.title,
    slug: p.slug,
    section: p.section,
    headings: p.slug === currentPageSlug ? headings : [],
  }));

  const currentPage = pages.find((p) => p.slug === currentPageSlug);

  const sidebarNav = (
    <div className="w-64 h-full bg-surface border-r border-border p-4 flex flex-col justify-between overflow-y-auto text-xs">
      <div className="space-y-5">
        <div className="flex items-center justify-between lg:hidden">
          <span className="font-bold uppercase tracking-wider text-text-muted text-[11px]">
            Docs Navigation
          </span>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="p-1 rounded text-text-muted hover:text-text"
            aria-label="Close docs navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-primary mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Portal Home</span>
          </Link>
          <DocsSearch index={searchIndex} />
        </div>

        {sections.map((section) => (
          <div key={section} className="space-y-1">
            <h2 className="font-semibold uppercase tracking-wider text-[11px] text-text-muted px-2 mb-1.5">
              {section}
            </h2>
            <nav aria-label={section} className="space-y-0.5">
              {sortedPages
                .filter((p) => p.section === section)
                .map((p) => {
                  const isActive = pathname === `/docs/${p.slug}` || (p.slug === "overview" && pathname === "/docs");
                  return (
                    <Link
                      key={p.slug}
                      href={`/docs/${p.slug}`}
                      onClick={() => setNavOpen(false)}
                      className={`block px-2.5 py-1.5 rounded transition-colors ${
                        isActive
                          ? "bg-primary text-white font-semibold"
                          : "text-text-muted hover:text-text hover:bg-bg font-medium"
                      }`}
                    >
                      {p.title}
                    </Link>
                  );
                })}
            </nav>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border text-[11px] text-text-muted leading-tight">
        <span>Digital Identity Specification v2.0.0</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <SkipLink targetId="docs-article" />
      <TopBar user={null} onToggleSidebar={() => setNavOpen((v) => !v)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Section Navigation (Desktop) */}
        <aside className="hidden lg:block shrink-0 no-print">
          {sidebarNav}
        </aside>

        {/* Left Section Navigation (Mobile Drawer) */}
        {navOpen && (
          <div className="fixed inset-0 z-40 lg:hidden no-print">
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setNavOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 z-50">
              {sidebarNav}
            </div>
          </div>
        )}

        {/* Center Article Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1280px] mx-auto flex items-start justify-center gap-8">
            <article
              id="docs-article"
              tabIndex={-1}
              className="w-full max-w-article shrink focus:outline-none"
            >
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Documentation", href: "/docs" },
                  { label: currentPage?.title || "Page" },
                ]}
              />

              <div className="prose prose-slate max-w-none text-text text-sm leading-relaxed">
                {children}
              </div>

              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Last updated: {lastUpdated}</span>
                <span className="font-mono">docs-source/REQUIREMENTS.md v2</span>
              </div>

              {/* Previous / Next Navigation */}
              <nav
                aria-label="Previous and Next Pages"
                className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4"
              >
                <div>
                  {prevPage && (
                    <Link
                      href={`/docs/${prevPage.slug}`}
                      className="group flex flex-col p-3 rounded border border-border bg-surface hover:border-primary transition-colors text-left"
                    >
                      <span className="flex items-center gap-1 text-[11px] text-text-muted group-hover:text-primary">
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </span>
                      <span className="font-semibold text-text text-xs mt-1">
                        {prevPage.title}
                      </span>
                    </Link>
                  )}
                </div>

                <div className="text-right">
                  {nextPage && (
                    <Link
                      href={`/docs/${nextPage.slug}`}
                      className="group flex flex-col items-end p-3 rounded border border-border bg-surface hover:border-primary transition-colors text-right"
                    >
                      <span className="flex items-center gap-1 text-[11px] text-text-muted group-hover:text-primary">
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-semibold text-text text-xs mt-1">
                        {nextPage.title}
                      </span>
                    </Link>
                  )}
                </div>
              </nav>
            </article>

            {/* Right "On this page" TOC */}
            <DocsToc headings={headings} />
          </div>
        </div>
      </div>
    </div>
  );
}
