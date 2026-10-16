import { db } from "@/lib/db";
import { body, failure, rateLimit, sameOrigin, json } from "@/lib/security";
import { messageInput } from "@/lib/validation";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Invalid origin", 403);
  try {
    if (!await rateLimit(request, "message", 3, 3600)) return failure("Please try again later", 429);
    const parsed = messageInput.safeParse(await body(request, 2048));
    if (!parsed.success) return failure("Invalid message", 400);
    if (parsed.data.website) return json({ data: { accepted: true } }, 202);
    const profile = await db.profile.findUnique({ where: { id: "main" } });
    if (!profile?.messagesEnabled) return failure("Messages are unavailable", 503);
    await db.message.create({ data: { profileId: "main", content: parsed.data.content } });
    return json({ data: { accepted: true } }, 202);
  } catch (error) { console.error("message POST", error); return failure("Messages are temporarily unavailable", 503); }
}
