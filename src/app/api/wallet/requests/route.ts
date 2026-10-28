import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["CITIZEN"]);

    const requests = await prisma.verificationRequest.findMany({
      where: { subjectUserId: session.id },
      include: {
        consentRecord: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = requests.map((r) => ({
      id: r.id,
      verifierId: r.verifierId,
      verifierName: r.verifierName,
      purpose: r.purpose,
      requestedAttributes: JSON.parse(r.requestedAttributes || "[]") as string[],
      validitySeconds: r.validitySeconds,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      expiresAt: r.expiresAt.toISOString(),
      consentRecord: r.consentRecord
        ? {
            decision: r.consentRecord.decision,
            approvedAttributes: JSON.parse(r.consentRecord.approvedAttributes || "[]"),
            decidedAt: r.consentRecord.decidedAt.toISOString(),
          }
        : null,
    }));

    return apiSuccess({ requests: mapped });
  } catch (err) {
    return apiError(err);
  }
}
