"use client";

import { useState } from "react";
import {
  Activity,
  Check,
  Copy,
  Crosshair,
  Layers,
  Monitor,
  Mouse,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";

export interface GameSettingItem {
  id: string;
  game: string;
  dpi?: number | null;
  sens?: string | null;
  edpi?: string | null;
  resolution?: string | null;
  crosshairCode?: string | null;
  pollingRate?: string | null;
  mousepad?: string | null;
  notes?: string | null;
}

export function GameSettings({ settings }: { settings?: GameSettingItem[] | null }) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!settings || settings.length === 0) return null;

  const activeIndex = Math.min(activeTab, settings.length - 1);
  const current = settings[activeIndex];

  const handleCopy = (code: string, id: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {});
  };

  return (
    <section className="game-settings-section mt-12 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Crosshair size={16} style={{ color: "var(--accent)" }} />
          <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-slate-700 dark:text-white/70">
            TARGETING & SENSITIVITY // {settings.length} {settings.length === 1 ? "PROFILE" : "PROFILES"}
          </h3>
        </div>

        {settings.length > 1 && (
          <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
            {settings.map((item, index) => (
              <button
                key={item.id || index}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`px-3 py-1 uppercase tracking-wider transition-all border ${
                  activeIndex === index
                    ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border-[var(--accent)] font-semibold shadow-sm"
                    : "bg-transparent text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white/80 hover:border-slate-300 dark:hover:border-white/20"
                }`}
                style={{
                  clipPath: "polygon(0 0, 100% 0, 92% 100%, 0% 100%)",
                }}
              >
                {item.game}
              </button>
            ))}
          </div>
        )}
      </div>

      {current && (
        <div
          className="p-5 md:p-6 border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-white/[0.02] shadow-sm dark:shadow-none backdrop-blur-md relative group transition-all hover:border-[var(--accent)]"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)",
          }}
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200/60 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[var(--accent)]">
                <Crosshair size={15} />
              </span>
              <div>
                <h4 className="text-sm font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase">
                  {current.game}
                </h4>
                <span className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-white/40 uppercase">
                  COMPETITIVE CONFIG
                </span>
              </div>
            </div>

            {current.resolution && (
              <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-800 dark:text-white/80">
                {current.resolution}
              </span>
            )}
          </div>

          {/* Crosshair Code Box (if available) */}
          {current.crosshairCode && (
            <div className="mb-5 p-3.5 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-8 h-8 rounded shrink-0 bg-slate-900 border border-[var(--accent)]/40 flex items-center justify-center">
                    {/* Retro mini crosshair preview */}
                    <div className="w-3 h-0.5 bg-[var(--accent)] absolute" />
                    <div className="h-3 w-0.5 bg-[var(--accent)] absolute" />
                    <div className="w-1 h-1 rounded-full bg-white absolute" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono tracking-widest text-[var(--accent)] font-semibold block uppercase">
                      IN-GAME CROSSHAIR CODE
                    </span>
                    <p className="text-xs font-mono text-slate-900 dark:text-white/90 truncate max-w-[280px] sm:max-w-md select-all">
                      {current.crosshairCode}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(current.crosshairCode!, current.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all border shrink-0 ${
                    copiedId === current.id
                      ? "bg-green-500/20 border-green-500/40 text-green-700 dark:text-green-300"
                      : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/10 hover:border-[var(--accent)]"
                  }`}
                  aria-label="Copy crosshair code"
                >
                  {copiedId === current.id ? (
                    <>
                      <Check size={13} className="text-green-600 dark:text-green-400" />
                      <span>COPIED CODE</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>COPY CROSSHAIR</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {/* DPI */}
            {current.dpi != null && (
              <div className="p-3 border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.015] rounded">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-slate-500 dark:text-white/40 mb-1">
                  <span>DPI</span>
                  <Mouse size={12} className="text-[var(--accent)] opacity-70" />
                </div>
                <p className="text-xs font-mono text-slate-900 dark:text-white font-semibold">{current.dpi} DPI</p>
              </div>
            )}

            {/* In-Game Sensitivity */}
            {current.sens && (
              <div className="p-3 border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.015] rounded">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-slate-500 dark:text-white/40 mb-1">
                  <span>IN-GAME SENS</span>
                  <Sliders size={12} className="text-[var(--accent)] opacity-70" />
                </div>
                <p className="text-xs font-mono text-slate-900 dark:text-white font-semibold">{current.sens}</p>
              </div>
            )}

            {/* eDPI */}
            {(current.edpi || (current.dpi != null && current.sens && !isNaN(Number(current.sens)))) && (
              <div className="p-3 border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.015] rounded">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-slate-500 dark:text-white/40 mb-1">
                  <span>eDPI</span>
                  <Zap size={12} className="text-[var(--accent)] opacity-70" />
                </div>
                <p className="text-xs font-mono text-slate-900 dark:text-white font-semibold">
                  {current.edpi || (Math.round(current.dpi! * Number(current.sens) * 10) / 10).toString()}
                </p>
              </div>
            )}

            {/* Polling Rate */}
            {current.pollingRate && (
              <div className="p-3 border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.015] rounded">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-slate-500 dark:text-white/40 mb-1">
                  <span>POLLING RATE</span>
                  <Activity size={12} className="text-[var(--accent)] opacity-70" />
                </div>
                <p className="text-xs font-mono text-slate-900 dark:text-white font-semibold">{current.pollingRate}</p>
              </div>
            )}

            {/* Mousepad / Surface */}
            {current.mousepad && (
              <div className="p-3 border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.015] rounded col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-slate-500 dark:text-white/40 mb-1">
                  <span>MOUSEPAD</span>
                  <Layers size={12} className="text-[var(--accent)] opacity-70" />
                </div>
                <p className="text-xs font-mono text-slate-900 dark:text-white font-semibold truncate">{current.mousepad}</p>
              </div>
            )}

            {/* Resolution (if grid fits) */}
            {current.resolution && (
              <div className="p-3 border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.015] rounded col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-slate-500 dark:text-white/40 mb-1">
                  <span>DISPLAY RES</span>
                  <Monitor size={12} className="text-[var(--accent)] opacity-70" />
                </div>
                <p className="text-xs font-mono text-slate-900 dark:text-white font-semibold truncate">{current.resolution}</p>
              </div>
            )}
          </div>

          {/* Notes / Grip */}
          {current.notes && (
            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-start gap-2 text-xs font-mono text-slate-600 dark:text-white/60">
              <Sparkles size={13} className="text-[var(--accent)] shrink-0 mt-0.5" />
              <span>{current.notes}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
