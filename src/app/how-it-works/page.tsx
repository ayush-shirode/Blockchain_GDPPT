import React from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Banner } from "@/components/ui/Banner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Callout } from "@/components/ui/Callout";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      <Banner />
      <TopBar user={null} />

      <main id="main-content" className="flex-1 max-w-portal mx-auto w-full px-4 sm:px-6 py-8">
        <PageHeader
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "How It Works" },
          ]}
          title="How Blockchain Digital Identity Works"
          description="A step-by-step breakdown of verifiable credential issuance, wallet custody, selective disclosure, and server-side verification."
        />

        <div className="space-y-8 text-sm text-text leading-relaxed">
          <Callout type="note" title="Architectural Principle">
            In Self-Sovereign Identity (SSI), institutions do not maintain central honeypots of personal
            records. The blockchain provides a distributed trust registry and credential status checks,
            while citizens control their own credentials.
          </Callout>

          {/* Step 1 */}
          <section className="border border-border rounded bg-surface p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary text-white">
                Step 1
              </span>
              <h2 className="text-base font-bold text-text">Issuance & Cryptographic Blinding</h2>
            </div>
            <p className="text-text-muted mb-4">
              An authorized issuer (such as a municipality or university) confirms the subject&apos;s
              identity through authorized vetting. Rather than placing records in a central database:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-text-muted mb-4">
              <li>
                Each attribute (e.g. name, date of birth, degree) is assigned a unique 128-bit random salt.
              </li>
              <li>
                The issuer computes individual salted hashes:{" "}
                <code className="font-mono text-xs bg-bg px-1 py-0.5 rounded">
                  hash = SHA-256(salt + key + value)
                </code>.
              </li>
              <li>
                The issuer signs a W3C Verifiable Credential JWT containing only the salted attribute digests.
              </li>
              <li>
                The credential hash is registered on the simulated ledger as an immutable issuance event.
              </li>
            </ul>
          </section>

          {/* Step 2 */}
          <section className="border border-border rounded bg-surface p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary text-white">
                Step 2
              </span>
              <h2 className="text-base font-bold text-text">Custody in the Citizen Wallet</h2>
            </div>
            <p className="text-text-muted mb-4">
              The citizen receives the digitally signed credential along with the unblinded attribute values
              and private salts in their wallet.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-text-muted mb-4">
              <li>No personal information is published on the blockchain.</li>
              <li>The citizen can review active, expired, and revoked credentials at any time.</li>
              <li>Private keys are never exposed in plaintext or displayed in user interfaces.</li>
            </ul>
          </section>

          {/* Step 3 */}
          <section className="border border-border rounded bg-surface p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary text-white">
                Step 3
              </span>
              <h2 className="text-base font-bold text-text">Proof Request & Explicit Consent</h2>
            </div>
            <p className="text-text-muted mb-4">
              When a service (e.g. a hospital or bank) needs to verify eligibility:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-text-muted mb-4">
              <li>The verifier creates a verification request stating their organization and specific purpose.</li>
              <li>The wallet displays the requested attributes and prompts the citizen for explicit consent.</li>
              <li>The citizen can approve the request or decline. Declining shares nothing.</li>
              <li>
                Only the consented attributes and their corresponding salts are disclosed (Salted-Hash SD-JWT).
                Unconsented attributes remain cryptographically obscured.
              </li>
            </ul>
          </section>

          {/* Step 4 */}
          <section className="border border-border rounded bg-surface p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary text-white">
                Step 4
              </span>
              <h2 className="text-base font-bold text-text">Server-Side Decision Table Verification</h2>
            </div>
            <p className="text-text-muted mb-4">
              The verifier executes a 6-step verification pipeline in strict order:
            </p>
            <div className="border border-border rounded overflow-hidden mb-4">
              <table className="w-full text-left text-xs divide-y divide-border">
                <thead className="bg-bg text-text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Check</th>
                    <th className="px-3 py-2 font-medium">Mechanism</th>
                    <th className="px-3 py-2 font-medium">Failure Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  <tr>
                    <td className="px-3 py-2 font-semibold">1. Structure</td>
                    <td className="px-3 py-2">W3C VC-JWT claims and segment validation</td>
                    <td className="px-3 py-2 text-danger font-mono">Invalid (MALFORMED)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold">2. Signature</td>
                    <td className="px-3 py-2">Ed25519 signature verified against public JWK</td>
                    <td className="px-3 py-2 text-danger font-mono">Invalid (BAD_SIGNATURE)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold">3. Issuer Trust</td>
                    <td className="px-3 py-2">Issuer DID verified active in trust registry</td>
                    <td className="px-3 py-2 text-danger font-mono">Invalid (UNTRUSTED_ISSUER)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold">4. Revocation</td>
                    <td className="px-3 py-2">Ledger queried for revocation events</td>
                    <td className="px-3 py-2 text-danger font-mono">Revoked (REVOKED)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold">5. Expiration</td>
                    <td className="px-3 py-2">Timestamp evaluated against validity window</td>
                    <td className="px-3 py-2 text-warning font-mono">Expired (EXPIRED)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold">6. Disclosure</td>
                    <td className="px-3 py-2">Salts rehashed and matched against signed digests</td>
                    <td className="px-3 py-2 text-danger font-mono">Invalid (DISCLOSURE_MISMATCH)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-text-muted">
              If the ledger is unavailable, the outcome is strictly <strong>Unable to verify</strong>, never Valid.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border bg-surface py-6 px-4 text-xs text-text-muted no-print">
        <div className="max-w-portal mx-auto flex justify-between items-center">
          <span>Digital Identity & E-Governance Portal</span>
          <Link href="/docs" className="text-primary hover:underline font-semibold">
            Technical Documentation →
          </Link>
        </div>
      </footer>
    </div>
  );
}
