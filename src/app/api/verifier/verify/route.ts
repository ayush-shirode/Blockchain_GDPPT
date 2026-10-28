import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";
import { verifyProofSchema } from "@/layers/api/validation/schemas";
import { checkRateLimit } from "@/layers/api/rate-limiter";
import { executeVerification } from "@/layers/policy/verification-engine";
import { getLedgerAdapter } from "@/layers/ledger";
import { recordAuditEvent } from "@/layers/policy/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["VERIFIER"]);

    const ip = req.headers.get("x-forwarded-for") || session.id;
    const rateCheck = checkRateLimit(`verify-${ip}`, 60, 60);

    if (!rateCheck.allowed) {
      return apiError(
        new Error("Verification rate limit exceeded. Please wait a moment."),
        "RATE_LIMIT_EXCEEDED",
        429
      );
    }

    const body = await req.json();
    const parsed = verifyProofSchema.parse(body);

    let consentedAttributes: string[] | undefined = undefined;
    let requestRecord = null;

    if (parsed.requestId) {
      requestRecord = await prisma.verificationRequest.findUnique({
        where: { id: parsed.requestId },
        include: { consentRecord: true },
      });

      if (requestRecord && requestRecord.consentRecord) {
        if (requestRecord.consentRecord.decision === "DECLINED") {
          return apiError(
            new Error("Consent was declined by the citizen. No verification permitted."),
            "CONSENT_DECLINED",
            403
          );
        }
        consentedAttributes = JSON.parse(
          requestRecord.consentRecord.approvedAttributes || "[]"
        );
      }
    }

    const ledger = getLedgerAdapter();
    const result = await executeVerification({
      jwtRaw: parsed.jwtRaw,
      disclosures: parsed.disclosures,
      consentedAttributes,
      ledger,
    });

    // Record VerificationEvent in DB
    const verificationEvent = await prisma.verificationEvent.create({
      data: {
        requestId: parsed.requestId || null,
        verifierId: session.id,
        verifierName: session.displayName,
        outcome: result.outcome,
        reasonCode: result.reasonCode || null,
        checksJson: JSON.stringify(result.checks),
        disclosedClaims: JSON.stringify(result.disclosedAttributes),
      },
    });

    await recordAuditEvent({
      actorId: session.id,
      action: "VERIFY_PROOF",
      targetRef: verificationEvent.id,
      result: result.outcome === "VALID" ? "SUCCESS" : "FAILURE",
    });

    const receipt = {
      verificationId: verificationEvent.id,
      timestamp: verificationEvent.createdAt.toISOString(),
      outcome: result.outcome,
      reasonCode: result.reasonCode || null,
      verifier: session.displayName,
      credentialId: result.credentialMetadata?.id || "unknown",
      issuerDid: result.credentialMetadata?.issuerDid || "unknown",
    };

    return apiSuccess({
      ...result,
      verificationId: verificationEvent.id,
      receipt,
    });
  } catch (err) {
    return apiError(err);
  }
}
