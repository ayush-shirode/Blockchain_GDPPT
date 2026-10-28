import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    requireRole(user, ["ISSUER"]);

    const citizens = await prisma.user.findMany({
      where: { role: "CITIZEN" },
      select: {
        id: true,
        displayName: true,
        email: true,
      },
      orderBy: { displayName: "asc" },
    });

    return apiSuccess({ subjects: citizens });
  } catch (err) {
    return apiError(err);
  }
}
