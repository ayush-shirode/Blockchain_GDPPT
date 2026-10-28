import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
  LedgerAdapter,
  LedgerReceipt,
  LedgerEventRecord,
  EventQuery,
  Page,
} from "./types";

const GENESIS_PREV_HASH = "0".repeat(64);

export function computeSha256(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function computeEventHash(params: {
  prevHash: string;
  payloadHash: string;
  eventType: string;
  recordId: string;
  issuerDid: string;
}): string {
  const canonical = `${params.prevHash}:${params.payloadHash}:${params.eventType}:${params.recordId}:${params.issuerDid}`;
  return computeSha256(canonical);
}

export class SimulatedLedger implements LedgerAdapter {
  readonly mode = "simulated" as const;

  async isOutageSimulated(): Promise<boolean> {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "LEDGER_OUTAGE_SIMULATION" },
    });
    return setting?.value === "true";
  }

  async health(): Promise<{ status: "up" | "down"; checkedAt: string }> {
    const checkedAt = new Date().toISOString();
    const outage = await this.isOutageSimulated();
    if (outage) {
      return { status: "down", checkedAt };
    }
    try {
      await prisma.ledgerEvent.count();
      return { status: "up", checkedAt };
    } catch {
      return { status: "down", checkedAt };
    }
  }

  async recordIssuance(e: {
    credentialId: string;
    credentialHash: string;
    issuerDid: string;
  }): Promise<LedgerReceipt> {
    if (await this.isOutageSimulated()) {
      throw new Error("LEDGER_UNAVAILABLE: Ledger outage simulated");
    }

    const payloadCanonical = JSON.stringify({
      credentialId: e.credentialId,
      credentialHash: e.credentialHash,
      issuerDid: e.issuerDid,
      eventType: "ISSUANCE",
    });
    const payloadHash = computeSha256(payloadCanonical);

    const latest = await prisma.ledgerEvent.findFirst({
      orderBy: { index: "desc" },
    });
    const prevHash = latest ? latest.hash : GENESIS_PREV_HASH;
    const hash = computeEventHash({
      prevHash,
      payloadHash,
      eventType: "ISSUANCE",
      recordId: e.credentialId,
      issuerDid: e.issuerDid,
    });

    const created = await prisma.ledgerEvent.create({
      data: {
        eventType: "ISSUANCE",
        recordId: e.credentialId,
        issuerDid: e.issuerDid,
        payloadHash,
        prevHash,
        hash,
      },
    });

    return {
      txRef: `sim-tx-${created.index}-${created.hash.slice(0, 12)}`,
      index: created.index,
      hash: created.hash,
      prevHash: created.prevHash,
      timestamp: created.createdAt.toISOString(),
    };
  }

  async recordRevocation(e: {
    credentialId: string;
    issuerDid: string;
    reasonCode: string;
  }): Promise<LedgerReceipt> {
    if (await this.isOutageSimulated()) {
      throw new Error("LEDGER_UNAVAILABLE: Ledger outage simulated");
    }

    const payloadCanonical = JSON.stringify({
      credentialId: e.credentialId,
      issuerDid: e.issuerDid,
      reasonCode: e.reasonCode,
      eventType: "REVOCATION",
    });
    const payloadHash = computeSha256(payloadCanonical);

    const latest = await prisma.ledgerEvent.findFirst({
      orderBy: { index: "desc" },
    });
    const prevHash = latest ? latest.hash : GENESIS_PREV_HASH;
    const hash = computeEventHash({
      prevHash,
      payloadHash,
      eventType: "REVOCATION",
      recordId: e.credentialId,
      issuerDid: e.issuerDid,
    });

    const created = await prisma.ledgerEvent.create({
      data: {
        eventType: "REVOCATION",
        recordId: e.credentialId,
        issuerDid: e.issuerDid,
        payloadHash,
        prevHash,
        hash,
      },
    });

    return {
      txRef: `sim-tx-${created.index}-${created.hash.slice(0, 12)}`,
      index: created.index,
      hash: created.hash,
      prevHash: created.prevHash,
      timestamp: created.createdAt.toISOString(),
    };
  }

  async getStatus(
    credentialId: string
  ): Promise<{ status: "ACTIVE" | "REVOKED"; txRef: string; at: string }> {
    if (await this.isOutageSimulated()) {
      throw new Error("LEDGER_UNAVAILABLE: Simulated ledger outage");
    }

    const events = await prisma.ledgerEvent.findMany({
      where: { recordId: credentialId },
      orderBy: { index: "desc" },
    });

    if (events.length === 0) {
      throw new Error("LEDGER_RECORD_NOT_FOUND: Credential not found on ledger");
    }

    const latest = events[0];
    const isRevoked = events.some((evt) => evt.eventType === "REVOCATION");

    return {
      status: isRevoked ? "REVOKED" : "ACTIVE",
      txRef: `sim-tx-${latest.index}-${latest.hash.slice(0, 12)}`,
      at: latest.createdAt.toISOString(),
    };
  }

  async listEvents(q: EventQuery): Promise<Page<LedgerEventRecord>> {
    const page = Math.max(1, q.page || 1);
    const pageSize = Math.max(1, Math.min(100, q.pageSize || 10));
    const skip = (page - 1) * pageSize;

    const where: { eventType?: string; issuerDid?: string } = {};
    if (q.eventType) where.eventType = q.eventType;
    if (q.issuerDid) where.issuerDid = q.issuerDid;

    const [items, total] = await Promise.all([
      prisma.ledgerEvent.findMany({
        where,
        orderBy: { index: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.ledgerEvent.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        eventType: item.eventType as "ISSUANCE" | "REVOCATION",
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async verifyIntegrity(): Promise<{
    ok: boolean;
    checked: number;
    firstBrokenIndex?: number;
  }> {
    const events = await prisma.ledgerEvent.findMany({
      orderBy: { index: "asc" },
    });

    if (events.length === 0) {
      return { ok: true, checked: 0 };
    }

    let expectedPrevHash = GENESIS_PREV_HASH;

    for (let i = 0; i < events.length; i++) {
      const evt = events[i];

      // Verify chain link
      if (evt.prevHash !== expectedPrevHash) {
        return { ok: false, checked: i, firstBrokenIndex: evt.index };
      }

      // Recompute hash
      const computed = computeEventHash({
        prevHash: evt.prevHash,
        payloadHash: evt.payloadHash,
        eventType: evt.eventType,
        recordId: evt.recordId,
        issuerDid: evt.issuerDid,
      });

      if (computed !== evt.hash) {
        return { ok: false, checked: i, firstBrokenIndex: evt.index };
      }

      expectedPrevHash = evt.hash;
    }

    return { ok: true, checked: events.length };
  }
}
