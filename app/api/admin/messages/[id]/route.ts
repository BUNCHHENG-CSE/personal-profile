import { db } from "@/lib/db";
import { admin, body, failure, json, rateLimit, sameOrigin } from "@/lib/security";
import { z } from "zod";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  if (!await admin()) return failure("Unauthorized", 401);
  if (!sameOrigin(request)) return failure("Invalid origin", 403);
  const { id } = await context.params;
  if (!/^[a-z0-9]{10,40}$/.test(id)) return failure("Invalid id", 400);
  try {
    if (!await rateLimit(request, "admin-message", 60, 3600)) return failure("Too many requests", 429);
    const parsed = z.object({ status: z.enum(["APPROVED", "REJECTED"]) }).strict().safeParse(await body(request, 512));
    if (!parsed.success) return failure("Invalid status", 400);
    const found = await db.message.findFirst({ where: { id, profileId: "main" } });
    if (!found) return failure("Message not found", 404);
    return json({ data: await db.message.update({ where: { id }, data: { status: parsed.data.status, moderatedAt: new Date() } }) });
  } catch (error) { console.error("message PATCH", error); return failure("Could not moderate message", 503); }
}
export async function DELETE(request: Request, context: Context) {
  if (!await admin()) return failure("Unauthorized", 401);
  if (!sameOrigin(request)) return failure("Invalid origin", 403);
  const { id } = await context.params;
  if (!/^[a-z0-9]{10,40}$/.test(id)) return failure("Invalid id", 400);
  try {
    if (!await rateLimit(request, "admin-message", 60, 3600)) return failure("Too many requests", 429);
    const result = await db.message.deleteMany({ where: { id, profileId: "main" } });
    return result.count ? json({ data: { deleted: true } }) : failure("Message not found", 404);
  } catch (error) { console.error("message DELETE", error); return failure("Could not delete message", 503); }
}
