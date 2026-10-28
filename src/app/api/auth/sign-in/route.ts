import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { setSessionCookie } from "@/layers/api/auth-session";
import { checkRateLimit } from "@/layers/api/rate-limiter";
import { signInSchema } from "@/layers/api/validation/schemas";
import { recordAuditEvent } from "@/layers/policy/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const rateCheck = checkRateLimit(`sign-in-${ip}`, 10, 60);

    if (!rateCheck.allowed) {
      return apiError(
        new Error("Too many sign-in attempts. Please try again in one minute."),
        "RATE_LIMIT_EXCEEDED",
        429
      );
    }

    const body = await req.json();
    const parsed = signInSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase().trim() },
      include: { issuerProfile: true },
    });

    if (!user) {
      await recordAuditEvent({
        action: "USER_LOGIN",
        targetRef: parsed.email,
        result: "FAILURE",
      });
      return apiError(
        new Error("Invalid email or password."),
        "INVALID_CREDENTIALS",
        401
      );
    }

    const validPassword = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!validPassword) {
      await recordAuditEvent({
        actorId: user.id,
        action: "USER_LOGIN",
        targetRef: user.email,
        result: "FAILURE",
      });
      return apiError(
        new Error("Invalid email or password."),
        "INVALID_CREDENTIALS",
        401
      );
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role as any,
      issuerId: user.issuerProfile?.id,
    };

    await setSessionCookie(sessionPayload);

    await recordAuditEvent({
      actorId: user.id,
      action: "USER_LOGIN",
      targetRef: user.email,
      result: "SUCCESS",
    });

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        issuerId: user.issuerProfile?.id,
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
