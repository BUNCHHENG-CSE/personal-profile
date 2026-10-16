"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  CircleHelp,
  ExternalLink,
  ImageIcon,
  Link2,
  Music2,
  Plus,
  Save,
  Search,
  Trash2,
  Trophy,
  UserRound,
  IdCard,
  Swords,
  Coffee,
  Headphones,
  Palette,
  Sliders,
} from "lucide-react";
import { SectionHeader } from "@/components/dashboard-ui";
import { MediaUploader } from "@/components/media-uploader";
import { Cpu, Crosshair, Film, Gamepad2, Laptop, Radio, Zap, Target, BookOpen } from "lucide-react";
import type { GamingGear } from "@/components/rig-specs";
import type { GameItem } from "@/components/gaming-shelf";
import type { GameSettingItem } from "@/components/game-settings";
import type { ClipItem } from "@/components/clips-showcase";
import type {
  TournamentItem,
  TournamentTier,
  GamerPassportConfig,
  GamerPassportTag,
  SkillMatrixConfig,
  GuestbookConfig,
  ChillLoungeConfig,
  CasualCornerConfig,
  PotatoPcGuideConfig,
  ThemeMatrixConfig,
  PotatoRigConfig,
  ReactionGameConfig,
  SpecAdvisorConfig,
  PartyBeaconConfig,
  GamingJournalConfig,
} from "@/lib/validation";
import { TOURNAMENT_PRESETS, getTierInfo } from "@/lib/tournaments";
import { PASSPORT_PLATFORMS } from "@/lib/passport";

type SocialLink = { id: string; label: string; url: string };
type Profile = {
  displayName: string;
  username: string;
  bio: string;
  status: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  musicUrl: string | null;
  trackTitle: string | null;
  trackArtist: string | null;
  discordId?: string | null;
  steamId?: string | null;
  gamingSetup?: GamingGear;
  favoriteGames?: GameItem[];
  seoTitle: string;
  seoDescription: string;
  socialLinks: SocialLink[];
  publicMessages: boolean;
  messagesEnabled: boolean;
  analyticsEnabled: boolean;
  retentionDays: number;
};

export function ProfileEditor({ initial }: { initial: Profile }) {
  const [profile, setProfile] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((previous) => ({ ...previous, [key]: value }));
    setFeedback(null);
  }
  function updateLink(index: number, key: keyof SocialLink, value: string) {
    update(
      "socialLinks",
      profile.socialLinks.map((link, i) =>
        i === index ? { ...link, [key]: value } : link,
      ),
    );
  }
  function addLink() {
    let count = 1;
    while (profile.socialLinks.some((link) => link.id === `link-${count}`))
      count++;
    update("socialLinks", [
      ...profile.socialLinks,
      { id: `link-${count}`, label: "New link", url: "" },
    ]);
  }

  function updateGear(key: keyof GamingGear, value: string) {
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      [key]: value || null,
    });
  }

  function updateGame<K extends keyof GameItem>(index: number, key: K, value: GameItem[K]) {
    const list = [...(profile.favoriteGames || [])];
    if (list[index]) {
      list[index] = { ...list[index], [key]: value };
      update("favoriteGames", list);
    }
  }

  function addGame() {
    let count = 1;
    const current = profile.favoriteGames || [];
    while (current.some((g) => g.id === `game-${count}`)) count++;
    update("favoriteGames", [
      ...current,
      {
        id: `game-${count}`,
        title: "New Game",
        status: "playing",
        platform: "PC",
        hours: 0,
        rating: 8.5,
      },
    ]);
  }

  function updateGameSetting<K extends keyof GameSettingItem>(index: number, key: K, value: GameSettingItem[K]) {
    const list = [...(profile.gamingSetup?.gameSettings || [])];
    if (list[index]) {
      list[index] = { ...list[index], [key]: value };
      update("gamingSetup", {
        ...(profile.gamingSetup || {}),
        gameSettings: list,
      });
    }
  }

  function addGameSetting(preset?: { game: string; dpi?: number; sens?: string; res?: string }) {
    let count = 1;
    const current = profile.gamingSetup?.gameSettings || [];
    while (current.some((s) => s.id === `sens-${count}`)) count++;
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      gameSettings: [
        ...current,
        {
          id: `sens-${count}`,
          game: preset?.game || "Valorant",
          dpi: preset?.dpi ?? 800,
          sens: preset?.sens ?? "0.35",
          edpi: preset ? String(Math.round((preset.dpi ?? 800) * Number(preset.sens ?? "0.35") * 10) / 10) : "280",
          resolution: preset?.res ?? "1920x1080 (16:9)",
          crosshairCode: "",
          pollingRate: "1000Hz",
          mousepad: "",
          notes: "",
        },
      ],
    });
  }

  function removeGameSetting(index: number) {
    const current = profile.gamingSetup?.gameSettings || [];
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      gameSettings: current.filter((_, i) => i !== index),
    });
  }

  function updateClip<K extends keyof ClipItem>(index: number, key: K, value: ClipItem[K]) {
    const list = [...(profile.gamingSetup?.clips || [])];
    if (list[index]) {
      list[index] = { ...list[index], [key]: value };
      update("gamingSetup", {
        ...(profile.gamingSetup || {}),
        clips: list,
      });
    }
  }

  function addClip() {
    let count = 1;
    const current = profile.gamingSetup?.clips || [];
    while (current.some((c) => c.id === `clip-${count}`)) count++;
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      clips: [
        ...current,
        {
          id: `clip-${count}`,
          title: "New Highlight Clip",
          videoUrl: "",
          game: "Valorant",
          thumbnailUrl: "",
          description: "",
        },
      ],
    });
  }

  function removeClip(index: number) {
    const current = profile.gamingSetup?.clips || [];
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      clips: current.filter((_, i) => i !== index),
    });
  }

  function updateTournament<K extends keyof TournamentItem>(
    index: number,
    key: K,
    value: TournamentItem[K]
  ) {
    const list = [...(profile.gamingSetup?.tournaments || [])];
    if (list[index]) {
      list[index] = { ...list[index], [key]: value };
      update("gamingSetup", {
        ...(profile.gamingSetup || {}),
        tournaments: list,
      });
    }
  }

  function addTournament(presetItem?: Omit<TournamentItem, "id">) {
    let count = 1;
    const current = profile.gamingSetup?.tournaments || [];
    while (current.some((t) => t.id === `tourney-${count}`)) count++;
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      tournaments: [
        ...current,
        presetItem
          ? { id: `tourney-${count}`, ...presetItem }
          : {
              id: `tourney-${count}`,
              tournamentName: "New Tournament Milestone",
              game: "Valorant",
              placement: "1st Place (Champion)",
              tier: "champion",
              date: new Date().toISOString().slice(0, 7),
              teamName: "",
              role: "IGL",
              format: "Online Playoff",
              prize: "",
              organizer: "",
              link: null,
              highlight: "",
            },
      ],
    });
  }

  function removeTournament(index: number) {
    const current = profile.gamingSetup?.tournaments || [];
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      tournaments: current.filter((_, i) => i !== index),
    });
  }

  function moveTournament(index: number, direction: -1 | 1) {
    const current = [...(profile.gamingSetup?.tournaments || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      tournaments: current,
    });
  }

  function updatePassport<K extends keyof GamerPassportConfig>(
    key: K,
    value: GamerPassportConfig[K]
  ) {
    const current = profile.gamingSetup?.passport || { enabled: true };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      passport: {
        ...current,
        [key]: value,
      },
    });
  }

  function updatePassportTag<K extends keyof GamerPassportTag>(
    index: number,
    key: K,
    value: GamerPassportTag[K]
  ) {
    const currentPassport = profile.gamingSetup?.passport || { enabled: true };
    const currentTags = [...(currentPassport.tags || [])];
    if (currentTags[index]) {
      currentTags[index] = { ...currentTags[index], [key]: value };
      update("gamingSetup", {
        ...(profile.gamingSetup || {}),
        passport: {
          ...currentPassport,
          tags: currentTags,
        },
      });
    }
  }

  function addPassportTag(
    platform: GamerPassportTag["platform"] = "custom",
    defaultTag = ""
  ) {
    const currentPassport = profile.gamingSetup?.passport || { enabled: true };
    const currentTags = currentPassport.tags || [];
    let count = 1;
    while (currentTags.some((t) => t.id === `tag-${count}`)) count++;
    const meta = PASSPORT_PLATFORMS[platform] || PASSPORT_PLATFORMS.custom;
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      passport: {
        ...currentPassport,
        tags: [
          ...currentTags,
          {
            id: `tag-${count}`,
            platform,
            label: meta.defaultLabel,
            tag: defaultTag || "",
            verified: false,
          },
        ],
      },
    });
  }

  function removePassportTag(index: number) {
    const currentPassport = profile.gamingSetup?.passport || { enabled: true };
    const currentTags = currentPassport.tags || [];
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      passport: {
        ...currentPassport,
        tags: currentTags.filter((_, i) => i !== index),
      },
    });
  }

  function movePassportTag(index: number, direction: -1 | 1) {
    const currentPassport = profile.gamingSetup?.passport || { enabled: true };
    const currentTags = [...(currentPassport.tags || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= currentTags.length) return;
    const temp = currentTags[index];
    currentTags[index] = currentTags[targetIdx];
    currentTags[targetIdx] = temp;
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      passport: {
        ...currentPassport,
        tags: currentTags,
      },
    });
  }

  function updateSkillMatrix<K extends keyof SkillMatrixConfig>(
    key: K,
    value: SkillMatrixConfig[K]
  ) {
    const current = profile.gamingSetup?.skillMatrix || {
      enabled: true,
      title: "COMBAT CAPABILITY RADAR",
      archetype: "AGGRESSIVE ENTRY FRAGGER",
      primaryRole: "Duelist / In-Game Leader",
      signatureAgent: "Jett / Omen / Reyna",
      winRate: "64.8% WR",
      kda: "1.42 K/D",
      attributes: [
        { attribute: "AIM / FLICK", value: 94, fullMark: 100 },
        { attribute: "MACRO SENSE", value: 86, fullMark: 100 },
        { attribute: "CLUTCH (1vX)", value: 91, fullMark: 100 },
        { attribute: "COMMS & IGL", value: 88, fullMark: 100 },
        { attribute: "MENTAL / TILT", value: 95, fullMark: 100 },
        { attribute: "VERSATILITY", value: 84, fullMark: 100 },
      ],
    };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      skillMatrix: {
        ...current,
        [key]: value,
      },
    });
  }

  function updateSkillAttribute(index: number, value: number) {
    const currentMatrix = profile.gamingSetup?.skillMatrix || {
      enabled: true,
      attributes: [
        { attribute: "AIM / FLICK", value: 94, fullMark: 100 },
        { attribute: "MACRO SENSE", value: 86, fullMark: 100 },
        { attribute: "CLUTCH (1vX)", value: 91, fullMark: 100 },
        { attribute: "COMMS & IGL", value: 88, fullMark: 100 },
        { attribute: "MENTAL / TILT", value: 95, fullMark: 100 },
        { attribute: "VERSATILITY", value: 84, fullMark: 100 },
      ],
    };
    const list = [...(currentMatrix.attributes || [])];
    if (list[index]) {
      list[index] = { ...list[index], value: Math.min(100, Math.max(0, value)) };
      update("gamingSetup", {
        ...(profile.gamingSetup || {}),
        skillMatrix: {
          ...currentMatrix,
          attributes: list,
        },
      });
    }
  }

  function updateGuestbook<K extends keyof GuestbookConfig>(
    key: K,
    value: GuestbookConfig[K]
  ) {
    const current = profile.gamingSetup?.guestbook || { enabled: true };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      guestbook: {
        ...current,
        [key]: value,
      },
    });
  }

  function updateChillLounge<K extends keyof ChillLoungeConfig>(
    key: K,
    value: ChillLoungeConfig[K]
  ) {
    const current = profile.gamingSetup?.chillLounge || { enabled: true, defaultTrack: "lofi" };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      chillLounge: {
        ...current,
        [key]: value,
      },
    });
  }

  function updateCasualCorner<K extends keyof CasualCornerConfig>(
    key: K,
    value: CasualCornerConfig[K]
  ) {
    const current = profile.gamingSetup?.casualCorner || { enabled: true };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      casualCorner: {
        ...current,
        [key]: value,
      },
    });
  }

  function updatePotatoPcGuide<K extends keyof PotatoPcGuideConfig>(
    key: K,
    value: PotatoPcGuideConfig[K]
  ) {
    const current = profile.gamingSetup?.potatoPcGuide || { enabled: true };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      potatoPcGuide: {
        ...current,
        [key]: value,
      },
    });
  }

  function updateThemeMatrix<K extends keyof ThemeMatrixConfig>(
    key: K,
    value: ThemeMatrixConfig[K]
  ) {
    const current = profile.gamingSetup?.themeMatrix || { enabled: true, allowVisitorPresets: true };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      themeMatrix: {
        ...current,
        [key]: value,
      },
    });
  }

  function updatePotatoRig<K extends keyof PotatoRigConfig>(
    key: K,
    value: PotatoRigConfig[K]
  ) {
    const current = profile.gamingSetup?.potatoRig || { enabled: true };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      potatoRig: {
        ...current,
        [key]: value,
      },
    });
  }

  function updateReactionGame<K extends keyof ReactionGameConfig>(
    key: K,
    value: ReactionGameConfig[K]
  ) {
    const current = profile.gamingSetup?.reactionGame || { enabled: true, ownerScoreMs: 215, difficulty: "standard" };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      reactionGame: {
        ...current,
        [key]: value,
      },
    });
  }

  function updateSpecAdvisor<K extends keyof SpecAdvisorConfig>(
    key: K,
    value: SpecAdvisorConfig[K]
  ) {
    const current = profile.gamingSetup?.specAdvisor || { enabled: true };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      specAdvisor: {
        ...current,
        [key]: value,
      },
    });
  }

  function updatePartyBeacon<K extends keyof PartyBeaconConfig>(
    key: K,
    value: PartyBeaconConfig[K]
  ) {
    const current = profile.gamingSetup?.partyBeacon || { enabled: true, status: "open" };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      partyBeacon: {
        ...current,
        [key]: value,
      },
    });
  }

  function updateGamingJournal<K extends keyof GamingJournalConfig>(
    key: K,
    value: GamingJournalConfig[K]
  ) {
    const current = profile.gamingSetup?.gamingJournal || { enabled: true };
    update("gamingSetup", {
      ...(profile.gamingSetup || {}),
      gamingJournal: {
        ...current,
        [key]: value,
      },
    });
  }

  async function save() {
    setSaving(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          status: profile.status || null,
          avatarUrl: profile.avatarUrl || null,
          bannerUrl: profile.bannerUrl || null,
          musicUrl: profile.musicUrl || null,
          trackTitle: profile.trackTitle || null,
          trackArtist: profile.trackArtist || null,
          discordId: profile.discordId || null,
          steamId: profile.steamId || null,
          gamingSetup: profile.gamingSetup || {},
          favoriteGames: profile.favoriteGames || [],
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not save your profile.");
      setFeedback({
        text: "Profile published. Your changes are live.",
        error: false,
      });
    } catch (error) {
      setFeedback({
        text:
          error instanceof Error
            ? error.message
            : "Could not save your profile.",
        error: true,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="editor-layout">
      <div className="editor-main">
        <section className="surface-card editor-section">
          <SectionHeader
            title="Your identity"
            detail="The essentials visitors see first."
            action={
              <span className="section-icon">
                <UserRound size={19} />
              </span>
            }
          />
          <div className="field-grid two-col">
            <label className="form-field">
              <span>
                Display name <b>*</b>
              </span>
              <input
                className="input"
                maxLength={60}
                value={profile.displayName}
                onChange={(event) => update("displayName", event.target.value)}
                placeholder="Your name"
              />
            </label>
            <label className="form-field">
              <span>
                Username <b>*</b>
              </span>
              <div className="input-prefix">
                <span>@</span>
                <input
                  className="input"
                  maxLength={30}
                  value={profile.username}
                  onChange={(event) => update("username", event.target.value)}
                  placeholder="username"
                />
              </div>
            </label>
            <label className="form-field">
              <span>
                Public status <small>optional</small>
              </span>
              <input
                className="input"
                maxLength={80}
                value={profile.status || ""}
                onChange={(event) => update("status", event.target.value)}
                placeholder="Working on something new"
              />
            </label>
          </div>
          <label className="form-field">
            <span>
              Biography <small>{profile.bio.length}/500</small>
            </span>
            <textarea
              className="input textarea"
              rows={5}
              maxLength={500}
              value={profile.bio}
              onChange={(event) => update("bio", event.target.value)}
              placeholder="Tell people a little about yourself..."
            />
          </label>
        </section>

        <section className="surface-card editor-section">
          <SectionHeader
            title="Images & audio"
            detail="Upload directly to Cloudinary or link secure media URLs."
            action={
              <span className="section-icon">
                <ImageIcon size={19} />
              </span>
            }
          />
          <div className="field-grid two-col">
            <MediaUploader
              label="Avatar image"
              helperText="Square format (PNG, JPG, WEBP)"
              type="avatar"
              value={profile.avatarUrl}
              onChange={(url) => update("avatarUrl", url)}
              placeholder="https://example.com/avatar.jpg"
            />
            <MediaUploader
              label="Banner image"
              helperText="Wide format (PNG, JPG, WEBP)"
              type="banner"
              value={profile.bannerUrl}
              onChange={(url) => update("bannerUrl", url)}
              placeholder="https://example.com/banner.jpg"
            />
          </div>
          <div className="editor-divider" />
          <div className="editor-subheading">
            <Music2 size={17} />
            <strong>Profile soundtrack</strong>
            <span>optional</span>
          </div>
          <div className="field-grid">
            <MediaUploader
              label="Soundtrack audio"
              helperText="MP3, WAV, OGG, M4A up to 30MB"
              type="audio"
              value={profile.musicUrl}
              onChange={(url) => update("musicUrl", url)}
              placeholder="https://example.com/track.mp3"
              onAudioMetadata={({ title, artist }) => {
                if (title && !profile.trackTitle) update("trackTitle", title);
                if (artist && !profile.trackArtist) update("trackArtist", artist);
              }}
            />
            <div className="field-grid two-col">
              <label className="form-field">
                <span>Track title</span>
                <input
                  className="input"
                  value={profile.trackTitle || ""}
                  onChange={(event) => update("trackTitle", event.target.value)}
                  placeholder="Song title"
                />
              </label>
              <label className="form-field">
                <span>Artist</span>
                <input
                  className="input"
                  value={profile.trackArtist || ""}
                  onChange={(event) =>
                    update("trackArtist", event.target.value)
                  }
                  placeholder="Artist name"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="surface-card editor-section">
          <SectionHeader
            title="Social links"
            detail="Put your favorite places within reach."
            action={
              <span className="section-icon">
                <Link2 size={19} />
              </span>
            }
          />
          <div className="social-editor-list">
            {profile.socialLinks.map((link, index) => (
              <div className="social-editor-row" key={index}>
                <div className="social-editor-number">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="social-editor-fields">
                  <label className="form-field">
                    <span>Label</span>
                    <input
                      className="input"
                      value={link.label}
                      onChange={(event) =>
                        updateLink(index, "label", event.target.value)
                      }
                      placeholder="GitHub"
                    />
                  </label>
                  <label className="form-field">
                    <span>Identifier</span>
                    <input
                      className="input"
                      value={link.id}
                      onChange={(event) =>
                        updateLink(index, "id", event.target.value)
                      }
                      placeholder="github"
                    />
                  </label>
                  <label className="form-field social-editor-url">
                    <span>HTTPS URL</span>
                    <input
                      className="input"
                      type="url"
                      value={link.url}
                      onChange={(event) =>
                        updateLink(index, "url", event.target.value)
                      }
                      placeholder="https://..."
                    />
                  </label>
                </div>
                <button
                  className="icon-button danger"
                  type="button"
                  aria-label={`Remove ${link.label}`}
                  onClick={() =>
                    update(
                      "socialLinks",
                      profile.socialLinks.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
          {profile.socialLinks.length === 0 && (
            <div className="mini-empty">
              <Link2 size={19} />
              <span>No links added yet.</span>
            </div>
          )}
          <button
            className="button button-secondary"
            type="button"
            onClick={addLink}
            disabled={profile.socialLinks.length >= 12}
          >
            <Plus size={16} /> Add social link
          </button>
        </section>

        <section className="surface-card editor-section">
          <SectionHeader
            title="Gaming identity & live presence"
            detail="Connect your Discord ID to display live in-game status and Spotify via Lanyard."
            action={
              <span className="section-icon">
                <Radio size={19} />
              </span>
            }
          />
          <div className="field-grid two-col">
            <label className="form-field">
              <span>
                Discord user ID <small>Lanyard presence (17-20 digits)</small>
              </span>
              <input
                className="input"
                maxLength={30}
                value={profile.discordId || ""}
                onChange={(event) => update("discordId", event.target.value)}
                placeholder="e.g. 290926798626357249"
              />
            </label>
            <label className="form-field">
              <span>
                Steam Vanity Name or SteamID64 <small>live sync</small>
              </span>
              <input
                className="input"
                maxLength={80}
                value={profile.steamId || ""}
                onChange={(event) => update("steamId", event.target.value)}
                placeholder="e.g. gabelogannewell or 76561197960287930"
              />
            </label>
            <div className="two-col-span p-3 rounded-lg border border-indigo-500/25 bg-indigo-500/5 text-xs font-mono space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/20 pb-2">
                <span className="text-slate-900 dark:text-white/90 font-medium">
                  📡 Live Presence Integrations:
                </span>
                <a
                  href="https://discord.gg/lanyard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-[#5865F2] hover:bg-[#4752c4] text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0"
                >
                  Join Lanyard Discord ↗
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-white/60 text-[11px] leading-relaxed">
                <div>
                  <strong className="text-slate-900 dark:text-white/80 block mb-0.5">🎮 Steam Live Sync:</strong>
                  Enter your Steam custom vanity URL name or 17-digit SteamID64. If your Steam profile is public, your live in-game status, top games, and total hours played are automatically synchronized!
                </div>
                <div>
                  <strong className="text-slate-900 dark:text-white/80 block mb-0.5">💬 Discord Live Presence:</strong>
                  Lanyard reads your live Discord game and Spotify status in real-time. Make sure your Discord account is joined in the free Lanyard server.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card editor-section">
          <SectionHeader
            title="Battlestation & rig specs"
            detail="Configure specs for your Desktop PC, Gaming Laptop, or both."
            action={
              <span className="section-icon">
                <Cpu size={19} />
              </span>
            }
          />

          {/* Setup Type Selector */}
          <div className="flex flex-wrap items-center gap-2 mb-6 p-2 rounded-lg bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 dark:text-white/40 mr-2">
              Setup Type:
            </span>
            {[
              { id: "desktop", label: "Desktop PC", icon: Cpu },
              { id: "laptop", label: "Gaming Laptop", icon: Laptop },
              { id: "both", label: "Both (Dual Rig)", icon: Zap },
            ].map(({ id, label, icon: Icon }) => {
              const current = profile.gamingSetup?.setupType || "desktop";
              const active = current === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => updateGear("setupType", id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all border ${
                    active
                      ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white border-[var(--accent)] font-semibold shadow-sm"
                      : "bg-transparent text-slate-600 dark:text-white/50 border-transparent hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/10"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Desktop Fields */}
          {(profile.gamingSetup?.setupType === "desktop" ||
            profile.gamingSetup?.setupType === "both" ||
            !profile.gamingSetup?.setupType) && (
            <div className="space-y-4 mb-6">
              {(profile.gamingSetup?.setupType === "both") && (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-white/70 border-b border-slate-200 dark:border-white/5 pb-2">
                  <Cpu size={14} className="text-[var(--accent)]" />
                  <strong>PRIMARY DESKTOP RIG</strong>
                </div>
              )}
              <div className="field-grid two-col">
                <label className="form-field">
                  <span>Processor (CPU)</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.cpu || ""}
                    onChange={(e) => updateGear("cpu", e.target.value)}
                    placeholder="e.g. AMD Ryzen 7 7800X3D"
                  />
                </label>
                <label className="form-field">
                  <span>Graphics (GPU)</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.gpu || ""}
                    onChange={(e) => updateGear("gpu", e.target.value)}
                    placeholder="e.g. NVIDIA RTX 4080 Super"
                  />
                </label>
                <label className="form-field">
                  <span>Memory (RAM)</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.ram || ""}
                    onChange={(e) => updateGear("ram", e.target.value)}
                    placeholder="e.g. 32GB DDR5 6000MHz"
                  />
                </label>
                <label className="form-field">
                  <span>Display / Monitor</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.display || ""}
                    onChange={(e) => updateGear("display", e.target.value)}
                    placeholder="e.g. 27'' OLED 240Hz"
                  />
                </label>
                <label className="form-field">
                  <span>Gaming Mouse</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.mouse || ""}
                    onChange={(e) => updateGear("mouse", e.target.value)}
                    placeholder="e.g. Logitech G Pro X Superlight"
                  />
                </label>
                <label className="form-field">
                  <span>Keyboard</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.keyboard || ""}
                    onChange={(e) => updateGear("keyboard", e.target.value)}
                    placeholder="e.g. Custom 75% Mechanical"
                  />
                </label>
                <label className="form-field">
                  <span>Audio / Headset</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.headset || ""}
                    onChange={(e) => updateGear("headset", e.target.value)}
                    placeholder="e.g. Beyerdynamic DT 990 Pro"
                  />
                </label>
                <label className="form-field">
                  <span>Storage</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.storage || ""}
                    onChange={(e) => updateGear("storage", e.target.value)}
                    placeholder="e.g. 2TB NVMe Gen4 SSD"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Laptop Fields */}
          {(profile.gamingSetup?.setupType === "laptop" ||
            profile.gamingSetup?.setupType === "both") && (
            <div className="space-y-4">
              {(profile.gamingSetup?.setupType === "both") && (
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-white/70 border-b border-slate-200 dark:border-white/5 pb-2 pt-2">
                  <Laptop size={14} className="text-[var(--accent)]" />
                  <strong>PORTABLE GAMING LAPTOP</strong>
                </div>
              )}
              <div className="field-grid two-col">
                <label className="form-field">
                  <span>Laptop Model</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.laptopModel || ""}
                    onChange={(e) => updateGear("laptopModel", e.target.value)}
                    placeholder="e.g. ASUS ROG Zephyrus G16 / Lenovo Legion 7"
                  />
                </label>
                <label className="form-field">
                  <span>Laptop Processor (CPU)</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.laptopCpu || ""}
                    onChange={(e) => updateGear("laptopCpu", e.target.value)}
                    placeholder="e.g. Intel Core i9-14900HX / Ryzen 9"
                  />
                </label>
                <label className="form-field">
                  <span>Dedicated GPU (dGPU) <small>Gaming Graphics</small></span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.laptopGpu || ""}
                    onChange={(e) => updateGear("laptopGpu", e.target.value)}
                    placeholder="e.g. NVIDIA GeForce RTX 3060 Laptop GPU (6GB)"
                  />
                </label>
                <label className="form-field">
                  <span>Integrated GPU (iGPU) <small>Display / Battery</small></span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.laptopIgpu || ""}
                    onChange={(e) => updateGear("laptopIgpu", e.target.value)}
                    placeholder="e.g. AMD Radeon 680M Graphics"
                  />
                </label>
                <label className="form-field">
                  <span>Laptop Memory (RAM)</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.laptopRam || ""}
                    onChange={(e) => updateGear("laptopRam", e.target.value)}
                    placeholder="e.g. 32GB DDR5 5600MHz"
                  />
                </label>
                <label className="form-field">
                  <span>Built-in Screen / Display</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.laptopDisplay || ""}
                    onChange={(e) => updateGear("laptopDisplay", e.target.value)}
                    placeholder="e.g. 16'' QHD+ 240Hz OLED / Mini-LED"
                  />
                </label>
                <label className="form-field">
                  <span>Laptop Storage</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.laptopStorage || ""}
                    onChange={(e) => updateGear("laptopStorage", e.target.value)}
                    placeholder="e.g. 1TB M.2 NVMe SSD"
                  />
                </label>
                <label className="form-field">
                  <span>Portable Mouse</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.laptopMouse || ""}
                    onChange={(e) => updateGear("laptopMouse", e.target.value)}
                    placeholder="e.g. Razer Orochi V2 / Viper Mini"
                  />
                </label>
                <label className="form-field">
                  <span>Earphones / Headset</span>
                  <input
                    className="input"
                    value={profile.gamingSetup?.laptopHeadset || ""}
                    onChange={(e) => updateGear("laptopHeadset", e.target.value)}
                    placeholder="e.g. IEMs / AirPods Pro / Wireless Headset"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Competitive In-Game Settings & Crosshairs */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Crosshair size={16} className="text-[var(--accent)]" />
                <div>
                  <h4 className="text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
                    Competitive Settings & Crosshairs
                  </h4>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-white/50">
                    Showcase your DPI, sensitivity, eDPI, resolution, and 1-click copyable crosshair codes.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 mr-1">Quick Add:</span>
                <button
                  type="button"
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white text-[10px] font-mono border border-slate-200 dark:border-white/10 transition-colors"
                  onClick={() => addGameSetting({ game: "Valorant", dpi: 800, sens: "0.35", res: "1920x1080 (16:9)" })}
                >
                  + Valorant
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white text-[10px] font-mono border border-slate-200 dark:border-white/10 transition-colors"
                  onClick={() => addGameSetting({ game: "Counter-Strike 2", dpi: 800, sens: "1.2", res: "1280x960 (4:3)" })}
                >
                  + CS2
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white text-[10px] font-mono border border-slate-200 dark:border-white/10 transition-colors"
                  onClick={() => addGameSetting({ game: "Apex Legends", dpi: 800, sens: "1.5", res: "1920x1080 (16:9)" })}
                >
                  + Apex
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white text-[10px] font-mono border border-slate-200 dark:border-white/10 transition-colors"
                  onClick={() => addGameSetting({ game: "Overwatch 2", dpi: 800, sens: "4.0", res: "1920x1080 (16:9)" })}
                >
                  + OW2
                </button>
              </div>
            </div>

            {/* List of Game Settings */}
            <div className="space-y-4">
              {(profile.gamingSetup?.gameSettings || []).map((setting, idx) => (
                <div
                  key={setting.id || idx}
                  className="p-4 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                    <span className="text-xs font-mono font-semibold text-[var(--accent)] tracking-wider uppercase">
                      {`PROFILE #${idx + 1} // ${setting.game || "Untitled Game"}`}
                    </span>
                    <button
                      type="button"
                      aria-label="Remove setting"
                      onClick={() => removeGameSetting(idx)}
                      className="text-slate-400 dark:text-white/40 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="field-grid two-col">
                    <label className="form-field">
                      <span>Game Title</span>
                      <input
                        className="input"
                        value={setting.game}
                        onChange={(e) => updateGameSetting(idx, "game", e.target.value)}
                        placeholder="e.g. Valorant, CS2"
                      />
                    </label>
                    <label className="form-field">
                      <span>Crosshair Code <small>1-click copyable</small></span>
                      <input
                        className="input"
                        value={setting.crosshairCode || ""}
                        onChange={(e) => updateGameSetting(idx, "crosshairCode", e.target.value)}
                        placeholder="e.g. 0;s;1;P;c;5;h;0;m;1;0l;4;0o;0;0a;1;0f;0;1b;0"
                      />
                    </label>
                    <label className="form-field">
                      <span>Mouse DPI</span>
                      <input
                        className="input"
                        type="number"
                        min={100}
                        max={32000}
                        value={setting.dpi ?? ""}
                        onChange={(e) => updateGameSetting(idx, "dpi", e.target.value ? parseInt(e.target.value, 10) : null)}
                        placeholder="800"
                      />
                    </label>
                    <label className="form-field">
                      <span>In-Game Sensitivity</span>
                      <input
                        className="input"
                        value={setting.sens || ""}
                        onChange={(e) => updateGameSetting(idx, "sens", e.target.value)}
                        placeholder="0.35"
                      />
                    </label>
                    <label className="form-field">
                      <span>eDPI <small>optional (or auto)</small></span>
                      <input
                        className="input"
                        value={setting.edpi || ""}
                        onChange={(e) => updateGameSetting(idx, "edpi", e.target.value)}
                        placeholder="e.g. 280"
                      />
                    </label>
                    <label className="form-field">
                      <span>Resolution & Aspect Ratio</span>
                      <input
                        className="input"
                        value={setting.resolution || ""}
                        onChange={(e) => updateGameSetting(idx, "resolution", e.target.value)}
                        placeholder="e.g. 1920x1080 (16:9) or 1280x960 (4:3)"
                      />
                    </label>
                    <label className="form-field">
                      <span>Polling Rate</span>
                      <input
                        className="input"
                        value={setting.pollingRate || ""}
                        onChange={(e) => updateGameSetting(idx, "pollingRate", e.target.value)}
                        placeholder="e.g. 1000Hz or 4000Hz"
                      />
                    </label>
                    <label className="form-field">
                      <span>Mousepad / Surface</span>
                      <input
                        className="input"
                        value={setting.mousepad || ""}
                        onChange={(e) => updateGameSetting(idx, "mousepad", e.target.value)}
                        placeholder="e.g. Artisan Zero Soft / Razer Gigantus"
                      />
                    </label>
                    <label className="form-field two-col-span">
                      <span>Notes / Grip Style</span>
                      <input
                        className="input"
                        value={setting.notes || ""}
                        onChange={(e) => updateGameSetting(idx, "notes", e.target.value)}
                        placeholder="e.g. Relaxed claw grip, RawAccel disabled, 110 FOV"
                      />
                    </label>
                  </div>
                </div>
              ))}

              {(!profile.gamingSetup?.gameSettings || profile.gamingSetup.gameSettings.length === 0) && (
                <div className="mini-empty">
                  <Crosshair size={18} />
                  <span>No competitive game settings added yet. Click &quot;+ Add Game Profile&quot; or a preset above.</span>
                </div>
              )}

              <button
                className="button button-secondary"
                type="button"
                onClick={() => addGameSetting()}
                disabled={(profile.gamingSetup?.gameSettings || []).length >= 12}
              >
                <Plus size={16} /> Add Game Profile
              </button>
            </div>
          </div>
        </section>

        <section className="surface-card editor-section">
          <SectionHeader
            title="Game vault (Now Playing & Favorites)"
            detail="Highlight what you are playing, your top rated games, and backlog."
            action={
              <span className="section-icon">
                <Gamepad2 size={19} />
              </span>
            }
          />
          <div className="space-y-4">
            {(profile.favoriteGames || []).map((game, index) => (
              <div
                key={game.id}
                className="p-4 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50/60 dark:bg-white/[0.02] space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-white/70">
                    GAME #{index + 1}
                  </span>
                  <button
                    className="icon-button danger"
                    type="button"
                    aria-label={`Remove ${game.title}`}
                    onClick={() =>
                      update(
                        "favoriteGames",
                        (profile.favoriteGames || []).filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="field-grid two-col">
                  <label className="form-field">
                    <span>Title</span>
                    <input
                      className="input"
                      value={game.title}
                      onChange={(e) => updateGame(index, "title", e.target.value)}
                      placeholder="Cyberpunk 2077"
                    />
                  </label>
                  <label className="form-field">
                    <span>Status</span>
                    <select
                      className="input"
                      value={game.status}
                      onChange={(e) => updateGame(index, "status", e.target.value as GameItem["status"])}
                    >
                      <option value="playing">Now Playing</option>
                      <option value="favorite">All-time Favorite</option>
                      <option value="completed">Completed / 100%</option>
                      <option value="backlog">Backlog / Wishlist</option>
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Platform</span>
                    <input
                      className="input"
                      value={game.platform || ""}
                      onChange={(e) => updateGame(index, "platform", e.target.value)}
                      placeholder="PC / Steam, PS5, Switch"
                    />
                  </label>
                  <label className="form-field">
                    <span>Hours Logged</span>
                    <input
                      className="input"
                      type="number"
                      min={0}
                      value={game.hours ?? ""}
                      onChange={(e) =>
                        updateGame(
                          index,
                          "hours",
                          e.target.value ? parseInt(e.target.value, 10) : null,
                        )
                      }
                      placeholder="e.g. 150"
                    />
                  </label>
                  <label className="form-field">
                    <span>Rating (0-10)</span>
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      min={0}
                      max={10}
                      value={game.rating ?? ""}
                      onChange={(e) =>
                        updateGame(
                          index,
                          "rating",
                          e.target.value ? parseFloat(e.target.value) : null,
                        )
                      }
                      placeholder="e.g. 9.5"
                    />
                  </label>
                  <label className="form-field">
                    <span>Cover Image URL <small>optional</small></span>
                    <input
                      className="input"
                      type="url"
                      value={game.coverUrl || ""}
                      onChange={(e) => updateGame(index, "coverUrl", e.target.value)}
                      placeholder="https://... (game cover)"
                    />
                  </label>
                </div>
              </div>
            ))}

            {(!profile.favoriteGames || profile.favoriteGames.length === 0) && (
              <div className="mini-empty">
                <Gamepad2 size={19} />
                <span>No games added to vault yet.</span>
              </div>
            )}

            <button
              className="button button-secondary"
              type="button"
              onClick={addGame}
              disabled={(profile.favoriteGames || []).length >= 24}
            >
              <Plus size={16} /> Add game
            </button>
          </div>
        </section>

        <section className="surface-card editor-section">
          <SectionHeader
            title="Clips & gaming highlights"
            detail="Show off clutch moments from YouTube, YouTube Shorts, Twitch clips, Medal.tv, or direct MP4."
            action={
              <span className="section-icon">
                <Film size={19} />
              </span>
            }
          />

          <div className="space-y-4">
            {(profile.gamingSetup?.clips || []).map((clip, idx) => (
              <div
                key={clip.id || idx}
                className="p-4 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                  <span className="text-xs font-mono font-semibold text-[var(--accent)] tracking-wider uppercase">
                    {`CLIP #${idx + 1} // ${clip.title || "Untitled Clip"}`}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove clip ${clip.title}`}
                    onClick={() => removeClip(idx)}
                    className="text-slate-400 dark:text-white/40 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="field-grid two-col">
                  <label className="form-field">
                    <span>Clip Title</span>
                    <input
                      className="input"
                      value={clip.title}
                      onChange={(e) => updateClip(idx, "title", e.target.value)}
                      placeholder="e.g. 1v5 Clutch in Radiant Lobby"
                    />
                  </label>
                  <label className="form-field">
                    <span>Game / Category</span>
                    <input
                      className="input"
                      value={clip.game || ""}
                      onChange={(e) => updateClip(idx, "game", e.target.value)}
                      placeholder="e.g. Valorant, CS2, Apex"
                    />
                  </label>
                  <label className="form-field two-col-span">
                    <span>Video URL <small>YouTube, Shorts, Twitch Clip, Medal.tv, MP4</small></span>
                    <input
                      className="input"
                      type="url"
                      value={clip.videoUrl}
                      onChange={(e) => updateClip(idx, "videoUrl", e.target.value)}
                      placeholder="https://youtube.com/shorts/... or https://clips.twitch.tv/..."
                    />
                  </label>
                  <label className="form-field">
                    <span>Custom Thumbnail URL <small>optional (auto for YouTube)</small></span>
                    <input
                      className="input"
                      type="url"
                      value={clip.thumbnailUrl || ""}
                      onChange={(e) => updateClip(idx, "thumbnailUrl", e.target.value)}
                      placeholder="https://... (image url)"
                    />
                  </label>
                  <label className="form-field">
                    <span>Brief Description <small>optional</small></span>
                    <input
                      className="input"
                      maxLength={200}
                      value={clip.description || ""}
                      onChange={(e) => updateClip(idx, "description", e.target.value)}
                      placeholder="e.g. Overtime round match point"
                    />
                  </label>
                </div>
              </div>
            ))}

            {(!profile.gamingSetup?.clips || profile.gamingSetup.clips.length === 0) && (
              <div className="mini-empty">
                <Film size={19} />
                <span>No clips added yet. Showcase your clutches and funny moments!</span>
              </div>
            )}

            <button
              className="button button-secondary"
              type="button"
              onClick={addClip}
              disabled={(profile.gamingSetup?.clips || []).length >= 12}
            >
              <Plus size={16} /> Add clip
            </button>
          </div>
        </section>

        <section className="surface-card editor-section">
          <SectionHeader
            title="Tournament history & competitive milestones"
            detail="Showcase official tournament placements, LAN experiences, teams, roles, prize earnings, and brackets."
            action={
              <span className="section-icon">
                <Trophy size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            {/* Quick preset selector */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs text-slate-600 dark:text-white/50 font-mono">Quick-add preset:</span>
              {TOURNAMENT_PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  className="button button-sm button-secondary"
                  onClick={() => addTournament(preset.item)}
                  disabled={(profile.gamingSetup?.tournaments || []).length >= 25}
                >
                  <Plus size={13} /> {preset.title}
                </button>
              ))}
            </div>

            {(profile.gamingSetup?.tournaments || []).map((tourney, idx) => {
              const visuals = getTierInfo(tourney.tier);
              return (
                <div key={tourney.id || idx} className="surface-panel item-card">
                  <div className="item-card-header">
                    <div className="flex items-center gap-2">
                      <span
                        className="badge"
                        style={{ color: visuals.accentHex, borderColor: visuals.accentHex }}
                      >
                        {visuals.shortLabel}
                      </span>
                      <strong>
                        {tourney.tournamentName || `Tournament #${idx + 1}`}
                      </strong>
                      <span className="text-xs text-slate-500 dark:text-white/40">
                        ({tourney.game || "Game"})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => moveTournament(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => moveTournament(idx, 1)}
                        disabled={
                          idx === (profile.gamingSetup?.tournaments || []).length - 1
                        }
                        title="Move Down"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        className="icon-button icon-button-danger"
                        type="button"
                        onClick={() => removeTournament(idx)}
                        title="Delete tournament"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="form-grid">
                    <label className="form-field">
                      <span>Tournament Name *</span>
                      <input
                        className="input"
                        value={tourney.tournamentName}
                        onChange={(e) =>
                          updateTournament(idx, "tournamentName", e.target.value)
                        }
                        placeholder="e.g. VCT Premier Division Playoff"
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span>Game *</span>
                      <input
                        className="input"
                        value={tourney.game}
                        onChange={(e) =>
                          updateTournament(idx, "game", e.target.value)
                        }
                        placeholder="e.g. Valorant, CS2, Apex"
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span>Placement Title *</span>
                      <input
                        className="input"
                        value={tourney.placement}
                        onChange={(e) =>
                          updateTournament(idx, "placement", e.target.value)
                        }
                        placeholder="e.g. 1st Place (Champion), Top 4"
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span>Placement Tier</span>
                      <select
                        className="input"
                        value={tourney.tier || "podium"}
                        onChange={(e) =>
                          updateTournament(
                            idx,
                            "tier",
                            e.target.value as TournamentTier
                          )
                        }
                      >
                        <option value="champion">🏆 1st / Champion (Gold)</option>
                        <option value="runner_up">🥈 2nd / Runner-Up (Silver)</option>
                        <option value="podium">🥉 3rd / Top 4 (Bronze)</option>
                        <option value="top_eight">
                          🛡️ Top 8 / Quarter-Finals (Cyan)
                        </option>
                        <option value="qualified">
                          🎯 Qualified / Group Stage (Purple)
                        </option>
                      </select>
                    </label>

                    <label className="form-field">
                      <span>Date <small>YYYY-MM or YYYY</small></span>
                      <input
                        className="input"
                        value={tourney.date || ""}
                        onChange={(e) =>
                          updateTournament(idx, "date", e.target.value)
                        }
                        placeholder="e.g. 2024-11"
                      />
                    </label>

                    <label className="form-field">
                      <span>Format</span>
                      <input
                        className="input"
                        value={tourney.format || ""}
                        onChange={(e) =>
                          updateTournament(idx, "format", e.target.value)
                        }
                        placeholder="e.g. LAN Finals, Online Playoff"
                      />
                    </label>

                    <label className="form-field">
                      <span>Team Name <small>optional</small></span>
                      <input
                        className="input"
                        value={tourney.teamName || ""}
                        onChange={(e) =>
                          updateTournament(idx, "teamName", e.target.value)
                        }
                        placeholder="e.g. Aogiri Syndicate, Solo"
                      />
                    </label>

                    <label className="form-field">
                      <span>Player Role <small>optional</small></span>
                      <input
                        className="input"
                        value={tourney.role || ""}
                        onChange={(e) =>
                          updateTournament(idx, "role", e.target.value)
                        }
                        placeholder="e.g. IGL / Duelist, AWPer"
                      />
                    </label>

                    <label className="form-field">
                      <span>Prize Won <small>optional</small></span>
                      <input
                        className="input"
                        value={tourney.prize || ""}
                        onChange={(e) =>
                          updateTournament(idx, "prize", e.target.value)
                        }
                        placeholder="e.g. $2,500 USD, Trophy"
                      />
                    </label>

                    <label className="form-field">
                      <span>Organizer <small>optional</small></span>
                      <input
                        className="input"
                        value={tourney.organizer || ""}
                        onChange={(e) =>
                          updateTournament(idx, "organizer", e.target.value)
                        }
                        placeholder="e.g. Riot Games, ESL, FACEIT"
                      />
                    </label>

                    <label className="form-field full-width">
                      <span>Official Link / Bracket URL <small>optional</small></span>
                      <input
                        className="input"
                        type="url"
                        value={tourney.link || ""}
                        onChange={(e) =>
                          updateTournament(idx, "link", e.target.value)
                        }
                        placeholder="https://vlr.gg/... or https://faceit.com/..."
                      />
                    </label>

                    <label className="form-field full-width">
                      <span>Highlight / Memorable Clutch <small>optional</small></span>
                      <input
                        className="input"
                        maxLength={200}
                        value={tourney.highlight || ""}
                        onChange={(e) =>
                          updateTournament(idx, "highlight", e.target.value)
                        }
                        placeholder="e.g. 13-11 Game 3 clutch in grand finals overtime"
                      />
                    </label>
                  </div>
                </div>
              );
            })}

            {(!profile.gamingSetup?.tournaments ||
              profile.gamingSetup.tournaments.length === 0) && (
              <div className="mini-empty">
                <Trophy size={19} />
                <span>
                  No tournament milestones added yet. Flex your competitive career!
                </span>
              </div>
            )}

            <button
              className="button button-secondary"
              type="button"
              onClick={() => addTournament()}
              disabled={(profile.gamingSetup?.tournaments || []).length >= 25}
            >
              <Plus size={16} /> Add tournament
            </button>
          </div>
        </section>

        <section className="surface-card editor-section" id="editor-passport">
          <SectionHeader
            title="Gamer Passport & In-Game IDs"
            detail="Configure your 3D Holographic digital ID card, gamer tags, callsign, and 1-click platform friend codes."
            action={
              <span className="section-icon">
                <IdCard size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            {/* On / Off Toggle */}
            <div className="setting-list mb-4">
              <label className="setting-row">
                <span className="setting-icon">
                  <IdCard size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Show Gamer Passport & IDs on profile</strong>
                  <small>
                    {profile.gamingSetup?.passport?.enabled !== false
                      ? "Currently ON — Passport and platform IDs are visible to visitors"
                      : "Currently OFF — Passport is hidden from public profile and navigation"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.passport?.enabled !== false}
                  onChange={(e) => updatePassport("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            {profile.gamingSetup?.passport?.enabled === false && (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/[0.02] text-xs font-mono text-slate-600 dark:text-white/50 flex items-center gap-2">
                <span>●</span>
                <span>Gamer Passport is currently hidden from public visitors. Toggle the switch above to show it.</span>
              </div>
            )}

            <div className="field-grid two-col">
              <label className="form-field">
                <span>
                  Operator Callsign <small>e.g. SHADOW-01</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={40}
                  value={profile.gamingSetup?.passport?.callsign || ""}
                  onChange={(e) => updatePassport("callsign", e.target.value)}
                  placeholder="SHADOW-01"
                />
              </label>

              <label className="form-field">
                <span>
                  Passport Title <small>top badge text</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={60}
                  value={profile.gamingSetup?.passport?.title || ""}
                  onChange={(e) => updatePassport("title", e.target.value)}
                  placeholder="SANCTUM OPERATOR PASSPORT"
                />
              </label>

              <label className="form-field">
                <span>
                  Tagline / Archetype <small>e.g. TACTICAL FPS // IGL</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={80}
                  value={profile.gamingSetup?.passport?.tagline || ""}
                  onChange={(e) => updatePassport("tagline", e.target.value)}
                  placeholder="COMPETITIVE GAMING // MULTI-PLATFORM ID"
                />
              </label>

              <label className="form-field">
                <span>
                  Region Server <small>e.g. APAC / SEA</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={40}
                  value={profile.gamingSetup?.passport?.region || ""}
                  onChange={(e) => updatePassport("region", e.target.value)}
                  placeholder="GLOBAL // APAC"
                />
              </label>

              <label className="form-field">
                <span>
                  Rank / Division <small>e.g. Ascendant / Immortal</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={40}
                  value={profile.gamingSetup?.passport?.rankTier || ""}
                  onChange={(e) => updatePassport("rankTier", e.target.value)}
                  placeholder="ELITE DIVISION"
                />
              </label>

              <label className="form-field">
                <span>
                  Clearance Level <small>e.g. CLEARANCE S-TIER</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={30}
                  value={profile.gamingSetup?.passport?.clearanceLevel || ""}
                  onChange={(e) => updatePassport("clearanceLevel", e.target.value)}
                  placeholder="CLEARANCE S-TIER"
                />
              </label>
            </div>

            {/* Quick Presets for tags */}
            <div className="pt-2">
              <span className="text-xs text-slate-600 dark:text-white/50 font-mono block mb-2">
                Quick-add platform friend code or gamer tag:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.values(PASSPORT_PLATFORMS).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="button button-sm button-secondary text-xs"
                    onClick={() => addPassportTag(p.id as GamerPassportTag["platform"])}
                    disabled={(profile.gamingSetup?.passport?.tags || []).length >= 12}
                  >
                    <Plus size={13} /> {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Existing tags list */}
            {(profile.gamingSetup?.passport?.tags || []).map((tagItem, idx) => (
              <div
                key={tagItem.id}
                className="p-4 border border-white/10 rounded-lg bg-white/[0.02] space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase">
                      {`TAG #${idx + 1} // ${tagItem.label || "Platform ID"}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="icon-button"
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePassportTag(idx, -1)}
                      title="Move up"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      className="icon-button"
                      type="button"
                      disabled={
                        idx === (profile.gamingSetup?.passport?.tags || []).length - 1
                      }
                      onClick={() => movePassportTag(idx, 1)}
                      title="Move down"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => removePassportTag(idx)}
                      title="Remove tag"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="field-grid three-col">
                  <label className="form-field">
                    <span>Platform</span>
                    <select
                      className="input"
                      value={tagItem.platform}
                      onChange={(e) =>
                        updatePassportTag(
                          idx,
                          "platform",
                          e.target.value as GamerPassportTag["platform"]
                        )
                      }
                    >
                      {Object.values(PASSPORT_PLATFORMS).map((plat) => (
                        <option key={plat.id} value={plat.id}>
                          {plat.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-field">
                    <span>Display Label</span>
                    <input
                      className="input font-mono"
                      maxLength={50}
                      value={tagItem.label}
                      onChange={(e) => updatePassportTag(idx, "label", e.target.value)}
                      placeholder="e.g. Riot ID, Steam Code"
                    />
                  </label>

                  <label className="form-field">
                    <span>Gamer Tag / Friend Code</span>
                    <input
                      className="input font-mono"
                      maxLength={100}
                      value={tagItem.tag}
                      onChange={(e) => updatePassportTag(idx, "tag", e.target.value)}
                      placeholder={
                        PASSPORT_PLATFORMS[tagItem.platform]?.placeholder ||
                        "Handle or Code"
                      }
                    />
                  </label>
                </div>
              </div>
            ))}

            {(profile.gamingSetup?.passport?.tags || []).length === 0 && (
              <div className="empty-state">
                <IdCard size={19} />
                <span>
                  No custom gamer tags added yet. Use the quick-add buttons above to add your Riot ID, Steam Code, or Discord handle!
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="surface-card editor-section" id="editor-skills">
          <SectionHeader
            title="RPG Combat Radar & Playstyle Matrix"
            detail="Configure your 6-axis combat ratings, competitive archetype, signature mains, win rate, and role."
            action={
              <span className="section-icon">
                <Swords size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            {/* On / Off Toggle */}
            <div className="setting-list mb-4">
              <label className="setting-row">
                <span className="setting-icon">
                  <Swords size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Show Combat Radar & Skill Matrix on profile</strong>
                  <small>
                    {profile.gamingSetup?.skillMatrix?.enabled !== false
                      ? "Currently ON — Radar chart and ratings are visible"
                      : "Currently OFF — Completely hidden from visitors (great for casual play or when not focusing on competitive gaming)"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.skillMatrix?.enabled !== false}
                  onChange={(e) => updateSkillMatrix("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            {profile.gamingSetup?.skillMatrix?.enabled === false && (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/[0.02] text-xs font-mono text-slate-600 dark:text-white/50 flex items-center gap-2">
                <span>●</span>
                <span>Combat Radar & Skill Matrix is currently hidden from your public profile. Toggle the switch above to show it.</span>
              </div>
            )}

            <div className="field-grid two-col">
              <label className="form-field">
                <span>
                  Matrix Title <small>e.g. COMBAT CAPABILITY RADAR</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={60}
                  value={profile.gamingSetup?.skillMatrix?.title || ""}
                  onChange={(e) => updateSkillMatrix("title", e.target.value)}
                  placeholder="COMBAT CAPABILITY RADAR"
                />
              </label>

              <label className="form-field">
                <span>
                  Player Archetype <small>e.g. AGGRESSIVE ENTRY FRAGGER</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={60}
                  value={profile.gamingSetup?.skillMatrix?.archetype || ""}
                  onChange={(e) => updateSkillMatrix("archetype", e.target.value)}
                  placeholder="AGGRESSIVE ENTRY FRAGGER"
                />
              </label>

              <label className="form-field">
                <span>
                  Primary In-Game Role <small>e.g. Duelist / IGL</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={50}
                  value={profile.gamingSetup?.skillMatrix?.primaryRole || ""}
                  onChange={(e) => updateSkillMatrix("primaryRole", e.target.value)}
                  placeholder="Duelist / In-Game Leader"
                />
              </label>

              <label className="form-field">
                <span>
                  Signature Agents / Mains <small>e.g. Jett / Omen / Reyna</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={50}
                  value={profile.gamingSetup?.skillMatrix?.signatureAgent || ""}
                  onChange={(e) => updateSkillMatrix("signatureAgent", e.target.value)}
                  placeholder="Jett / Omen / Reyna"
                />
              </label>

              <label className="form-field">
                <span>
                  Competitive Win Rate <small>e.g. 64.8% WR</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={20}
                  value={profile.gamingSetup?.skillMatrix?.winRate || ""}
                  onChange={(e) => updateSkillMatrix("winRate", e.target.value)}
                  placeholder="64.8% WR"
                />
              </label>

              <label className="form-field">
                <span>
                  K/D Ratio <small>e.g. 1.42 K/D</small>
                </span>
                <input
                  className="input font-mono"
                  maxLength={20}
                  value={profile.gamingSetup?.skillMatrix?.kda || ""}
                  onChange={(e) => updateSkillMatrix("kda", e.target.value)}
                  placeholder="1.42 K/D"
                />
              </label>
            </div>

            {/* 6 Attributes Calibration */}
            <div className="pt-2">
              <span className="text-xs text-slate-600 dark:text-white/50 font-mono block mb-3 uppercase tracking-wider">
                Attribute Calibration (0 to 100):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  profile.gamingSetup?.skillMatrix?.attributes || [
                    { attribute: "AIM / FLICK", value: 94, fullMark: 100 },
                    { attribute: "MACRO SENSE", value: 86, fullMark: 100 },
                    { attribute: "CLUTCH (1vX)", value: 91, fullMark: 100 },
                    { attribute: "COMMS & IGL", value: 88, fullMark: 100 },
                    { attribute: "MENTAL / TILT", value: 95, fullMark: 100 },
                    { attribute: "VERSATILITY", value: 84, fullMark: 100 },
                  ]
                ).map((attr, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50/60 dark:bg-white/[0.02] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-slate-900 dark:text-white/90">{attr.attribute}</span>
                      <span className="text-[var(--accent)] font-bold">{attr.value} / 100</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={attr.value}
                      onChange={(e) => updateSkillAttribute(idx, Number(e.target.value))}
                      className="w-full accent-[var(--accent)] cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card editor-section" id="editor-kudos">
          <SectionHeader
            title="Arcade Kudos Deck (1-Click Reactions)"
            detail="Allow visitors to tap instant GG, Hype, Cracked, Respect, and MVP reaction bursts."
            action={
              <span className="section-icon">
                <Zap size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            <div className="setting-list mb-2">
              <label className="setting-row">
                <span className="setting-icon">
                  <Zap size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Enable 1-Click Arcade Kudos reactions</strong>
                  <small>
                    {profile.gamingSetup?.kudos?.enabled !== false
                      ? "Currently ON — Visitors can tap reaction buttons and spark effects in the community section"
                      : "Currently OFF — Kudos reaction deck is hidden from the public profile"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.kudos?.enabled !== false}
                  onChange={(e) => {
                    const current = profile.gamingSetup?.kudos || {};
                    update("gamingSetup", {
                      ...(profile.gamingSetup || {}),
                      kudos: {
                        ...current,
                        enabled: e.target.checked,
                      },
                    });
                  }}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            {profile.gamingSetup?.kudos?.enabled === false && (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/[0.02] text-xs font-mono text-slate-600 dark:text-white/50 flex items-center gap-2">
                <span>●</span>
                <span>Arcade Kudos Deck is currently hidden from public visitors. Toggle the switch above to show it.</span>
              </div>
            )}
          </div>
        </section>

        {/* 1. VISITOR GUESTBOOK & ARCADE STAMPS */}
        <section className="surface-card editor-section" id="editor-guestbook">
          <SectionHeader
            title="Visitor Guestbook & Arcade Stamp Station"
            detail="Allow visitors, friends, and clanmates to stamp their callsign, platform, and leave friendly notes."
            action={
              <span className="section-icon">
                <Gamepad2 size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            <div className="setting-list mb-4">
              <label className="setting-row">
                <span className="setting-icon">
                  <Gamepad2 size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Show Visitor Guestbook on profile</strong>
                  <small>
                    {profile.gamingSetup?.guestbook?.enabled !== false
                      ? "Currently ON — Visitors can sign and stamp their mark in your public guestbook"
                      : "Currently OFF — Completely hidden from visitors (great for quiet periods)"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.guestbook?.enabled !== false}
                  onChange={(e) => updateGuestbook("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            <div className="field-grid two-col">
              <label className="form-field">
                <span>Section Title <small>e.g. Visitor Stamps &amp; Guestbook</small></span>
                <input
                  className="input font-mono"
                  maxLength={60}
                  value={profile.gamingSetup?.guestbook?.title || ""}
                  onChange={(e) => updateGuestbook("title", e.target.value)}
                  placeholder="Visitor Stamps & Guestbook"
                />
              </label>
              <label className="form-field">
                <span>Subtitle / Welcome prompt</span>
                <input
                  className="input font-mono"
                  maxLength={120}
                  value={profile.gamingSetup?.guestbook?.subtitle || ""}
                  onChange={(e) => updateGuestbook("subtitle", e.target.value)}
                  placeholder="Leave your gamer callsign, platform, and stamp your mark."
                />
              </label>
            </div>
          </div>
        </section>

        {/* 2. CHILL GAMING LOUNGE AUDIO PLAYER */}
        <section className="surface-card editor-section" id="editor-chill-lounge">
          <SectionHeader
            title="Chill Gaming Lounge (Lo-Fi & Soundscapes)"
            detail="A floating mini-deck in the bottom corner playing procedural ambient soundscapes (Lo-Fi, Cyberpunk Rain, 8-Bit Arcade)."
            action={
              <span className="section-icon">
                <Headphones size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            <div className="setting-list mb-4">
              <label className="setting-row">
                <span className="setting-icon">
                  <Headphones size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Enable Chill Gaming Lounge Audio Player</strong>
                  <small>
                    {profile.gamingSetup?.chillLounge?.enabled !== false
                      ? "Currently ON — Floating lo-fi audio deck is active in the bottom corner"
                      : "Currently OFF — Audio player is hidden from public profile"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.chillLounge?.enabled !== false}
                  onChange={(e) => updateChillLounge("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            <div className="field-grid two-col">
              <label className="form-field">
                <span>Default Audio Preset</span>
                <select
                  className="input font-mono"
                  value={profile.gamingSetup?.chillLounge?.defaultTrack || "lofi"}
                  onChange={(e) =>
                    updateChillLounge(
                      "defaultTrack",
                      e.target.value as "lofi" | "rain" | "arcade" | "synthwave"
                    )
                  }
                >
                  <option value="lofi">☕ Lo-Fi Study &amp; Chill Beats</option>
                  <option value="rain">🌧️ Cyberpunk Rain Ambience</option>
                  <option value="arcade">👾 Retro 8-Bit Chiptune Arcade</option>
                  <option value="synthwave">🌌 Synthwave Highway Chord</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        {/* 3. CASUAL CORNER & COZY GAMES SHELF */}
        <section className="surface-card editor-section" id="editor-casual-corner">
          <SectionHeader
            title="Casual Corner &amp; Cozy Games Shelf"
            detail="Highlight your favorite indie, comfort, and co-op games that run smoothly without needing high-end specs."
            action={
              <span className="section-icon">
                <Coffee size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            <div className="setting-list mb-4">
              <label className="setting-row">
                <span className="setting-icon">
                  <Coffee size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Show Casual Corner on profile</strong>
                  <small>
                    {profile.gamingSetup?.casualCorner?.enabled !== false
                      ? "Currently ON — Cozy games showcase is visible to visitors"
                      : "Currently OFF — Casual shelf is hidden"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.casualCorner?.enabled !== false}
                  onChange={(e) => updateCasualCorner("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            <div className="field-grid two-col">
              <label className="form-field">
                <span>Headline <small>e.g. Casual Corner &amp; Comfort Games</small></span>
                <input
                  className="input font-mono"
                  maxLength={80}
                  value={profile.gamingSetup?.casualCorner?.headline || ""}
                  onChange={(e) => updateCasualCorner("headline", e.target.value)}
                  placeholder="Casual Corner & Comfort Games"
                />
              </label>
              <label className="form-field">
                <span>Description</span>
                <input
                  className="input font-mono"
                  maxLength={200}
                  value={profile.gamingSetup?.casualCorner?.description || ""}
                  onChange={(e) => updateCasualCorner("description", e.target.value)}
                  placeholder="Great games to enjoy without needing high-end specs or competitive sweat."
                />
              </label>
            </div>
          </div>
        </section>

        {/* 4. POTATO PC & LOW-SPEC OPTIMIZATION GUIDE */}
        <section className="surface-card editor-section" id="editor-potato-pc">
          <SectionHeader
            title="Potato PC &amp; Low-Spec Optimization Guide"
            detail="Share your practical Windows optimizations, resolution tweaks (stretched 4:3), and FPS commands with fellow gamers."
            action={
              <span className="section-icon">
                <Sliders size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            <div className="setting-list mb-4">
              <label className="setting-row">
                <span className="setting-icon">
                  <Sliders size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Show Potato PC Optimization Guide on profile</strong>
                  <small>
                    {profile.gamingSetup?.potatoPcGuide?.enabled !== false
                      ? "Currently ON — Visitors can read and copy your FPS optimization tweaks"
                      : "Currently OFF — Low-spec guide is hidden"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.potatoPcGuide?.enabled !== false}
                  onChange={(e) => updatePotatoPcGuide("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            <div className="field-grid two-col">
              <label className="form-field">
                <span>Guide Title <small>e.g. Low-Spec PC Optimization Guide</small></span>
                <input
                  className="input font-mono"
                  maxLength={80}
                  value={profile.gamingSetup?.potatoPcGuide?.title || ""}
                  onChange={(e) => updatePotatoPcGuide("title", e.target.value)}
                  placeholder="Low-Spec PC Optimization Guide"
                />
              </label>
              <label className="form-field">
                <span>Target Hardware <small>e.g. Budget PC / Intel UHD Graphics</small></span>
                <input
                  className="input font-mono"
                  maxLength={100}
                  value={profile.gamingSetup?.potatoPcGuide?.targetHardware || ""}
                  onChange={(e) => updatePotatoPcGuide("targetHardware", e.target.value)}
                  placeholder="Budget PC / Integrated Graphics / GTX 1050"
                />
              </label>
            </div>
          </div>
        </section>

        {/* 5. VISITOR THEME MATRIX SWITCHER */}
        <section className="surface-card editor-section" id="editor-theme-matrix">
          <SectionHeader
            title="Interactive Theme Matrix (Visitor Colorways)"
            detail="Enable a floating palette on your public profile letting visitors switch between Nebula Purple, Matrix Acid Green, Bloodline Red, and Synthwave Cyan."
            action={
              <span className="section-icon">
                <Palette size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            <div className="setting-list mb-2">
              <label className="setting-row">
                <span className="setting-icon">
                  <Palette size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Allow visitors to switch theme colorways</strong>
                  <small>
                    {profile.gamingSetup?.themeMatrix?.enabled !== false
                      ? "Currently ON — Floating colorway pill is available to visitors"
                      : "Currently OFF — Colorway switcher is hidden (locks your chosen theme)"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.themeMatrix?.enabled !== false}
                  onChange={(e) => updateThemeMatrix("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* 6. BATTLESTATION RIG INSPECTOR */}
        <section className="surface-card editor-section" id="editor-potato-rig">
          <SectionHeader
            title="Certified Potato Battlestation (Rig Inspector)"
            detail="Showcase your real budget hardware, humor telemetry, and tested FPS benchmarks with pride."
            action={
              <span className="section-icon">
                <Cpu size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            <div className="setting-list mb-2">
              <label className="setting-row">
                <span className="setting-icon">
                  <Cpu size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Enable Battlestation Spec Inspector</strong>
                  <small>
                    {profile.gamingSetup?.potatoRig?.enabled !== false
                      ? "Currently ON — Visitors can inspect your component specs & benchmarks"
                      : "Currently OFF — Rig inspector section is hidden"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.potatoRig?.enabled !== false}
                  onChange={(e) => updatePotatoRig("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            <div className="field-grid two-col">
              <label className="form-field">
                <span>Rig Name <small>e.g. The Trusty Budget Rig</small></span>
                <input
                  className="input font-mono"
                  maxLength={80}
                  value={profile.gamingSetup?.potatoRig?.rigName || ""}
                  onChange={(e) => updatePotatoRig("rigName", e.target.value)}
                  placeholder="The Trusty Budget Rig"
                />
              </label>
              <label className="form-field">
                <span>Badge / Title <small>e.g. Certified Potato Mark IV</small></span>
                <input
                  className="input font-mono"
                  maxLength={60}
                  value={profile.gamingSetup?.potatoRig?.rigBadge || ""}
                  onChange={(e) => updatePotatoRig("rigBadge", e.target.value)}
                  placeholder="Certified Potato Mark IV"
                />
              </label>
            </div>

            <label className="form-field">
              <span>Overall Hardware Verdict / Summary</span>
              <input
                className="input"
                maxLength={160}
                value={profile.gamingSetup?.potatoRig?.overallVerdict || ""}
                onChange={(e) => updatePotatoRig("overallVerdict", e.target.value)}
                placeholder="Honest hardware specs with tested benchmarks. Certified proof that good games don't require $2,000 graphics cards."
              />
            </label>
          </div>
        </section>

        {/* 7. CAN MY PC RUN IT? LOW-SPEC ADVISOR */}
        <section className="surface-card editor-section" id="editor-spec-advisor">
          <SectionHeader
            title="'Can My PC Run It?' Low-Spec Community Advisor"
            detail="Provide honest, tested advice on whether popular games will run on potato / budget laptops and desktops."
            action={
              <span className="section-icon">
                <Search size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            <div className="setting-list mb-2">
              <label className="setting-row">
                <span className="setting-icon">
                  <Search size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Enable Community Hardware Advisor</strong>
                  <small>
                    {profile.gamingSetup?.specAdvisor?.enabled !== false
                      ? "Currently ON — Visitors can search and check hardware verdicts"
                      : "Currently OFF — Hardware advisor section is hidden"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.specAdvisor?.enabled !== false}
                  onChange={(e) => updateSpecAdvisor("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            <div className="field-grid two-col">
              <label className="form-field">
                <span>Section Title <small>e.g. Can My Potato PC Run It?</small></span>
                <input
                  className="input font-mono"
                  maxLength={80}
                  value={profile.gamingSetup?.specAdvisor?.title || ""}
                  onChange={(e) => updateSpecAdvisor("title", e.target.value)}
                  placeholder="Can My Potato PC Run It?"
                />
              </label>
              <label className="form-field">
                <span>Subtitle / Advisory Note</span>
                <input
                  className="input"
                  maxLength={160}
                  value={profile.gamingSetup?.specAdvisor?.subtitle || ""}
                  onChange={(e) => updateSpecAdvisor("subtitle", e.target.value)}
                  placeholder="Honest verdicts for popular games on budget and low-spec machines."
                />
              </label>
            </div>
          </div>
        </section>

        {/* 8. ARCADE REACTION CHALLENGE */}
        <section className="surface-card editor-section" id="editor-reaction-game">
          <SectionHeader
            title="Arcade Reaction Challenge ('Beat My High Score')"
            detail="Let visitors test their reflex speed against your personal benchmark with retro sounds and instant ms feedback."
            action={
              <span className="section-icon">
                <Target size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            <div className="setting-list mb-2">
              <label className="setting-row">
                <span className="setting-icon">
                  <Target size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Enable Arcade Reflex Challenge</strong>
                  <small>
                    {profile.gamingSetup?.reactionGame?.enabled !== false
                      ? "Currently ON — Visitors can play the 1-click reflex test on your profile"
                      : "Currently OFF — Reaction mini-challenge is hidden"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.reactionGame?.enabled !== false}
                  onChange={(e) => updateReactionGame("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            <div className="field-grid two-col">
              <label className="form-field">
                <span>Challenge Title <small>e.g. Beat My Reaction High Score</small></span>
                <input
                  className="input font-mono"
                  maxLength={80}
                  value={profile.gamingSetup?.reactionGame?.title || ""}
                  onChange={(e) => updateReactionGame("title", e.target.value)}
                  placeholder="Beat My Reaction High Score"
                />
              </label>
              <label className="form-field">
                <span>Your Target Benchmark Score (Milliseconds)</span>
                <input
                  type="number"
                  className="input font-mono"
                  min={50}
                  max={2000}
                  value={profile.gamingSetup?.reactionGame?.ownerScoreMs ?? 215}
                  onChange={(e) => updateReactionGame("ownerScoreMs", Number(e.target.value) || 215)}
                  placeholder="215"
                />
              </label>
            </div>
          </div>
        </section>

        {/* 9. LOOKING FOR PARTY (LFP) BEACON */}
        <section className="surface-card editor-section" id="editor-party-beacon">
          <SectionHeader
            title="Looking For Party (LFP) Casual Beacon"
            detail="Signal to friends and visitors when you are open for casual co-op sessions without sweat or rage."
            action={
              <span className="section-icon">
                <Radio size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            <div className="setting-list mb-2">
              <label className="setting-row">
                <span className="setting-icon">
                  <Radio size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Enable LFP Squad Beacon</strong>
                  <small>
                    {profile.gamingSetup?.partyBeacon?.enabled !== false
                      ? "Currently ON — Pulsing squad beacon is broadcasted on your public profile"
                      : "Currently OFF — Party beacon is hidden"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.partyBeacon?.enabled !== false}
                  onChange={(e) => updatePartyBeacon("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            <div className="field-grid two-col">
              <label className="form-field">
                <span>Current Beacon Status</span>
                <select
                  className="input font-mono"
                  value={profile.gamingSetup?.partyBeacon?.status || "open"}
                  onChange={(e) => updatePartyBeacon("status", e.target.value as "open" | "duo_only" | "full_squad" | "offline")}
                >
                  <option value="open">🟢 Open for Co-op (Looking for Party)</option>
                  <option value="duo_only">🟡 Duo Mode (Need +1 Only)</option>
                  <option value="full_squad">🔴 Squad Full (In a Match)</option>
                  <option value="offline">⚪ Offline / AFK</option>
                </select>
              </label>
              <label className="form-field">
                <span>Beacon Headline <small>e.g. LFP // Chill Friday Night Co-op</small></span>
                <input
                  className="input font-mono"
                  maxLength={80}
                  value={profile.gamingSetup?.partyBeacon?.headline || ""}
                  onChange={(e) => updatePartyBeacon("headline", e.target.value)}
                  placeholder="LFP // Chill Friday Night Co-op"
                />
              </label>
            </div>

            <div className="field-grid two-col">
              <label className="form-field">
                <span>Discord Voice Server Invite (Optional)</span>
                <input
                  className="input font-mono"
                  maxLength={120}
                  value={profile.gamingSetup?.partyBeacon?.discordInvite || ""}
                  onChange={(e) => updatePartyBeacon("discordInvite", e.target.value)}
                  placeholder="https://discord.gg/yourserver"
                />
              </label>
              <label className="form-field">
                <span>Lobby / Room Code (Optional)</span>
                <input
                  className="input font-mono"
                  maxLength={60}
                  value={profile.gamingSetup?.partyBeacon?.roomCode || ""}
                  onChange={(e) => updatePartyBeacon("roomCode", e.target.value)}
                  placeholder="e.g. #STARD-7729"
                />
              </label>
            </div>

            <label className="form-field">
              <span>Co-op Session Vibe / Notes</span>
              <input
                className="input"
                maxLength={250}
                value={profile.gamingSetup?.partyBeacon?.note || ""}
                onChange={(e) => updatePartyBeacon("note", e.target.value)}
                placeholder="Looking for casual friends to play relaxing co-op games. Zero rage, zero sweat. Positive energy only."
              />
            </label>
          </div>
        </section>

        {/* 10. DAILY GAMING MICRO-LOG / JOURNAL */}
        <section className="surface-card editor-section" id="editor-gaming-journal">
          <SectionHeader
            title="Daily Gaming Micro-Log / Journal"
            detail="Share short personal notes, hilarious multiplayer moments, and FPS victories after your gaming sessions."
            action={
              <span className="section-icon">
                <BookOpen size={19} />
              </span>
            }
          />
          <div className="editor-form-stack">
            <div className="setting-list mb-2">
              <label className="setting-row">
                <span className="setting-icon">
                  <BookOpen size={20} strokeWidth={1.8} />
                </span>
                <span className="setting-copy">
                  <strong>Enable Daily Gaming Micro-Log</strong>
                  <small>
                    {profile.gamingSetup?.gamingJournal?.enabled !== false
                      ? "Currently ON — Recent gaming micro-logs are visible to visitors"
                      : "Currently OFF — Gaming journal section is hidden"}
                  </small>
                </span>
                <input
                  className="switch-input"
                  type="checkbox"
                  checked={profile.gamingSetup?.gamingJournal?.enabled !== false}
                  onChange={(e) => updateGamingJournal("enabled", e.target.checked)}
                />
                <span className="switch-track" aria-hidden="true">
                  <span />
                </span>
              </label>
            </div>

            <label className="form-field">
              <span>Journal Title <small>e.g. Daily Gaming Micro-Log</small></span>
              <input
                className="input font-mono"
                maxLength={80}
                value={profile.gamingSetup?.gamingJournal?.title || ""}
                onChange={(e) => updateGamingJournal("title", e.target.value)}
                placeholder="Daily Gaming Micro-Log"
              />
            </label>
          </div>
        </section>

        <section className="surface-card editor-section">
          <SectionHeader
            title="Search appearance"
            detail="Control how your profile is described in search and previews."
            action={
              <span className="section-icon">
                <Search size={19} />
              </span>
            }
          />
          <div className="field-grid">
            <label className="form-field">
              <span>
                Page title <small>{profile.seoTitle.length}/80</small>
              </span>
              <input
                className="input"
                maxLength={80}
                value={profile.seoTitle}
                onChange={(event) => update("seoTitle", event.target.value)}
              />
            </label>
            <label className="form-field">
              <span>
                Description <small>{profile.seoDescription.length}/160</small>
              </span>
              <textarea
                className="input textarea"
                rows={3}
                maxLength={160}
                value={profile.seoDescription}
                onChange={(event) =>
                  update("seoDescription", event.target.value)
                }
              />
            </label>
            <div className="two-col-span p-4 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Dynamic Gamer Social Card (OpenGraph / Twitter)
                  </h4>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-white/50">
                    Auto-generated 1200x630 trading card with your avatar, live badges, and top specs when shared on Discord & Twitter.
                  </p>
                </div>
                <a
                  href="/api/og"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 hover:text-slate-900 dark:text-white/80 dark:hover:text-white text-xs font-mono border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <span>Open Full Card</span>
                  <ExternalLink size={13} />
                </a>
              </div>
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 aspect-[1200/630] max-w-md bg-slate-100 dark:bg-black/40">
                <img
                  src="/api/og"
                  alt="Dynamic Gamer Card Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside className="editor-aside">
        <div className="preview-heading">
          <span>
            <i /> LIVE PREVIEW
          </span>
          <small>Unsaved changes</small>
        </div>
        <div className="preview-frame">
          <div className="profile-card compact">
            <div className="profile-banner">
              {profile.bannerUrl && <img src={profile.bannerUrl} alt="" />}
            </div>
            <div className="profile-card-body">
              <div className="profile-avatar">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar preview" />
                ) : (
                  profile.displayName.slice(0, 1).toUpperCase()
                )}
              </div>
              <h3>{profile.displayName || "Your name"}</h3>
              <span className="profile-handle">
                @{profile.username || "username"}
              </span>
              <p>{profile.bio || "Your bio will appear here."}</p>
              <div className="preview-link-list">
                {profile.socialLinks.slice(0, 3).map((link, index) => (
                  <div key={index}>
                    <Link2 size={15} />
                    <span>{link.label || "New link"}</span>
                    <ExternalLink size={13} />
                  </div>
                ))}
              </div>
              {(profile.musicUrl || profile.trackTitle) && (
                <div className="preview-soundtrack-badge">
                  <Music2 size={12} />
                  <span className="truncate">
                    {profile.trackTitle || "Profile Soundtrack"}
                    {profile.trackArtist ? ` • ${profile.trackArtist}` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="preview-tip">
          <CircleHelp size={17} />
          <p>
            Your preview updates as you type. Changes become public once you
            publish.
          </p>
        </div>
      </aside>

      <div className="save-dock">
        <div className="save-status">
          {feedback ? (
            <span
              className={feedback.error ? "error-text" : "success-text"}
              role="status"
            >
              {feedback.error ? <CircleHelp size={16} /> : <Check size={16} />}
              {feedback.text}
            </span>
          ) : (
            <span>Ready to publish your changes</span>
          )}
        </div>
        <div className="save-actions">
          <a
            className="button button-secondary"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open profile <ArrowRight size={16} />
          </a>
          <button
            className="button button-primary"
            type="button"
            disabled={saving}
            onClick={save}
          >
            <Save size={16} />
            {saving ? "Publishing..." : "Save & publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
