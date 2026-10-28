import * as jose from "jose";
import { LedgerAdapter } from "@/layers/ledger/types";
import { checkIssuerTrust } from "@/layers/identity/trust-registry";
import { verifyVcJwtSignature } from "@/layers/identity/vc-jwt";
import {
  DisclosureProof,
  verifySelectiveDisclosures,
} from "@/layers/identity/selective-disclosure";

export type OutcomeType =
  | "VALID"
  | "INVALID"
  | "EXPIRED"
  | "REVOKED"
  | "UNABLE_TO_VERIFY";

export interface VerificationCheck {
  id: string;
  name: string;
  status: "PASSED" | "FAILED" | "UNAVAILABLE" | "SKIPPED";
  message: string;
}

export interface VerificationResult {
  outcome: OutcomeType;
  reasonCode?:
    | "MALFORMED"
    | "BAD_SIGNATURE"
    | "UNTRUSTED_ISSUER"
    | "REVOKED"
    | "EXPIRED"
    | "LEDGER_UNAVAILABLE"
    | "DISCLOSURE_MISMATCH";
  message: string;
  checks: VerificationCheck[];
  disclosedAttributes: Record<string, string | number | boolean>;
  credentialMetadata?: {
    id: string;
    type: string;
    issuerDid: string;
    subjectId: string;
    issuedAt: string;
    expiresAt: string;
  };
}

export async function executeVerification(params: {
  jwtRaw: string;
  disclosures?: DisclosureProof[];
  consentedAttributes?: string[];
  ledger: LedgerAdapter;
}): Promise<VerificationResult> {
  const checks: VerificationCheck[] = [
    {
      id: "structure",
      name: "Credential Structure",
      status: "SKIPPED",
      message: "Checking credential formatting and required claims.",
    },
    {
      id: "signature",
      name: "Digital Signature",
      status: "SKIPPED",
      message: "Validating cryptographic Ed25519 signature.",
    },
    {
      id: "issuer_trust",
      name: "Issuer Trust Registry",
      status: "SKIPPED",
      message: "Verifying issuer authority registration status.",
    },
    {
      id: "revocation",
      name: "Ledger Revocation Status",
      status: "SKIPPED",
      message: "Querying immutable ledger for revocation events.",
    },
    {
      id: "expiration",
      name: "Validity Period",
      status: "SKIPPED",
      message: "Checking current timestamp against validity window.",
    },
    {
      id: "disclosure",
      name: "Selective Disclosure Integrity",
      status: "SKIPPED",
      message: "Confirming disclosed claims match consented attributes and signed digests.",
    },
  ];

  let rawVc: Record<string, unknown> | null = null;
  let credentialId = "";
  let issuerDid = "";
  let subjectId = "";
  let credentialType = "VerifiableCredential";
  let issuedAtDate: Date | null = null;
  let expiresAtDate: Date | null = null;
  let claimsHashes: string[] = [];
  const disclosedAttributes: Record<string, string | number | boolean> = {};

  // CHECK 1: Structure
  try {
    const parts = params.jwtRaw.trim().split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT token format; expected 3 segments");
    }

    const payload = jose.decodeJwt(params.jwtRaw) as Record<string, any>;
    if (!payload || !payload.vc) {
      throw new Error("Missing 'vc' property in token claims");
    }

    rawVc = payload.vc as Record<string, unknown>;
    credentialId = (payload.jti || rawVc.id) as string;
    issuerDid = (payload.iss || rawVc.issuer) as string;

    const credSubject = rawVc.credentialSubject as Record<string, unknown>;
    subjectId = (payload.sub || credSubject?.id) as string;
    const types = Array.isArray(rawVc.type) ? rawVc.type : [rawVc.type];
    credentialType = types.find((t: string) => t !== "VerifiableCredential") || "VerifiableCredential";

    claimsHashes = (credSubject?._sd as string[]) || [];

    if (payload.iat) {
      issuedAtDate = new Date(payload.iat * 1000);
    }
    if (payload.exp) {
      expiresAtDate = new Date(payload.exp * 1000);
    }

    if (!credentialId || !issuerDid || !expiresAtDate) {
      throw new Error("Credential is missing required identifiers or expiry");
    }

    checks[0] = {
      id: "structure",
      name: "Credential Structure",
      status: "PASSED",
      message: "Structure is valid and matches W3C Verifiable Credential standard.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Malformed credential";
    checks[0] = {
      id: "structure",
      name: "Credential Structure",
      status: "FAILED",
      message: `Structure validation failed: ${msg}`,
    };
    return {
      outcome: "INVALID",
      reasonCode: "MALFORMED",
      message: "Credential structure is invalid or malformed.",
      checks,
      disclosedAttributes: {},
    };
  }

  // CHECK 2 & 3: Issuer Trust & Signature
  let issuerRecord: Awaited<ReturnType<typeof checkIssuerTrust>>["issuer"] = undefined;
  try {
    const trustResult = await checkIssuerTrust(issuerDid);
    issuerRecord = trustResult.issuer;

    if (!trustResult.trusted || !issuerRecord) {
      checks[2] = {
        id: "issuer_trust",
        name: "Issuer Trust Registry",
        status: "FAILED",
        message: trustResult.reason || "Issuer is not trusted in authority registry.",
      };
      // Still attempt signature check if public key exists, else fail
      checks[1] = {
        id: "signature",
        name: "Digital Signature",
        status: "FAILED",
        message: "Signature could not be validated because issuer is untrusted.",
      };
      return {
        outcome: "INVALID",
        reasonCode: "UNTRUSTED_ISSUER",
        message: "The issuing organization is untrusted or unverified.",
        checks,
        disclosedAttributes: {},
      };
    }

    checks[2] = {
      id: "issuer_trust",
      name: "Issuer Trust Registry",
      status: "PASSED",
      message: `Issuer '${issuerRecord.organizationName}' is registered and trusted.`,
    };

    // Signature verification against trusted public key
    const sigResult = await verifyVcJwtSignature(
      params.jwtRaw,
      issuerRecord.publicKeyJwk
    );

    if (!sigResult.valid) {
      checks[1] = {
        id: "signature",
        name: "Digital Signature",
        status: "FAILED",
        message: `Cryptographic signature validation failed (${sigResult.error}).`,
      };
      return {
        outcome: "INVALID",
        reasonCode: "BAD_SIGNATURE",
        message: "Digital signature is invalid or has been tampered with.",
        checks,
        disclosedAttributes: {},
      };
    }

    checks[1] = {
      id: "signature",
      name: "Digital Signature",
      status: "PASSED",
      message: "Cryptographic Ed25519 signature is authentic and verified.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error verifying signature";
    checks[1] = {
      id: "signature",
      name: "Digital Signature",
      status: "FAILED",
      message: msg,
    };
    return {
      outcome: "INVALID",
      reasonCode: "BAD_SIGNATURE",
      message: "Signature validation failed.",
      checks,
      disclosedAttributes: {},
    };
  }

  // CHECK 4: Revocation Status via Ledger Adapter
  let ledgerUnavailable = false;
  let isRevoked = false;
  let ledgerMessage = "";

  try {
    const statusResult = await params.ledger.getStatus(credentialId);
    if (statusResult.status === "REVOKED") {
      isRevoked = true;
      ledgerMessage = `Credential was revoked on ledger at ${statusResult.at} (${statusResult.txRef}).`;
      checks[3] = {
        id: "revocation",
        name: "Ledger Revocation Status",
        status: "FAILED",
        message: ledgerMessage,
      };
    } else {
      checks[3] = {
        id: "revocation",
        name: "Ledger Revocation Status",
        status: "PASSED",
        message: `Active on ledger (verified at ${statusResult.at}, ${statusResult.txRef}).`,
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Ledger unavailable";
    ledgerUnavailable = true;
    checks[3] = {
      id: "revocation",
      name: "Ledger Revocation Status",
      status: "UNAVAILABLE",
      message: `Could not verify revocation status on ledger: ${msg}`,
    };
  }

  // CHECK 5: Expiration
  const now = new Date();
  const isExpired = expiresAtDate ? now > expiresAtDate : false;
  if (isExpired) {
    checks[4] = {
      id: "expiration",
      name: "Validity Period",
      status: "FAILED",
      message: `Credential expired on ${expiresAtDate?.toISOString()}.`,
    };
  } else {
    checks[4] = {
      id: "expiration",
      name: "Validity Period",
      status: "PASSED",
      message: `Credential is valid until ${expiresAtDate?.toISOString()}.`,
    };
  }

  // CHECK 6: Selective Disclosure & Consent Scope
  try {
    if (params.disclosures && params.disclosures.length > 0) {
      // 1. Verify disclosed attributes against consented attributes if provided
      if (params.consentedAttributes && params.consentedAttributes.length > 0) {
        const consentedSet = new Set(params.consentedAttributes);
        for (const disc of params.disclosures) {
          if (!consentedSet.has(disc.key)) {
            throw new Error(
              `DISCLOSURE_MISMATCH: Disclosed attribute '${disc.key}' was not approved in consent agreement.`
            );
          }
        }
      }

      // 2. Verify salted hashes against signed digests in VC
      const verified = verifySelectiveDisclosures(
        params.disclosures,
        claimsHashes
      );
      Object.assign(disclosedAttributes, verified);

      checks[5] = {
        id: "disclosure",
        name: "Selective Disclosure Integrity",
        status: "PASSED",
        message: `Disclosed ${Object.keys(verified).length} attributes matching salted digests.`,
      };
    } else {
      checks[5] = {
        id: "disclosure",
        name: "Selective Disclosure Integrity",
        status: "PASSED",
        message: "No selective attributes disclosed; presentation integrity confirmed.",
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Disclosure mismatch";
    checks[5] = {
      id: "disclosure",
      name: "Selective Disclosure Integrity",
      status: "FAILED",
      message: msg,
    };
    return {
      outcome: "INVALID",
      reasonCode: "DISCLOSURE_MISMATCH",
      message: "Disclosed attributes do not match signed digests or consented scope.",
      checks,
      disclosedAttributes: {},
    };
  }

  const credentialMetadata = {
    id: credentialId,
    type: credentialType,
    issuerDid,
    subjectId,
    issuedAt: issuedAtDate ? issuedAtDate.toISOString() : "",
    expiresAt: expiresAtDate ? expiresAtDate.toISOString() : "",
  };

  // Evaluate Precedence: Invalid -> Revoked -> Expired -> Unable to verify -> Valid
  if (isRevoked) {
    return {
      outcome: "REVOKED",
      reasonCode: "REVOKED",
      message: "Credential revoked. This credential is no longer valid. Contact the issuing organization.",
      checks,
      disclosedAttributes,
      credentialMetadata,
    };
  }

  if (isExpired) {
    return {
      outcome: "EXPIRED",
      reasonCode: "EXPIRED",
      message: "Credential expired. The validity period has ended.",
      checks,
      disclosedAttributes,
      credentialMetadata,
    };
  }

  if (ledgerUnavailable) {
    return {
      outcome: "UNABLE_TO_VERIFY",
      reasonCode: "LEDGER_UNAVAILABLE",
      message: "Verification temporarily unavailable. We could not check the credential status. No access decision has been made. Try again later.",
      checks,
      disclosedAttributes: {},
      credentialMetadata,
    };
  }

  // All checks passed
  return {
    outcome: "VALID",
    message: "Credential verified. The signature is valid, the issuer is trusted, and the credential is not expired or revoked.",
    checks,
    disclosedAttributes,
    credentialMetadata,
  };
}
