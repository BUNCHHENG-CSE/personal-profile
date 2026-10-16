import { db } from "@/lib/db";
import { admin, body, failure, json, rateLimit, sameOrigin } from "@/lib/security";
import { themeInput } from "@/lib/validation";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  if (!await admin()) return failure("Unauthorized", 401);
  if (!sameOrigin(request)) return failure("Invalid origin", 403);
  const { id } = await context.params;
  if (!/^[a-z0-9]{10,40}$/.test(id)) return failure("Invalid id", 400);
  try {
    if (!await rateLimit(request, "admin-theme", 30, 3600)) return failure("Too many requests", 429);
    const parsed = themeInput.safeParse(await body(request, 4096));
    if (!parsed.success) return failure("Invalid theme", 400);
    const data = await db.$transaction(async tx => {
      const found = await tx.theme.findFirst({ where: { id, profileId: "main" } });
      if (!found) return null;
      if (parsed.data.isActive) await tx.theme.updateMany({ where: { profileId: "main", isActive: true }, data: { isActive: false } });
      return tx.theme.update({ where: { id }, data: { name: parsed.data.name, configuration: parsed.data.configuration, isActive: parsed.data.isActive || found.isActive } });
    });
    return data ? json({ data }) : failure("Theme not found", 404);
  } catch (error) { console.error("theme PATCH", error); return failure("Could not save theme", 503); }
}
export async function DELETE(request: Request, context: Context) {
  if (!await admin()) return failure("Unauthorized", 401);
  if (!sameOrigin(request)) return failure("Invalid origin", 403);
  const { id } = await context.params;
  if (!/^[a-z0-9]{10,40}$/.test(id)) return failure("Invalid id", 400);
  try {
    if (!await rateLimit(request, "admin-theme", 30, 3600)) return failure("Too many requests", 429);
    const theme = await db.theme.findFirst({ where: { id, profileId: "main" } });
    if (!theme) return failure("Theme not found", 404);
    if (theme.isActive) return failure("Activate another theme first", 409);
    await db.theme.delete({ where: { id } });
    return json({ data: { deleted: true } });
  } catch (error) { console.error("theme DELETE", error); return failure("Could not delete theme", 503); }
}
