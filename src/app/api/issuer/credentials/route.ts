import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";
import { issueCredentialSchema } from "@/layers/api/validation/schemas";
import { createSaltedClaims } from "@/layers/identity/selective-disclosure";
import { createAndSignVcJwt } from "@/layers/identity/vc-jwt";
import { getLedgerAdapter } from "@/layers/ledger";
import { recordAuditEvent } from "@/layers/policy/audit-logger";
import { parseDid } from "@/layers/identity/did";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["ISSUER"]);

    const issuer = await prisma.issuer.findUnique({
      where: { userId: session.id },
    });

    if (!issuer) {
      return apiError(
        new Error("Issuer profile not found for this account."),
        "NOT_FOUND",
        404
      );
    }

    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get("type");
    const statusFilter = searchParams.get("status");

    const where: any = { issuerId: issuer.id };
    if (typeFilter) where.type = typeFilter;
    if (statusFilter) where.status = statusFilter;

    const credentials = await prisma.credential.findMany({
      where,
      include: {
        subjectUser: {
          select: { displayName: true, email: true },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    const mapped = credentials.map((c) => ({
      id: c.id,
      type: c.type,
      subjectName: c.subjectUser.displayName,
      subjectEmail: c.subjectUser.email,
      status: c.status,
      issuedAt: c.issuedAt.toISOString(),
      expiresAt: c.expiresAt.toISOString(),
      revokedAt: c.revokedAt?.toISOString() || null,
      revocationReason: c.revocationReason,
      credentialHash: c.credentialHash,
      ledgerTxRef: c.ledgerTxRef,
    }));

    return apiSuccess({ credentials: mapped, issuer });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["ISSUER"]);

    const issuer = await prisma.issuer.findUnique({
      where: { userId: session.id },
    });

    if (!issuer) {
      return apiError(
        new Error("Issuer profile not found for this account."),
        "NOT_FOUND",
        404
      );
    }

    const body = await req.json();
    const parsed = issueCredentialSchema.parse(body);

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

    const { saltedClaims, claimsHashes } = createSaltedClaims(parsed.attributes);
    const credentialId = `urn:uuid:${crypto.randomUUID()}`;
    const issuedAt = new Date();
    const expiresAt = new Date(
      Date.now() + parsed.validityDays * 24 * 60 * 60 * 1000
    );

    // Extract issuer slug from DID
    const { slug } = parseDid(issuer.did);
    const issuerSlug = slug || "demo-municipal-corporation";

    // Sign W3C VC-JWT
    const { jwtRaw, credentialHash } = await createAndSignVcJwt(
      {
        jti: credentialId,
        iss: issuer.did,
        sub: `urn:uuid:${subject.id}`,
        type: parsed.type,
        claimsHashes,
        issuedAt,
        expiresAt,
      },
      issuerSlug
    );

    // Record on LedgerAdapter
    const ledger = getLedgerAdapter();
    const ledgerReceipt = await ledger.recordIssuance({
      credentialId,
      credentialHash,
      issuerDid: issuer.did,
    });

    // Save in DB
    const createdCred = await prisma.credential.create({
      data: {
        id: credentialId,
        subjectUserId: subject.id,
        issuerId: issuer.id,
        type: parsed.type,
        claimsData: JSON.stringify(saltedClaims),
        claimsHashes: JSON.stringify(claimsHashes),
        credentialHash,
        jwtRaw,
        status: "ACTIVE",
        issuedAt,
        expiresAt,
        ledgerTxRef: ledgerReceipt.txRef,
      },
    });

    await recordAuditEvent({
      actorId: session.id,
      action: "ISSUE_CREDENTIAL",
      targetRef: credentialId,
      result: "SUCCESS",
    });

    return apiSuccess({
      credential: {
        id: createdCred.id,
        type: createdCred.type,
        subjectName: subject.displayName,
        status: createdCred.status,
        issuedAt: createdCred.issuedAt.toISOString(),
        expiresAt: createdCred.expiresAt.toISOString(),
        credentialHash: createdCred.credentialHash,
        ledgerTxRef: createdCred.ledgerTxRef,
      },
      receipt: {
        transactionId: ledgerReceipt.txRef,
        credentialId,
        issuerDid: issuer.did,
        credentialHash,
        blockHash: ledgerReceipt.hash,
        timestamp: ledgerReceipt.timestamp,
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
