import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["VERIFIER"]);

    const events = await prisma.verificationEvent.findMany({
      where: { verifierId: session.id },
      include: {
        request: {
          select: {
            purpose: true,
            subjectUser: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = events.map((e) => ({
      id: e.id,
      outcome: e.outcome,
      reasonCode: e.reasonCode,
      purpose: e.request?.purpose || "Direct presentation verification",
      subjectName: e.request?.subjectUser.displayName || "Presented Proof",
      createdAt: e.createdAt.toISOString(),
      checks: JSON.parse(e.checksJson || "[]"),
      disclosedClaims: JSON.parse(e.disclosedClaims || "{}"),
    }));

    return apiSuccess({ history: mapped });
  } catch (err) {
    return apiError(err);
  }
}
