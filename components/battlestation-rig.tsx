"use client";

import { useState } from "react";
import {
  Cpu,
  Monitor,
  HardDrive,
  Keyboard,
  Check,
  Copy,
  Flame,
  Sparkles,
  Info,
} from "lucide-react";
import type { PotatoRigConfig, RigPartItem, RigBenchmarkItem } from "@/lib/validation";

interface BattlestationRigProps {
  config?: PotatoRigConfig | null;
  className?: string;
}

const DEFAULT_PARTS: RigPartItem[] = [
  {
    id: "part-1",
    name: "Processor (CPU)",
    category: "cpu",
    spec: "Intel Core i5-4460 @ 3.20 GHz (4 Cores / 4 Threads)",
    humorNote: "Vintage silicon running at 100% capacity on Discord startup.",
    upgradeIdea: "Budget upgrade: Ryzen 5 3600 ($60 used)",
  },
  {
    id: "part-2",
    name: "Graphics Card (GPU)",
    category: "gpu",
    spec: "NVIDIA GeForce GTX 1050 Ti 4GB GDDR5",
    humorNote: "The undisputed champion of low-budget gaming since 2016.",
    upgradeIdea: "Budget upgrade: RX 580 8GB ($70)",
  },
  {
    id: "part-3",
    name: "Memory (RAM)",
    category: "ram",
    spec: "16 GB DDR3 1600 MHz Dual-Channel",
    humorNote: "Chrome uses 15.2 GB, games get what is left over.",
    upgradeIdea: "Budget upgrade: 3200MHz DDR4 when motherboard permits",
  },
  {
    id: "part-4",
    name: "Primary Storage",
    category: "storage",
    spec: "240 GB SATA SSD + 1 TB 7200 RPM Mechanical HDD",
    humorNote: "Windows on the SSD, games on the noisy mechanical spinner.",
    upgradeIdea: "Budget upgrade: 1TB NVMe M.2 ($50)",
  },
  {
    id: "part-5",
    name: "Display",
    category: "display",
    spec: '24" 1080p 75Hz IPS Panel (Overclocked to 77Hz)',
    humorNote: "Gained 2Hz through custom resolution and felt like an esports god.",
    upgradeIdea: "Budget upgrade: 144Hz IPS panel ($110)",
  },
  {
    id: "part-6",
    name: "Battle Peripherals",
    category: "peripherals",
    spec: "Budget Optical Mouse (1000Hz) + Blue Switch Mechanical Keyboard",
    humorNote: "Loud enough to wake the neighbors, reliable enough for clutches.",
    upgradeIdea: "Budget upgrade: Lightweight paracord mouse ($25)",
  },
];

const DEFAULT_BENCHMARKS: RigBenchmarkItem[] = [
  {
    game: "Stardew Valley",
    fps: 144,
    quality: "Max 1080p",
    verdict: "Silky Smooth ☕",
  },
  {
    game: "Valorant",
    fps: 95,
    quality: "Low 1080p Stretched",
    verdict: "Competitive Ready 🎯",
  },
  {
    game: "Lethal Company",
    fps: 60,
    quality: "720p Optimized",
    verdict: "Co-op Certified 👥",
  },
  {
    game: "Cyberpunk 2077",
    fps: 14,
    quality: "720p Low FSR Ultra",
    verdict: "Explosive Hazard ⚠️",
  },
];

export function BattlestationRig({ config, className = "" }: BattlestationRigProps) {
  const parts = config?.parts?.length ? config.parts : DEFAULT_PARTS;
  const benchmarks = config?.benchmarks?.length ? config.benchmarks : DEFAULT_BENCHMARKS;
  const [selectedPartId, setSelectedPartId] = useState<string>(parts[0]?.id || "part-1");
  const [copied, setCopied] = useState(false);

  if (config?.enabled === false) return null;

  const activePart = parts.find((p) => p.id === selectedPartId) || parts[0];

  const copySpecs = () => {
    const text = parts.map((p) => `${p.name}: ${p.spec}`).join("\n");
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "cpu":
      case "gpu":
        return Cpu;
      case "display":
        return Monitor;
      case "storage":
      case "ram":
        return HardDrive;
      default:
        return Keyboard;
    }
  };

  return (
    <div
      className={`battlestation-rig-section w-full my-6 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-gradient-to-b dark:from-white/[0.03] dark:to-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden select-none ${className}`}
      id="battlestation-rig"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-600 dark:text-cyan-400 font-bold whitespace-nowrap shrink-0">
              HARDWARE CALIBRATION // RIG INSPECTOR
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white flex flex-wrap sm:flex-nowrap items-center gap-2">
            <span>{config?.rigName || "The Trusty Budget Rig"}</span>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-normal whitespace-nowrap shrink-0">
              {config?.rigBadge || "Certified Potato Mark IV"}
            </span>
          </h3>
          <p className="text-xs font-mono text-slate-500 dark:text-white/50 mt-1">
            {config?.overallVerdict ||
              "Honest hardware specs with tested benchmarks. Certified proof that good games don't require $2,000 graphics cards."}
          </p>
        </div>

        <button
          type="button"
          onClick={copySpecs}
          className="px-4 py-2 rounded-xl text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white dark:border-white/10 transition-all flex items-center gap-2 self-start xl:self-auto whitespace-nowrap shrink-0 active:scale-95 cursor-pointer shadow-xs"
        >
          {copied ? <Check size={13} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? "Specs Copied!" : "Copy Full Specs"}</span>
        </button>
      </div>

      {/* Main Grid: Interactive Part Selector (Left) & Inspector Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Parts List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-[10px] font-mono tracking-widest uppercase text-slate-500 dark:text-white/40 mb-2">
            SELECT COMPONENT TO INSPECT:
          </div>
          {parts.map((part) => {
            const Icon = getCategoryIcon(part.category);
            const isSelected = part.id === selectedPartId;
            return (
              <button
                key={part.id}
                type="button"
                onClick={() => setSelectedPartId(part.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-purple-500/10 border-[var(--accent)] text-slate-900 dark:bg-white/10 dark:text-white shadow-xs scale-[1.01]"
                    : "bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-700 dark:bg-white/[0.02] dark:border-white/5 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] font-bold"
                        : "bg-white text-slate-600 border border-slate-200 dark:bg-white/5 dark:text-white/60 dark:border-transparent"
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                  <div className="truncate">
                    <strong className="text-xs font-mono block text-slate-900 dark:text-white truncate">
                      {part.name}
                    </strong>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 truncate block">
                      {part.spec}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Part Detail Card */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] relative overflow-hidden shadow-xs">
          {activePart && (
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] font-semibold">
                    HARDWARE TELEMETRY // {activePart.category.toUpperCase()}
                  </span>
                  <h4 className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                    {activePart.name}
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/5 dark:text-white/70 dark:border-white/10 whitespace-nowrap shrink-0">
                  HEALTH: 100%
                </span>
              </div>

              {/* Exact Spec */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 mb-4">
                <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 block mb-1">
                  CURRENT SPECIFICATION:
                </span>
                <code className="text-xs font-mono text-slate-800 dark:text-[var(--accent)] font-semibold select-all">
                  {activePart.spec}
                </code>
              </div>

              {/* Humor Note */}
              {activePart.humorNote && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 mb-4">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold mb-1">
                    <Info size={13} />
                    <span>Real-World Performance Note:</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-white/75 font-sans leading-relaxed">
                    &ldquo;{activePart.humorNote}&rdquo;
                  </p>
                </div>
              )}

              {/* Upgrade Idea */}
              {activePart.upgradeIdea && (
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25">
                  <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold mb-1">
                    <Sparkles size={13} />
                    <span>Next Smart Budget Upgrade:</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-white/75 font-sans">
                    {activePart.upgradeIdea}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-white/40">
            <span>STABLE OPERATING TEMP: 62°C</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● RUNNING NOISE: SILENT</span>
          </div>
        </div>
      </div>

      {/* Real Tested FPS Benchmarks */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-amber-500 dark:text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-900 dark:text-white font-bold">
              REAL TESTED FPS BENCHMARKS
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-white/40">
            TESTED ON 1080P / LOW LATENCY MODE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benchmarks.map((bench, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 hover:bg-slate-100/90 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-2 shadow-xs"
            >
              <div>
                <strong className="text-xs font-mono text-slate-900 dark:text-white block">
                  {bench.game}
                </strong>
                <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 block">
                  {bench.quality}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-200 dark:border-white/5">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1">
                  <span>{bench.fps}</span>
                  <span className="text-[10px] font-normal text-slate-500 dark:text-white/40">FPS</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap shrink-0">
                  {bench.verdict}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
