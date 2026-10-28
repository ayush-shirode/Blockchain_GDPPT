import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";
import { getLedgerAdapter } from "@/layers/ledger";
import { recordAuditEvent } from "@/layers/policy/audit-logger";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const session = requireRole(user, ["ADMIN"]);

    const ledger = getLedgerAdapter();
    const result = await ledger.verifyIntegrity();

    await recordAuditEvent({
      actorId: session.id,
      action: "INTEGRITY_CHECK",
      result: result.ok ? "SUCCESS" : "FAILURE",
    });

    return apiSuccess({
      integrity: result,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return apiError(err);
  }
}
