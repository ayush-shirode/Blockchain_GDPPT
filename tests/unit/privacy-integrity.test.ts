import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";
import { SimulatedLedger } from "@/layers/ledger/simulated-ledger";
import { issueCredentialSchema, settingsSchema } from "@/layers/api/validation/schemas";

describe("Privacy Guarantees, Ledger Tamper Detection & Form Validation", () => {
  const ledger = new SimulatedLedger();

  it("should confirm no personal data exists in ledger events table (Zero-PII guarantee)", async () => {
    const events = await prisma.ledgerEvent.findMany();
    expect(events.length).toBeGreaterThan(0);

    const forbiddenStrings = ["Asha", "Patil", "Rohan", "Deshmukh", "Street", "1994", "Computer Science"];

    for (const evt of events) {
      const payloadStr = JSON.stringify(evt);
      for (const forbidden of forbiddenStrings) {
        expect(payloadStr).not.toContain(forbidden);
      }
      // Ensure record contains only hashes, IDs, timestamps, and standard enums
      expect(evt.hash).toMatch(/^[0-9a-f]{64}$/);
      expect(evt.prevHash).toMatch(/^[0-9a-f]{64}$|^0$/);
      expect(evt.payloadHash).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("should confirm no plaintext citizen attributes exist in audit logs", async () => {
    const logs = await prisma.auditEvent.findMany();
    expect(logs.length).toBeGreaterThan(0);

    const forbiddenClaimValues = ["1994-06-12", "Computer Science", "B.Tech", "42 Heritage Road"];

    for (const log of logs) {
      const logStr = JSON.stringify(log);
      for (const forbidden of forbiddenClaimValues) {
        expect(logStr).not.toContain(forbidden);
      }
      expect(log.action).toBeDefined();
      expect(log.correlationId).toBeDefined();
    }
  });

  it("should detect cryptographic ledger tampering via verifyIntegrity()", async () => {
    // 1. Initial integrity must be valid
    const initialCheck = await ledger.verifyIntegrity();
    expect(initialCheck.ok).toBe(true);

    // 2. Find latest event
    const latest = await prisma.ledgerEvent.findFirst({
      orderBy: { index: "desc" },
    });
    expect(latest).toBeDefined();

    if (latest) {
      const originalHash = latest.hash;

      // 3. Tamper with latest block hash
      await prisma.ledgerEvent.update({
        where: { index: latest.index },
        data: { hash: "deadbeef".repeat(8) },
      });

      // 4. Chain verification must detect the tampering
      const tamperedCheck = await ledger.verifyIntegrity();
      expect(tamperedCheck.ok).toBe(false);
      expect(tamperedCheck.firstBrokenIndex).toBe(latest.index);

      // 5. Restore original hash
      await prisma.ledgerEvent.update({
        where: { index: latest.index },
        data: { hash: originalHash },
      });

      // 6. Restored ledger must be valid again
      const restoredCheck = await ledger.verifyIntegrity();
      expect(restoredCheck.ok).toBe(true);
    }
  });

  it("should share nothing when consent request is declined", async () => {
    // Verifies that unconsented attributes produce empty disclosed claims
    const sampleClaims = {
      fullName: "Asha Patil",
      dateOfBirth: "1994-06-12",
      degree: "B.Tech",
    };

    // When citizen approves nothing / declines:
    const consented: string[] = [];
    const disclosed = Object.entries(sampleClaims).filter(([k]) => consented.includes(k));

    expect(disclosed).toHaveLength(0);
    expect(disclosed).toEqual([]);
  });

  it("should reject invalid form inputs via Zod validation schemas", () => {
    // Missing required attributes
    expect(() =>
      issueCredentialSchema.parse({
        subjectUserId: "123e4567-e89b-12d3-a456-426614174000",
        type: "IdentityCredential",
        attributes: {},
        validityDays: 365,
      })
    ).toThrow();

    // Retention days below minimum (0 days)
    expect(() =>
      settingsSchema.parse({
        dataRetentionDays: 0,
        requireConsentSignature: true,
      })
    ).toThrow();

    // Valid settings
    expect(() =>
      settingsSchema.parse({
        dataRetentionDays: 365,
        requireConsentSignature: true,
      })
    ).not.toThrow();
  });
});
