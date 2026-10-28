import { describe, it, expect } from "vitest";
import {
  createSaltedClaims,
  buildSelectiveDisclosure,
  verifySelectiveDisclosures,
  computeClaimHash,
} from "@/layers/identity/selective-disclosure";

describe("Salted-Hash Selective Disclosure", () => {
  const rawAttributes = {
    fullName: "Asha Patil",
    dateOfBirth: "1998-05-14",
    isOver18: true,
    residentCity: "Metro City",
  };

  it("should create salted claims with sorted digests", () => {
    const { saltedClaims, claimsHashes } = createSaltedClaims(rawAttributes);

    expect(Object.keys(saltedClaims)).toEqual([
      "fullName",
      "dateOfBirth",
      "isOver18",
      "residentCity",
    ]);
    expect(claimsHashes.length).toBe(4);
    // Digests should be 64-character hex strings
    for (const hash of claimsHashes) {
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it("should selectively reveal only consented attributes with their salts", () => {
    const { saltedClaims, claimsHashes } = createSaltedClaims(rawAttributes);
    const selectedKeys = ["fullName", "isOver18"];

    const disclosures = buildSelectiveDisclosure(saltedClaims, selectedKeys);
    expect(disclosures.length).toBe(2);

    const verified = verifySelectiveDisclosures(disclosures, claimsHashes);
    expect(verified).toEqual({
      fullName: "Asha Patil",
      isOver18: true,
    });
    // Unrevealed attributes are not present
    expect(verified["dateOfBirth"]).toBeUndefined();
    expect(verified["residentCity"]).toBeUndefined();
  });

  it("should reject tampered or unconsented claims", () => {
    const { saltedClaims, claimsHashes } = createSaltedClaims(rawAttributes);
    const disclosures = buildSelectiveDisclosure(saltedClaims, ["fullName"]);

    // Tamper with the disclosed value
    disclosures[0].value = "Imposter Name";

    expect(() =>
      verifySelectiveDisclosures(disclosures, claimsHashes)
    ).toThrowError(/DISCLOSURE_MISMATCH/);
  });
});
