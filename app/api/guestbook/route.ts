import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { body, failure, json, rateLimit, sameOrigin } from "@/lib/security";
import { guestbookInput, type GuestbookStamp } from "@/lib/validation";
import { extractGeoFromRequest } from "@/lib/visitor";

export const runtime = "nodejs";

const DEFAULT_STAMPS: GuestbookStamp[] = [
  {
    id: "stamp-seed-1",
    callsign: "Viper_Nine",
    platform: "steam",
    sticker: "gg",
    favoriteGame: "Valorant & Lethal Company",
    message: "Clean setup! Add me on Steam for casual lobbies.",
    countryFlag: "🇺🇸",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isPinned: true,
  },
  {
    id: "stamp-seed-2",
    callsign: "KuroNeko",
    platform: "discord",
    sticker: "chill",
    favoriteGame: "Stardew Valley",
    message: "Loved the chill lo-fi player and cozy games shelf. GG!",
    countryFlag: "🇯🇵",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    isPinned: true,
  },
  {
    id: "stamp-seed-3",
    callsign: "Bagas_Gamer",
    platform: "pc_casual",
    sticker: "gamepad",
    favoriteGame: "Hades & Balatro",
    message: "Potato PC optimizations worked wonders on my laptop! Thank you brother.",
    countryFlag: "🇮🇩",
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    isPinned: false,
  },
];

declare global {
  var __guestbookStamps: GuestbookStamp[] | undefined;
}

if (!globalThis.__guestbookStamps) {
  globalThis.__guestbookStamps = DEFAULT_STAMPS;
}

export async function GET() {
  try {
    const profile = await db.profile.findUnique({
      where: { id: "main" },
      select: { gamingSetup: true },
    });

    const setup = (profile?.gamingSetup as Record<string, unknown>) || {};
    const config = setup.guestbook as { enabled?: boolean; stamps?: GuestbookStamp[] } | undefined;

    const stamps = config?.stamps?.length ? config.stamps : globalThis.__guestbookStamps || DEFAULT_STAMPS;
    return json({ stamps, enabled: config?.enabled !== false });
  } catch {
    return json({ stamps: globalThis.__guestbookStamps || DEFAULT_STAMPS, enabled: true });
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("Invalid origin", 403);

  try {
    // Rate limit: 5 guestbook entries per 10 minutes per IP
    const allowed = await rateLimit(request, "guestbook", 5, 600);
    if (!allowed) {
      return failure("Arcade terminal cooling down... please wait a moment!", 429);
    }

    const payload = await body(request, 2048);
    const parsed = guestbookInput.safeParse(payload);
    if (!parsed.success) {
      return failure("Invalid stamp details", 400);
    }

    const geo = extractGeoFromRequest(request);

    const newStamp: GuestbookStamp = {
      id: randomUUID(),
      callsign: parsed.data.callsign,
      platform: parsed.data.platform,
      sticker: parsed.data.sticker,
      favoriteGame: parsed.data.favoriteGame || undefined,
      message: parsed.data.message,
      countryFlag: geo.countryFlag,
      createdAt: new Date().toISOString(),
      isPinned: false,
    };

    // Update in-memory ring buffer
    const current = globalThis.__guestbookStamps || [];
    globalThis.__guestbookStamps = [newStamp, ...current].slice(0, 50);

    // Persist to Postgres database if available
    try {
      const profile = await db.profile.findUnique({ where: { id: "main" } });
      if (profile) {
        const setup = (profile.gamingSetup as Record<string, unknown>) || {};
        const config = (setup.guestbook as Record<string, unknown>) || {};
        const existingStamps = (config.stamps as GuestbookStamp[]) || [];

        const updatedStamps = [newStamp, ...existingStamps].slice(0, 50);

        await db.profile.update({
          where: { id: "main" },
          data: {
            gamingSetup: {
              ...setup,
              guestbook: {
                ...config,
                enabled: config.enabled !== false,
                stamps: updatedStamps,
              },
            },
          },
        });
      }
    } catch (dbErr) {
      console.warn("Guestbook db write skipped:", dbErr instanceof Error ? dbErr.message : "timeout");
    }

    return json({ success: true, stamp: newStamp });
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Could not sign guestbook", 500);
  }
}
