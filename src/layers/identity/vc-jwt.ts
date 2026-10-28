import * as jose from "jose";
import crypto from "crypto";
import { loadIssuerPrivateKey, importPublicJwk } from "./key-manager";

export interface VcPayload {
  jti: string;
  iss: string;
  sub: string;
  type: string;
  claimsHashes: string[];
  issuedAt: Date;
  expiresAt: Date;
}

export function computeCredentialHash(payload: VcPayload): string {
  const canonical = JSON.stringify({
    jti: payload.jti,
    iss: payload.iss,
    sub: payload.sub,
    type: payload.type,
    _sd: [...payload.claimsHashes].sort(),
    iat: Math.floor(payload.issuedAt.getTime() / 1000),
    exp: Math.floor(payload.expiresAt.getTime() / 1000),
  });
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

export async function createAndSignVcJwt(
  payload: VcPayload,
  issuerSlug: string
): Promise<{ jwtRaw: string; credentialHash: string }> {
  const privateKey = await loadIssuerPrivateKey(issuerSlug);
  const credentialHash = computeCredentialHash(payload);

  const iatSeconds = Math.floor(payload.issuedAt.getTime() / 1000);
  const expSeconds = Math.floor(payload.expiresAt.getTime() / 1000);

  const jwtRaw = await new jose.SignJWT({
    vc: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://identity.gov.example/contexts/v1",
      ],
      id: payload.jti,
      type: ["VerifiableCredential", payload.type],
      issuer: payload.iss,
      issuanceDate: payload.issuedAt.toISOString(),
      expirationDate: payload.expiresAt.toISOString(),
      credentialSubject: {
        id: payload.sub,
        _sd: [...payload.claimsHashes].sort(),
        credentialHash,
      },
    },
  })
    .setProtectedHeader({ alg: "EdDSA", typ: "JWT" })
    .setIssuer(payload.iss)
    .setSubject(payload.sub)
    .setJti(payload.jti)
    .setIssuedAt(iatSeconds)
    .setExpirationTime(expSeconds)
    .sign(privateKey);

  return { jwtRaw, credentialHash };
}

export async function verifyVcJwtSignature(
  jwtRaw: string,
  publicKeyJwkJson: string
): Promise<{
  valid: boolean;
  payload?: jose.JWTPayload;
  error?: string;
}> {
  try {
    const publicKey = await importPublicJwk(publicKeyJwkJson);
    // compactVerify checks cryptographic signature without enforcing expiration check
    const { payload: rawPayload } = await jose.compactVerify(
      jwtRaw,
      publicKey,
      {
        algorithms: ["EdDSA"],
      }
    );
    const parsed = JSON.parse(new TextDecoder().decode(rawPayload));
    return { valid: true, payload: parsed };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "BAD_SIGNATURE";
    return { valid: false, error: message };
  }
}
