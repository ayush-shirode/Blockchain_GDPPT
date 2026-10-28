import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["CITIZEN"]);

    const credentials = await prisma.credential.findMany({
      where: { subjectUserId: session.id },
      include: {
        issuer: {
          select: {
            organizationName: true,
            did: true,
            trustStatus: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    const mapped = credentials.map((c) => ({
      id: c.id,
      type: c.type,
      status: c.status,
      issuedAt: c.issuedAt.toISOString(),
      expiresAt: c.expiresAt.toISOString(),
      revokedAt: c.revokedAt?.toISOString() || null,
      revocationReason: c.revocationReason,
      credentialHash: c.credentialHash,
      ledgerTxRef: c.ledgerTxRef,
      issuer: c.issuer,
      claimsCount: Object.keys(JSON.parse(c.claimsData || "{}")).length,
    }));

    return apiSuccess({ credentials: mapped });
  } catch (err) {
    return apiError(err);
  }
}
