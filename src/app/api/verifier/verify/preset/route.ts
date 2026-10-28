import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";
import { buildSelectiveDisclosure } from "@/layers/identity/selective-disclosure";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    requireRole(user, ["VERIFIER"]);

    const { searchParams } = new URL(req.url);
    const scenario = searchParams.get("scenario") || "scenario-valid";

    let credential = null;
    let tampered = false;

    if (scenario === "scenario-valid" || scenario === "scenario-outage") {
      credential = await prisma.credential.findFirst({
        where: {
          status: "ACTIVE",
          type: "IdentityCredential",
          issuer: { trustStatus: "TRUSTED" },
        },
        include: { issuer: true },
      });
    } else if (scenario === "scenario-bad-sig") {
      credential = await prisma.credential.findFirst({
        where: {
          status: "ACTIVE",
          type: "IdentityCredential",
          issuer: { trustStatus: "TRUSTED" },
        },
        include: { issuer: true },
      });
      tampered = true;
    } else if (scenario === "scenario-untrusted") {
      credential = await prisma.credential.findFirst({
        where: {
          issuer: { trustStatus: "UNTRUSTED" },
        },
        include: { issuer: true },
      });
    } else if (scenario === "scenario-expired") {
      credential = await prisma.credential.findFirst({
        where: {
          status: "EXPIRED",
        },
        include: { issuer: true },
      });
    } else if (scenario === "scenario-revoked") {
      credential = await prisma.credential.findFirst({
        where: {
          status: "REVOKED",
        },
        include: { issuer: true },
      });
    }

    if (!credential) {
      return apiError(
        new Error(`No seeded test credential found for scenario '${scenario}'. Ensure database is seeded.`),
        "SCENARIO_NOT_FOUND",
        404
      );
    }

    let jwtRaw = credential.jwtRaw;
    if (tampered) {
      // Modify last 12 chars of signature to simulate cryptographic tamper
      jwtRaw = jwtRaw.slice(0, -12) + "TAMPERED_SIG";
    }

    const claims = JSON.parse(credential.claimsData || "{}");
    const sampleKeys = Object.keys(claims).slice(0, 2);
    const disclosures = buildSelectiveDisclosure(claims, sampleKeys);

    return apiSuccess({
      scenario,
      jwtRaw,
      disclosures,
      type: credential.type,
      issuerName: credential.issuer.organizationName,
      status: credential.status,
    });
  } catch (err) {
    return apiError(err);
  }
}
