import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole, assertOwnership } from "@/layers/policy/access-control";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["CITIZEN"]);
    const { id } = await params;

    const credential = await prisma.credential.findUnique({
      where: { id },
      include: {
        issuer: {
          select: {
            organizationName: true,
            did: true,
            trustStatus: true,
          },
        },
      },
    });

    if (!credential) {
      return apiError(
        new Error("Credential not found."),
        "NOT_FOUND",
        404
      );
    }

    // IDOR check: ensure requester owns this credential
    assertOwnership(credential.subjectUserId, session.id, "credential");

    const saltedClaims = JSON.parse(credential.claimsData || "{}");
    // Extract attribute values for citizen view (salts kept safe)
    const attributes: Record<string, any> = {};
    for (const [k, v] of Object.entries(saltedClaims)) {
      attributes[k] = (v as any).value;
    }

    return apiSuccess({
      credential: {
        id: credential.id,
        type: credential.type,
        status: credential.status,
        issuedAt: credential.issuedAt.toISOString(),
        expiresAt: credential.expiresAt.toISOString(),
        revokedAt: credential.revokedAt?.toISOString() || null,
        revocationReason: credential.revocationReason,
        credentialHash: credential.credentialHash,
        jwtRaw: credential.jwtRaw,
        ledgerTxRef: credential.ledgerTxRef,
        issuer: credential.issuer,
        attributes,
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
