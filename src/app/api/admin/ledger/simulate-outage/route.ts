import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";
import { outageToggleSchema } from "@/layers/api/validation/schemas";
import { recordAuditEvent } from "@/layers/policy/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["ADMIN"]);

    const body = await req.json();
    const parsed = outageToggleSchema.parse(body);

    const updated = await prisma.systemSetting.upsert({
      where: { key: "LEDGER_OUTAGE_SIMULATION" },
      update: { value: parsed.simulateOutage ? "true" : "false" },
      create: { key: "LEDGER_OUTAGE_SIMULATION", value: parsed.simulateOutage ? "true" : "false" },
    });

    await recordAuditEvent({
      actorId: session.id,
      action: "LEDGER_OUTAGE_TOGGLE",
      targetRef: `simulateOutage=${parsed.simulateOutage}`,
      result: "SUCCESS",
    });

    return apiSuccess({
      simulateOutage: updated.value === "true",
      updatedAt: updated.updatedAt.toISOString(),
      message:
        updated.value === "true"
          ? "Ledger outage simulation is now ENABLED. Verifications will report 'Unable to verify'."
          : "Ledger outage simulation is now DISABLED. Normal ledger queries restored.",
    });
  } catch (err) {
    return apiError(err);
  }
}
