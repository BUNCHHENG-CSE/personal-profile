"use client";

import { useState, useEffect } from "react";
import {
  Coffee,
  Flame,
  Gamepad2,
  Pin,
  Send,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import type { GuestbookConfig, GuestbookStamp, GuestbookPlatform, GuestbookSticker } from "@/lib/validation";
import { playTechSound } from "@/lib/passport";

interface VisitorGuestbookProps {
  config?: GuestbookConfig | null;
  className?: string;
}

const STICKER_ICONS: Record<
  GuestbookSticker,
  { label: string; icon: typeof Zap; color: string; emoji: string }
> = {
  gg: { label: "GG", icon: Zap, color: "#f59e0b", emoji: "⚡" },
  chill: { label: "CHILL", icon: Coffee, color: "#10b981", emoji: "☕" },
  gamepad: { label: "GAMER", icon: Gamepad2, color: "#06b6d4", emoji: "🎮" },
  tank: { label: "TANK", icon: Shield, color: "#3b82f6", emoji: "🛡️" },
  trophy: { label: "MVP", icon: Trophy, color: "#a855f7", emoji: "🏆" },
  fire: { label: "HYPE", icon: Flame, color: "#ef4444", emoji: "🔥" },
};

const PLATFORM_LABELS: Record<GuestbookPlatform, string> = {
  steam: "Steam",
  discord: "Discord",
  playstation: "PlayStation",
  xbox: "Xbox",
  switch: "Switch",
  pc_casual: "Casual PC",
  other: "Gamer",
};

export function VisitorGuestbook({ config, className = "" }: VisitorGuestbookProps) {
  const [stamps, setStamps] = useState<GuestbookStamp[]>(config?.stamps || []);
  const [callsign, setCallsign] = useState("");
  const [platform, setPlatform] = useState<GuestbookPlatform>("pc_casual");
  const [sticker, setSticker] = useState<GuestbookSticker>("gg");
  const [favoriteGame, setFavoriteGame] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/guestbook")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stamps) {
          setStamps(data.stamps);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callsign: callsign.trim(),
          platform,
          sticker,
          favoriteGame: favoriteGame.trim() || undefined,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to stamp guestbook");

      playTechSound("copy", false);
      if (typeof window !== "undefined" && window.__trackVisitorAction) {
        window.__trackVisitorAction(`Stamped Guestbook as ${callsign.trim()}`);
      }

      if (data.stamp) {
        setStamps((prev) => [data.stamp, ...prev]);
      }

      setCallsign("");
      setMessage("");
      setFavoriteGame("");
      setShowForm(false);
      setFeedback({ text: "Visitor Stamp stamped successfully! GG!", error: false });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        text: err instanceof Error ? err.message : "Could not sign guestbook right now.",
        error: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (config?.enabled === false) return null;

  return (
    <div
      className={`visitor-guestbook-section w-full my-6 p-6 sm:p-10 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden select-none ${className}`}
      id="guestbook"
    >
      {/* Subtle Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)",
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold">
              ARCADE TERMINAL // VISITOR REGISTRY
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex flex-wrap sm:flex-nowrap items-center gap-2">
            <span>{config?.title || "Visitor Stamps & Guestbook"}</span>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 font-normal whitespace-nowrap shrink-0">
              {stamps.length} Stamps
            </span>
          </h3>
          <p className="text-xs font-mono text-white/50 mt-1">
            {config?.subtitle || "Leave your gamer callsign, platform, and stamp your mark on my profile."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playTechSound("click", false);
            setShowForm((prev) => !prev);
          }}
          className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 bg-[var(--accent)] text-[var(--accent-fg,#090d16)] hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 active:scale-95"
        >
          <Sparkles size={14} />
          <span>{showForm ? "Close Terminal" : "Stamp Your Mark"}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`my-4 p-3 rounded-lg text-xs font-mono border ${
            feedback.error
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Interactive Sign-In Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="my-6 p-5 sm:p-6 rounded-xl border border-white/15 bg-black/60 backdrop-blur-md space-y-4 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="text-xs font-mono text-[var(--accent)] uppercase tracking-wider font-semibold">
            &gt; NEW VISITOR REGISTRATION PROTOCOL
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Callsign */}
            <div>
              <label className="block text-[11px] font-mono text-white/60 mb-1">
                Gamer Callsign / Handle *
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                placeholder="e.g. Kitsune#JP, ShadowWalker"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* Favorite Game */}
            <div>
              <label className="block text-[11px] font-mono text-white/60 mb-1">
                Favorite Game / Tagline <small className="text-white/40">(optional)</small>
              </label>
              <input
                type="text"
                maxLength={50}
                value={favoriteGame}
                onChange={(e) => setFavoriteGame(e.target.value)}
                placeholder="e.g. Valorant, Stardew Valley"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block text-[11px] font-mono text-white/60 mb-2">
              Primary Platform:
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "steam",
                  "discord",
                  "playstation",
                  "xbox",
                  "switch",
                  "pc_casual",
                  "other",
                ] as GuestbookPlatform[]
              ).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    playTechSound("click", false);
                    setPlatform(p);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                    platform === p
                      ? "bg-white/15 border-[var(--accent)] text-white font-bold"
                      : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Stamp / Sticker Selector */}
          <div>
            <label className="block text-[11px] font-mono text-white/60 mb-2">
              Choose Your Gamer Stamp Badge:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(
                [
                  "gg",
                  "chill",
                  "gamepad",
                  "tank",
                  "trophy",
                  "fire",
                ] as GuestbookSticker[]
              ).map((s) => {
                const info = STICKER_ICONS[s];
                const Icon = info.icon;
                const isSelected = sticker === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      playTechSound("click", false);
                      setSticker(s);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-white/15 border-white text-white shadow-md scale-105"
                        : "bg-white/[0.02] border-white/10 text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={18} style={{ color: info.color }} />
                    <span className="text-[10px] font-mono font-bold">
                      {info.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-[11px] font-mono text-white/60 mb-1">
              Short Note / Greeting *
            </label>
            <textarea
              required
              rows={3}
              maxLength={400}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Loved your rig specs and casual game recs! Let's play sometime."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            />
            <div className="text-right text-[10px] font-mono text-white/40 mt-1">
              {message.length} / 400
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-fg,#090d16)] hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Send size={13} />
              <span>{isSubmitting ? "Stamping..." : "Stamp Guestbook"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Stamps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {stamps.map((stamp) => {
          const stickerInfo = STICKER_ICONS[stamp.sticker] || STICKER_ICONS.gg;
          const StickerIcon = stickerInfo.icon;
          return (
            <div
              key={stamp.id}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between relative group overflow-hidden"
            >
              {/* Subtle accent border glow */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: stickerInfo.color }}
              />

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                      <StickerIcon size={14} style={{ color: stickerInfo.color }} />
                    </span>
                    <strong className="text-xs font-mono text-white truncate">
                      {stamp.callsign}
                    </strong>
                    {stamp.countryFlag && (
                      <span className="text-sm">{stamp.countryFlag}</span>
                    )}
                  </div>
                  {stamp.isPinned && (
                    <span className="text-amber-400 flex items-center gap-0.5 text-[10px] font-mono">
                      <Pin size={11} className="rotate-45" /> Pinned
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-white/40">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                    {PLATFORM_LABELS[stamp.platform] || stamp.platform}
                  </span>
                  {stamp.favoriteGame && (
                    <span className="truncate max-w-[120px]">
                      {stamp.favoriteGame}
                    </span>
                  )}
                </div>

                <p className="text-xs font-sans text-white/80 leading-relaxed italic line-clamp-3">
                  &ldquo;{stamp.message}&rdquo;
                </p>
              </div>

              {stamp.createdAt && (
                <div className="text-[10px] font-mono text-white/30 pt-3 border-t border-white/5 mt-3">
                  {new Date(stamp.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
