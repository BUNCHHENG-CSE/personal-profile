import { db } from "@/lib/db";
import { admin, failure, json, rateLimit, sameOrigin } from "@/lib/security";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!await admin()) return failure("Unauthorized", 401);
  if (!sameOrigin(request)) return failure("Invalid origin", 403);
  if (!await rateLimit(request, "admin-cleanup", 3, 3600)) return failure("Too many requests", 429);
  const profile = await db.profile.findUnique({ where: { id: "main" } });
  const before = new Date(Date.now() - (profile?.retentionDays || 90) * 86400000);
  const [events, messages, buckets, loginBuckets] = await Promise.all([db.analyticsEvent.deleteMany({ where: { occurredAt: { lt: before } } }), db.message.deleteMany({ where: { createdAt: { lt: before } } }), db.rateBucket.deleteMany({ where: { expiresAt: { lt: new Date() } } }), db.rateLimit.deleteMany({ where: { lastRequest: { lt: BigInt(Date.now() - 86400000) } } })]);
  return json({ data: { events: events.count, messages: messages.count, buckets: buckets.count + loginBuckets.count } });
}
