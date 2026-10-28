import crypto from "crypto";

export interface SaltedClaim {
  key: string;
  value: string | number | boolean;
  salt: string;
}

export interface DisclosureProof {
  key: string;
  value: string | number | boolean;
  salt: string;
}

export function computeClaimHash(
  salt: string,
  key: string,
  value: string | number | boolean
): string {
  const canonical = `${salt}:${key}:${JSON.stringify(value)}`;
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

/**
 * Creates salted claims for all attributes at issuance.
 * Each attribute is blinded with a cryptographically secure 128-bit salt.
 */
export function createSaltedClaims(
  attributes: Record<string, string | number | boolean>
): {
  saltedClaims: Record<string, { value: string | number | boolean; salt: string }>;
  claimsHashes: string[];
} {
  const saltedClaims: Record<
    string,
    { value: string | number | boolean; salt: string }
  > = {};
  const claimsHashes: string[] = [];

  for (const [key, value] of Object.entries(attributes)) {
    const salt = crypto.randomBytes(16).toString("hex");
    saltedClaims[key] = { value, salt };
    const hash = computeClaimHash(salt, key, value);
    claimsHashes.push(hash);
  }

  // Sort hashes to avoid leaking order
  claimsHashes.sort();

  return { saltedClaims, claimsHashes };
}

/**
 * Prepares the disclosure payload revealing ONLY selected attributes with their salts.
 */
export function buildSelectiveDisclosure(
  saltedClaims: Record<string, { value: string | number | boolean; salt: string }>,
  selectedKeys: string[]
): DisclosureProof[] {
  const disclosures: DisclosureProof[] = [];
  for (const key of selectedKeys) {
    if (saltedClaims[key]) {
      disclosures.push({
        key,
        value: saltedClaims[key].value,
        salt: saltedClaims[key].salt,
      });
    }
  }
  return disclosures;
}

/**
 * Verifies that each disclosed attribute matches a hash signed in claimsHashes.
 * Returns the disclosed attributes if all match, or throws DISCLOSURE_MISMATCH.
 */
export function verifySelectiveDisclosures(
  disclosures: DisclosureProof[],
  signedHashes: string[]
): Record<string, string | number | boolean> {
  const verifiedAttributes: Record<string, string | number | boolean> = {};
  const signedHashSet = new Set(signedHashes);

  for (const d of disclosures) {
    const recomputed = computeClaimHash(d.salt, d.key, d.value);
    if (!signedHashSet.has(recomputed)) {
      throw new Error(
        `DISCLOSURE_MISMATCH: Disclosed claim '${d.key}' does not match any signed hash in credential.`
      );
    }
    verifiedAttributes[d.key] = d.value;
  }

  return verifiedAttributes;
}
