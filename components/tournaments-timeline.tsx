"use client";

import { useMemo, useState } from "react";
import {
  Award,
  Calendar,
  ExternalLink,
  Flame,
  Gamepad2,
  Medal,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { TournamentItem } from "@/lib/validation";
import {
  calculateTournamentStats,
  filterAndSortTournaments,
  getTierInfo,
  type TournamentFilterMode,
} from "@/lib/tournaments";

interface TournamentsTimelineProps {
  tournaments?: TournamentItem[] | null;
}

export function TournamentsTimeline({ tournaments }: TournamentsTimelineProps) {
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<TournamentFilterMode>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const stats = useMemo(() => {
    return calculateTournamentStats(tournaments || []);
  }, [tournaments]);

  const filteredTournaments = useMemo(() => {
    const list = filterAndSortTournaments(
      tournaments || [],
      selectedGame,
      filterMode
    );
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter((t) => {
      return (
        t.tournamentName.toLowerCase().includes(q) ||
        t.game.toLowerCase().includes(q) ||
        t.placement.toLowerCase().includes(q) ||
        (t.teamName && t.teamName.toLowerCase().includes(q)) ||
        (t.role && t.role.toLowerCase().includes(q)) ||
        (t.organizer && t.organizer.toLowerCase().includes(q))
      );
    });
  }, [tournaments, selectedGame, filterMode, searchQuery]);

  if (!tournaments || tournaments.length === 0) {
    return null;
  }

  return (
    <section className="tournaments-timeline-section mt-12 w-full" id="tournaments">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <Trophy size={18} style={{ color: "var(--accent)" }} />
          <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-white/70">
            COMPETITIVE TIMELINE // {stats.total}{" "}
            {stats.total === 1 ? "MILESTONE" : "MILESTONES"}
          </h3>
        </div>
        <div className="text-[10px] font-mono text-white/40 tracking-widest uppercase flex items-center gap-1.5">
          <Swords size={12} className="text-[var(--accent)]" />
          <span>OFFICIAL BRACKETS & LAN PLACEMENTS</span>
        </div>
      </div>

      {/* Esports Stats HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md p-3.5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
              CHAMPIONSHIPS
            </span>
            <Trophy size={14} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {stats.championships}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-0.5">
            1st Place Trophies
          </div>
        </div>

        <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md p-3.5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
              PODIUM FINISHES
            </span>
            <Medal size={14} className="text-slate-300" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-200">
            {stats.podiums}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-0.5">
            Top 3 / Top 4 Finishes
          </div>
        </div>

        <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md p-3.5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
              LAN EXPERIENCE
            </span>
            <Flame size={14} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {stats.lanCount}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-0.5">
            Offline LAN Tournaments
          </div>
        </div>

        <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md p-3.5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
              DISCIPLINES
            </span>
            <Gamepad2 size={14} style={{ color: "var(--accent)" }} />
          </div>
          <div className="text-2xl font-bold font-mono" style={{ color: "var(--accent)" }}>
            {stats.uniqueGamesCount}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-0.5">
            Competitive Titles
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Game filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedGame("all")}
            className={`text-xs px-3 py-1.5 transition-all font-mono uppercase tracking-wider border ${
              selectedGame === "all"
                ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] border-[var(--accent)] font-semibold shadow-[0_0_12px_var(--accent)]"
                : "bg-white/[0.03] text-white/70 border-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            All Games ({stats.total})
          </button>
          {stats.gamesList.map((g) => (
            <button
              key={g.game}
              type="button"
              onClick={() => setSelectedGame(g.game)}
              className={`text-xs px-3 py-1.5 transition-all font-mono uppercase tracking-wider border ${
                selectedGame.toLowerCase() === g.game.toLowerCase()
                  ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] border-[var(--accent)] font-semibold shadow-[0_0_12px_var(--accent)]"
                  : "bg-white/[0.03] text-white/70 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {g.game} ({g.count})
            </button>
          ))}
        </div>

        {/* Mode filter & search */}
        <div className="flex items-center gap-2">
          <div className="flex border border-white/10 bg-white/[0.03] p-0.5">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`text-[11px] font-mono px-2.5 py-1 transition-colors uppercase ${
                filterMode === "all"
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/50 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("podiums")}
              className={`text-[11px] font-mono px-2.5 py-1 transition-colors uppercase ${
                filterMode === "podiums"
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Podiums
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("lan")}
              className={`text-[11px] font-mono px-2.5 py-1 transition-colors uppercase ${
                filterMode === "lan"
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/50 hover:text-white"
              }`}
            >
              LAN Only
            </button>
          </div>

          {tournaments.length > 3 && (
            <div className="relative min-w-[130px] sm:min-w-[160px]">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-2.5 py-1 bg-white/[0.03] border border-white/10 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Timeline Layout */}
      {filteredTournaments.length > 0 ? (
        <div className="relative pl-6 sm:pl-8 border-l border-white/10 ml-3 sm:ml-4 space-y-6">
          {filteredTournaments.map((tourney) => {
            const visuals = getTierInfo(tourney.tier);
            const isChamp = tourney.tier === "champion";

            return (
              <div key={tourney.id} className="relative group">
                {/* Timeline node / pulse indicator */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-4 w-3.5 h-3.5 rounded-full transition-transform group-hover:scale-125 ${visuals.dotClass}`}
                />

                {/* Tournament Card */}
                <div
                  className={`border transition-all duration-200 bg-white/[0.02] backdrop-blur-md p-4 sm:p-5 relative ${
                    isChamp
                      ? "border-amber-400/30 hover:border-amber-400/60 bg-amber-400/[0.02]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)",
                  }}
                >
                  {/* Top Bar: Placement Badge + Date & Format */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold tracking-wider uppercase border ${visuals.badgeClass}`}
                      >
                        {visuals.iconName === "trophy" && (
                          <Trophy size={13} className="shrink-0" />
                        )}
                        {visuals.iconName === "medal" && (
                          <Medal size={13} className="shrink-0" />
                        )}
                        {visuals.iconName === "award" && (
                          <Award size={13} className="shrink-0" />
                        )}
                        {visuals.iconName === "shield" && (
                          <Shield size={13} className="shrink-0" />
                        )}
                        {visuals.iconName === "target" && (
                          <Target size={13} className="shrink-0" />
                        )}
                        <span>{tourney.placement}</span>
                      </span>

                      <span className="text-xs font-mono text-white/80 bg-white/[0.06] px-2 py-0.5 border border-white/10">
                        {tourney.game}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-white/50">
                      {tourney.format && (
                        <span
                          className={`px-2 py-0.5 uppercase tracking-wider border ${
                            /\blan\b/i.test(tourney.format)
                              ? "bg-cyan-500/10 text-cyan-300 border-cyan-400/30"
                              : "bg-white/[0.04] text-white/60 border-white/10"
                          }`}
                        >
                          {tourney.format}
                        </span>
                      )}
                      {tourney.date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-white/40" />
                          <span>{tourney.date}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tournament Title & Organizer */}
                  <div className="mb-3">
                    <h4 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
                      <span>{tourney.tournamentName}</span>
                      {tourney.organizer && (
                        <span className="text-xs font-mono text-white/40 font-normal">
                          by {tourney.organizer}
                        </span>
                      )}
                    </h4>
                  </div>

                  {/* Team, Role, and Prize Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-mono text-white/70 mb-3 pt-2 border-t border-white/5">
                    {tourney.teamName && (
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-[var(--accent)] shrink-0" />
                        <span className="text-white/40">Team:</span>
                        <span className="text-white font-medium truncate">
                          {tourney.teamName}
                        </span>
                      </div>
                    )}

                    {tourney.role && (
                      <div className="flex items-center gap-1.5">
                        <Target size={12} className="text-cyan-400 shrink-0" />
                        <span className="text-white/40">Role:</span>
                        <span className="text-white font-medium truncate">
                          {tourney.role}
                        </span>
                      </div>
                    )}

                    {tourney.prize && (
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-400 shrink-0" />
                        <span className="text-white/40">Prize:</span>
                        <span className="text-amber-300 font-semibold truncate">
                          {tourney.prize}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Highlight Callout */}
                  {tourney.highlight && (
                    <div className="mt-2.5 px-3 py-2 bg-white/[0.03] border-l-2 border-[var(--accent)] text-xs text-white/80 italic font-sans flex items-start gap-2">
                      <span className="text-[var(--accent)] font-bold select-none">
                        “
                      </span>
                      <p className="not-italic leading-relaxed">
                        {tourney.highlight}
                      </p>
                    </div>
                  )}

                  {/* External Link */}
                  {tourney.link && (
                    <div className="mt-3 pt-2 flex items-center justify-end">
                      <a
                        href={tourney.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--accent)] hover:underline opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <span>Verified Bracket / Standings</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-white/10 bg-white/[0.02] p-8 text-center flex flex-col items-center justify-center gap-3">
          <Trophy size={28} className="text-white/30" />
          <p className="text-sm text-white/60 font-mono">
            No tournament milestones found matching the selected filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedGame("all");
              setFilterMode("all");
              setSearchQuery("");
            }}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--accent)] border border-[var(--accent)] px-3 py-1.5 hover:bg-[var(--accent)] hover:text-[var(--accent-fg,#090d16)] transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        </div>
      )}
    </section>
  );
}
