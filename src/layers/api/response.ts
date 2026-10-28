import { NextResponse } from "next/server";
import { ZodError } from "zod";
import crypto from "crypto";
import { AuthorizationError } from "@/layers/policy/access-control";

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    correlationId: string;
    details?: unknown;
  };
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function apiError(
  err: unknown,
  customCode?: string,
  statusCode = 500
): NextResponse<ApiErrorEnvelope> {
  const correlationId = `err-${crypto.randomBytes(6).toString("hex")}`;

  if (err instanceof AuthorizationError) {
    return NextResponse.json(
      {
        error: {
          code: err.code,
          message: err.message,
          correlationId,
        },
      },
      { status: err.statusCode }
    );
  }

  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: issues.join("; ") || "Request payload validation failed",
          correlationId,
        },
      },
      { status: 400 }
    );
  }

  const message =
    err instanceof Error && process.env.NODE_ENV !== "production"
      ? err.message
      : "An unexpected error occurred. Please try again later.";

  const code =
    customCode ||
    (err instanceof Error && err.message.startsWith("LEDGER_UNAVAILABLE")
      ? "LEDGER_UNAVAILABLE"
      : "INTERNAL_SERVER_ERROR");

  return NextResponse.json(
    {
      error: {
        code,
        message,
        correlationId,
      },
    },
    { status: statusCode }
  );
}
