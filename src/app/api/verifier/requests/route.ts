import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";
import { createVerificationRequestSchema } from "@/layers/api/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["VERIFIER"]);

    const requests = await prisma.verificationRequest.findMany({
      where: { verifierId: session.id },
      include: {
        subjectUser: {
          select: { displayName: true, email: true },
        },
        consentRecord: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = requests.map((r) => ({
      id: r.id,
      subjectName: r.subjectUser.displayName,
      subjectEmail: r.subjectUser.email,
      purpose: r.purpose,
      requestedAttributes: JSON.parse(r.requestedAttributes || "[]"),
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      expiresAt: r.expiresAt.toISOString(),
      consentDecision: r.consentRecord?.decision || null,
    }));

    return apiSuccess({ requests: mapped });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["VERIFIER"]);

    const body = await req.json();
    const parsed = createVerificationRequestSchema.parse(body);

    const subject = await prisma.user.findUnique({
      where: { id: parsed.subjectUserId },
    });

    if (!subject || subject.role !== "CITIZEN") {
      return apiError(
        new Error("Selected subject is not a valid citizen account."),
        "INVALID_SUBJECT",
        400
      );
    }

    const expiresAt = new Date(Date.now() + parsed.validitySeconds * 1000);

    const created = await prisma.verificationRequest.create({
      data: {
        verifierId: session.id,
        verifierName: session.displayName,
        subjectUserId: subject.id,
        purpose: parsed.purpose,
        requestedAttributes: JSON.stringify(parsed.requestedAttributes),
        validitySeconds: parsed.validitySeconds,
        status: "PENDING",
        expiresAt,
      },
    });

    return apiSuccess({
      request: {
        id: created.id,
        verifierName: created.verifierName,
        subjectName: subject.displayName,
        purpose: created.purpose,
        requestedAttributes: parsed.requestedAttributes,
        status: created.status,
        expiresAt: created.expiresAt.toISOString(),
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
