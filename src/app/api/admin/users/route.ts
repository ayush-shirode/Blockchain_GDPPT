import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    requireRole(user, ["ADMIN"]);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        issuerProfile: {
          select: { organizationName: true, did: true, trustStatus: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const mapped = users.map((u) => ({
      id: u.id,
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      issuer: u.issuerProfile,
    }));

    return apiSuccess({ users: mapped });
  } catch (err) {
    return apiError(err);
  }
}
