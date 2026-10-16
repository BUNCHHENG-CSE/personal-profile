import { describe, it, expect } from "vitest";
import { tournamentItem } from "../lib/validation";
import {
  calculateTournamentStats,
  filterAndSortTournaments,
  getTierInfo,
  TIER_CONFIG,
} from "../lib/tournaments";
import type { TournamentItem } from "../lib/validation";

describe("Tournament Schema Validation", () => {
  it("validates valid tournament items", () => {
    const valid = {
      id: "tourney-1",
      tournamentName: "VCT Premier Division Playoff",
      game: "Valorant",
      placement: "1st Place",
      tier: "champion",
      date: "2024-11",
      teamName: "Aogiri",
      role: "IGL",
      format: "LAN Finals",
      prize: "$2,000",
      organizer: "Riot Games",
      link: "https://vlr.gg/event/123",
      highlight: "Clutched 1v3 in Game 5",
    };

    const res = tournamentItem.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.tier).toBe("champion");
      expect(res.data.tournamentName).toBe("VCT Premier Division Playoff");
    }
  });

  it("applies default tier if omitted", () => {
    const minimal = {
      id: "tourney-2",
      tournamentName: "Community Cup",
      game: "Counter-Strike 2",
      placement: "Top 4",
    };

    const res = tournamentItem.safeParse(minimal);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.tier).toBe("podium");
      expect(res.data.date).toBeUndefined();
    }
  });

  it("rejects invalid links and empty required fields", () => {
    const invalidUrl = {
      id: "tourney-3",
      tournamentName: "Cup",
      game: "CS2",
      placement: "1st",
      link: "not-a-valid-url",
    };

    expect(tournamentItem.safeParse(invalidUrl).success).toBe(false);

    const emptyName = {
      id: "tourney-4",
      tournamentName: "",
      game: "CS2",
      placement: "1st",
    };

    expect(tournamentItem.safeParse(emptyName).success).toBe(false);
  });
});

describe("Tier Visuals and Config", () => {
  it("returns visual configuration for each tier", () => {
    expect(getTierInfo("champion").iconName).toBe("trophy");
    expect(getTierInfo("runner_up").iconName).toBe("medal");
    expect(getTierInfo("podium").iconName).toBe("award");
    expect(getTierInfo("top_eight").iconName).toBe("shield");
    expect(getTierInfo("qualified").iconName).toBe("target");
  });

  it("falls back gracefully for unknown or null tiers", () => {
    expect(getTierInfo(null).label).toBe(TIER_CONFIG.podium.label);
    expect(getTierInfo("unknown_tier").label).toBe(TIER_CONFIG.podium.label);
  });
});

describe("Tournament Statistics Calculation", () => {
  const sampleTournaments: TournamentItem[] = [
    {
      id: "t1",
      tournamentName: "VCT Premier",
      game: "Valorant",
      placement: "1st Place (Champion)",
      tier: "champion",
      format: "LAN Finals",
    },
    {
      id: "t2",
      tournamentName: "Faceit Season 5",
      game: "Counter-Strike 2",
      placement: "2nd Place",
      tier: "runner_up",
      format: "Online Qualifier",
    },
    {
      id: "t3",
      tournamentName: "Apex Open",
      game: "Apex Legends",
      placement: "Top 4",
      tier: "podium",
      format: "LAN Invitational",
    },
    {
      id: "t4",
      tournamentName: "Valorant Community Cup",
      game: "Valorant",
      placement: "Quarter-Finalist",
      tier: "top_eight",
      format: "Online",
    },
  ];

  it("computes stats accurately", () => {
    const stats = calculateTournamentStats(sampleTournaments);
    expect(stats.total).toBe(4);
    expect(stats.championships).toBe(1);
    expect(stats.podiums).toBe(3); // 1st, 2nd, Top 4
    expect(stats.lanCount).toBe(2); // VCT Premier (LAN), Apex Open (LAN)
    expect(stats.uniqueGamesCount).toBe(3); // Valorant, CS2, Apex
    expect(stats.gamesList[0].game).toBe("Valorant");
    expect(stats.gamesList[0].count).toBe(2);
  });

  it("handles empty tournaments list", () => {
    const stats = calculateTournamentStats([]);
    expect(stats.total).toBe(0);
    expect(stats.championships).toBe(0);
    expect(stats.podiums).toBe(0);
    expect(stats.lanCount).toBe(0);
    expect(stats.uniqueGamesCount).toBe(0);
    expect(stats.gamesList).toEqual([]);
  });
});

describe("Tournament Filtering and Sorting", () => {
  const sample: TournamentItem[] = [
    {
      id: "t1",
      tournamentName: "Old Valorant Cup",
      game: "Valorant",
      placement: "1st Place",
      tier: "champion",
      date: "2023-05",
      format: "Online",
    },
    {
      id: "t2",
      tournamentName: "Recent CS2 LAN",
      game: "Counter-Strike 2",
      placement: "Top 4",
      tier: "podium",
      date: "2024-10",
      format: "LAN Championship",
    },
    {
      id: "t3",
      tournamentName: "Apex Qualifier",
      game: "Apex Legends",
      placement: "Qualified",
      tier: "qualified",
      date: "2024-02",
      format: "Online",
    },
  ];

  it("filters by game", () => {
    const valorantOnly = filterAndSortTournaments(sample, "Valorant", "all");
    expect(valorantOnly.length).toBe(1);
    expect(valorantOnly[0].tournamentName).toBe("Old Valorant Cup");
  });

  it("filters by podiums only", () => {
    const podiums = filterAndSortTournaments(sample, "all", "podiums");
    expect(podiums.length).toBe(2);
    expect(podiums.map((p) => p.id)).toContain("t1");
    expect(podiums.map((p) => p.id)).toContain("t2");
  });

  it("filters by LAN events only", () => {
    const lan = filterAndSortTournaments(sample, "all", "lan");
    expect(lan.length).toBe(1);
    expect(lan[0].tournamentName).toBe("Recent CS2 LAN");
  });

  it("sorts by date descending", () => {
    const sorted = filterAndSortTournaments(sample, "all", "all");
    expect(sorted[0].date).toBe("2024-10");
    expect(sorted[1].date).toBe("2024-02");
    expect(sorted[2].date).toBe("2023-05");
  });
});
