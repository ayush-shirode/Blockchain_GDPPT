import fs from "fs";
import path from "path";
import { marked } from "marked";

export interface DocPageMeta {
  title: string;
  slug: string;
  section: string;
  order: number;
  description: string;
}

export const DOCS_PAGES: DocPageMeta[] = [
  {
    slug: "overview",
    title: "System Overview",
    section: "Getting Started",
    order: 1,
    description: "Scope, goals, architectural boundaries, and what this demonstration prototype is and is not.",
  },
  {
    slug: "concepts",
    title: "Core Concepts",
    section: "Getting Started",
    order: 2,
    description: "Self-Sovereign Identity, Decentralized Identifiers (DIDs), Verifiable Credentials, and Selective Disclosure.",
  },
  {
    slug: "on-chain-vs-off-chain",
    title: "On-Chain vs Off-Chain Storage",
    section: "Architecture & Data",
    order: 3,
    description: "Comprehensive breakdown of data boundaries: privacy-preserving ledger events vs off-chain verifiable credentials.",
  },
  {
    slug: "architecture",
    title: "Five-Layer Architecture",
    section: "Architecture & Data",
    order: 4,
    description: "System architecture breakdown from Layer 1 (Ledger) to Layer 5 (UI) with strict downward calling rules.",
  },
  {
    slug: "guides",
    title: "User Guides & Workflows",
    section: "Workflows",
    order: 5,
    description: "Step-by-step procedural guides for issuing credentials, sharing proofs, verifying credentials, and managing revocations.",
  },
  {
    slug: "verification-outcomes",
    title: "Verification Outcomes & Logic",
    section: "Workflows",
    order: 6,
    description: "The six-step server-side verification pipeline and strict precedence decision table across all five outcomes.",
  },
  {
    slug: "security-limitations",
    title: "Security Model & Limitations",
    section: "Security & Governance",
    order: 7,
    description: "Threat model, key management safeguards, simulated vs production capabilities, and GDPR compliance tensions.",
  },
  {
    slug: "api-reference",
    title: "API Reference",
    section: "Developers",
    order: 8,
    description: "RESTful route handlers, authentication scopes, request/response JSON contracts, and error code envelopes.",
  },
  {
    slug: "demo-accounts",
    title: "Demo Accounts & Test Data",
    section: "Developers",
    order: 9,
    description: "Seeded synthetic citizen, issuer, verifier, and admin accounts with credentials and testing instructions.",
  },
  {
    slug: "glossary",
    title: "Terminology & Glossary",
    section: "Reference",
    order: 10,
    description: "Definitions for SSI, DID, VC, VP, W3C standards, hash chaining, and cryptographic primitives.",
  },
  {
    slug: "changelog-project-info",
    title: "Project Information & Changelog",
    section: "Reference",
    order: 11,
    description: "Prototype revision history, academic references, team attribution, and licensing.",
  },
  {
    slug: "demo-script",
    title: "Scripted Demo Walkthrough",
    section: "Demonstration",
    order: 12,
    description: "Ten-minute end-to-end evaluation script demonstrating each citizen, issuer, verifier, and admin outcome.",
  },
];

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      const text = rawText.replace(/[`*_[\]]/g, "");
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      headings.push({ id, text, level });
    }
  }

  return headings;
}

export async function getDocContent(slug: string): Promise<{
  meta: DocPageMeta;
  headings: TocHeading[];
  html: string;
  rawMarkdown: string;
} | null> {
  const meta = DOCS_PAGES.find((p) => p.slug === slug);
  if (!meta) return null;

  const docsDir = path.join(process.cwd(), "src/content/docs");
  const filePath = path.join(docsDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rawMarkdown = fs.readFileSync(filePath, "utf-8");
  const headings = extractHeadings(rawMarkdown);

  // Configure marked for custom IDs matching extractHeadings
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = tokens.map((t) => t.raw).join("");
    const cleanText = text.replace(/[`*_[\]]/g, "");
    const id = cleanText
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  const html = await marked.parse(rawMarkdown, { renderer });

  return {
    meta,
    headings,
    html,
    rawMarkdown,
  };
}
