/**
 * DID helper utilities for did:web and did:key formatting.
 */
export function formatIssuerDid(organizationSlug: string): string {
  const cleanSlug = organizationSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `did:web:gov.example:issuers:${cleanSlug}`;
}

export function parseDid(did: string): {
  method: string;
  id: string;
  slug?: string;
} {
  const parts = did.split(":");
  if (parts.length < 3 || parts[0] !== "did") {
    throw new Error(`MALFORMED: Invalid DID format '${did}'`);
  }
  return {
    method: parts[1],
    id: parts.slice(2).join(":"),
    slug: parts[parts.length - 1],
  };
}
