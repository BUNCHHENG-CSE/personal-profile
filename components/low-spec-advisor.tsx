"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { SpecAdvisorConfig, SpecAdvisorGameItem } from "@/lib/validation";

interface LowSpecAdvisorProps {
  config?: SpecAdvisorConfig | null;
  className?: string;
}

const DEFAULT_ADVISOR_GAMES: SpecAdvisorGameItem[] = [
  {
    id: "adv-1",
    title: "Stardew Valley",
    verdict: "smooth",
    minSpecs: "Integrated Intel HD Graphics + 2 GB RAM",
    recommendedSettings: "Max 1080p, Zoom 100%. Flawless performance.",
    thermalAlert: "Whisper quiet. Your PC will stay ice cold.",
  },
  {
    id: "adv-2",
    title: "Terraria",
    verdict: "smooth",
    minSpecs: "Any dual-core CPU + 4 GB RAM",
    recommendedSettings: "Frame Skip: Subtly ON, Lighting: Color or White.",
    thermalAlert: "Runs on potato hardware without breaking a sweat.",
  },
  {
    id: "adv-3",
    title: "Lethal Company",
    verdict: "playable",
    minSpecs: "GTX 660 / RX 460 or Ryzen APU (Vega 8)",
    recommendedSettings: "Disable Volumetric Fog and High Resolution mod.",
    thermalAlert: "Moderate warmth during intense multiplayer moments.",
  },
  {
    id: "adv-4",
    title: "Valorant",
    verdict: "playable",
    minSpecs: "Intel Core 2 Duo E8400 + Intel HD 4000",
    recommendedSettings: "All Low, 1280x960 4:3 stretched for +25 FPS.",
    thermalAlert: "Vanguard is heavy, close Discord overlay for extra stability.",
  },
  {
    id: "adv-5",
    title: "Counter-Strike 2",
    verdict: "tweaks_needed",
    minSpecs: "GTX 1050 / RX 560 + 8 GB RAM",
    recommendedSettings: "FidelityFX Super Resolution (FSR) on Balanced, 720p.",
    thermalAlert: "Smoke grenades will drop FPS by ~15. Use potato launch options.",
  },
  {
    id: "adv-6",
    title: "Cyberpunk 2077",
    verdict: "hazard",
    minSpecs: "GTX 1060 6GB or RX 580 (Minimum)",
    recommendedSettings: "720p Low, FSR Performance. 20-30 FPS cinematic slideshow.",
    thermalAlert: "DANGER: GPU fan will sound like an airplane takeoff.",
  },
];

const VERDICT_STYLES = {
  smooth: {
    label: "Smooth (60+ FPS)",
    shortLabel: "Smooth (60+)",
    color: "#10b981",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    icon: CheckCircle2,
  },
  playable: {
    label: "Playable (30-60 FPS)",
    shortLabel: "Playable (30-60)",
    color: "#06b6d4",
    badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    icon: CheckCircle2,
  },
  tweaks_needed: {
    label: "Needs Tweaks",
    shortLabel: "Needs Tweaks",
    color: "#f59e0b",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    icon: AlertTriangle,
  },
  hazard: {
    label: "Explosive Hazard",
    shortLabel: "Hazard ⚠️",
    color: "#ef4444",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
    icon: ShieldAlert,
  },
};

export function LowSpecAdvisor({ config, className = "" }: LowSpecAdvisorProps) {
  const games = config?.games?.length ? config.games : DEFAULT_ADVISOR_GAMES;
  const [query, setQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");

  if (config?.enabled === false) return null;

  const filtered = games.filter((g) => {
    const matchQuery = g.title.toLowerCase().includes(query.toLowerCase());
    const matchVerdict = verdictFilter === "all" || g.verdict === verdictFilter;
    return matchQuery && matchVerdict;
  });

  return (
    <div
      className={`low-spec-advisor-section w-full my-6 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-gradient-to-b dark:from-white/[0.03] dark:to-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden select-none ${className}`}
      id="low-spec-advisor"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-600 dark:text-cyan-400 font-bold whitespace-nowrap shrink-0">
              COMMUNITY HARDWARE ADVISOR // CAN MY PC RUN IT?
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white flex flex-wrap sm:flex-nowrap items-center gap-2">
            <span>{config?.title || "Can My Potato PC Run It?"}</span>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white/70 dark:border-transparent font-normal whitespace-nowrap shrink-0">
              {games.length} Tested Titles
            </span>
          </h3>
          <p className="text-xs font-mono text-slate-500 dark:text-white/50 mt-1">
            {config?.subtitle ||
              "Honest verdicts for popular games on budget and low-spec machines. No fake ultra-spec gatekeeping."}
          </p>
        </div>

        {/* Search Bar & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 self-start xl:self-auto max-w-full">
          <div className="relative w-full sm:w-44 shrink-0">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search game..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-slate-400 dark:placeholder:text-white/40"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar whitespace-nowrap max-w-full shrink-0">
            <button
              type="button"
              onClick={() => setVerdictFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                verdictFilter === "all"
                  ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] font-bold shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5"
              }`}
            >
              All
            </button>
            {(["smooth", "playable", "tweaks_needed", "hazard"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVerdictFilter(v)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10.5px] sm:text-[11px] font-mono transition-all whitespace-nowrap shrink-0 tracking-tight cursor-pointer ${
                  verdictFilter === v
                    ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] font-bold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5"
                }`}
                title={VERDICT_STYLES[v].label}
              >
                {VERDICT_STYLES[v].shortLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {filtered.map((item) => {
          const style = VERDICT_STYLES[item.verdict] || VERDICT_STYLES.playable;
          const VerdictIcon = style.icon;
          return (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 hover:bg-slate-100/90 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold font-mono text-slate-900 dark:text-white truncate min-w-0 flex-1 group-hover:text-[var(--accent)] transition-colors">
                    {item.title}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold whitespace-nowrap shrink-0 ${style.badgeClass}`}
                  >
                    <VerdictIcon size={11} className="shrink-0" />
                    <span>{style.label}</span>
                  </span>
                </div>

                {/* Min Specs Required */}
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 mb-2.5">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 block mb-0.5">
                    MINIMUM TESTED SPEC:
                  </span>
                  <span className="text-xs font-mono text-slate-800 dark:text-white/85 font-medium">
                    {item.minSpecs}
                  </span>
                </div>

                {/* Recommended Potato Settings */}
                <div className="text-xs font-sans text-slate-600 dark:text-white/70 leading-relaxed mb-2">
                  <strong className="font-mono text-[11px] text-[var(--accent)] block mb-0.5">
                    Recommended Low-Spec Config:
                  </strong>
                  {item.recommendedSettings}
                </div>

                {/* Thermal Alert */}
                {item.thermalAlert && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                    <Flame size={13} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-amber-800 dark:text-amber-200/80 font-sans leading-tight">
                      {item.thermalAlert}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                <a
                  href="#potato-pc-guide"
                  className="text-[11px] font-mono text-[var(--accent)] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Apply FPS Tweaks</span>
                  <ArrowRight size={11} />
                </a>
                <span className="text-[9px] font-mono text-slate-400 dark:text-white/30">
                  COMMUNITY TESTED
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
