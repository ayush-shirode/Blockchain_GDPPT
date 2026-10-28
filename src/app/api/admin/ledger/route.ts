import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";
import { getLedgerAdapter } from "@/layers/ledger";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    requireRole(user, ["ADMIN"]);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "15", 10);
    const eventType = searchParams.get("eventType") || undefined;

    const ledger = getLedgerAdapter();
    const result = await ledger.listEvents({
      page,
      pageSize,
      eventType,
    });

    const isOutage =
      "isOutageSimulated" in ledger
        ? await (ledger as any).isOutageSimulated()
        : false;

    return apiSuccess({
      ...result,
      mode: ledger.mode,
      isOutageSimulated: isOutage,
    });
  } catch (err) {
    return apiError(err);
  }
}
