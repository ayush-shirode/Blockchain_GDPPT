import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/layers/api/response";
import { getSessionUser } from "@/layers/api/auth-session";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    return apiSuccess({ user });
  } catch (err) {
    return apiError(err);
  }
}
