import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    requireRole(user, ["ADMIN"]);

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || undefined;
    const format = searchParams.get("format");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};
    if (action) where.action = action;

    const events = await prisma.auditEvent.findMany({
      where,
      include: {
        actor: {
          select: { displayName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    if (format === "csv") {
      const headers = "ID,Timestamp,Actor,Action,TargetRef,Result,CorrelationID\n";
      const rows = events
        .map(
          (e) =>
            `"${e.id}","${e.createdAt.toISOString()}","${e.actor?.email || "System"}","${e.action}","${e.targetRef || ""}","${e.result}","${e.correlationId}"`
        )
        .join("\n");

      return new NextResponse(headers + rows, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="audit_logs.csv"',
        },
      });
    }

    const mapped = events.map((e) => ({
      id: e.id,
      actorName: e.actor?.displayName || "System / Anonymous",
      actorEmail: e.actor?.email || null,
      actorRole: e.actor?.role || null,
      action: e.action,
      targetRef: e.targetRef,
      result: e.result,
      correlationId: e.correlationId,
      createdAt: e.createdAt.toISOString(),
    }));

    return apiSuccess({ events: mapped });
  } catch (err) {
    return apiError(err);
  }
}
