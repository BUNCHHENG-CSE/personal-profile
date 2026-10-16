import { db } from "@/lib/db";
import {
  admin,
  body,
  failure,
  json,
  rateLimit,
  sameOrigin,
} from "@/lib/security";
import { profileInput } from "@/lib/validation";
export const runtime = "nodejs";
export async function GET() {
  if (!(await admin())) return failure("Unauthorized", 401);
  const data = await db.profile.findUnique({ where: { id: "main" } });
  return json({ data });
}
export async function PATCH(request: Request) {
  if (!(await admin())) return failure("Unauthorized", 401);
  if (!sameOrigin(request)) return failure("Invalid origin", 403);
  try {
    if (!(await rateLimit(request, "admin-profile", 30, 3600)))
      return failure("Too many requests", 429);
    const parsed = profileInput.safeParse(await body(request, 65536));
    if (!parsed.success)
      return json(
        { error: "Invalid profile", issues: parsed.error.flatten() },
        400,
      );
    const data = await db.profile.update({
      where: { id: "main" },
      data: {
        ...parsed.data,
        socialLinks: parsed.data.socialLinks,
        gamingSetup: parsed.data.gamingSetup ?? {},
        favoriteGames: parsed.data.favoriteGames ?? [],
      },
    });
    return json({ data });
  } catch (error) {
    console.error("admin profile PATCH", error);
    return failure("Could not save profile", 503);
  }
}
