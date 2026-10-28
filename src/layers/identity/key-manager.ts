import * as jose from "jose";
import fs from "fs/promises";
import path from "path";

const KEYS_DIR = process.env.KEYS_DIR || "./.keys";

export interface KeyPairJwk {
  publicKeyJwk: jose.JWK;
  privateKeyJwk: jose.JWK;
}

export async function ensureKeysDir(): Promise<string> {
  const resolved = path.resolve(process.cwd(), KEYS_DIR);
  await fs.mkdir(resolved, { recursive: true });
  return resolved;
}

export async function generateIssuerKeyPair(
  issuerSlug: string
): Promise<KeyPairJwk> {
  const dir = await ensureKeysDir();
  const { publicKey, privateKey } = await jose.generateKeyPair("EdDSA", {
    crv: "Ed25519",
    extractable: true,
  });

  const publicKeyJwk = await jose.exportJWK(publicKey);
  const privateKeyJwk = await jose.exportJWK(privateKey);

  publicKeyJwk.kid = `key-${issuerSlug}-1`;
  privateKeyJwk.kid = `key-${issuerSlug}-1`;
  publicKeyJwk.alg = "EdDSA";
  privateKeyJwk.alg = "EdDSA";

  const privPath = path.join(dir, `${issuerSlug}.private.json`);
  const pubPath = path.join(dir, `${issuerSlug}.public.json`);

  await fs.writeFile(privPath, JSON.stringify(privateKeyJwk, null, 2), "utf8");
  await fs.writeFile(pubPath, JSON.stringify(publicKeyJwk, null, 2), "utf8");

  return { publicKeyJwk, privateKeyJwk };
}

export async function loadIssuerPrivateKey(
  issuerSlug: string
): Promise<CryptoKey | Uint8Array> {
  const dir = await ensureKeysDir();
  const privPath = path.join(dir, `${issuerSlug}.private.json`);
  try {
    const raw = await fs.readFile(privPath, "utf8");
    const jwk = JSON.parse(raw);
    return await jose.importJWK(jwk, "EdDSA");
  } catch (err) {
    throw new Error(
      `KEY_NOT_FOUND: Could not load private signing key for issuer slug '${issuerSlug}' from ${privPath}. Ensure keys are generated via seed.`
    );
  }
}

export async function importPublicJwk(
  jwkJsonOrObj: string | jose.JWK
): Promise<CryptoKey | Uint8Array> {
  const jwk =
    typeof jwkJsonOrObj === "string" ? JSON.parse(jwkJsonOrObj) : jwkJsonOrObj;
  return await jose.importJWK(jwk, "EdDSA");
}
