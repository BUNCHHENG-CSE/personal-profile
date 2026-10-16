"use client";

import { useState } from "react";
import {
  Radio,
  Gamepad2,
  Users2,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type { PartyBeaconConfig } from "@/lib/validation";

interface PartyBeaconProps {
  config?: PartyBeaconConfig | null;
  discordId?: string | null;
  className?: string;
}

const STATUS_DETAILS = {
  open: {
    label: "Open for Co-op (Looking for Party)",
    dotColor: "bg-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    pingClass: "bg-emerald-400",
  },
  duo_only: {
    label: "Duo Mode (Need +1)",
    dotColor: "bg-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    pingClass: "bg-amber-400",
  },
  full_squad: {
    label: "Party Full (In Match)",
    dotColor: "bg-rose-500",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    pingClass: "bg-rose-400",
  },
  offline: {
    label: "Offline / AFK",
    dotColor: "bg-neutral-500",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-white/50 dark:border-white/10",
    pingClass: "bg-neutral-500",
  },
};

const DEFAULT_PREFERRED_GAMES = [
  "Stardew Valley",
  "Lethal Company",
  "Terraria",
  "Minecraft",
  "Party Animals",
  "Peak Comedy Games",
];

export function PartyBeacon({ config, discordId, className = "" }: PartyBeaconProps) {
  const [copied, setCopied] = useState(false);

  if (config?.enabled === false) return null;

  const statusKey = config?.status || "open";
  const statusMeta = STATUS_DETAILS[statusKey] || STATUS_DETAILS.open;
  const games = config?.preferredGames?.length ? config.preferredGames : DEFAULT_PREFERRED_GAMES;

  const copyPartyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  return (
    <div
      className={`party-beacon-section w-full my-6 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-gradient-to-b dark:from-white/[0.03] dark:to-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden select-none ${className}`}
      id="party-beacon"
    >
      {/* Background Radar Waves */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusMeta.pingClass}`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusMeta.dotColor}`}
              />
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-600 dark:text-white/70 font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <Radio size={13} className="text-[var(--accent)]" />
              SQUAD BEACON // LOOKING FOR PARTY (LFP)
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white flex flex-wrap sm:flex-nowrap items-center gap-2">
            <span>{config?.headline || "LFP // Chill Friday Night Co-op"}</span>
            <span
              className={`text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full border font-semibold whitespace-nowrap shrink-0 ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
          </h3>

          <p className="text-xs font-mono text-slate-500 dark:text-white/50 mt-1">
            {config?.note ||
              "Looking for casual friends to play relaxing co-op games. Zero rage, zero sweat. Positive energy only."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto">
          {config?.roomCode && (
            <button
              type="button"
              onClick={() => copyPartyCode(config.roomCode!)}
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white dark:border-white/10 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              {copied ? <Check size={13} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? "Room Code Copied!" : `Room Code: ${config.roomCode}`}</span>
            </button>
          )}

          {config?.discordInvite ? (
            <a
              href={config.discordInvite}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#5865F2] text-white hover:brightness-110 transition-all flex items-center gap-2 shadow-md active:scale-95 whitespace-nowrap shrink-0"
            >
              <Users2 size={13} />
              <span>Join Discord Voice</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            discordId && (
              <button
                type="button"
                onClick={() => copyPartyCode(discordId)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#5865F2] text-white hover:brightness-110 transition-all flex items-center gap-2 shadow-md active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? "Discord ID Copied!" : "Copy Discord Tag"}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Preferred Co-op Games Pills */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Gamepad2 size={14} className="text-[var(--accent)]" />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-700 dark:text-white/70 font-semibold">
            PREFERRED CO-OP ROTATION:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {games.map((g, idx) => (
            <div
              key={idx}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] transition-colors flex items-center gap-2 text-xs font-mono text-slate-800 dark:text-white/85 whitespace-nowrap shrink-0 font-medium shadow-xs"
            >
              <Sparkles size={11} className="text-[var(--accent)]" />
              <span>{g}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
