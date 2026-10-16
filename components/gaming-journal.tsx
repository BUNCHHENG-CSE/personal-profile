"use client";

import {
  Coffee,
  Flame,
  Trophy,
  Sparkles,
  AlertCircle,
  Calendar,
} from "lucide-react";
import type { GamingJournalConfig, JournalEntryItem } from "@/lib/validation";

interface GamingJournalProps {
  config?: GamingJournalConfig | null;
  className?: string;
}

const DEFAULT_ENTRIES: JournalEntryItem[] = [
  {
    id: "entry-1",
    date: "Yesterday",
    game: "Stardew Valley",
    mood: "cozy",
    content: "Spent 3 peaceful hours reorganizing my ancient fruit greenhouse. No deadlines, no sweating, just pure acoustic guitar and farm life.",
    fpsExperienced: 144,
  },
  {
    id: "entry-2",
    date: "3 days ago",
    game: "Counter-Strike 2",
    mood: "struggling",
    content: "Tested 4:3 stretched resolution (1024x768). Gained 25 FPS instantly! My headshots feel crisp again even on my vintage GTX 1050 Ti.",
    fpsExperienced: 75,
  },
  {
    id: "entry-3",
    date: "Last Weekend",
    game: "Lethal Company",
    mood: "hyped",
    content: "Died to a bracken while shouting into the walkie-talkie with Discord friends. Peak comedy Friday night gaming session.",
    fpsExperienced: 60,
  },
  {
    id: "entry-4",
    date: "Oct 2",
    game: "Terraria",
    mood: "victorious",
    content: "Finally defeated the Moon Lord in Master Mode after 6 failed attempts. The secret was building a long minecart skybridge.",
    fpsExperienced: 90,
  },
];

const MOOD_META = {
  cozy: {
    label: "Cozy & Relaxing",
    icon: Coffee,
    color: "#10b981",
    badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  struggling: {
    label: "FPS Survival Mode",
    icon: AlertCircle,
    color: "#f59e0b",
    badgeClass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  hyped: {
    label: "Peak Comedy / Hype",
    icon: Flame,
    color: "#f43f5e",
    badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  },
  victorious: {
    label: "Victorious Boss Fight",
    icon: Trophy,
    color: "#a855f7",
    badgeClass: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  },
  chill: {
    label: "Late Night Chill",
    icon: Sparkles,
    color: "#06b6d4",
    badgeClass: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  },
};

export function GamingJournal({ config, className = "" }: GamingJournalProps) {
  const entries = config?.entries?.length ? config.entries : DEFAULT_ENTRIES;

  if (config?.enabled === false) return null;

  return (
    <div
      className={`gaming-journal-section w-full my-6 p-6 sm:p-10 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden select-none ${className}`}
      id="gaming-journal"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-purple-400 font-bold whitespace-nowrap shrink-0">
              GAMING DIARY // RECENT MICRO-LOGS
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex flex-wrap sm:flex-nowrap items-center gap-2">
            <span>{config?.title || "Daily Gaming Micro-Log"}</span>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 font-normal whitespace-nowrap shrink-0">
              {entries.length} Entries Logged
            </span>
          </h3>
          <p className="text-xs font-mono text-white/50 mt-1">
            Short real thoughts, funny multiplayer moments, and FPS tuning logs recorded after casual sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-white/40 self-start xl:self-auto">
          <Calendar size={13} className="text-[var(--accent)]" />
          <span>UPDATED REGULARLY</span>
        </div>
      </div>

      {/* Journal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {entries.map((entry) => {
          const mood = MOOD_META[entry.mood] || MOOD_META.chill;
          const MoodIcon = mood.icon;

          return (
            <div
              key={entry.id}
              className="p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 relative group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <strong className="text-sm font-bold font-mono text-white truncate">
                      {entry.game}
                    </strong>
                    <span className="text-[10px] font-mono text-white/40 whitespace-nowrap shrink-0">
                      • {entry.date}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold whitespace-nowrap shrink-0 ${mood.badgeClass}`}
                  >
                    <MoodIcon size={11} className="shrink-0" />
                    <span>{mood.label}</span>
                  </span>
                </div>

                <p className="text-xs text-white/80 font-sans leading-relaxed italic">
                  &ldquo;{entry.content}&rdquo;
                </p>
              </div>

              {entry.fpsExperienced && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>TELEMETRY RECORDED</span>
                  <span className="text-emerald-400 font-semibold">
                    ~{entry.fpsExperienced} FPS STABLE
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
