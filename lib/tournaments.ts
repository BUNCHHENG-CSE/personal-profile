import type { TournamentItem, TournamentTier } from "@/lib/validation";

export interface TierVisuals {
  label: string;
  shortLabel: string;
  badgeClass: string;
  accentHex: string;
  dotClass: string;
  iconName: "trophy" | "medal" | "award" | "shield" | "target";
}

export const TIER_CONFIG: Record<TournamentTier, TierVisuals> = {
  champion: {
    label: "1st / Champion",
    shortLabel: "1ST PLACE",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.18)]",
    accentHex: "#fbbf24",
    dotClass: "bg-amber-400 ring-4 ring-amber-400/20 shadow-[0_0_12px_#fbbf24]",
    iconName: "trophy",
  },
  runner_up: {
    label: "2nd / Runner-Up",
    shortLabel: "2ND PLACE",
    badgeClass: "bg-slate-300/15 text-slate-200 border-slate-300/40 shadow-[0_0_15px_rgba(203,213,225,0.15)]",
    accentHex: "#cbd5e1",
    dotClass: "bg-slate-300 ring-4 ring-slate-300/20 shadow-[0_0_12px_#cbd5e1]",
    iconName: "medal",
  },
  podium: {
    label: "3rd / Top 4",
    shortLabel: "TOP 4",
    badgeClass: "bg-orange-500/15 text-orange-300 border-orange-400/40 shadow-[0_0_15px_rgba(249,115,22,0.15)]",
    accentHex: "#f97316",
    dotClass: "bg-orange-400 ring-4 ring-orange-500/20 shadow-[0_0_12px_#f97316]",
    iconName: "award",
  },
  top_eight: {
    label: "Top 8 / Quarter-Finals",
    shortLabel: "TOP 8",
    badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    accentHex: "#06b6d4",
    dotClass: "bg-cyan-400 ring-4 ring-cyan-500/20 shadow-[0_0_10px_#06b6d4]",
    iconName: "shield",
  },
  qualified: {
    label: "Qualified / Participant",
    shortLabel: "QUALIFIED",
    badgeClass: "bg-purple-500/15 text-purple-300 border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    accentHex: "#a855f7",
    dotClass: "bg-purple-400 ring-4 ring-purple-500/20 shadow-[0_0_10px_#a855f7]",
    iconName: "target",
  },
};

export function getTierInfo(tier?: TournamentTier | string | null): TierVisuals {
  if (tier && tier in TIER_CONFIG) {
    return TIER_CONFIG[tier as TournamentTier];
  }
  return TIER_CONFIG.podium;
}

export interface TournamentStats {
  total: number;
  championships: number;
  podiums: number;
  lanCount: number;
  uniqueGamesCount: number;
  gamesList: { game: string; count: number }[];
}

export function calculateTournamentStats(tournaments: TournamentItem[] = []): TournamentStats {
  if (!tournaments || tournaments.length === 0) {
    return {
      total: 0,
      championships: 0,
      podiums: 0,
      lanCount: 0,
      uniqueGamesCount: 0,
      gamesList: [],
    };
  }

  let championships = 0;
  let podiums = 0;
  let lanCount = 0;
  const gameMap: Record<string, number> = {};

  for (const t of tournaments) {
    const isChamp =
      t.tier === "champion" ||
      (!t.tier && /\b(1st|champion|winner|gold)\b/i.test(t.placement));
    if (isChamp) {
      championships++;
      podiums++;
    } else if (t.tier === "runner_up" || t.tier === "podium") {
      podiums++;
    } else if (
      !t.tier &&
      /\b(2nd|3rd|4th|top 3|top 4|runner[- ]up|grand finalist|semi[- ]finalist|bronze|silver)\b/i.test(t.placement) &&
      !/\bquarter[- ]finalist\b/i.test(t.placement)
    ) {
      podiums++;
    }

    if (t.format && /\blan\b/i.test(t.format)) {
      lanCount++;
    }

    const gameName = t.game.trim();
    if (gameName) {
      gameMap[gameName] = (gameMap[gameName] || 0) + 1;
    }
  }

  const gamesList = Object.entries(gameMap)
    .map(([game, count]) => ({ game, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: tournaments.length,
    championships,
    podiums,
    lanCount,
    uniqueGamesCount: gamesList.length,
    gamesList,
  };
}

export type TournamentFilterMode = "all" | "podiums" | "lan";

export function filterAndSortTournaments(
  tournaments: TournamentItem[] = [],
  filterGame: string = "all",
  filterMode: TournamentFilterMode = "all"
): TournamentItem[] {
  let list = [...tournaments];

  // Game filter
  if (filterGame && filterGame.toLowerCase() !== "all") {
    list = list.filter(
      (t) => t.game.trim().toLowerCase() === filterGame.trim().toLowerCase()
    );
  }

  // Filter mode
  if (filterMode === "podiums") {
    list = list.filter((t) => {
      if (t.tier === "champion" || t.tier === "runner_up" || t.tier === "podium") {
        return true;
      }
      if (t.tier === "top_eight" || t.tier === "qualified") {
        return false;
      }
      return (
        /\b(1st|2nd|3rd|4th|top 3|top 4|champion|winner|runner[- ]up|semi[- ]finalist)\b/i.test(t.placement) &&
        !/\bquarter[- ]finalist\b/i.test(t.placement)
      );
    });
  } else if (filterMode === "lan") {
    list = list.filter((t) => t.format && /\blan\b/i.test(t.format));
  }

  // Sort: most recent date first if available, otherwise original order
  return list.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });
}

export const TOURNAMENT_PRESETS: {
  title: string;
  item: Omit<TournamentItem, "id">;
}[] = [
  {
    title: "Valorant Premier Champion",
    item: {
      tournamentName: "VCT Premier Division Playoff",
      game: "Valorant",
      placement: "1st Place (Champion)",
      tier: "champion",
      date: "2024-11",
      teamName: "Aogiri Syndicate",
      role: "Duelist / IGL",
      format: "Online Playoff",
      prize: "Division Champion Crest",
      organizer: "Riot Games",
      link: "https://playvalorant.com",
      highlight: "13-11 Game 3 clutch in grand finals overtime",
    },
  },
  {
    title: "CS2 Faceit Championship",
    item: {
      tournamentName: "FACEIT Community Clash Invitational",
      game: "Counter-Strike 2",
      placement: "2nd Place (Runner-Up)",
      tier: "runner_up",
      date: "2024-09",
      teamName: "Vortex Five",
      role: "AWPer / Entry",
      format: "Online Finals",
      prize: "$750 USD",
      organizer: "FACEIT",
      link: "https://faceit.com",
      highlight: "34-kill Mirage overtime ace in the semi-finals",
    },
  },
  {
    title: "Apex Legends LAN Finals",
    item: {
      tournamentName: "Regional Esports LAN Expo",
      game: "Apex Legends",
      placement: "Top 4 (Podium)",
      tier: "podium",
      date: "2024-07",
      teamName: "Apex Predators",
      role: "Fragger / Scout",
      format: "LAN Finals",
      prize: "$500 USD",
      organizer: "Community Esports LAN",
      link: null,
      highlight: "Match Point survivor squad with 14 team kills",
    },
  },
  {
    title: "Fighting Game Local Bracket",
    item: {
      tournamentName: "FGC Nightfight Bracket #12",
      game: "Tekken 8",
      placement: "1st Place",
      tier: "champion",
      date: "2024-05",
      teamName: "Solo",
      role: "Reina / Jin",
      format: "LAN Double Elimination",
      prize: "Trophy + $200",
      organizer: "Local FGC",
      link: null,
      highlight: "Reset the bracket from losers side 3-2 and won grand finals",
    },
  },
];
