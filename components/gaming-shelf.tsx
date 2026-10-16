"use client";

import { useState } from "react";
import { Gamepad2, Star, Clock, Laptop } from "lucide-react";

export interface GameItem {
  id: string;
  title: string;
  coverUrl?: string | null;
  status: "playing" | "completed" | "favorite" | "backlog";
  platform?: string | null;
  hours?: number | null;
  rating?: number | null;
}

const statusLabels: Record<GameItem["status"], { label: string; color: string }> = {
  playing: { label: "NOW PLAYING", color: "#22c55e" },
  favorite: { label: "FAVORITE", color: "var(--accent)" },
  completed: { label: "COMPLETED", color: "#38bdf8" },
  backlog: { label: "BACKLOG", color: "#a855f7" },
};

export function GamingShelf({ games }: { games: GameItem[] }) {
  const [filter, setFilter] = useState<string>("all");

  if (!games || games.length === 0) return null;

  const filtered = filter === "all" ? games : games.filter((g) => g.status === filter);

  return (
    <section className="gaming-shelf-section mt-12 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Gamepad2 size={16} style={{ color: "var(--accent)" }} />
          <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-slate-700 dark:text-white/70">
            GAME VAULT // {games.length} TITLES
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
          {["all", "playing", "favorite", "completed", "backlog"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 uppercase tracking-wider transition-all border ${
                filter === tab
                  ? "bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white border-[var(--accent)] font-semibold shadow-sm"
                  : "bg-transparent text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/5 hover:text-slate-900 dark:hover:text-white/80 hover:border-slate-300 dark:hover:border-white/20"
              }`}
              style={{
                clipPath: "polygon(0 0, 100% 0, 92% 100%, 0% 100%)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((game) => {
          const badge = statusLabels[game.status] || {
            label: game.status.toUpperCase(),
            color: "var(--accent)",
          };

          return (
            <div
              key={game.id}
              className="game-card relative group border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-white/[0.02] shadow-sm dark:shadow-none backdrop-blur-md overflow-hidden hover:border-[var(--accent)] transition-all duration-300"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
              }}
            >
              {game.coverUrl && (
                <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-black/40 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 dark:opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
              )}

              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 border"
                    style={{
                      borderColor: badge.color,
                      color: badge.color,
                      backgroundColor: `${badge.color}15`,
                    }}
                  >
                    {badge.label}
                  </span>
                  {game.platform && (
                    <span className="text-[10px] font-mono text-slate-500 dark:text-white/40 flex items-center gap-1">
                      <Laptop size={11} /> {game.platform}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                  {game.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-white/50 pt-1 border-t border-slate-200/60 dark:border-white/5">
                  {game.hours !== undefined && game.hours !== null ? (
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-slate-400 dark:text-white/40" />
                      {game.hours}h logged
                    </span>
                  ) : (
                    <span />
                  )}

                  {game.rating !== undefined && game.rating !== null && (
                    <span className="flex items-center gap-1 text-[var(--accent)]">
                      <Star size={11} fill="currentColor" />
                      {game.rating}/10
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
