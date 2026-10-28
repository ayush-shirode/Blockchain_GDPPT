import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export interface AuditLogInput {
  actorId?: string | null;
  action:
    | "USER_LOGIN"
    | "USER_LOGOUT"
    | "ISSUE_CREDENTIAL"
    | "REVOKE_CREDENTIAL"
    | "CONSENT_SHARE"
    | "VERIFY_PROOF"
    | "LEDGER_OUTAGE_TOGGLE"
    | "INTEGRITY_CHECK";
  targetRef?: string | null;
  result: "SUCCESS" | "FAILURE";
  correlationId?: string;
}

export async function recordAuditEvent(input: AuditLogInput): Promise<string> {
  const correlationId =
    input.correlationId || `corr-${crypto.randomBytes(8).toString("hex")}`;

  try {
    const event = await prisma.auditEvent.create({
      data: {
        actorId: input.actorId || null,
        action: input.action,
        targetRef: input.targetRef || null,
        result: input.result,
        correlationId,
      },
    });
    return event.id;
  } catch (err) {
    // Audit logging failure should not leak or crash completely, but report to stderr
    console.error("[AUDIT LOG ERROR] Failed to persist audit event", err);
    return correlationId;
  }
}
