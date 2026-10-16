import { describe, it, expect } from "vitest";
import {
  potatoRigConfig,
  reactionGameConfig,
  specAdvisorConfig,
  partyBeaconConfig,
  gamingJournalConfig,
  gamingGear,
} from "../lib/validation";

describe("Pack 2 Feature Schemas Validation", () => {
  it("validates potatoRigConfig with defaults and parts", () => {
    const valid = potatoRigConfig.parse({
      enabled: true,
      rigName: "Potato Rig Mark IV",
      rigBadge: "Certified Potato",
      overallVerdict: "Runs on hopes and thermal paste",
      parts: [
        {
          id: "p1",
          name: "CPU",
          category: "cpu",
          spec: "Intel i5-4460",
          humorNote: "100% capacity",
        },
      ],
      benchmarks: [
        {
          game: "Stardew Valley",
          fps: 144,
          quality: "Max 1080p",
          verdict: "Silky Smooth",
        },
      ],
    });
    expect(valid.enabled).toBe(true);
    expect(valid.parts?.length).toBe(1);
    expect(valid.benchmarks?.length).toBe(1);
  });

  it("validates reactionGameConfig defaults and ranges", () => {
    const valid = reactionGameConfig.parse({
      enabled: true,
      ownerScoreMs: 220,
      difficulty: "standard",
    });
    expect(valid.ownerScoreMs).toBe(220);
    expect(valid.difficulty).toBe("standard");

    expect(() =>
      reactionGameConfig.parse({
        ownerScoreMs: 10, // below min 50
      })
    ).toThrow();
  });

  it("validates specAdvisorConfig and game items", () => {
    const valid = specAdvisorConfig.parse({
      enabled: true,
      title: "Can My PC Run It?",
      games: [
        {
          id: "g1",
          title: "Terraria",
          verdict: "smooth",
          minSpecs: "2GB RAM",
          recommendedSettings: "Color lighting",
          thermalAlert: "Runs ice cold",
        },
      ],
    });
    expect(valid.games?.length).toBe(1);
    expect(valid.games?.[0].verdict).toBe("smooth");
  });

  it("validates partyBeaconConfig and statuses", () => {
    const valid = partyBeaconConfig.parse({
      enabled: true,
      status: "open",
      headline: "LFP Friday",
      note: "Chill co-op",
      discordInvite: "https://discord.gg/test",
      preferredGames: ["Stardew Valley", "Lethal Company"],
    });
    expect(valid.status).toBe("open");
    expect(valid.preferredGames?.length).toBe(2);
  });

  it("validates gamingJournalConfig entries", () => {
    const valid = gamingJournalConfig.parse({
      enabled: true,
      title: "Gaming Journal",
      entries: [
        {
          id: "e1",
          date: "Yesterday",
          game: "Stardew Valley",
          mood: "cozy",
          content: "Reorganized greenhouse.",
          fpsExperienced: 144,
        },
      ],
    });
    expect(valid.entries?.length).toBe(1);
    expect(valid.entries?.[0].mood).toBe("cozy");
  });

  it("validates that gamingGear includes all 5 new feature configs", () => {
    const validGear = gamingGear.parse({
      potatoRig: { enabled: true },
      reactionGame: { enabled: true, ownerScoreMs: 215 },
      specAdvisor: { enabled: true },
      partyBeacon: { enabled: true, status: "open" },
      gamingJournal: { enabled: true },
    });
    expect(validGear.potatoRig?.enabled).toBe(true);
    expect(validGear.reactionGame?.ownerScoreMs).toBe(215);
    expect(validGear.partyBeacon?.status).toBe("open");
  });
});
