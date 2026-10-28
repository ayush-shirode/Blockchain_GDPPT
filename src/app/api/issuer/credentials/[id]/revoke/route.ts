import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole, assertOwnership } from "@/layers/policy/access-control";
import { revokeCredentialSchema } from "@/layers/api/validation/schemas";
import { getLedgerAdapter } from "@/layers/ledger";
import { recordAuditEvent } from "@/layers/policy/audit-logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["ISSUER"]);
    const { id } = await params;

    const body = await req.json();
    const parsed = revokeCredentialSchema.parse(body);

    const credential = await prisma.credential.findUnique({
      where: { id },
      include: {
        issuer: true,
      },
    });

    if (!credential) {
      return apiError(
        new Error("Credential not found."),
        "NOT_FOUND",
        404
      );
    }

    // Ownership check: only issuing organization can revoke
    assertOwnership(credential.issuer.userId, session.id, "credential for revocation");

    if (credential.status === "REVOKED") {
      return apiError(
        new Error("Credential has already been revoked."),
        "ALREADY_REVOKED",
        400
      );
    }

    const ledger = getLedgerAdapter();
    const ledgerReceipt = await ledger.recordRevocation({
      credentialId: credential.id,
      issuerDid: credential.issuer.did,
      reasonCode: parsed.reasonCode,
    });

    const revokedAt = new Date();
    await prisma.credential.update({
      where: { id },
      data: {
        status: "REVOKED",
        revocationReason: parsed.reasonCode,
        revokedAt,
        ledgerTxRef: ledgerReceipt.txRef,
      },
    });

    await recordAuditEvent({
      actorId: session.id,
      action: "REVOKE_CREDENTIAL",
      targetRef: credential.id,
      result: "SUCCESS",
    });

    return apiSuccess({
      credentialId: credential.id,
      status: "REVOKED",
      reasonCode: parsed.reasonCode,
      revokedAt: revokedAt.toISOString(),
      receipt: {
        transactionId: ledgerReceipt.txRef,
        credentialId: credential.id,
        issuerDid: credential.issuer.did,
        reasonCode: parsed.reasonCode,
        blockHash: ledgerReceipt.hash,
        timestamp: ledgerReceipt.timestamp,
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
