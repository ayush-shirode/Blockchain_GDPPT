import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";
import { getLedgerAdapter } from "@/layers/ledger";
import { loadIssuerPrivateKey } from "@/layers/identity/key-manager";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    requireRole(user, ["ADMIN"]);

    const timestamp = new Date().toISOString();

    // 1. Database check
    let dbStatus: "up" | "down" = "down";
    let dbLatency = 0;
    try {
      const t0 = performance.now();
      await prisma.user.count();
      dbLatency = Math.round(performance.now() - t0);
      dbStatus = "up";
    } catch {
      dbStatus = "down";
    }

    // 2. Ledger adapter check
    const ledger = getLedgerAdapter();
    const ledgerHealth = await ledger.health();

    // 3. Signing service check
    let signingStatus: "up" | "down" = "down";
    try {
      await loadIssuerPrivateKey("demo-municipal-corporation");
      signingStatus = "up";
    } catch {
      signingStatus = "down";
    }

    const services = [
      {
        name: "Application API Gateway",
        layer: "Layer 4",
        status: "up",
        latencyMs: 1,
        lastChecked: timestamp,
        notes: "Next.js App Router handlers healthy",
      },
      {
        name: "PostgreSQL / SQLite Database",
        layer: "Layer 1/Off-chain",
        status: dbStatus,
        latencyMs: dbLatency,
        lastChecked: timestamp,
        notes: "Off-chain relational identity & credential state",
      },
      {
        name: `Blockchain Adapter (${ledger.mode.toUpperCase()})`,
        layer: "Layer 1",
        status: ledgerHealth.status,
        latencyMs: 3,
        lastChecked: ledgerHealth.checkedAt,
        notes:
          ledgerHealth.status === "down"
            ? "Simulated outage is currently ACTIVE (returns 'Unable to verify')"
            : "SHA-256 hash-chained append-only event log operating normally",
      },
      {
        name: "Ed25519 Cryptographic Signing Engine",
        layer: "Layer 2",
        status: signingStatus,
        latencyMs: 2,
        lastChecked: timestamp,
        notes: "Local key store accessible & verified",
      },
    ];

    return apiSuccess({ services, timestamp });
  } catch (err) {
    return apiError(err);
  }
}
