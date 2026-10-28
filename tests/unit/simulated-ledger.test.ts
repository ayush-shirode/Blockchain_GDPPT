import { describe, it, expect, beforeEach } from "vitest";
import { SimulatedLedger } from "@/layers/ledger/simulated-ledger";
import { prisma } from "@/lib/prisma";

describe("SimulatedLedger & Integrity", () => {
  const ledger = new SimulatedLedger();

  it("should report healthy status when outage is not simulated", async () => {
    const health = await ledger.health();
    expect(health.status).toBe("up");
  });

  it("should successfully verify integrity of seeded ledger events", async () => {
    const result = await ledger.verifyIntegrity();
    expect(result.ok).toBe(true);
    expect(result.checked).toBeGreaterThan(0);
    expect(result.firstBrokenIndex).toBeUndefined();
  });

  it("should record a new issuance and update hash chain", async () => {
    const initialEvents = await prisma.ledgerEvent.count();
    const receipt = await ledger.recordIssuance({
      credentialId: "urn:uuid:test-cred-123",
      credentialHash: "a".repeat(64),
      issuerDid: "did:web:gov.example:issuers:test-issuer",
    });

    expect(receipt.txRef).toContain("sim-tx-");
    expect(receipt.hash).toBeDefined();

    const afterCount = await prisma.ledgerEvent.count();
    expect(afterCount).toBe(initialEvents + 1);

    const integrity = await ledger.verifyIntegrity();
    expect(integrity.ok).toBe(true);
  });

  it("should record revocation and reflect status as REVOKED", async () => {
    const credId = `urn:uuid:test-revoke-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await ledger.recordIssuance({
      credentialId: credId,
      credentialHash: "b".repeat(64),
      issuerDid: "did:web:gov.example:issuers:test-issuer",
    });

    let status = await ledger.getStatus(credId);
    expect(status.status).toBe("ACTIVE");

    await ledger.recordRevocation({
      credentialId: credId,
      issuerDid: "did:web:gov.example:issuers:test-issuer",
      reasonCode: "LOST_DEVICE",
    });

    status = await ledger.getStatus(credId);
    expect(status.status).toBe("REVOKED");
  });

  it("should detect tampering if a block hash is altered", async () => {
    // Find the latest event
    const latest = await prisma.ledgerEvent.findFirst({
      orderBy: { index: "desc" },
    });
    expect(latest).toBeDefined();

    if (latest) {
      const originalHash = latest.hash;
      // Tamper with hash
      await prisma.ledgerEvent.update({
        where: { index: latest.index },
        data: { hash: "deadbeef".repeat(8) },
      });

      const integrity = await ledger.verifyIntegrity();
      expect(integrity.ok).toBe(false);
      expect(integrity.firstBrokenIndex).toBe(latest.index);

      // Restore original hash
      await prisma.ledgerEvent.update({
        where: { index: latest.index },
        data: { hash: originalHash },
      });
    }
  });
});
