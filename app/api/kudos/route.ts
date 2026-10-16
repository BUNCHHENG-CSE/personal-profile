import { db } from "@/lib/db";
import { failure, json, rateLimit, sameOrigin, body } from "@/lib/security";
import { kudosInput, type KudosRecord } from "@/lib/validation";

export const runtime = "nodejs";

const DEFAULT_KUDOS: Required<KudosRecord> = {
  enabled: true,
  gg: 128,
  hype: 86,
  cracked: 64,
  respect: 142,
  mvp: 45,
};

export async function GET() {
  try {
    const profile = await db.profile.findUnique({
      where: { id: "main" },
      select: { gamingSetup: true },
    });

    const setup = (profile?.gamingSetup as Record<string, unknown>) || {};
    const stored = (setup.kudos as Partial<KudosRecord>) || {};

    const kudos: Required<KudosRecord> = {
      enabled: stored.enabled !== false,
      gg: typeof stored.gg === "number" ? stored.gg : DEFAULT_KUDOS.gg,
      hype: typeof stored.hype === "number" ? stored.hype : DEFAULT_KUDOS.hype,
      cracked: typeof stored.cracked === "number" ? stored.cracked : DEFAULT_KUDOS.cracked,
      respect: typeof stored.respect === "number" ? stored.respect : DEFAULT_KUDOS.respect,
      mvp: typeof stored.mvp === "number" ? stored.mvp : DEFAULT_KUDOS.mvp,
    };

    return json({ kudos });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not fetch kudos", 500);
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Invalid origin", 403);

  try {
    // Rate limit: 60 reactions per 10 minutes per IP
    const allowed = await rateLimit(request, "kudos", 60, 600);
    if (!allowed) {
      return failure("Recharging arcade battery... please wait a bit!", 429);
    }

    const payload = await body(request, 1024);
    const parsed = kudosInput.safeParse(payload);
    if (!parsed.success) {
      return failure("Invalid kudos reaction", 400);
    }

    const { reaction } = parsed.data;

    // Fetch and atomically update kudos within profile
    const profile = await db.profile.findUnique({
      where: { id: "main" },
    });

    if (!profile) return failure("Profile not found", 404);

    const setup = (profile.gamingSetup as Record<string, unknown>) || {};
    const currentKudos = (setup.kudos as Partial<KudosRecord>) || {};

    const currentCount = typeof currentKudos[reaction] === "number"
      ? (currentKudos[reaction] as number)
      : DEFAULT_KUDOS[reaction];

    const updatedKudos: Required<KudosRecord> = {
      enabled: currentKudos.enabled !== false,
      gg: typeof currentKudos.gg === "number" ? currentKudos.gg : DEFAULT_KUDOS.gg,
      hype: typeof currentKudos.hype === "number" ? currentKudos.hype : DEFAULT_KUDOS.hype,
      cracked: typeof currentKudos.cracked === "number" ? currentKudos.cracked : DEFAULT_KUDOS.cracked,
      respect: typeof currentKudos.respect === "number" ? currentKudos.respect : DEFAULT_KUDOS.respect,
      mvp: typeof currentKudos.mvp === "number" ? currentKudos.mvp : DEFAULT_KUDOS.mvp,
      [reaction]: currentCount + 1,
    };

    await db.profile.update({
      where: { id: "main" },
      data: {
        gamingSetup: {
          ...setup,
          kudos: updatedKudos,
        },
      },
    });

    return json({ success: true, kudos: updatedKudos, incremented: reaction });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not record kudos", 500);
  }
}
