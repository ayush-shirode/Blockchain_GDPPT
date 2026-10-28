import { prisma } from "@/lib/prisma";

export interface TrustedIssuerRecord {
  id: string;
  organizationName: string;
  did: string;
  publicKeyJwk: string;
  trustStatus: "TRUSTED" | "UNTRUSTED";
}

export async function lookupIssuer(
  didOrId: string
): Promise<TrustedIssuerRecord | null> {
  const issuer = await prisma.issuer.findFirst({
    where: {
      OR: [{ did: didOrId }, { id: didOrId }],
    },
  });

  if (!issuer) return null;

  return {
    id: issuer.id,
    organizationName: issuer.organizationName,
    did: issuer.did,
    publicKeyJwk: issuer.publicKeyJwk,
    trustStatus: issuer.trustStatus as "TRUSTED" | "UNTRUSTED",
  };
}

export async function checkIssuerTrust(
  issuerDid: string
): Promise<{ trusted: boolean; issuer?: TrustedIssuerRecord; reason?: string }> {
  const issuer = await lookupIssuer(issuerDid);
  if (!issuer) {
    return {
      trusted: false,
      reason: `UNTRUSTED_ISSUER: Issuer DID '${issuerDid}' is not registered in the trust registry.`,
    };
  }

  if (issuer.trustStatus !== "TRUSTED") {
    return {
      trusted: false,
      issuer,
      reason: `UNTRUSTED_ISSUER: Issuer '${issuer.organizationName}' (${issuer.did}) has trust status '${issuer.trustStatus}'.`,
    };
  }

  return { trusted: true, issuer };
}
