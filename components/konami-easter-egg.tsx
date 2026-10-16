"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import {
  Gamepad2,
  Volume2,
  VolumeX,
  X,
  Trophy,
  Sparkles,
  Zap,
  Music,
  Monitor,
  GripVertical,
} from "lucide-react";
import {
  KONAMI_CODE,
  isKonamiMatch,
  pushKey,
  isEditableElement,
  playKonamiFanfare,
  playRetroSfx,
  type RetroSfxType,
} from "@/lib/konami";

export function KonamiEasterEgg() {
  const pathname = usePathname();
  const isDashboard = Boolean(pathname?.startsWith("/dashboard"));

  const [isOpen, setIsOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // Pure client-side draggable position stored in localStorage
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    hasMoved: boolean;
  } | null>(null);

  // Restore client state from localStorage on mount
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (localStorage.getItem("arzur_retro_unlocked") === "1") {
          setUnlocked(true);
        }
        const stored = localStorage.getItem("arzur_arcade_pill_pos");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
            const margin = 8;
            const w = 180;
            const h = 40;
            const safeX = Math.max(margin, Math.min(window.innerWidth - w - margin, parsed.x));
            const safeY = Math.max(margin, Math.min(window.innerHeight - h - margin, parsed.y));
            setPosition({ x: safeX, y: safeY });
          }
        }
      } catch {
        // Ignore
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const [recentKeys, setRecentKeys] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"pad" | "soundboard">("pad");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanlinesActive, setScanlinesActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerUnlock = useCallback(() => {
    setUnlocked(true);
    setIsOpen(true);
    setToastMessage("🏆 CHEAT UNLOCKED: 30 LIVES // RETRO ARCADE");
    setTimeout(() => setToastMessage(null), 4000);

    try {
      localStorage.setItem("arzur_retro_unlocked", "1");
    } catch {
      // Ignore
    }

    if (soundEnabled) {
      playKonamiFanfare();
    }
  }, [soundEnabled]);

  // Global keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableElement(e.target)) return;

      setRecentKeys((prev) => {
        const next = pushKey(prev, e.key, KONAMI_CODE.length);
        if (isKonamiMatch(next)) {
          triggerUnlock();
          return [];
        }
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerUnlock]);

  // Toggle body scanline class
  useEffect(() => {
    if (scanlinesActive) {
      document.body.classList.add("retro-scanlines-active");
    } else {
      document.body.classList.remove("retro-scanlines-active");
    }
    return () => {
      document.body.classList.remove("retro-scanlines-active");
    };
  }, [scanlinesActive]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = pillRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
      hasMoved: false,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || !pillRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (!dragStartRef.current.hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      dragStartRef.current.hasMoved = true;
    }

    if (!dragStartRef.current.hasMoved) return;

    const el = pillRef.current;
    const w = el ? el.offsetWidth : 160;
    const h = el ? el.offsetHeight : 36;
    const margin = 8;

    const nextX = Math.max(margin, Math.min(window.innerWidth - w - margin, dragStartRef.current.originX + dx));
    const nextY = Math.max(margin, Math.min(window.innerHeight - h - margin, dragStartRef.current.originY + dy));

    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const { hasMoved } = dragStartRef.current;
    dragStartRef.current = null;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }

    if (hasMoved) {
      if (position) {
        try {
          localStorage.setItem("arzur_arcade_pill_pos", JSON.stringify(position));
        } catch {
          // Ignore
        }
      }
    } else {
      // Tap / Click action
      if (unlocked) {
        setIsOpen(true);
      } else {
        setActiveTab("pad");
        setIsOpen(true);
      }
    }
  };

  const resetPillPosition = () => {
    try {
      localStorage.removeItem("arzur_arcade_pill_pos");
    } catch {
      // Ignore
    }
    setPosition(null);
  };

  const handleVirtualKey = (key: string) => {
    if (soundEnabled) {
      playRetroSfx("laser");
    }
    setRecentKeys((prev) => {
      const next = pushKey(prev, key, KONAMI_CODE.length);
      if (isKonamiMatch(next)) {
        triggerUnlock();
        return [];
      }
      return next;
    });
  };

  const handleSfx = (type: RetroSfxType) => {
    if (soundEnabled) {
      playRetroSfx(type);
    }
  };

  return (
    <>
      {/* Toast Notification when unlocked */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[99999] animate-bounce pointer-events-none">
          <div className="bg-emerald-950/90 border-2 border-emerald-400 text-emerald-200 px-5 py-3 rounded-xl shadow-[0_0_35px_rgba(16,185,129,0.5)] font-mono text-xs uppercase tracking-wider flex items-center gap-3 backdrop-blur-md">
            <Trophy className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: "3s" }} />
            <div>
              <div className="font-bold text-white text-sm">ACHIEVEMENT UNLOCKED</div>
              <div>{toastMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Retro Pill (Draggable entry point - purely client-side & stored in localStorage) */}
      <div
        ref={pillRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragStartRef.current = null;
          setIsDragging(false);
        }}
        style={
          position
            ? {
                position: "fixed",
                left: `${position.x}px`,
                top: `${position.y}px`,
                bottom: "auto",
                right: "auto",
                zIndex: 40,
              }
            : undefined
        }
        className={`${
          position
            ? "fixed z-40 print:hidden select-none touch-none"
            : isDashboard
            ? "fixed bottom-24 right-6 z-40 print:hidden select-none touch-none"
            : "fixed bottom-4 left-4 z-40 print:hidden select-none touch-none"
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          title={
            unlocked
              ? "Drag to move • Click to open Retro Arcade"
              : "Drag to move • Click for Konami Pad (↑ ↑ ↓ ↓ ← → ← → B A)"
          }
          className={`group flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full text-xs font-mono font-medium backdrop-blur-md border transition-all duration-200 shadow-lg ${
            isDragging
              ? "cursor-grabbing scale-105 shadow-[0_0_25px_rgba(168,85,247,0.4)] border-purple-400 bg-purple-100 dark:bg-purple-900/90 text-purple-900 dark:text-purple-100"
              : "cursor-grab"
          } ${
            unlocked
              ? "bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-500/60 text-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/90 hover:border-purple-400 shadow-purple-500/10 dark:shadow-purple-950/60"
              : "bg-white/80 dark:bg-black/60 border-slate-200 dark:border-white/15 text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/30 hover:bg-white dark:hover:bg-black/80"
          }`}
        >
          <GripVertical className="w-3.5 h-3.5 text-slate-400 dark:text-white/30 group-hover:text-slate-700 dark:group-hover:text-white/70 -mr-0.5 transition-colors" />
          <Gamepad2 className={`w-3.5 h-3.5 ${unlocked ? "text-purple-600 dark:text-purple-400 animate-pulse" : "text-slate-500 dark:text-white/60"}`} />
          <span className="hidden sm:inline">
            {unlocked ? "ARCADE MODE" : "KONAMI: ↑↑↓↓←→←→BA"}
          </span>
          {unlocked && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          )}
        </div>
      </div>

      {/* Retro Arcade Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-xl bg-[#080511] border-2 border-purple-500/60 rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.35)] overflow-hidden flex flex-col max-h-[92vh]"
            style={{
              boxShadow: "0 0 50px rgba(139, 92, 246, 0.25), inset 0 0 30px rgba(139, 92, 246, 0.1)",
            }}
          >
            {/* Header Banner */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-purple-950/40 border-b border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300">
                  <Gamepad2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white tracking-wider">
                      RETRO ARCADE // CHEAT MODE
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                      30 LIVES
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-300/70 font-mono">
                    Sequence: ↑ ↑ ↓ ↓ ← → ← → B A
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  title={soundEnabled ? "Mute Retro Audio" : "Enable Retro Audio"}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-purple-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-white/40" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 text-white/70 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 bg-black/40 border-b border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("pad")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === "pad"
                    ? "bg-purple-600 text-white font-semibold shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Gamepad Controller
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("soundboard")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  activeTab === "soundboard"
                    ? "bg-purple-600 text-white font-semibold shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                8-Bit Soundboard
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {activeTab === "soundboard" && (
                <div className="space-y-4">
                  <div className="text-xs font-mono text-white/70">
                    Pure Web Audio API synthesizer. Zero external mp3 downloads, generated on-the-fly via mathematical sound waves.
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => playKonamiFanfare()}
                      className="p-4 rounded-xl bg-purple-950/50 border border-purple-500/40 hover:bg-purple-900/60 hover:border-purple-400 text-left transition-all group"
                    >
                      <Sparkles className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-mono font-bold text-white">KONAMI FANFARE</div>
                      <div className="text-[10px] text-purple-300/60 font-mono">8-bit arpeggio chord</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSfx("coin")}
                      className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 hover:border-amber-400 text-left transition-all group"
                    >
                      <Zap className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-mono font-bold text-white">COIN / PING</div>
                      <div className="text-[10px] text-amber-300/60 font-mono">B5 to E6 chime</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSfx("laser")}
                      className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50 hover:border-cyan-400 text-left transition-all group"
                    >
                      <Zap className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-mono font-bold text-white">LASER BLAST</div>
                      <div className="text-[10px] text-cyan-300/60 font-mono">Pitch drop sawtooth</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSfx("jump")}
                      className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 hover:border-emerald-400 text-left transition-all group"
                    >
                      <Zap className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-mono font-bold text-white">RETRO JUMP</div>
                      <div className="text-[10px] text-emerald-300/60 font-mono">Square frequency rise</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSfx("powerup")}
                      className="p-4 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/40 hover:bg-fuchsia-900/50 hover:border-fuchsia-400 text-left transition-all group"
                    >
                      <Trophy className="w-5 h-5 text-fuchsia-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-mono font-bold text-white">1-UP POWERUP</div>
                      <div className="text-[10px] text-fuchsia-300/60 font-mono">Tri-wave flourish</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSfx("explosion")}
                      className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/50 hover:border-rose-400 text-left transition-all group"
                    >
                      <Zap className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-mono font-bold text-white">EXPLOSION</div>
                      <div className="text-[10px] text-rose-300/60 font-mono">Bass low rumble</div>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "pad" && (
                <div className="flex flex-col items-center justify-center space-y-6 py-2">
                  <div className="text-center">
                    <p className="text-xs font-mono text-purple-300 mb-1">
                      Touch or click the retro D-Pad to enter the code:
                    </p>
                    <div className="text-xs font-mono font-bold text-white tracking-widest bg-black/60 px-4 py-1.5 rounded-lg border border-purple-500/30 inline-block">
                      ↑ ↑ ↓ ↓ ← → ← → B A
                    </div>
                  </div>

                  {/* Input Buffer Indicator */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const key = recentKeys[i];
                      return (
                        <div
                          key={i}
                          className={`w-7 h-8 rounded border font-mono text-xs flex items-center justify-center uppercase transition-all ${
                            key
                              ? "bg-purple-600/40 border-purple-400 text-white font-bold"
                              : "bg-white/5 border-white/10 text-white/30"
                          }`}
                        >
                          {key === "ArrowUp"
                            ? "↑"
                            : key === "ArrowDown"
                            ? "↓"
                            : key === "ArrowLeft"
                            ? "←"
                            : key === "ArrowRight"
                            ? "→"
                            : key || "•"}
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Gamepad Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 bg-black/40 p-6 rounded-2xl border border-white/10">
                    {/* D-PAD */}
                    <div className="relative w-36 h-36">
                      <button
                        type="button"
                        onClick={() => handleVirtualKey("ArrowUp")}
                        className="absolute top-0 left-12 w-12 h-12 bg-neutral-800 hover:bg-neutral-700 active:bg-purple-600 border border-neutral-600 rounded-t-lg flex items-center justify-center text-white font-bold text-lg active:scale-95 transition-all"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVirtualKey("ArrowLeft")}
                        className="absolute top-12 left-0 w-12 h-12 bg-neutral-800 hover:bg-neutral-700 active:bg-purple-600 border border-neutral-600 rounded-l-lg flex items-center justify-center text-white font-bold text-lg active:scale-95 transition-all"
                      >
                        ◄
                      </button>
                      <div className="absolute top-12 left-12 w-12 h-12 bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-neutral-700" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVirtualKey("ArrowRight")}
                        className="absolute top-12 right-0 w-12 h-12 bg-neutral-800 hover:bg-neutral-700 active:bg-purple-600 border border-neutral-600 rounded-r-lg flex items-center justify-center text-white font-bold text-lg active:scale-95 transition-all"
                      >
                        ►
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVirtualKey("ArrowDown")}
                        className="absolute bottom-0 left-12 w-12 h-12 bg-neutral-800 hover:bg-neutral-700 active:bg-purple-600 border border-neutral-600 rounded-b-lg flex items-center justify-center text-white font-bold text-lg active:scale-95 transition-all"
                      >
                        ▼
                      </button>
                    </div>

                    {/* ACTION BUTTONS (B and A) */}
                    <div className="flex items-center gap-4 rotate-[-15deg]">
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => handleVirtualKey("b")}
                          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-400 border-2 border-red-800 shadow-[0_4px_0_#7f1d1d] active:translate-y-1 active:shadow-none flex items-center justify-center text-white font-mono font-bold text-lg transition-all"
                        >
                          B
                        </button>
                        <span className="text-[10px] font-mono text-white/50 mt-1 uppercase">Key B</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => handleVirtualKey("a")}
                          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-400 border-2 border-red-800 shadow-[0_4px_0_#7f1d1d] active:translate-y-1 active:shadow-none flex items-center justify-center text-white font-mono font-bold text-lg transition-all"
                        >
                          A
                        </button>
                        <span className="text-[10px] font-mono text-white/50 mt-1 uppercase">Key A</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={triggerUnlock}
                    className="text-xs font-mono text-purple-400 underline hover:text-purple-300"
                  >
                    Quick Unlock (Skip code)
                  </button>
                </div>
              )}
            </div>

            {/* Footer with CRT Scanline visual toggle */}
            <div className="px-5 py-3 bg-black/60 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <label className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={scanlinesActive}
                  onChange={(e) => setScanlinesActive(e.target.checked)}
                  className="rounded border-white/20 bg-black/50 text-purple-600 focus:ring-purple-500"
                />
                <Monitor className="w-3.5 h-3.5 text-purple-400" />
                <span>Page CRT Scanlines Effect</span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetPillPosition}
                  title="Reset floating arcade button to default location"
                  className="text-[11px] text-white/40 hover:text-white underline decoration-dotted transition-colors"
                >
                  Reset Pill Position
                </button>
                <div className="text-[11px] text-white/40">
                  Arzur Sanctum Arcade v1.0
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
