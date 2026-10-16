import { z } from "zod";

export const httpsUrl = z.url().max(500).refine(value => {
  try { const url = new URL(value); return url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.hostname === "localhost" && url.protocol === "http:"); } catch { return false; }
}, "Use a valid HTTPS URL");
const optionalUrl = z.union([httpsUrl, z.literal("")]).transform(v => v || null).nullable().optional();
export const socialLink = z.object({ id: z.string().regex(/^[a-z0-9-]{1,40}$/), label: z.string().trim().min(1).max(40), url: httpsUrl });
export const gameSetting = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  game: z.string().trim().min(1).max(50),
  dpi: z.number().int().min(100).max(32000).nullable().optional(),
  sens: z.string().trim().max(30).nullable().optional(),
  edpi: z.string().trim().max(30).nullable().optional(),
  resolution: z.string().trim().max(50).nullable().optional(),
  crosshairCode: z.string().trim().max(150).nullable().optional(),
  pollingRate: z.string().trim().max(30).nullable().optional(),
  mousepad: z.string().trim().max(60).nullable().optional(),
  notes: z.string().trim().max(150).nullable().optional(),
});

export const clipItem = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  title: z.string().trim().min(1).max(100),
  videoUrl: httpsUrl,
  game: z.string().trim().max(50).nullable().optional(),
  thumbnailUrl: optionalUrl,
  description: z.string().trim().max(200).nullable().optional(),
});

export const tournamentPlacementTier = z.enum([
  "champion",
  "runner_up",
  "podium",
  "top_eight",
  "qualified",
]);

export const tournamentItem = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  tournamentName: z.string().trim().min(1).max(100),
  game: z.string().trim().min(1).max(60),
  placement: z.string().trim().min(1).max(50),
  tier: tournamentPlacementTier.default("podium"),
  date: z.string().trim().max(30).nullable().optional(),
  teamName: z.string().trim().max(60).nullable().optional(),
  role: z.string().trim().max(50).nullable().optional(),
  format: z.string().trim().max(40).nullable().optional(),
  prize: z.string().trim().max(50).nullable().optional(),
  organizer: z.string().trim().max(60).nullable().optional(),
  link: optionalUrl,
  highlight: z.string().trim().max(200).nullable().optional(),
});

export type TournamentTier = z.infer<typeof tournamentPlacementTier>;
export type TournamentItem = z.infer<typeof tournamentItem>;

export const gamerPassportPlatform = z.enum([
  "riot",
  "steam",
  "discord",
  "battlenet",
  "epic",
  "xbox",
  "playstation",
  "switch",
  "ea",
  "ubisoft",
  "custom",
]);

export const gamerPassportTag = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  platform: gamerPassportPlatform,
  label: z.string().trim().min(1).max(50),
  tag: z.string().trim().min(1).max(100),
  verified: z.boolean().optional(),
});

export const gamerPassportConfig = z.object({
  enabled: z.boolean().default(true),
  callsign: z.string().trim().max(40).nullable().optional(),
  title: z.string().trim().max(60).nullable().optional(),
  tagline: z.string().trim().max(80).nullable().optional(),
  region: z.string().trim().max(40).nullable().optional(),
  rankTier: z.string().trim().max(40).nullable().optional(),
  clearanceLevel: z.string().trim().max(30).nullable().optional(),
  primaryGame: z.string().trim().max(50).nullable().optional(),
  secondaryGame: z.string().trim().max(50).nullable().optional(),
  tags: z.array(gamerPassportTag).max(12).optional(),
});

export type GamerPassportTag = z.infer<typeof gamerPassportTag>;
export type GamerPassportConfig = z.infer<typeof gamerPassportConfig>;

// 1-Click GG Kudos Reaction System
export const kudosType = z.enum(["gg", "hype", "cracked", "respect", "mvp"]);
export type KudosType = z.infer<typeof kudosType>;

export const kudosRecord = z.object({
  enabled: z.boolean().default(true),
  gg: z.number().int().min(0).default(0),
  hype: z.number().int().min(0).default(0),
  cracked: z.number().int().min(0).default(0),
  respect: z.number().int().min(0).default(0),
  mvp: z.number().int().min(0).default(0),
}).partial();

export type KudosRecord = z.infer<typeof kudosRecord>;

export const kudosInput = z.object({
  reaction: kudosType,
}).strict();

// RPG Combat & Playstyle Skill Matrix
export const skillAttribute = z.object({
  attribute: z.string().trim().min(1).max(40),
  value: z.number().min(0).max(100),
  fullMark: z.number().default(100),
});

export const skillMatrixConfig = z.object({
  enabled: z.boolean().default(true),
  title: z.string().trim().max(60).nullable().optional(),
  archetype: z.string().trim().max(60).nullable().optional(),
  primaryRole: z.string().trim().max(50).nullable().optional(),
  signatureAgent: z.string().trim().max(50).nullable().optional(),
  winRate: z.string().trim().max(20).nullable().optional(),
  kda: z.string().trim().max(20).nullable().optional(),
  attributes: z.array(skillAttribute).min(3).max(8).optional(),
});

export type SkillAttribute = z.infer<typeof skillAttribute>;
export type SkillMatrixConfig = z.infer<typeof skillMatrixConfig>;

// 1. Interactive Visitor Guestbook & Arcade Stamp Station
export const guestbookPlatform = z.enum([
  "steam",
  "discord",
  "playstation",
  "xbox",
  "switch",
  "pc_casual",
  "other",
]);
export const guestbookSticker = z.enum([
  "gg",
  "chill",
  "gamepad",
  "tank",
  "trophy",
  "fire",
]);

export const guestbookStamp = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  callsign: z.string().trim().min(1).max(40),
  platform: guestbookPlatform.default("pc_casual"),
  sticker: guestbookSticker.default("gg"),
  favoriteGame: z.string().trim().max(50).nullable().optional(),
  message: z.string().trim().min(2).max(400),
  countryFlag: z.string().max(10).optional(),
  createdAt: z.string().optional(),
  isPinned: z.boolean().optional(),
});

export const guestbookConfig = z.object({
  enabled: z.boolean().default(true),
  title: z.string().trim().max(60).nullable().optional(),
  subtitle: z.string().trim().max(120).nullable().optional(),
  stamps: z.array(guestbookStamp).max(50).optional(),
});

export const guestbookInput = z.object({
  callsign: z.string().trim().min(1).max(40),
  platform: guestbookPlatform.default("pc_casual"),
  sticker: guestbookSticker.default("gg"),
  favoriteGame: z.string().trim().max(50).nullable().optional(),
  message: z.string().trim().min(2).max(400),
}).strict();

export type GuestbookPlatform = z.infer<typeof guestbookPlatform>;
export type GuestbookSticker = z.infer<typeof guestbookSticker>;
export type GuestbookStamp = z.infer<typeof guestbookStamp>;
export type GuestbookConfig = z.infer<typeof guestbookConfig>;
export type GuestbookInput = z.infer<typeof guestbookInput>;

// 2. Chill Gaming Lounge Floating Music Player & Soundscapes
export const chillLoungeTrack = z.enum(["lofi", "rain", "arcade", "synthwave"]);
export type ChillLoungeTrack = z.infer<typeof chillLoungeTrack>;

export const chillLoungeConfig = z.object({
  enabled: z.boolean().default(true),
  defaultTrack: chillLoungeTrack.default("lofi"),
  customAudioUrl: optionalUrl,
  ambientTitle: z.string().trim().max(60).nullable().optional(),
  autoPlayMuted: z.boolean().default(false),
}).partial();
export type ChillLoungeConfig = z.infer<typeof chillLoungeConfig>;

// 3. Casual Corner & Cozy Games Shelf
export const casualGameStatus = z.enum(["vibing", "comfort", "coop", "completed"]);
export type CasualGameStatus = z.infer<typeof casualGameStatus>;

export const casualGameItem = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  title: z.string().trim().min(1).max(80),
  coverUrl: optionalUrl,
  status: casualGameStatus.default("vibing"),
  rating: z.number().min(0).max(10).nullable().optional(),
  hours: z.number().int().min(0).max(99999).nullable().optional(),
  lowSpecFriendly: z.boolean().default(true),
  notes: z.string().trim().max(200).nullable().optional(),
});

export const casualCornerConfig = z.object({
  enabled: z.boolean().default(true),
  headline: z.string().trim().max(80).nullable().optional(),
  description: z.string().trim().max(200).nullable().optional(),
  games: z.array(casualGameItem).max(20).optional(),
});
export type CasualGameItem = z.infer<typeof casualGameItem>;
export type CasualCornerConfig = z.infer<typeof casualCornerConfig>;

// 4. Potato PC & Low-Spec Optimization Guide
export const potatoTweakCategory = z.enum([
  "windows",
  "resolution",
  "launch_options",
  "graphics",
  "network",
]);
export type PotatoTweakCategory = z.infer<typeof potatoTweakCategory>;
export const potatoPcTweak = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  category: potatoTweakCategory.default("windows"),
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300),
  commandToCopy: z.string().trim().max(250).nullable().optional(),
  fpsGainEst: z.string().trim().max(40).nullable().optional(),
});

export const potatoPcGuideConfig = z.object({
  enabled: z.boolean().default(true),
  title: z.string().trim().max(80).nullable().optional(),
  targetHardware: z.string().trim().max(100).nullable().optional(),
  tweaks: z.array(potatoPcTweak).max(20).optional(),
});
export type PotatoPcTweak = z.infer<typeof potatoPcTweak>;
export type PotatoPcGuideConfig = z.infer<typeof potatoPcGuideConfig>;

// 5. Interactive Theme Matrix Switcher
export const themeMatrixConfig = z.object({
  enabled: z.boolean().default(true),
  allowVisitorPresets: z.boolean().default(true),
});
export type ThemeMatrixConfig = z.infer<typeof themeMatrixConfig>;

// 6. Interactive Potato Battlestation Spec Inspector
export const rigPartItem = z.object({
  id: z.string(),
  name: z.string().trim().max(80),
  category: z.enum(["cpu", "gpu", "ram", "storage", "display", "peripherals"]),
  spec: z.string().trim().max(120),
  humorNote: z.string().trim().max(160).optional(),
  upgradeIdea: z.string().trim().max(160).optional(),
});
export const rigBenchmarkItem = z.object({
  game: z.string().trim().max(80),
  fps: z.number().int().min(1).max(1000),
  quality: z.string().trim().max(60),
  verdict: z.string().trim().max(80),
});
export const potatoRigConfig = z.object({
  enabled: z.boolean().default(true),
  rigName: z.string().trim().max(80).nullable().optional(),
  rigBadge: z.string().trim().max(60).nullable().optional(),
  overallVerdict: z.string().trim().max(160).nullable().optional(),
  parts: z.array(rigPartItem).max(15).optional(),
  benchmarks: z.array(rigBenchmarkItem).max(10).optional(),
});
export type RigPartItem = z.infer<typeof rigPartItem>;
export type RigBenchmarkItem = z.infer<typeof rigBenchmarkItem>;
export type PotatoRigConfig = z.infer<typeof potatoRigConfig>;

// 7. Arcade Reaction Speed & Aim Challenge ("Beat My High Score")
export const reactionGameConfig = z.object({
  enabled: z.boolean().default(true),
  title: z.string().trim().max(80).nullable().optional(),
  ownerScoreMs: z.number().int().min(50).max(2000).default(215),
  difficulty: z.enum(["chill", "standard", "hardcore"]).default("standard"),
});
export type ReactionGameConfig = z.infer<typeof reactionGameConfig>;

// 8. "Can My PC Run It?" — Low-Spec Community Advisor
export const specAdvisorGameItem = z.object({
  id: z.string(),
  title: z.string().trim().max(80),
  verdict: z.enum(["smooth", "playable", "tweaks_needed", "hazard"]),
  minSpecs: z.string().trim().max(120),
  recommendedSettings: z.string().trim().max(160),
  thermalAlert: z.string().trim().max(160).optional(),
});
export const specAdvisorConfig = z.object({
  enabled: z.boolean().default(true),
  title: z.string().trim().max(80).nullable().optional(),
  subtitle: z.string().trim().max(160).nullable().optional(),
  games: z.array(specAdvisorGameItem).max(20).optional(),
});
export type SpecAdvisorGameItem = z.infer<typeof specAdvisorGameItem>;
export type SpecAdvisorConfig = z.infer<typeof specAdvisorConfig>;

// 9. "Looking For Party" (LFP) Casual Beacon
export const partyBeaconConfig = z.object({
  enabled: z.boolean().default(true),
  status: z.enum(["open", "duo_only", "full_squad", "offline"]).default("open"),
  headline: z.string().trim().max(80).nullable().optional(),
  note: z.string().trim().max(250).nullable().optional(),
  discordInvite: z.string().trim().max(120).nullable().optional(),
  roomCode: z.string().trim().max(60).nullable().optional(),
  preferredGames: z.array(z.string().trim().max(40)).max(8).optional(),
});
export type PartyBeaconConfig = z.infer<typeof partyBeaconConfig>;

// 10. Daily Micro-Log / Gaming Journal
export const journalEntryItem = z.object({
  id: z.string(),
  date: z.string().trim().max(30),
  game: z.string().trim().max(60),
  mood: z.enum(["cozy", "struggling", "hyped", "victorious", "chill"]),
  content: z.string().trim().max(400),
  fpsExperienced: z.number().int().min(1).max(500).optional(),
});
export const gamingJournalConfig = z.object({
  enabled: z.boolean().default(true),
  title: z.string().trim().max(80).nullable().optional(),
  entries: z.array(journalEntryItem).max(25).optional(),
});
export type JournalEntryItem = z.infer<typeof journalEntryItem>;
export type GamingJournalConfig = z.infer<typeof gamingJournalConfig>;

export const gamingGear = z.object({
  setupType: z.enum(["desktop", "laptop", "both"]).optional().nullable(),
  // Desktop Specs
  cpu: z.string().trim().max(100).nullable().optional(),
  gpu: z.string().trim().max(100).nullable().optional(),
  ram: z.string().trim().max(100).nullable().optional(),
  storage: z.string().trim().max(100).nullable().optional(),
  motherboard: z.string().trim().max(100).nullable().optional(),
  display: z.string().trim().max(100).nullable().optional(),
  mouse: z.string().trim().max(100).nullable().optional(),
  keyboard: z.string().trim().max(100).nullable().optional(),
  headset: z.string().trim().max(100).nullable().optional(),
  // Laptop Specs
  laptopModel: z.string().trim().max(100).nullable().optional(),
  laptopCpu: z.string().trim().max(100).nullable().optional(),
  laptopGpu: z.string().trim().max(100).nullable().optional(),
  laptopIgpu: z.string().trim().max(100).nullable().optional(),
  laptopRam: z.string().trim().max(100).nullable().optional(),
  laptopStorage: z.string().trim().max(100).nullable().optional(),
  laptopDisplay: z.string().trim().max(100).nullable().optional(),
  laptopMouse: z.string().trim().max(100).nullable().optional(),
  laptopHeadset: z.string().trim().max(100).nullable().optional(),
  // Competitive Game Configs & Settings
  gameSettings: z.array(gameSetting).max(12).nullable().optional(),
  // Clips & Highlights Showcase
  clips: z.array(clipItem).max(12).nullable().optional(),
  // Tournament & Esports Timeline
  tournaments: z.array(tournamentItem).max(25).nullable().optional(),
  // Holographic 3D Gamer Passport
  passport: gamerPassportConfig.nullable().optional(),
  // 1-Click GG Kudos Reaction Deck
  kudos: kudosRecord.nullable().optional(),
  // RPG Skill Matrix & Playstyle Hexagon
  skillMatrix: skillMatrixConfig.nullable().optional(),
  // Interactive Community & Low-Spec Features:
  guestbook: guestbookConfig.nullable().optional(),
  chillLounge: chillLoungeConfig.nullable().optional(),
  casualCorner: casualCornerConfig.nullable().optional(),
  potatoPcGuide: potatoPcGuideConfig.nullable().optional(),
  themeMatrix: themeMatrixConfig.nullable().optional(),
  // 5 New Super Features Pack 2:
  potatoRig: potatoRigConfig.nullable().optional(),
  reactionGame: reactionGameConfig.nullable().optional(),
  specAdvisor: specAdvisorConfig.nullable().optional(),
  partyBeacon: partyBeaconConfig.nullable().optional(),
  gamingJournal: gamingJournalConfig.nullable().optional(),
}).partial();

export const gameItem = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  title: z.string().trim().min(1).max(100),
  coverUrl: optionalUrl,
  status: z.enum(["playing", "completed", "favorite", "backlog"]),
  platform: z.string().trim().max(50).nullable().optional(),
  hours: z.number().int().min(0).max(999999).nullable().optional(),
  rating: z.number().min(0).max(10).nullable().optional(),
});

export const profileInput = z.object({
  displayName: z.string().trim().min(1).max(60), username: z.string().trim().regex(/^[a-zA-Z0-9_.-]{2,30}$/), bio: z.string().trim().max(500),
  status: z.string().trim().max(80).nullable().optional(), avatarUrl: optionalUrl, bannerUrl: optionalUrl, musicUrl: optionalUrl,
  trackTitle: z.string().trim().max(80).nullable().optional(), trackArtist: z.string().trim().max(80).nullable().optional(),
  seoTitle: z.string().trim().min(1).max(80), seoDescription: z.string().trim().max(160), socialLinks: z.array(socialLink).max(12).refine(links => new Set(links.map(link => link.id)).size === links.length, "Link identifiers must be unique"),
  gamingSetup: gamingGear.nullable().optional(),
  favoriteGames: z.array(gameItem).max(30).nullable().optional(),
  discordId: z.string().trim().max(40).regex(/^[0-9]*$/).nullable().optional(),
  steamId: z.string().trim().max(120).nullable().optional(),
  publicMessages: z.boolean().optional(), messagesEnabled: z.boolean().optional(), analyticsEnabled: z.boolean().optional(), retentionDays: z.number().int().min(7).max(365).optional(),
}).strict();
export const themeConfig = z.object({ accent: z.string().regex(/^#[0-9a-fA-F]{6}$/), background: z.enum(["aurora", "grid", "plain"]), card: z.enum(["glass", "solid"]), font: z.enum(["sans", "mono"]), glow: z.number().min(0).max(100), blur: z.number().min(0).max(40) }).strict();
export const themeInput = z.object({ name: z.string().trim().min(1).max(40), configuration: themeConfig, isActive: z.boolean().optional() }).strict();
export const defaultTheme = { accent: "#bb9aff", background: "aurora", card: "glass", font: "sans", glow: 60, blur: 18 } as const;
export const messageInput = z.object({ content: z.string().trim().min(2).max(1000), website: z.string().max(100).optional() }).strict();
export const allowedProfilePath = z.enum(["/", "/about-introduction"]);

export const eventInput = z.discriminatedUnion("eventType", [
  z.object({
    eventType: z.literal("profile_view"),
    pagePath: allowedProfilePath.default("/"),
    referrer: z.string().max(500).optional(),
    action: z.string().max(100).optional(),
  }),
  z.object({
    eventType: z.literal("social_link_click"),
    pagePath: allowedProfilePath.default("/"),
    linkId: z.string().regex(/^[a-z0-9-]{1,40}$/),
    referrer: z.string().max(500).optional(),
  }),
  z.object({
    eventType: z.literal("interaction"),
    pagePath: allowedProfilePath.default("/"),
    action: z.string().trim().min(1).max(100),
    detail: z.string().max(100).optional(),
    referrer: z.string().max(500).optional(),
  }),
]);
