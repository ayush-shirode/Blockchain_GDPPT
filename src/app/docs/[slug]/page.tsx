import React from "react";
import { notFound } from "next/navigation";
import { getDocContent, DOCS_PAGES } from "@/lib/docs-data";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { ArchitectureSvg } from "@/components/docs/ArchitectureSvg";
import { ApiEndpoint } from "@/components/docs/ApiEndpoint";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DOCS_PAGES.map((p) => ({
    slug: p.slug,
  }));
}

export default async function DocSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getDocContent(slug);

  if (!content) {
    notFound();
  }

  const { meta, headings, html } = content;

  return (
    <DocsLayout
      pages={DOCS_PAGES}
      currentPageSlug={slug}
      headings={headings}
      lastUpdated="October 2026"
    >
      <div className="prose prose-slate max-w-none text-text">
        {/* Render architecture diagram on architecture page */}
        {slug === "architecture" ? (
          <div>
            <div
              dangerouslySetInnerHTML={{
                __html: html.replace("<!-- ARCHITECTURE_SVG_COMPONENT -->", ""),
              }}
            />
            <div className="my-8">
              <ArchitectureSvg />
            </div>
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        )}

        {/* Interactive API Endpoint widgets on api-reference page */}
        {slug === "api-reference" && (
          <div className="mt-12 space-y-8 border-t border-border pt-8">
            <h2 id="interactive-endpoint-specifications" className="text-lg font-bold text-text">
              Interactive Endpoint Specifications
            </h2>
            <p className="text-xs text-text-muted">
              Live contracts matching the active route handlers in <code className="font-mono text-xs">src/app/api/</code>.
            </p>

            <ApiEndpoint
              method="POST"
              path="/api/auth/sign-in"
              role="PUBLIC"
              description="Authenticates citizen, issuer, verifier, or admin using email and password. Sets an HTTP-only SameSite=Strict session cookie."
              requestExample={`{\n  "email": "asha.patil@example.gov",\n  "password": "DemoPassword123!"\n}`}
              responseExample={`{\n  "ok": true,\n  "data": {\n    "user": {\n      "id": "usr-citizen-1",\n      "email": "asha.patil@example.gov",\n      "displayName": "Asha Patil",\n      "role": "CITIZEN"\n    }\n  }\n}`}
              errorCodes={[
                { code: "INVALID_CREDENTIALS", status: 401, description: "Supplied email or password does not match." },
                { code: "RATE_LIMITED", status: 429, description: "Too many sign-in attempts from this IP address." },
              ]}
            />

            <ApiEndpoint
              method="GET"
              path="/api/wallet/credentials"
              role="CITIZEN"
              description="Retrieves credentials held by the authenticated citizen. Enforces strict IDOR ownership checks; callers cannot access other citizens' credentials."
              responseExample={`{\n  "ok": true,\n  "data": {\n    "credentials": [\n      {\n        "id": "cred-demo-identity-1",\n        "type": "IdentityCredential",\n        "issuerDid": "did:key:z6MkuTjN9zX...",\n        "issuerName": "Municipal Corporation",\n        "status": "VALID",\n        "issuanceDate": "2026-01-15T09:00:00.000Z"\n      }\n    ]\n  }\n}`}
              errorCodes={[
                { code: "UNAUTHORIZED", status: 401, description: "No valid session cookie detected." },
                { code: "FORBIDDEN", status: 403, description: "User lacks the CITIZEN role." },
              ]}
            />

            <ApiEndpoint
              method="POST"
              path="/api/issuer/credentials"
              role="ISSUER"
              description="Issues a new W3C VC-JWT signed with the issuer's Ed25519 private key. Commits a SHA-256 issuance digest to the append-only ledger."
              requestExample={`{\n  "subjectId": "usr-citizen-1",\n  "type": "IdentityCredential",\n  "claims": {\n    "fullName": "Asha Patil",\n    "dateOfBirth": "1994-06-12",\n    "nationality": "IN"\n  },\n  "validityDays": 730\n}`}
              responseExample={`{\n  "ok": true,\n  "data": {\n    "credentialId": "cred-uuid-101",\n    "blockIndex": 12,\n    "blockHash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",\n    "jwt": "eyJhbGciOiJFZERTQSI..."\n  }\n}`}
              errorCodes={[
                { code: "FORBIDDEN", status: 403, description: "Caller does not possess ISSUER authority." },
                { code: "VALIDATION_FAILED", status: 400, description: "Required claims missing from input payload." },
              ]}
            />

            <ApiEndpoint
              method="POST"
              path="/api/verifier/verify"
              role="PUBLIC"
              description="Evaluates a credential or presentation against the six-step verification pipeline in strict order of precedence (Invalid > Revoked > Expired > Unable to verify > Valid)."
              requestExample={`{\n  "presentationJwt": "eyJhbGciOiJFZERTQSI...",\n  "verifierDid": "did:key:z6MkuHospital..."\n}`}
              responseExample={`{\n  "ok": true,\n  "data": {\n    "outcome": "VALID",\n    "checks": {\n      "structure": { "passed": true, "label": "Structure valid" },\n      "signature": { "passed": true, "label": "Signature authentic" },\n      "issuerTrust": { "passed": true, "label": "Issuer trusted" },\n      "expiry": { "passed": true, "label": "Not expired" },\n      "revocation": { "passed": true, "label": "Not revoked" },\n      "disclosure": { "passed": true, "label": "Disclosure consented" }\n    },\n    "disclosedClaims": {\n      "fullName": "Asha Patil",\n      "dateOfBirth": "1994-06-12"\n    }\n  }\n}`}
              errorCodes={[
                { code: "RATE_LIMITED", status: 429, description: "Too many verification requests submitted from IP." },
              ]}
            />

            <ApiEndpoint
              method="POST"
              path="/api/admin/ledger/integrity"
              role="ADMIN"
              description="Recomputes the cryptographic SHA-256 hash chain from Genesis to Head to verify ledger block immutability."
              responseExample={`{\n  "ok": true,\n  "data": {\n    "isValid": true,\n    "totalBlocks": 14,\n    "lastVerifiedAt": "2026-10-28T11:45:00.000Z"\n  }\n}`}
              errorCodes={[
                { code: "FORBIDDEN", status: 403, description: "Requires ADMIN role." },
              ]}
            />
          </div>
        )}
      </div>
    </DocsLayout>
  );
}
