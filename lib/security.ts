import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export const failure = (message: string, status: number) => json({ error: message }, status);
export function hash(value: string) { const secret = process.env.BETTER_AUTH_SECRET; if (!secret || secret.length < 32) throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters"); return createHmac("sha256", secret).update(value).digest("hex"); }
export async function admin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin" || session.user.email !== process.env.ADMIN_EMAIL) return null;
  return session.user;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}
export async function rateLimit(request: Request, scope: string, max: number, seconds: number) {
  try {
    const ip = process.env.VERCEL ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() : "local";
    if (!ip) return false;
    const key = `${scope}:${hash(ip).slice(0, 50)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + seconds * 1000);
    await db.$executeRaw`INSERT INTO "RateBucket" ("key", "count", "expiresAt") VALUES (${key}, 1, ${expiresAt}) ON CONFLICT ("key") DO UPDATE SET "count" = CASE WHEN "RateBucket"."expiresAt" < ${now} THEN 1 ELSE "RateBucket"."count" + 1 END, "expiresAt" = CASE WHEN "RateBucket"."expiresAt" < ${now} THEN ${expiresAt} ELSE "RateBucket"."expiresAt" END`;
    const bucket = await db.rateBucket.findUnique({ where: { key } });
    return !!bucket && bucket.count <= max;
  } catch (error) {
    // Fail-open if rate limiting DB query times out or fails
    console.warn("Rate limit check failed open:", error instanceof Error ? error.message : "DB timeout");
    return true;
  }
}
export async function body(request: Request, limit = 4096) {
  const raw = await request.text();
  if (raw.length > limit) throw new Error("PAYLOAD_TOO_LARGE");
  return JSON.parse(raw) as unknown;
}
