"use client";

import { useState, useEffect, useRef } from "react";
import { Palette, Sparkles, Check } from "lucide-react";
import type { ThemeMatrixConfig } from "@/lib/validation";
import { playTechSound } from "@/lib/passport";

interface ThemeMatrixSwitcherProps {
  config?: ThemeMatrixConfig | null;
  defaultAccent?: string;
  defaultGlow?: number;
  className?: string;
  onColorwayChange?: (colorway: { accent: string; glow: number; fg?: string } | null) => void;
}

interface ColorwayPreset {
  id: string;
  name: string;
  accent: string;
  glow: number;
  badge: string;
  fg: string;
}

const COLORWAYS: ColorwayPreset[] = [
  { id: "nebula", name: "Nebula Purple", accent: "#bb9aff", glow: 60, badge: "🟣", fg: "#0d091a" },
  { id: "matrix", name: "Matrix Terminal", accent: "#22c55e", glow: 75, badge: "🟢", fg: "#052e16" },
  { id: "crimson", name: "Bloodline Crimson", accent: "#ef4444", glow: 70, badge: "🔴", fg: "#ffffff" },
  { id: "synthwave", name: "Synthwave Cyan", accent: "#06b6d4", glow: 80, badge: "🔵", fg: "#082f49" },
  { id: "amber", name: "Arcade Amber", accent: "#f59e0b", glow: 65, badge: "🟡", fg: "#1c1917" },
  { id: "stealth", name: "OLED Stealth", accent: "#cbd5e1", glow: 30, badge: "🌑", fg: "#090d16" },
];

export function ThemeMatrixSwitcher({
  config,
  defaultAccent = "#bb9aff",
  defaultGlow = 60,
  className = "",
  onColorwayChange,
}: ThemeMatrixSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeColorway, setActiveColorway] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("preferred_colorway");
        if (saved && COLORWAYS.some((c) => c.id === saved)) {
          return saved;
        }
      } catch {}
    }
    return "";
  });

  const applyVars = (accent: string, glow: number, fg = "#090d16") => {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--glow", `${glow}`);
    document.documentElement.style.setProperty("--accent-fg", fg);
    const mainEl = document.getElementById("top") || document.querySelector("main");
    if (mainEl) {
      mainEl.style.setProperty("--accent", accent);
      mainEl.style.setProperty("--glow", `${glow}`);
      mainEl.style.setProperty("--accent-fg", fg);
    }
  };

  // Close dropdown on click outside or escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Synchronize CSS custom properties with selected colorway
  useEffect(() => {
    if (!activeColorway) return;
    const match = COLORWAYS.find((c) => c.id === activeColorway);
    if (match) {
      applyVars(match.accent, match.glow, match.fg);
      onColorwayChange?.({ accent: match.accent, glow: match.glow, fg: match.fg });
    }
  }, [activeColorway, onColorwayChange]);

  const selectColorway = (preset: ColorwayPreset) => {
    setActiveColorway(preset.id);
    applyVars(preset.accent, preset.glow, preset.fg);
    onColorwayChange?.({ accent: preset.accent, glow: preset.glow, fg: preset.fg });
    playTechSound("click", false);
    if (typeof window !== "undefined" && (window as unknown as { __trackVisitorAction?: (msg: string) => void }).__trackVisitorAction) {
      (window as unknown as { __trackVisitorAction: (msg: string) => void }).__trackVisitorAction(`Switched Colorway to ${preset.name}`);
    }
    try {
      localStorage.setItem("preferred_colorway", preset.id);
    } catch {}
  };

  const resetToOriginal = () => {
    setActiveColorway("");
    applyVars(defaultAccent, defaultGlow, "#090d16");
    onColorwayChange?.(null);
    playTechSound("click", false);
    try {
      localStorage.removeItem("preferred_colorway");
    } catch {}
  };

  if (config?.enabled === false) return null;

  return (
    <div ref={containerRef} className={`fixed top-4 right-20 z-40 select-none ${className}`}>
      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => {
          playTechSound("scan", false);
          setIsOpen((prev) => !prev);
        }}
        className="px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-white/15 bg-white/80 dark:bg-black/60 backdrop-blur-md text-slate-800 dark:text-white text-xs font-mono flex items-center gap-2 shadow-md hover:border-[var(--accent)] transition-all group cursor-pointer"
        title="Visitor Colorway Matrix Switcher"
      >
        <Palette size={13} className="text-[var(--accent)] group-hover:rotate-45 transition-transform" />
        <span className="hidden sm:inline">Colorway</span>
      </button>

      {/* Dropdown Tray */}
      {isOpen && (
        <div className="absolute top-10 right-0 w-52 p-3 rounded-2xl border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-black/90 backdrop-blur-2xl shadow-2xl space-y-1.5 animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-white font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10 mb-2">
            <span className="text-[10px] uppercase text-slate-500 dark:text-white/50 tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-[var(--accent)]" /> LIVE COLORWAYS
            </span>
            {activeColorway ? (
              <button
                type="button"
                onClick={resetToOriginal}
                className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 hover:text-slate-900 dark:text-white/80 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-white/15"
                title="Reset to default theme"
              >
                <span>↺</span> Reset
              </button>
            ) : (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/60">
                6 Presets
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-1">
            {COLORWAYS.map((c) => {
              const isSelected = activeColorway === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectColorway(c)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-slate-100 dark:bg-white/15 border-slate-300 dark:border-white/30 text-slate-900 dark:text-white font-bold"
                      : "bg-transparent border-transparent text-slate-600 dark:text-white/70 hover:bg-slate-100/70 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300 dark:border-white/30 shrink-0"
                      style={{ backgroundColor: c.accent }}
                    />
                    <span className="text-[11px] truncate">{c.name}</span>
                  </div>
                  {isSelected && <Check size={12} className="text-[var(--accent)]" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/5 text-[9px] text-slate-400 dark:text-white/40 text-center">
            Tap to preview live palette
          </div>
        </div>
      )}
    </div>
  );
}

