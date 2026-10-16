"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import {
  ArrowUpRight,
  Clock,
  ExternalLink,
  Flame,
  Gamepad2,
  Sparkles,
} from "lucide-react";
import type { SteamProfileData } from "@/lib/steam";

// SVG Steam Icon
export function SteamIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.912c0 .052.005.105.005.158 0 1.909-1.55 3.456-3.458 3.456-1.512 0-2.805-.97-3.277-2.327L.373 15.34C1.795 20.311 6.457 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
    </svg>
  );
}

const statusConfig: Record<
  SteamProfileData["onlineState"],
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  "in-game": {
    label: "IN-GAME",
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
    dot: "#22c55e",
  },
  online: {
    label: "ONLINE",
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.1)",
    border: "rgba(56, 189, 248, 0.3)",
    dot: "#38bdf8",
  },
  offline: {
    label: "OFFLINE",
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.1)",
    border: "rgba(148, 163, 184, 0.2)",
    dot: "#64748b",
  },
};

export function SteamPresence({
  steamId,
  initialData,
  variant = "full",
}: {
  steamId?: string | null;
  initialData?: SteamProfileData | null;
  variant?: "compact" | "full";
}) {
  const [data] = useState<SteamProfileData | null>(initialData ?? null);

  if (!steamId) return null;

  // Fallback state if Steam community profile is private or loading
  if (!data) {
    return (
      <div
        className="p-3 border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg flex items-center justify-between gap-3 text-xs font-mono"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
        }}
      >
        <div className="flex items-center gap-2 text-white/70">
          <SteamIcon size={15} className="text-[#66c0f4] shrink-0" />
          <span>
            STEAM // <strong className="text-white">Connecting...</strong>
          </span>
        </div>
        <a
          href={
            steamId.startsWith("http")
              ? steamId
              : /^\d{17}$/.test(steamId)
                ? `https://steamcommunity.com/profiles/${steamId}`
                : `https://steamcommunity.com/id/${steamId}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-1 font-mono tracking-wider uppercase opacity-85 hover:opacity-100"
        >
          <span>View Steam</span>
          <ArrowUpRight size={11} />
        </a>
      </div>
    );
  }

  const status = statusConfig[data.onlineState];

  // Compact hero badge
  if (variant === "compact") {
    return (
      <div
        className="p-3 border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg text-xs font-mono relative overflow-hidden group hover:border-[var(--accent)] transition-all"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {data.avatar ? (
              <div className="relative shrink-0">
                <img
                  src={data.avatar}
                  alt={data.personaName}
                  className="w-8 h-8 rounded object-cover border border-white/10"
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-black"
                  style={{ backgroundColor: status.dot }}
                />
              </div>
            ) : (
              <SteamIcon size={20} className="text-[#66c0f4] shrink-0" />
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold truncate">{data.personaName}</span>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase tracking-wider font-semibold"
                  style={{
                    color: status.color,
                    backgroundColor: status.bg,
                    borderColor: status.border,
                  }}
                >
                  {status.label}
                </span>
              </div>
              <p className="text-[11px] text-white/50 truncate">
                {data.currentGame ? (
                  <span className="text-green-300 font-medium">Playing {data.currentGame.name}</span>
                ) : (
                  data.stateMessage || "Steam Profile"
                )}
              </p>
            </div>
          </div>

          <a
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0"
            aria-label="View on Steam"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    );
  }

  // Full Expanded Steam Showcase
  return (
    <section className="steam-presence-section mt-12 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <SteamIcon size={16} className="text-[#66c0f4]" />
          <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-white/70">
            STEAM COMMUNITY // LIVE PROFILE & TOP TITLES
          </h3>
        </div>

        <a
          href={data.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono tracking-wider uppercase text-white/70 hover:text-white border border-white/10 hover:border-[var(--accent)] bg-white/[0.02] rounded transition-all"
        >
          <span>Open on Steam</span>
          <ArrowUpRight size={12} />
        </a>
      </div>

      <div
        className="p-5 md:p-6 border border-white/10 bg-white/[0.02] backdrop-blur-md relative group hover:border-[var(--accent)] transition-all"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)",
        }}
      >
        {/* Profile Identity Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={data.avatar}
                alt={data.personaName}
                className="w-12 h-12 rounded object-cover border border-white/15 shadow-sm"
              />
              <span
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#121216]"
                style={{ backgroundColor: status.dot }}
              />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-mono font-bold tracking-wider text-white">
                  {data.personaName}
                </h4>
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-widest font-semibold"
                  style={{
                    color: status.color,
                    backgroundColor: status.bg,
                    borderColor: status.border,
                  }}
                >
                  {status.label}
                </span>
              </div>
              <p className="text-xs font-mono text-white/50 truncate">
                {data.stateMessage || "Steam Member"}
              </p>
            </div>
          </div>

          {/* Current Game Highlight (if in-game) */}
          {data.currentGame && (
            <div className="flex items-center gap-2.5 p-2 px-3 rounded-lg border border-green-500/30 bg-green-500/10">
              <Gamepad2 size={16} className="text-green-400 animate-pulse shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] font-mono tracking-widest text-green-300 uppercase block font-semibold">
                  CURRENTLY PLAYING
                </span>
                <span className="text-xs font-mono text-white font-medium truncate block max-w-[200px]">
                  {data.currentGame.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Most Played Games Grid */}
        {data.mostPlayedGames && data.mostPlayedGames.length > 0 && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-white/40 uppercase">
              <div className="flex items-center gap-1.5">
                <Flame size={12} className="text-[var(--accent)]" />
                <span>TOP PLAYED ON STEAM</span>
              </div>
              <span>HOURS LOGGED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {data.mostPlayedGames.map((game, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded border border-white/5 bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/10 transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-start gap-2.5 mb-2.5">
                    {game.icon ? (
                      <img
                        src={game.icon}
                        alt={game.name}
                        className="w-7 h-7 rounded shrink-0 object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Gamepad2 size={13} className="text-white/40" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-mono font-medium text-white/90 truncate block leading-snug">
                        {game.name}
                      </span>
                      {game.hours2Weeks && (
                        <span className="text-[10px] font-mono text-white/40">
                          {game.hours2Weeks} hrs / past 2 wks
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono">
                    <span className="text-white/40 flex items-center gap-1">
                      <Clock size={11} className="text-[var(--accent)] opacity-70" />
                      Total
                    </span>
                    <strong className="text-white/90 font-semibold">
                      {game.hoursTotal || "N/A"} hrs
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
          <div className="flex items-center gap-1">
            <Sparkles size={11} className="text-[var(--accent)]" />
            <span>Synced automatically with Steam Community</span>
          </div>
          <span>ID: {data.steamId64}</span>
        </div>
      </div>
    </section>
  );
}
