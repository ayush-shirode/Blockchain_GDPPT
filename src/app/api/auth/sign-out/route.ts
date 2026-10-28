import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser, clearSessionCookie } from "@/layers/api/auth-session";
import { recordAuditEvent } from "@/layers/policy/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (user) {
      await recordAuditEvent({
        actorId: user.id,
        action: "USER_LOGOUT",
        result: "SUCCESS",
      });
    }

    await clearSessionCookie();
    return apiSuccess({ signedOut: true });
  } catch (err) {
    return apiError(err);
  }
}
