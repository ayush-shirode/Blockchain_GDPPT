import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";
import { SimulatedLedger } from "@/layers/ledger/simulated-ledger";
import { executeVerification } from "@/layers/policy/verification-engine";

describe("Verification Engine & Decision Table", () => {
  const ledger = new SimulatedLedger();

  it("should verify a seeded active credential as VALID", async () => {
    const cred = await prisma.credential.findFirst({
      where: {
        status: "ACTIVE",
        issuer: { trustStatus: "TRUSTED" },
        expiresAt: { gt: new Date() },
      },
      include: { issuer: true },
    });

    expect(cred).toBeDefined();
    if (!cred) return;

    const result = await executeVerification({
      jwtRaw: cred.jwtRaw,
      ledger,
    });

    expect(result.outcome).toBe("VALID");
    expect(result.checks.every((c) => c.status === "PASSED")).toBe(true);
  });

  it("should reject tampered signature as INVALID with BAD_SIGNATURE", async () => {
    const cred = await prisma.credential.findFirst({
      where: { status: "ACTIVE" },
    });
    expect(cred).toBeDefined();
    if (!cred) return;

    // Tamper with the JWT signature (last segment)
    const parts = cred.jwtRaw.split(".");
    const tamperedJwt = `${parts[0]}.${parts[1]}.tamperedSignature1234567890`;

    const result = await executeVerification({
      jwtRaw: tamperedJwt,
      ledger,
    });

    expect(result.outcome).toBe("INVALID");
    expect(result.reasonCode).toBe("BAD_SIGNATURE");
  });

  it("should reject credential from untrusted issuer as INVALID with UNTRUSTED_ISSUER", async () => {
    const untrustedCred = await prisma.credential.findFirst({
      where: {
        issuer: { trustStatus: "UNTRUSTED" },
      },
    });

    expect(untrustedCred).toBeDefined();
    if (!untrustedCred) return;

    const result = await executeVerification({
      jwtRaw: untrustedCred.jwtRaw,
      ledger,
    });

    expect(result.outcome).toBe("INVALID");
    expect(result.reasonCode).toBe("UNTRUSTED_ISSUER");
  });

  it("should report expired credential as EXPIRED", async () => {
    const expiredCred = await prisma.credential.findFirst({
      where: { status: "EXPIRED" },
    });

    expect(expiredCred).toBeDefined();
    if (!expiredCred) return;

    const result = await executeVerification({
      jwtRaw: expiredCred.jwtRaw,
      ledger,
    });

    expect(result.outcome).toBe("EXPIRED");
    expect(result.reasonCode).toBe("EXPIRED");
  });

  it("should report revoked credential as REVOKED", async () => {
    const revokedCred = await prisma.credential.findFirst({
      where: { status: "REVOKED" },
    });

    expect(revokedCred).toBeDefined();
    if (!revokedCred) return;

    const result = await executeVerification({
      jwtRaw: revokedCred.jwtRaw,
      ledger,
    });

    expect(result.outcome).toBe("REVOKED");
    expect(result.reasonCode).toBe("REVOKED");
  });

  it("should report UNABLE_TO_VERIFY when ledger outage is simulated, and NEVER VALID", async () => {
    const cred = await prisma.credential.findFirst({
      where: {
        status: "ACTIVE",
        issuer: { trustStatus: "TRUSTED" },
        expiresAt: { gt: new Date() },
      },
    });
    expect(cred).toBeDefined();
    if (!cred) return;

    // Simulate ledger outage
    await prisma.systemSetting.upsert({
      where: { key: "LEDGER_OUTAGE_SIMULATION" },
      update: { value: "true" },
      create: { key: "LEDGER_OUTAGE_SIMULATION", value: "true" },
    });

    const result = await executeVerification({
      jwtRaw: cred.jwtRaw,
      ledger,
    });

    expect(result.outcome).toBe("UNABLE_TO_VERIFY");
    expect(result.reasonCode).toBe("LEDGER_UNAVAILABLE");
    expect(result.outcome).not.toBe("VALID");

    // Restore ledger
    await prisma.systemSetting.update({
      where: { key: "LEDGER_OUTAGE_SIMULATION" },
      data: { value: "false" },
    });
  });
});
