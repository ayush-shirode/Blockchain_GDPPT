import React from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Banner } from "@/components/ui/Banner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Callout } from "@/components/ui/Callout";

export default function PrivacySecurityPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <Banner />
      <TopBar user={null} />

      <main id="main-content" className="flex-1 max-w-portal mx-auto w-full px-4 sm:px-6 py-8">
        <PageHeader
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Privacy & Security" },
          ]}
          title="Privacy Model & Security Architecture"
          description="A rigorous technical explanation of data storage boundaries, cryptographic key protection, and privacy compliance."
        />

        <div className="space-y-8 text-sm text-text leading-relaxed">
          <Callout type="warning" title="Claims Policy & Engineering Boundaries">
            This application adheres to a strict claims policy: we do not claim &quot;100% security&quot;,
            &quot;unhackable&quot; systems, or &quot;zero-knowledge proofs&quot;. Selective disclosure
            is implemented via salted-hash disclosures (SD-JWT style).
          </Callout>

          {/* On-Chain vs Off-Chain Table */}
          <section className="border border-border rounded bg-surface p-6">
            <h2 className="text-base font-bold text-text mb-2">On-Chain vs. Off-Chain Storage Boundary</h2>
            <p className="text-xs text-text-muted mb-4">
              To ensure compliance with privacy laws and eliminate central honeypots, personal identity
              attributes are never written to the blockchain ledger.
            </p>

            <div className="border border-border rounded overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-border">
                <thead className="bg-bg text-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-text">On-Chain (Simulated Ledger)</th>
                    <th className="px-4 py-3 font-semibold text-text">Off-Chain (App Database / Wallet)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  <tr>
                    <td className="px-4 py-2.5 font-mono text-text">Issuer DID (e.g. did:web:gov.example:...)</td>
                    <td className="px-4 py-2.5 text-text-muted">Citizen Full Name, Father&apos;s Name</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-mono text-text">Credential Hash (SHA-256 digest)</td>
                    <td className="px-4 py-2.5 text-text-muted">Date of Birth, Age, Gender</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-mono text-text">Revocation Status & Reason Codes</td>
                    <td className="px-4 py-2.5 text-text-muted">Physical Residential Address</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-mono text-text">Event Type (ISSUANCE / REVOCATION)</td>
                    <td className="px-4 py-2.5 text-text-muted">National ID / Aadhaar / Passport Numbers</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-mono text-text">Cryptographic Timestamps & Block Hashes</td>
                    <td className="px-4 py-2.5 text-text-muted">Academic Grades, Medical Records, Biometrics</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-mono text-text">Transaction References (txRef)</td>
                    <td className="px-4 py-2.5 text-text-muted">Private Attribute Salts & Verification Proofs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* GDPR / Immutability Tension */}
          <section className="border border-border rounded bg-surface p-6">
            <h2 className="text-base font-bold text-text mb-2">GDPR Right to be Forgotten vs. Ledger Immutability</h2>
            <p className="text-text-muted mb-3">
              One of the fundamental tensions in blockchain engineering is between Article 17 of the GDPR
              (the &quot;Right to Erasure&quot;) and the cryptographic immutability of distributed ledgers.
            </p>
            <p className="text-text-muted mb-3">
              Because blocks cannot be deleted retroactively without destroying the hash chain, placing personal
              identifiable information (PII) on a ledger makes GDPR compliance impossible.
            </p>
            <div className="bg-bg border border-border rounded p-4 text-xs text-text-muted space-y-2">
              <strong className="block text-text font-semibold">Our Architectural Solution:</strong>
              <p>
                1. <strong>Strict Data Minimization:</strong> Only one-way cryptographic hashes and public DIDs
                are committed to the ledger.
              </p>
              <p>
                2. <strong>Crypto-Shredding:</strong> When off-chain credentials are deleted by a citizen or expired
                by policy, the private salts are erased. The on-chain hash remains an orphan string that can never
                be reversed back to the identity record.
              </p>
            </div>
          </section>

          {/* Key Management */}
          <section className="border border-border rounded bg-surface p-6">
            <h2 className="text-base font-bold text-text mb-2">Cryptographic Key Management</h2>
            <p className="text-text-muted mb-3">
              Signing keys represent authority in an SSI ecosystem:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-text-muted">
              <li>
                <strong>Issuer Keys:</strong> Ed25519 asymmetric key pairs are generated at initialization into
                a secure, git-ignored local directory (<code className="font-mono text-xs">.keys/</code>).
                Public keys are registered in the Issuer Trust Registry as JWKs.
              </li>
              <li>
                <strong>No Key Leakage:</strong> Private keys are never stored in the application database,
                never exposed through API endpoints, and never rendered in frontend views.
              </li>
              <li>
                <strong>Audit Trail:</strong> All security-sensitive actions (issuance, revocation, verification,
                and session logins) are logged in off-chain audit logs with unique correlation IDs.
              </li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="border-t border-border bg-surface py-6 px-4 text-xs text-text-muted no-print">
        <div className="max-w-portal mx-auto flex justify-between items-center">
          <span>Digital Identity & E-Governance Portal</span>
          <Link href="/docs" className="text-primary hover:underline font-semibold">
            API & Security Reference →
          </Link>
        </div>
      </footer>
    </div>
  );
}
