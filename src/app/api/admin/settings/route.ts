import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";
import { requireRole } from "@/layers/policy/access-control";
import { settingsSchema } from "@/layers/api/validation/schemas";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    requireRole(user, ["ADMIN"]);

    const settings = await prisma.systemSetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    return apiSuccess({
      settings: {
        dataRetentionDays: parseInt(map.DATA_RETENTION_DAYS || "365", 10),
        requireConsentSignature: map.REQUIRE_CONSENT_SIGNATURE === "true",
        ledgerOutageSimulated: map.LEDGER_OUTAGE_SIMULATION === "true",
      },
    });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    requireRole(user, ["ADMIN"]);

    const body = await req.json();
    const parsed = settingsSchema.parse(body);

    await prisma.systemSetting.upsert({
      where: { key: "DATA_RETENTION_DAYS" },
      update: { value: String(parsed.dataRetentionDays) },
      create: { key: "DATA_RETENTION_DAYS", value: String(parsed.dataRetentionDays) },
    });

    await prisma.systemSetting.upsert({
      where: { key: "REQUIRE_CONSENT_SIGNATURE" },
      update: { value: parsed.requireConsentSignature ? "true" : "false" },
      create: { key: "REQUIRE_CONSENT_SIGNATURE", value: parsed.requireConsentSignature ? "true" : "false" },
    });

    return apiSuccess({
      saved: true,
      settings: parsed,
    });
  } catch (err) {
    return apiError(err);
  }
}
