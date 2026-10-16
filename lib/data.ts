import "server-only";
import { db } from "@/lib/db";
import { defaultTheme, themeConfig, socialLink, gamingGear, gameItem } from "@/lib/validation";
import { getSteamProfile } from "@/lib/steam";
import { z } from "zod";
import type { Profile } from "@/generated/prisma/client";

export function editableProfile(profile: Profile) {
  const {
    displayName,
    username,
    bio,
    status,
    avatarUrl,
    bannerUrl,
    musicUrl,
    trackTitle,
    trackArtist,
    seoTitle,
    seoDescription,
    discordId,
    steamId,
    publicMessages,
    messagesEnabled,
    analyticsEnabled,
    retentionDays,
  } = profile;
  return {
    displayName,
    username,
    bio,
    status,
    avatarUrl,
    bannerUrl,
    musicUrl,
    trackTitle,
    trackArtist,
    seoTitle,
    seoDescription,
    discordId: discordId || null,
    steamId: steamId || null,
    publicMessages,
    messagesEnabled,
    analyticsEnabled,
    retentionDays,
    socialLinks: z.array(socialLink).safeParse(profile.socialLinks).data || [],
    gamingSetup: gamingGear.safeParse(profile.gamingSetup).data || {},
    favoriteGames: z.array(gameItem).safeParse(profile.favoriteGames).data || [],
  };
}

export async function ensureProfile() {
  const profile =
    (await db.profile.findUnique({ where: { id: "main" } })) ||
    (await db.profile.create({ data: { id: "main" } }));
  if ((await db.theme.count({ where: { profileId: "main" } })) === 0)
    await db.theme.create({
      data: {
        profileId: "main",
        name: "Nebula",
        configuration: defaultTheme,
        isActive: true,
      },
    });
  return profile;
}

export async function getDiscordPresence(discordId?: string | null) {
  if (!discordId || !/^\d{17,20}$/.test(discordId.trim())) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId.trim()}?_t=${Date.now()}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success && json?.data ? json.data : null;
  } catch {
    return null;
  }
}

export async function publicProfile() {
  const profile = await ensureProfile();
  const [theme, discordPresence, steamProfile] = await Promise.all([
    db.theme.findFirst({
      where: { profileId: "main", isActive: true },
      orderBy: { createdAt: "asc" },
    }),
    getDiscordPresence(profile.discordId),
    getSteamProfile(profile.steamId),
  ]);
  return {
    displayName: profile.displayName,
    username: profile.username,
    bio: profile.bio,
    status: profile.status,
    avatarUrl: profile.avatarUrl,
    bannerUrl: profile.bannerUrl,
    musicUrl: profile.musicUrl,
    trackTitle: profile.trackTitle,
    trackArtist: profile.trackArtist,
    seoTitle: profile.seoTitle,
    seoDescription: profile.seoDescription,
    discordId: profile.discordId || null,
    discordPresence,
    steamId: profile.steamId || null,
    steamProfile,
    socialLinks: z.array(socialLink).safeParse(profile.socialLinks).data || [],
    gamingSetup: gamingGear.safeParse(profile.gamingSetup).data || {},
    favoriteGames: z.array(gameItem).safeParse(profile.favoriteGames).data || [],
    messagesEnabled: profile.messagesEnabled,
    publicMessages: profile.publicMessages,
    analyticsEnabled: profile.analyticsEnabled,
    theme: theme
      ? {
          id: theme.id,
          name: theme.name,
          configuration:
            themeConfig.safeParse(theme.configuration).data || defaultTheme,
        }
      : { id: "default", name: "Nebula", configuration: defaultTheme },
  };
}
