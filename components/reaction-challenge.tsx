"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Zap,
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
  Flame,
} from "lucide-react";
import type { ReactionGameConfig } from "@/lib/validation";

interface ReactionChallengeProps {
  config?: ReactionGameConfig | null;
  className?: string;
}

type GameState = "idle" | "waiting" | "ready" | "result" | "early";

export function ReactionChallenge({ config, className = "" }: ReactionChallengeProps) {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [muted, setMuted] = useState(false);

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const ownerScore = config?.ownerScoreMs || 215;

  const playBeep = useCallback((freq = 440, type: OscillatorType = "sine", duration = 0.1) => {
    if (muted || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext policy
    }
  }, [muted]);

  // Clean timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startTest = () => {
    setGameState("waiting");
    setReactionTime(null);
    playBeep(330, "triangle", 0.08);

    // Random delay between 1.5s and 4.2s
    const delay = Math.floor(Math.random() * 2700) + 1500;
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setGameState("ready");
      playBeep(880, "sine", 0.15);
    }, delay);
  };

  const handlePadClick = () => {
    if (gameState === "idle" || gameState === "result" || gameState === "early") {
      startTest();
      return;
    }

    if (gameState === "waiting") {
      // Too early!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState("early");
      playBeep(220, "sawtooth", 0.2);
      return;
    }

    if (gameState === "ready") {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setReactionTime(elapsed);
      setAttempts((prev) => prev + 1);
      setBestScore((prev) => (prev === null ? elapsed : Math.min(prev, elapsed)));
      setGameState("result");
      playBeep(elapsed < ownerScore ? 1200 : 660, "sine", 0.2);
    }
  };

  if (config?.enabled === false) return null;

  return (
    <div
      className={`reaction-challenge-section w-full my-6 p-6 sm:p-10 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden select-none ${className}`}
      id="reaction-challenge"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold whitespace-nowrap shrink-0">
              ARCADE REFLEX // REACTION CHALLENGE
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex flex-wrap sm:flex-nowrap items-center gap-2">
            <span>{config?.title || "Beat My Reaction High Score"}</span>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 font-normal whitespace-nowrap shrink-0">
              Benchmark: {ownerScore} ms
            </span>
          </h3>
          <p className="text-xs font-mono text-white/50 mt-1">
            Test your reflex speed against my personal benchmark. Click the arcade touchpad as soon as it turns green!
          </p>
        </div>

        <div className="flex items-center gap-2 self-start xl:self-auto">
          <button
            type="button"
            onClick={() => setMuted((prev) => !prev)}
            className="p-2 rounded-xl text-xs font-mono text-white/50 hover:text-white bg-white/5 border border-white/10 transition-colors flex items-center gap-1.5"
            title={muted ? "Unmute audio" : "Mute audio"}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[var(--accent)]" />}
            <span className="text-[10px] hidden sm:inline">{muted ? "MUTED" : "SFX ON"}</span>
          </button>
        </div>
      </div>

      {/* Main Arcade Test Pad */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handlePadClick}
          className={`w-full min-h-[220px] sm:min-h-[260px] rounded-2xl border transition-all duration-150 flex flex-col items-center justify-center p-6 text-center cursor-pointer relative overflow-hidden active:scale-[0.99] ${
            gameState === "idle"
              ? "bg-white/[0.03] border-white/15 hover:bg-white/[0.06] text-white"
              : gameState === "waiting"
              ? "bg-rose-950/40 border-rose-500/50 text-rose-300"
              : gameState === "ready"
              ? "bg-emerald-500 border-emerald-300 text-black shadow-[0_0_50px_rgba(16,185,129,0.5)] animate-pulse"
              : gameState === "early"
              ? "bg-amber-950/40 border-amber-500/50 text-amber-300"
              : "bg-purple-950/40 border-purple-500/50 text-white"
          }`}
        >
          {gameState === "idle" && (
            <>
              <Target size={38} className="text-[var(--accent)] mb-3 animate-bounce" />
              <strong className="text-xl sm:text-2xl font-mono font-bold block mb-1">
                CLICK TO START REFLEX TEST
              </strong>
              <span className="text-xs font-mono text-white/50">
                Wait for the pad to turn GREEN, then tap as fast as humanly possible.
              </span>
            </>
          )}

          {gameState === "waiting" && (
            <>
              <div className="w-4 h-4 rounded-full bg-rose-500 animate-ping mb-3" />
              <strong className="text-xl sm:text-2xl font-mono font-bold block mb-1 text-rose-300">
                WAIT FOR GREEN...
              </strong>
              <span className="text-xs font-mono text-rose-400/70">
                Hold your finger ready. Don&apos;t click early!
              </span>
            </>
          )}

          {gameState === "ready" && (
            <>
              <Zap size={48} className="text-black mb-2 animate-bounce" />
              <strong className="text-3xl sm:text-4xl font-mono font-extrabold text-black tracking-tight">
                CLICK NOW!!
              </strong>
            </>
          )}

          {gameState === "early" && (
            <>
              <RotateCcw size={32} className="text-amber-400 mb-2" />
              <strong className="text-xl font-mono font-bold text-amber-300 mb-1">
                TOO EARLY! JUMPED THE GUN.
              </strong>
              <span className="text-xs font-mono text-white/60">
                Click anywhere to try again.
              </span>
            </>
          )}

          {gameState === "result" && reactionTime !== null && (
            <>
              <div className="flex items-center gap-2 mb-2">
                {reactionTime <= ownerScore ? (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <Trophy size={13} /> BEAT OWNER BENCHMARK!
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                    <Flame size={13} /> {reactionTime - ownerScore} ms SLOWER THAN OWNER
                  </span>
                )}
              </div>

              <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tighter my-1">
                {reactionTime} <span className="text-lg text-white/50 font-normal">ms</span>
              </div>

              <span className="text-xs font-mono text-white/60 mt-2 flex items-center gap-1">
                <RotateCcw size={12} /> Click pad to test again
              </span>
            </>
          )}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/5">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <span className="text-xs font-mono text-white/50">Owner Benchmark:</span>
          <strong className="text-xs font-mono text-[var(--accent)] font-bold">
            {ownerScore} ms
          </strong>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <span className="text-xs font-mono text-white/50 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" /> Your Best Today:
          </span>
          <strong className="text-xs font-mono text-white font-bold">
            {bestScore ? `${bestScore} ms` : "—"}
          </strong>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
          <span className="text-xs font-mono text-white/50">Total Attempts:</span>
          <strong className="text-xs font-mono text-white font-bold">
            {attempts}
          </strong>
        </div>
      </div>
    </div>
  );
}
