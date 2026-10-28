import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole, assertOwnership } from "@/layers/policy/access-control";
import { respondToRequestSchema } from "@/layers/api/validation/schemas";
import { buildSelectiveDisclosure } from "@/layers/identity/selective-disclosure";
import { recordAuditEvent } from "@/layers/policy/audit-logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["CITIZEN"]);
    const { id } = await params;

    const body = await req.json();
    const parsed = respondToRequestSchema.parse(body);

    const vRequest = await prisma.verificationRequest.findUnique({
      where: { id },
    });

    if (!vRequest) {
      return apiError(
        new Error("Verification request not found."),
        "NOT_FOUND",
        404
      );
    }

    assertOwnership(vRequest.subjectUserId, session.id, "verification request");

    if (vRequest.status !== "PENDING") {
      return apiError(
        new Error(`Request has already been processed with status '${vRequest.status}'.`),
        "INVALID_STATE",
        400
      );
    }

    if (parsed.decision === "DECLINED") {
      await prisma.verificationRequest.update({
        where: { id },
        data: { status: "DECLINED" },
      });

      const consent = await prisma.consentRecord.create({
        data: {
          holderId: session.id,
          requestId: id,
          decision: "DECLINED",
          approvedAttributes: JSON.stringify([]),
        },
      });

      await recordAuditEvent({
        actorId: session.id,
        action: "CONSENT_SHARE",
        targetRef: id,
        result: "SUCCESS",
      });

      return apiSuccess({
        decision: "DECLINED",
        consentId: consent.id,
        message: "Request declined. No personal attributes were disclosed or shared.",
      });
    }

    // Citizen approved: find credentials holding the selected attributes
    const requestedKeys = JSON.parse(vRequest.requestedAttributes || "[]") as string[];
    // Ensure citizen cannot select attributes outside of what was requested
    const validSelectedKeys = parsed.selectedAttributes.filter((k) =>
      requestedKeys.includes(k)
    );

    // Fetch active credentials for this citizen
    const credentials = await prisma.credential.findMany({
      where: {
        subjectUserId: session.id,
        status: "ACTIVE",
      },
      include: { issuer: true },
    });

    // Find the credential that contains the requested attributes
    let matchingCredential = null;
    let selectedDisclosures: any[] = [];

    for (const cred of credentials) {
      const claims = JSON.parse(cred.claimsData || "{}");
      const hasAll = validSelectedKeys.every((k) => claims[k] !== undefined);
      if (hasAll && validSelectedKeys.length > 0) {
        matchingCredential = cred;
        selectedDisclosures = buildSelectiveDisclosure(claims, validSelectedKeys);
        break;
      }
    }

    // Fallback: if multiple credentials or first matching
    if (!matchingCredential && credentials.length > 0) {
      const first = credentials[0];
      const claims = JSON.parse(first.claimsData || "{}");
      matchingCredential = first;
      selectedDisclosures = buildSelectiveDisclosure(claims, validSelectedKeys);
    }

    await prisma.verificationRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    const consent = await prisma.consentRecord.create({
      data: {
        holderId: session.id,
        requestId: id,
        decision: "APPROVED",
        approvedAttributes: JSON.stringify(validSelectedKeys),
      },
    });

    await recordAuditEvent({
      actorId: session.id,
      action: "CONSENT_SHARE",
      targetRef: id,
      result: "SUCCESS",
    });

    return apiSuccess({
      decision: "APPROVED",
      consentId: consent.id,
      verifierName: vRequest.verifierName,
      purpose: vRequest.purpose,
      approvedAttributes: validSelectedKeys,
      presentation: matchingCredential
        ? {
            jwtRaw: matchingCredential.jwtRaw,
            disclosures: selectedDisclosures,
            credentialType: matchingCredential.type,
            issuerName: matchingCredential.issuer.organizationName,
          }
        : null,
      receipt: {
        transactionId: `rcpt-${consent.id.slice(0, 8)}`,
        sharedWith: vRequest.verifierName,
        purpose: vRequest.purpose,
        attributesShared: validSelectedKeys,
        timestamp: consent.decidedAt.toISOString(),
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
