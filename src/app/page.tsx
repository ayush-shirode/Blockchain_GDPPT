import React from "react";
import Link from "next/link";
import {
  Shield,
  FileCheck2,
  Wallet,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Lock,
  Database,
  Layers,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Banner } from "@/components/ui/Banner";
import { Callout } from "@/components/ui/Callout";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <Banner />
      <TopBar user={null} />

      <main id="main-content" className="flex-1 max-w-portal mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header Section */}
        <div className="border-b border-border pb-6 mb-8">
          <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" aria-hidden="true" />
            <span>Digital Identity & E-Governance Prototype</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            Digital Identity & E-Governance Portal
          </h1>
          <p className="mt-2 text-base text-text-muted max-w-3xl leading-relaxed">
            A documentation-grade demonstration portal implementing Self-Sovereign Identity (SSI)
            and W3C Verifiable Credentials backed by an auditable, hash-chained simulated ledger.
          </p>
        </div>

        {/* Callout Notice */}
        <Callout type="note" title="Demonstration System Notice">
          This is an offline prototype using synthetic identity data. It demonstrates the technical
          and cryptographic mechanisms of verifiable credentials and selective disclosure. It is
          not connected to Aadhaar, DigiLocker, or government production databases.
        </Callout>

        {/* Primary Workflows */}
        <div className="my-8">
          <h2 className="text-lg font-bold text-text mb-4">Select a Demonstration Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Citizen Wallet */}
            <div className="border border-border rounded bg-surface p-5 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <Wallet className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-text mb-1">Citizen Wallet</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-4">
                  View issued verifiable credentials, inspect cryptographic digests, and review or
                  consent to selective disclosure proof requests.
                </p>
              </div>
              <Link
                href="/citizen"
                className="inline-flex items-center justify-between px-3.5 py-2 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
              >
                <span>Open Citizen Wallet</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Issuer Console */}
            <div className="border border-border rounded bg-surface p-5 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <FileCheck2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-text mb-1">Issuer Console</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-4">
                  Authorized authorities issue Ed25519 digitally signed credentials to citizens and
                  record lifecycle revocation events on the simulated ledger.
                </p>
              </div>
              <Link
                href="/issuer"
                className="inline-flex items-center justify-between px-3.5 py-2 rounded bg-surface border border-border text-text text-xs font-semibold hover:bg-bg hover:border-primary transition-colors"
              >
                <span>Issue a Credential</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Verifier Portal */}
            <div className="border border-border rounded bg-surface p-5 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-text mb-1">Verifier Portal</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-4">
                  Services verify credential presentations against the 6-step server-side
                  decision engine without collecting unnecessary personal identity attributes.
                </p>
              </div>
              <Link
                href="/verifier"
                className="inline-flex items-center justify-between px-3.5 py-2 rounded bg-surface border border-border text-text text-xs font-semibold hover:bg-bg hover:border-primary transition-colors"
              >
                <span>Verify a Credential</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works (Spec 7.6) */}
        <div className="my-10 pt-6 border-t border-border">
          <h2 className="text-lg font-bold text-text mb-2">How It Works</h2>
          <p className="text-xs text-text-muted mb-6">
            The Self-Sovereign Identity lifecycle operates in four sequential stages:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-border rounded bg-surface p-4">
              <span className="font-mono text-xs font-bold text-primary block mb-1">
                Step 1: Issue
              </span>
              <h3 className="text-sm font-semibold text-text mb-1">Authority Verification</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                An authorized institution verifies applicant data, signs a W3C VC-JWT with Ed25519,
                and registers the credential hash on the ledger.
              </p>
            </div>

            <div className="border border-border rounded bg-surface p-4">
              <span className="font-mono text-xs font-bold text-primary block mb-1">
                Step 2: Hold
              </span>
              <h3 className="text-sm font-semibold text-text mb-1">Citizen Custody</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                The citizen stores salted attributes in their private digital wallet. Full identity
                records remain entirely off-chain under the citizen&apos;s control.
              </p>
            </div>

            <div className="border border-border rounded bg-surface p-4">
              <span className="font-mono text-xs font-bold text-primary block mb-1">
                Step 3: Present
              </span>
              <h3 className="text-sm font-semibold text-text mb-1">Selective Disclosure</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                When requested by a service provider, the citizen reviews the purpose and releases
                only the approved attribute proofs with cryptographic salts.
              </p>
            </div>

            <div className="border border-border rounded bg-surface p-4">
              <span className="font-mono text-xs font-bold text-primary block mb-1">
                Step 4: Verify
              </span>
              <h3 className="text-sm font-semibold text-text mb-1">Decision Engine</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                The verifier validates digital signatures, issuer trust status, expiry, and revocation
                on the ledger without querying the original issuer.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy & Architecture Summary */}
        <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
          <div className="border border-border rounded bg-surface p-5">
            <div className="flex items-center gap-2 mb-2 text-text font-bold text-sm">
              <Lock className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Off-Chain Privacy Model</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Personal identifying information (names, dates of birth, addresses, IDs) is never
              recorded on the blockchain ledger. The ledger stores only immutable metadata:
              credential digests, issuer DIDs, timestamps, and revocation status references.
            </p>
            <Link
              href="/privacy-security"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Learn more about privacy & data boundaries →
            </Link>
          </div>

          <div className="border border-border rounded bg-surface p-5">
            <div className="flex items-center gap-2 mb-2 text-text font-bold text-sm">
              <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Documentation Hub</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Explore the full documentation site, including the five-layer architecture, formal
              verification decision table, security threat analysis, API catalogue, and demo script.
            </p>
            <Link
              href="/docs"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Explore Documentation Hub (11 chapters) →
            </Link>
          </div>
        </div>
      </main>

      {/* Government-Grade Plain Footer */}
      <footer className="border-t border-border bg-surface py-6 px-4 text-xs text-text-muted no-print">
        <div className="max-w-portal mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <span className="font-semibold text-text">Digital Identity & E-Governance</span> — Academic Project Demonstration
          </div>
          <div className="flex items-center gap-4">
            <Link href="/how-it-works" className="hover:text-text">
              How it works
            </Link>
            <Link href="/privacy-security" className="hover:text-text">
              Privacy & Security
            </Link>
            <Link href="/docs" className="hover:text-text">
              Documentation
            </Link>
            <Link href="/sign-in" className="hover:text-text">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
