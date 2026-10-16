"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Cpu,
  Monitor,
  Sliders,
  Terminal,
  Zap,
  Flame,
  Shield,
} from "lucide-react";
import type { PotatoPcGuideConfig, PotatoPcTweak, PotatoTweakCategory } from "@/lib/validation";
import { playTechSound } from "@/lib/passport";

interface PotatoPcGuideProps {
  config?: PotatoPcGuideConfig | null;
  className?: string;
}

const CATEGORY_INFO: Record<
  PotatoTweakCategory,
  { label: string; icon: typeof Cpu; color: string }
> = {
  windows: { label: "Windows OS", icon: Sliders, color: "#a855f7" },
  resolution: { label: "Display & Scaling", icon: Monitor, color: "#06b6d4" },
  launch_options: { label: "Launch Options", icon: Terminal, color: "#f59e0b" },
  graphics: { label: "In-Game Video", icon: Zap, color: "#10b981" },
  network: { label: "Ping & Latency", icon: Shield, color: "#ef4444" },
};

const DEFAULT_TWEAKS: PotatoPcTweak[] = [
  {
    id: "tweak-1",
    category: "launch_options",
    title: "Steam & Source Engine FPS Command",
    description: "Forces high process priority, allocates available CPU threads, and skips intro videos for faster loading.",
    commandToCopy: "-novid -high -threads 4 -fullscreen -tickrate 128 +mat_queue_mode 2",
    fpsGainEst: "+15–25 FPS",
  },
  {
    id: "tweak-2",
    category: "resolution",
    title: "4:3 Stretched Aspect Ratio (1280x960)",
    description: "Renders 30% fewer pixels than 1080p, giving massive FPS stability and making player character models appear wider and easier to hit.",
    commandToCopy: "Custom Resolution: 1280 x 960 @ 75Hz (Full Screen Stretched)",
    fpsGainEst: "+20–40% FPS Boost",
  },
  {
    id: "tweak-3",
    category: "windows",
    title: "Disable Fullscreen Optimizations & Game DVR",
    description: "Prevents Windows DWM composition layer overhead, slashing input latency and micro-stutters during intense gunfights.",
    commandToCopy: "Right-click Game.exe -> Properties -> Compatibility -> Check 'Disable Fullscreen Optimizations'",
    fpsGainEst: "Smoother Frame Pacing",
  },
  {
    id: "tweak-4",
    category: "graphics",
    title: "Shader & Shadow Culling (Ultra-Low Preset)",
    description: "Turns off dynamic shadows and reflections while keeping textures at medium so game visual clarity remains sharp without GPU choking.",
    commandToCopy: "Shadow Quality: LOW // Particle Detail: LOW // Texture Filtering: Anisotropic 2x",
    fpsGainEst: "+15–20% FPS Boost",
  },
];

export function PotatoPcGuide({ config, className = "" }: PotatoPcGuideProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<PotatoTweakCategory | "all">("all");

  const tweaks = config?.tweaks?.length ? config.tweaks : DEFAULT_TWEAKS;
  const filtered = filter === "all" ? tweaks : tweaks.filter((t) => t.category === filter);

  const copyTweakCommand = (command: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(command).then(() => {
        playTechSound("copy", false);
        setCopiedId(id);
        if (typeof window !== "undefined" && window.__trackVisitorAction) {
          window.__trackVisitorAction(`Copied FPS Tweak: ${id}`);
        }
        setTimeout(() => setCopiedId(null), 2400);
      }).catch(() => {});
    }
  };

  if (config?.enabled === false) return null;

  return (
    <div
      className={`potato-pc-guide-section w-full my-6 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-gradient-to-b dark:from-white/[0.03] dark:to-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden select-none ${className}`}
      id="potato-pc-guide"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-600 dark:text-amber-400 font-bold">
              PERFORMANCE TUNING // POTATO PC GUIDE
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white flex flex-wrap sm:flex-nowrap items-center gap-2">
            <span>{config?.title || "Low-Spec PC Optimization Guide"}</span>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:text-white/70 dark:border-transparent font-normal whitespace-nowrap shrink-0">
              {tweaks.length} Tweaks
            </span>
          </h3>
          <p className="text-xs font-mono text-slate-500 dark:text-white/50 mt-1">
            {config?.targetHardware
              ? `Calibrated for: ${config.targetHardware} — tested tweaks for maximum FPS and minimal input lag.`
              : "Practical Windows, launch commands, and resolution scaling tweaks tested on modest hardware."}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar max-w-full shrink-0">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap shrink-0 ${
              filter === "all"
                ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] font-bold shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5"
            }`}
          >
            All
          </button>
          {(["windows", "resolution", "launch_options", "graphics", "network"] as PotatoTweakCategory[]).map((cat) => {
            const label = CATEGORY_INFO[cat].label;
            const isLong = label.length > 13;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`rounded-lg font-mono transition-all whitespace-nowrap shrink-0 ${
                  isLong ? "px-2.5 py-1 text-[11px] tracking-tight" : "px-3 py-1 text-xs"
                } ${
                  filter === cat
                    ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] font-bold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tweaks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {filtered.map((tweak) => {
          const catInfo = CATEGORY_INFO[tweak.category] || CATEGORY_INFO.windows;
          const CatIcon = catInfo.icon;
          const isCopied = copiedId === tweak.id;
          return (
            <div
              key={tweak.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 hover:bg-slate-100/90 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 relative group shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-white text-slate-700 border border-slate-200 dark:bg-white/5 dark:text-white/70 dark:border-transparent whitespace-nowrap shrink-0">
                    <CatIcon size={11} style={{ color: catInfo.color }} className="shrink-0" />
                    <span className="whitespace-nowrap">{catInfo.label}</span>
                  </span>
                  {tweak.fpsGainEst && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 whitespace-nowrap shrink-0">
                      <Flame size={10} className="shrink-0" />
                      <span className="whitespace-nowrap">{tweak.fpsGainEst}</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-white mb-1.5">
                  {tweak.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-white/70 font-sans leading-relaxed">
                  {tweak.description}
                </p>
              </div>

              {/* Command Box with 1-Click Copy */}
              {tweak.commandToCopy && (
                <div className="pt-2">
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                    <code className="text-[11px] font-mono text-slate-800 dark:text-[var(--accent)] font-semibold truncate select-all">
                      {tweak.commandToCopy}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyTweakCommand(tweak.commandToCopy!, tweak.id)}
                      className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-[11px] font-mono shrink-0 cursor-pointer ${
                        isCopied
                          ? "bg-emerald-500 text-black font-bold"
                          : "bg-white dark:bg-white/10 text-slate-700 dark:text-white/80 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-transparent active:scale-95 shadow-xs"
                      }`}
                      title="Copy command"
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
