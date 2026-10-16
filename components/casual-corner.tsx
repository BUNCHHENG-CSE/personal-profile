"use client";

import { useState } from "react";
import {
  Coffee,
  Heart,
  Sparkles,
  Star,
  Users2,
  Trophy,
  Clock,
  Cpu,
} from "lucide-react";
import type { CasualCornerConfig, CasualGameItem, CasualGameStatus } from "@/lib/validation";

interface CasualCornerProps {
  config?: CasualCornerConfig | null;
  className?: string;
}

const STATUS_INFO: Record<
  CasualGameStatus,
  { label: string; icon: typeof Heart; color: string; badgeClass: string }
> = {
  vibing: {
    label: "Currently Vibing",
    icon: Sparkles,
    color: "#a855f7",
    badgeClass: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  },
  comfort: {
    label: "Comfort Game",
    icon: Coffee,
    color: "#10b981",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  coop: {
    label: "Co-op with Friends",
    icon: Users2,
    color: "#06b6d4",
    badgeClass: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  },
  completed: {
    label: "Completed",
    icon: Trophy,
    color: "#f59e0b",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
};

function getStatusBadgeClasses(label: string) {
  const len = label.length;
  if (len > 15) {
    return "text-[8px] sm:text-[8.5px] px-2 py-0.5 tracking-tight";
  }
  if (len > 11) {
    return "text-[9px] sm:text-[9.5px] px-2.5 py-0.5 tracking-tight";
  }
  return "text-[10px] px-2.5 py-0.5 tracking-normal";
}

const DEFAULT_CASUAL_GAMES: CasualGameItem[] = [
  {
    id: "casual-1",
    title: "Stardew Valley",
    status: "comfort",
    rating: 10,
    hours: 240,
    lowSpecFriendly: true,
    notes: "The ultimate cozy escape after a long day. Runs at 144 FPS on literally any PC or laptop.",
  },
  {
    id: "casual-2",
    title: "Balatro",
    status: "vibing",
    rating: 9.8,
    hours: 85,
    lowSpecFriendly: true,
    notes: "Pure roguelike poker addiction with hypnotic synth sounds. Zero GPU load.",
  },
  {
    id: "casual-3",
    title: "Hades",
    status: "completed",
    rating: 9.5,
    hours: 110,
    lowSpecFriendly: true,
    notes: "God-tier soundtrack and combat flow. Extremely well optimized for integrated graphics.",
  },
  {
    id: "casual-4",
    title: "Lethal Company",
    status: "coop",
    rating: 9.0,
    hours: 74,
    lowSpecFriendly: true,
    notes: "Peak comedy with friends on Discord on Friday nights. Great proximity chat moments.",
  },
];

export function CasualCorner({ config, className = "" }: CasualCornerProps) {
  const [filter, setFilter] = useState<CasualGameStatus | "all">("all");

  if (config?.enabled === false) return null;

  const games = config?.games?.length ? config.games : DEFAULT_CASUAL_GAMES;
  const filtered = filter === "all" ? games : games.filter((g) => g.status === filter);

  return (
    <div
      className={`casual-corner-section w-full my-6 p-6 sm:p-10 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden select-none ${className}`}
      id="casual-corner"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
              CASUAL &amp; COZY SHELF // POTATO-FRIENDLY
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex flex-wrap sm:flex-nowrap items-center gap-2">
            <span>{config?.headline || "Casual Corner & Comfort Games"}</span>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 font-normal whitespace-nowrap shrink-0">
              {games.length} Titles
            </span>
          </h3>
          <p className="text-xs font-mono text-white/50 mt-1">
            {config?.description ||
              "Great games to enjoy without needing high-end specs or competitive sweat. Comfort over meta."}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/50 border border-white/10 overflow-x-auto no-scrollbar max-w-full shrink-0">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap shrink-0 ${
              filter === "all"
                ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] font-bold shadow-sm"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            All
          </button>
          {(["vibing", "comfort", "coop", "completed"] as CasualGameStatus[]).map((st) => {
            const label = STATUS_INFO[st].label;
            const isLong = label.length > 12;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={`rounded-lg font-mono transition-all whitespace-nowrap shrink-0 ${
                  isLong ? "px-2.5 py-1 text-[11px] tracking-tight" : "px-3 py-1 text-xs"
                } ${
                  filter === st
                    ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] font-bold shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
        {filtered.map((game) => {
          const statusMeta = STATUS_INFO[game.status] || STATUS_INFO.vibing;
          const StatusIcon = statusMeta.icon;
          return (
            <div
              key={game.id}
              className="p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold font-mono text-white truncate min-w-0 flex-1 group-hover:text-[var(--accent)] transition-colors">
                    {game.title}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full font-mono border font-semibold whitespace-nowrap shrink-0 transition-all ${getStatusBadgeClasses(
                      statusMeta.label
                    )} ${statusMeta.badgeClass}`}
                    title={statusMeta.label}
                  >
                    <StatusIcon size={statusMeta.label.length > 14 ? 10 : 11} className="shrink-0" />
                    <span className="whitespace-nowrap">{statusMeta.label}</span>
                  </span>
                </div>

                {/* Rating & Potato Friendly Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {typeof game.rating === "number" && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 font-bold whitespace-nowrap shrink-0">
                      <Star size={12} fill="currentColor" className="shrink-0" />
                      <span>{game.rating.toFixed(1)} / 10</span>
                    </span>
                  )}
                  {typeof game.hours === "number" && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-white/50 whitespace-nowrap shrink-0">
                      <Clock size={11} className="shrink-0" />
                      <span>{game.hours} hrs</span>
                    </span>
                  )}
                  {game.lowSpecFriendly && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 whitespace-nowrap shrink-0">
                      <Cpu size={10} className="shrink-0" />
                      <span className="whitespace-nowrap">Potato PC Friendly</span>
                    </span>
                  )}
                </div>

                {game.notes && (
                  <p className="text-xs text-white/70 font-sans leading-relaxed line-clamp-3">
                    {game.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
                <span>VERIFIED CASUAL FUN</span>
                <span className="text-[var(--accent)]">● ACTIVE ROTATION</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
