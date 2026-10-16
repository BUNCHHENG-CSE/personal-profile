import { db } from "@/lib/db";
import { admin, body, failure, json, rateLimit, sameOrigin } from "@/lib/security";
import { themeInput } from "@/lib/validation";
export const runtime = "nodejs";
export async function GET() { if (!await admin()) return failure("Unauthorized", 401); return json({ data: await db.theme.findMany({ where: { profileId: "main" }, orderBy: { createdAt: "asc" } }) }); }
export async function POST(request: Request) {
  if (!await admin()) return failure("Unauthorized", 401);
  if (!sameOrigin(request)) return failure("Invalid origin", 403);
  try {
    if (!await rateLimit(request, "admin-theme", 30, 3600)) return failure("Too many requests", 429);
    const parsed = themeInput.safeParse(await body(request, 4096));
    if (!parsed.success) return failure("Invalid theme", 400);
    const data = await db.$transaction(async tx => {
      if (parsed.data.isActive) await tx.theme.updateMany({ where: { profileId: "main", isActive: true }, data: { isActive: false } });
      return tx.theme.create({ data: { profileId: "main", name: parsed.data.name, configuration: parsed.data.configuration, isActive: parsed.data.isActive || false } });
    });
    return json({ data }, 201);
  } catch (error) { console.error("theme POST", error); return failure("Could not create theme", 503); }
}
