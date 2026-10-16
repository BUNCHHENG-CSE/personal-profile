"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Coffee,
  Crosshair,
  Flame,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import type { KudosRecord, KudosType } from "@/lib/validation";
import { playTechSound, type TechSoundType } from "@/lib/passport";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  rotation: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  label: string;
  color: string;
}

interface ArcadeKudosProps {
  initialKudos?: KudosRecord | null;
  className?: string;
}

const KUDOS_CONFIG: Record<
  KudosType,
  {
    label: string;
    description: string;
    icon: typeof Zap;
    color: string;
    borderGlow: string;
    sound: TechSoundType;
  }
> = {
  gg: {
    label: "GG",
    description: "Good Game / High Five",
    icon: Zap,
    color: "#f59e0b",
    borderGlow: "rgba(245, 158, 11, 0.4)",
    sound: "kudos_gg",
  },
  hype: {
    label: "HYPE",
    description: "Insane Energy",
    icon: Flame,
    color: "#ef4444",
    borderGlow: "rgba(239, 68, 68, 0.4)",
    sound: "kudos_hype",
  },
  cracked: {
    label: "CRACKED",
    description: "God Aim & Mechanics",
    icon: Crosshair,
    color: "#06b6d4",
    borderGlow: "rgba(6, 182, 212, 0.4)",
    sound: "kudos_cracked",
  },
  respect: {
    label: "RESPECT",
    description: "Chill Vibes & Honor",
    icon: Coffee,
    color: "#10b981",
    borderGlow: "rgba(16, 185, 129, 0.4)",
    sound: "kudos_respect",
  },
  mvp: {
    label: "MVP",
    description: "Legendary Status",
    icon: Trophy,
    color: "#a855f7",
    borderGlow: "rgba(168, 85, 247, 0.4)",
    sound: "kudos_mvp",
  },
};

export function ArcadeKudos({ initialKudos, className = "" }: ArcadeKudosProps) {
  const [counts, setCounts] = useState<Required<KudosRecord>>({
    enabled: initialKudos?.enabled !== false,
    gg: initialKudos?.gg ?? 128,
    hype: initialKudos?.hype ?? 86,
    cracked: initialKudos?.cracked ?? 64,
    respect: initialKudos?.respect ?? 142,
    mvp: initialKudos?.mvp ?? 45,
  });

  const [activeReaction, setActiveReaction] = useState<KudosType | null>(null);
  const [muted, setMuted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const nextParticleId = useRef(0);

  // Fetch updated counts on mount
  useEffect(() => {
    fetch("/api/kudos")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.kudos) {
          setCounts(data.kudos);
        }
      })
      .catch(() => {});
  }, []);

  // Animation loop for particle bursts
  useEffect(() => {
    if (particles.length === 0) return;

    let animId: number;
    const updateParticles = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.18, // Gravity
            alpha: p.alpha - 0.022,
            size: Math.max(0.5, p.size - 0.08),
          }))
          .filter((p) => p.alpha > 0)
      );
      animId = requestAnimationFrame(updateParticles);
    };

    animId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animId);
  }, [particles.length]);

  const triggerReaction = useCallback(
    async (reaction: KudosType, e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.blur();
      const clickX = e.clientX;
      const clickY = e.clientY;

      const config = KUDOS_CONFIG[reaction];

      // Audio feedback
      playTechSound(config.sound, muted);

      // Trigger button pulse
      setActiveReaction(reaction);
      setTimeout(() => setActiveReaction(null), 300);

      // Spawn 14 glowing sparks
      const newParticles: Particle[] = [];
      for (let i = 0; i < 14; i++) {
        const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 5 + 3;
        newParticles.push({
          id: nextParticleId.current++,
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          color: config.color,
          size: Math.random() * 4 + 2,
          alpha: 1,
          rotation: Math.random() * 360,
        });
      }
      setParticles((prev) => [...prev.slice(-30), ...newParticles]);

      // Spawn floating +1 label
      const floatId = nextParticleId.current++;
      setFloatingTexts((prev) => [
        ...prev,
        {
          id: floatId,
          x: clickX,
          y: clickY,
          label: `+1 ${config.label}!`,
          color: config.color,
        },
      ]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((item) => item.id !== floatId));
      }, 1000);

      // Optimistic state increment
      setCounts((prev) => ({
        ...prev,
        [reaction]: prev[reaction] + 1,
      }));

      if (typeof window !== "undefined" && window.__trackVisitorAction) {
        window.__trackVisitorAction(`Sent ${reaction.toUpperCase()} Kudos`);
      }

      // API call to persist
      try {
        const res = await fetch("/api/kudos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reaction }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.kudos) {
            setCounts(data.kudos);
          }
        }
      } catch {
        // Rollback on network failure
        setCounts((prev) => ({
          ...prev,
          [reaction]: Math.max(0, prev[reaction] - 1),
        }));
      }
    },
    [muted]
  );

  const totalKudos =
    counts.gg + counts.hype + counts.cracked + counts.respect + counts.mvp;

  if (initialKudos?.enabled === false || counts.enabled === false) return null;

  return (
    <div
      className={`arcade-kudos-deck w-full my-6 p-6 sm:p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/40 backdrop-blur-xl shadow-xl relative overflow-hidden select-none ${className}`}
    >
      {/* Background Subtle Radar Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)",
        }}
      />

      {/* Floating Particles (Rendered in fixed viewport coordinates) */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.alpha,
              boxShadow: `0 0 8px ${p.color}`,
              transform: `translate(-50%, -50%)`,
            }}
          />
        ))}

        {floatingTexts.map((item) => (
          <div
            key={item.id}
            className="absolute pointer-events-none font-mono text-xs font-bold tracking-wider animate-float-up"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              color: item.color,
              textShadow: `0 0 10px ${item.color}`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
            <Sparkles size={15} />
          </span>
          <div>
            <h4 className="text-xs font-mono font-bold tracking-[0.2em] text-white uppercase flex items-center gap-2">
              ARCADE KUDOS DECK
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                1-CLICK
              </span>
            </h4>
            <p className="text-[10px] font-mono text-white/50 tracking-wider">
              {totalKudos.toLocaleString()} TOTAL REACTIONS LOGGED
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMuted((prev) => !prev)}
          className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 font-mono text-xs flex items-center gap-1"
          title={muted ? "Unmute reaction audio" : "Mute reaction audio"}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[var(--accent)]" />}
          <span className="hidden sm:inline text-[9px]">{muted ? "MUTED" : "SFX ON"}</span>
        </button>
      </div>

      {/* Arcade Reactions Button Deck */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-4">
        {(Object.keys(KUDOS_CONFIG) as KudosType[]).map((type) => {
          const config = KUDOS_CONFIG[type];
          const count = counts[type];
          const Icon = config.icon;
          const isPulsing = activeReaction === type;

          return (
            <button
              key={type}
              type="button"
              onClick={(e) => triggerReaction(type, e)}
              className={`group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl border transition-all duration-150 cursor-pointer active:scale-95 text-center ${
                isPulsing
                  ? "bg-white/15 scale-95"
                  : "bg-white/[0.03] hover:bg-white/[0.08]"
              }`}
              style={{
                borderColor: isPulsing ? config.color : "rgba(255, 255, 255, 0.1)",
                boxShadow: isPulsing
                  ? `0 0 20px ${config.borderGlow}`
                  : "none",
              }}
              title={config.description}
            >
              {/* Icon with glowing badge */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 shadow-sm"
                style={{
                  backgroundColor: `${config.color}20`,
                  color: config.color,
                  border: `1px solid ${config.color}40`,
                }}
              >
                <Icon size={18} />
              </div>

              {/* Label */}
              <span className="text-[11px] font-mono font-bold tracking-wider text-white group-hover:text-white">
                {config.label}
              </span>

              {/* Counter */}
              <span
                className="text-[10px] font-mono font-medium transition-colors mt-0.5"
                style={{ color: config.color }}
              >
                {count.toLocaleString()}
              </span>

              {/* Hover description tooltip hint */}
              <span className="text-[8px] font-mono text-white/40 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full block">
                {config.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <div className="relative z-10 mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/40">
        <span>No typing required. Tap any reaction to drop energy.</span>
        <span className="text-[var(--accent)] font-semibold">TAP TO BURST</span>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -180%) scale(1.3);
          }
        }
        .animate-float-up {
          animation: floatUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `,
        }}
      />
    </div>
  );
}
