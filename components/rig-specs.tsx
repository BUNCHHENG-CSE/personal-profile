"use client";

import { useState } from "react";
import {
  Cpu,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  Layers,
  Monitor,
  Mouse,
  Tv,
  Zap,
} from "lucide-react";
import { GameSettings, type GameSettingItem } from "@/components/game-settings";
import type { ClipItem } from "@/components/clips-showcase";
import type {
  TournamentItem,
  GamerPassportConfig,
  KudosRecord,
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

export interface GamingGear {
  setupType?: "desktop" | "laptop" | "both" | null;
  // Desktop Specs
  cpu?: string | null;
  gpu?: string | null;
  ram?: string | null;
  storage?: string | null;
  motherboard?: string | null;
  display?: string | null;
  mouse?: string | null;
  keyboard?: string | null;
  headset?: string | null;
  // Laptop Specs
  laptopModel?: string | null;
  laptopCpu?: string | null;
  laptopGpu?: string | null;
  laptopIgpu?: string | null;
  laptopRam?: string | null;
  laptopStorage?: string | null;
  laptopDisplay?: string | null;
  laptopMouse?: string | null;
  laptopHeadset?: string | null;
  // Competitive Game Configs & Settings
  gameSettings?: GameSettingItem[] | null;
  // Clips & Highlights
  clips?: ClipItem[] | null;
  // Tournaments & Milestones
  tournaments?: TournamentItem[] | null;
  // Holographic 3D Gamer Passport
  passport?: GamerPassportConfig | null;
  // 1-Click GG Kudos Reaction Deck
  kudos?: KudosRecord | null;
  // RPG Skill Matrix & Playstyle Hexagon
  skillMatrix?: SkillMatrixConfig | null;
  // 5 New Super Modules Pack 1
  guestbook?: GuestbookConfig | null;
  chillLounge?: ChillLoungeConfig | null;
  casualCorner?: CasualCornerConfig | null;
  potatoPcGuide?: PotatoPcGuideConfig | null;
  themeMatrix?: ThemeMatrixConfig | null;
  // 5 New Super Modules Pack 2
  potatoRig?: PotatoRigConfig | null;
  reactionGame?: ReactionGameConfig | null;
  specAdvisor?: SpecAdvisorConfig | null;
  partyBeacon?: PartyBeaconConfig | null;
  gamingJournal?: GamingJournalConfig | null;
}

export type SpecKey = Exclude<
  keyof GamingGear,
  | "setupType"
  | "gameSettings"
  | "clips"
  | "tournaments"
  | "passport"
  | "kudos"
  | "skillMatrix"
  | "guestbook"
  | "chillLounge"
  | "casualCorner"
  | "potatoPcGuide"
  | "themeMatrix"
  | "potatoRig"
  | "reactionGame"
  | "specAdvisor"
  | "partyBeacon"
  | "gamingJournal"
>;

const desktopMap: { key: SpecKey; label: string; icon: typeof Cpu }[] = [
  { key: "cpu", label: "PROCESSOR", icon: Cpu },
  { key: "gpu", label: "GRAPHICS", icon: Zap },
  { key: "ram", label: "MEMORY", icon: Layers },
  { key: "display", label: "DISPLAY", icon: Monitor },
  { key: "mouse", label: "MOUSE", icon: Mouse },
  { key: "keyboard", label: "KEYBOARD", icon: Keyboard },
  { key: "headset", label: "AUDIO", icon: Headphones },
  { key: "storage", label: "STORAGE", icon: HardDrive },
  { key: "motherboard", label: "MAINBOARD", icon: Tv },
];

const laptopMap: { key: SpecKey; label: string; icon: typeof Cpu }[] = [
  { key: "laptopModel", label: "LAPTOP MODEL", icon: Laptop },
  { key: "laptopCpu", label: "PROCESSOR", icon: Cpu },
  { key: "laptopGpu", label: "GRAPHICS", icon: Zap },
  { key: "laptopRam", label: "MEMORY", icon: Layers },
  { key: "laptopDisplay", label: "BUILT-IN DISPLAY", icon: Monitor },
  { key: "laptopStorage", label: "STORAGE", icon: HardDrive },
  { key: "laptopMouse", label: "MOUSE", icon: Mouse },
  { key: "laptopHeadset", label: "AUDIO", icon: Headphones },
];

function classifyGpus(firstGpu: string, secondGpu: string): { dgpu: string; igpu: string } {
  function scoreGpu(name: string): number {
    const s = name.toLowerCase();
    let score = 0;

    // Strong discrete GPU signals
    if (s.includes("nvidia") || s.includes("geforce")) score += 40;
    if (s.includes("rtx") || s.includes("gtx")) score += 30;
    if (s.includes("radeon rx")) score += 30;
    if (s.includes("arc a") || s.includes("intel arc")) score += 25;
    if (/([4-9]|[1-9][0-9])\s*gb/.test(s)) score += 20; // 4GB+ dedicated VRAM
    if (s.includes("discrete") || s.includes("dgpu")) score += 50;

    // Strong integrated GPU signals
    if (s.includes("radeon(tm) graphics") || s.includes("radeon graphics")) score -= 30;
    if (s.includes("iris") || s.includes("intel uhd") || s.includes("intel hd")) score -= 30;
    if (s.includes("vega") && !s.includes("rx vega")) score -= 25;
    if (/(\d+)\s*mb/.test(s)) score -= 30; // e.g. 486 MB, 512 MB
    if (s.includes("integrated") || s.includes("igpu")) score -= 50;

    return score;
  }

  const score1 = scoreGpu(firstGpu);
  const score2 = scoreGpu(secondGpu);

  if (score2 > score1) {
    return { dgpu: secondGpu.trim(), igpu: firstGpu.trim() };
  }
  return { dgpu: firstGpu.trim(), igpu: secondGpu.trim() };
}

function SpecValue({
  itemKey,
  value,
  gear,
}: {
  itemKey: SpecKey;
  value: string;
  gear: GamingGear;
}) {
  if (itemKey === "laptopGpu" || itemKey === "gpu") {
    let rawA = value;
    let rawB = gear.laptopIgpu || "";

    if (!rawB && (value.includes(" / ") || value.includes(" + "))) {
      const parts = value.includes(" / ") ? value.split(" / ") : value.split(" + ");
      rawA = parts[0] || "";
      rawB = parts.slice(1).join(" / ");
    }

    if (rawB.trim()) {
      const { dgpu, igpu } = classifyGpus(rawA, rawB);

      return (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-start gap-1.5">
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold shrink-0 leading-none">
              dGPU
            </span>
            <span className="text-xs font-mono text-slate-900 dark:text-white/90 font-medium break-words leading-snug">
              {dgpu}
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-semibold shrink-0 leading-none">
              iGPU
            </span>
            <span className="text-xs font-mono text-slate-700 dark:text-white/70 break-words leading-snug">
              {igpu}
            </span>
          </div>
        </div>
      );
    }
  }

  return (
    <p className="text-xs font-mono text-slate-900 dark:text-white/90 font-medium break-words leading-snug">
      {value}
    </p>
  );
}

export function RigSpecs({ gear }: { gear?: GamingGear | null }) {
  const activeDesktopSpecs = desktopMap.filter((item) => Boolean(gear?.[item.key]));
  const activeLaptopSpecs = laptopMap.filter((item) => Boolean(gear?.[item.key]));

  const hasDesktop = activeDesktopSpecs.length > 0;
  const hasLaptop = activeLaptopSpecs.length > 0;

  const defaultMode =
    gear?.setupType === "laptop" || (!hasDesktop && hasLaptop)
      ? "laptop"
      : "desktop";

  const [activeTab, setActiveTab] = useState<"desktop" | "laptop">(defaultMode);

  const hasSettings = Boolean(gear?.gameSettings && gear.gameSettings.length > 0);

  if (!gear || (!hasDesktop && !hasLaptop && !hasSettings)) return null;

  const currentSpecs = activeTab === "laptop" ? activeLaptopSpecs : activeDesktopSpecs;
  const showSwitcher = hasDesktop && hasLaptop;

  return (
    <>
      {(hasDesktop || hasLaptop) && (
        <section className="rig-specs-section mt-12 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              {activeTab === "laptop" ? (
                <Laptop size={16} style={{ color: "var(--accent)" }} />
              ) : (
                <Cpu size={16} style={{ color: "var(--accent)" }} />
              )}
              <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-slate-700 dark:text-white/70">
                {activeTab === "laptop"
                  ? "BATTLESTATION // GAMING LAPTOP RIG"
                  : "BATTLESTATION // DESKTOP RIG SPECS"}
              </h3>
            </div>

            {showSwitcher && (
              <div className="flex items-center gap-1.5 p-1 border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.02] backdrop-blur-md rounded-md text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1 uppercase tracking-wider transition-all rounded ${
                    activeTab === "desktop"
                      ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white border border-[var(--accent)] font-semibold shadow-sm"
                      : "text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white/80"
                  }`}
                >
                  <Cpu size={12} />
                  Desktop PC
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("laptop")}
                  className={`flex items-center gap-1.5 px-3 py-1 uppercase tracking-wider transition-all rounded ${
                    activeTab === "laptop"
                      ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white border border-[var(--accent)] font-semibold shadow-sm"
                      : "text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white/80"
                  }`}
                >
                  <Laptop size={12} />
                  Gaming Laptop
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentSpecs.map(({ key, label, icon: Icon }) => {
              const value = gear[key];
              if (!value || typeof value !== "string") return null;
              return (
                <div
                  key={key}
                  className="p-3.5 border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-white/[0.02] shadow-sm dark:shadow-none backdrop-blur-md relative group hover:border-[var(--accent)] transition-colors flex flex-col justify-between h-full min-h-[104px]"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-slate-500 dark:text-white/40 mb-2">
                    <span>{label}</span>
                    <Icon
                      size={13}
                      className="text-[var(--accent)] opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <SpecValue itemKey={key} value={value} gear={gear} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {hasSettings && <GameSettings settings={gear.gameSettings} />}
    </>
  );
}
