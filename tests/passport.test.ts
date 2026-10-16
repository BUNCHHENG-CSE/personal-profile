import { describe, expect, it } from "vitest";
import { gamerPassportConfig, gamerPassportTag, profileInput, kudosInput, kudosRecord, skillMatrixConfig } from "../lib/validation";
import { PASSPORT_PLATFORMS } from "../lib/passport";

describe("gamer passport validation", () => {
  it("validates individual gamer tags with recognized platforms", () => {
    const validTag = {
      id: "riot-1",
      platform: "riot",
      label: "Riot ID",
      tag: "Arzur#SEA",
      verified: true,
    };
    expect(gamerPassportTag.safeParse(validTag).success).toBe(true);

    const invalidPlatform = {
      id: "unknown-1",
      platform: "invalid-gaming-platform",
      label: "Custom",
      tag: "test",
    };
    expect(gamerPassportTag.safeParse(invalidPlatform).success).toBe(false);

    const invalidTagFormat = {
      id: "invalid tag spaces!",
      platform: "steam",
      label: "Steam Code",
      tag: "76561198000000000",
    };
    expect(gamerPassportTag.safeParse(invalidTagFormat).success).toBe(false);
  });

  it("validates full passport configuration inside profileInput", () => {
    const profileWithPassport = {
      displayName: "Arzur",
      username: "arzur",
      bio: "Sanctum Gamer Profile",
      seoTitle: "Arzur Sanctum",
      seoDescription: "Live gamer passport and profile",
      socialLinks: [],
      gamingSetup: {
        passport: {
          enabled: true,
          callsign: "VANGUARD-01",
          title: "SANCTUM OPERATOR PASSPORT",
          tagline: "TACTICAL FPS // IGL",
          region: "APAC / SEA",
          rankTier: "Ascendant / Immortal",
          clearanceLevel: "CLEARANCE S-TIER",
          tags: [
            {
              id: "riot-tag",
              platform: "riot",
              label: "Riot ID",
              tag: "Arzur#SEA",
              verified: true,
            },
            {
              id: "steam-tag",
              platform: "steam",
              label: "Steam Code",
              tag: "12345678",
              verified: false,
            },
          ],
        },
      },
    };

    expect(gamerPassportConfig.safeParse(profileWithPassport.gamingSetup.passport).success).toBe(true);
    const parsed = profileInput.safeParse(profileWithPassport);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.gamingSetup?.passport?.callsign).toBe("VANGUARD-01");
      expect(parsed.data.gamingSetup?.passport?.tags?.length).toBe(2);
    }
  });

  it("exports valid platform metadata with default labels and colors", () => {
    expect(PASSPORT_PLATFORMS.riot).toBeDefined();
    expect(PASSPORT_PLATFORMS.steam).toBeDefined();
    expect(PASSPORT_PLATFORMS.discord).toBeDefined();
    expect(PASSPORT_PLATFORMS.battlenet).toBeDefined();
    expect(PASSPORT_PLATFORMS.epic).toBeDefined();
    expect(PASSPORT_PLATFORMS.xbox).toBeDefined();
    expect(PASSPORT_PLATFORMS.playstation).toBeDefined();
    expect(PASSPORT_PLATFORMS.switch).toBeDefined();

    expect(PASSPORT_PLATFORMS.riot.color).toBe("#ff4655");
    expect(PASSPORT_PLATFORMS.steam.badge).toBe("VALVE");
  });

  it("validates arcade kudos reactions", () => {
    expect(kudosInput.safeParse({ reaction: "gg" }).success).toBe(true);
    expect(kudosInput.safeParse({ reaction: "hype" }).success).toBe(true);
    expect(kudosInput.safeParse({ reaction: "cracked" }).success).toBe(true);
    expect(kudosInput.safeParse({ reaction: "respect" }).success).toBe(true);
    expect(kudosInput.safeParse({ reaction: "mvp" }).success).toBe(true);
    expect(kudosInput.safeParse({ reaction: "invalid_reaction" }).success).toBe(false);

    const validRecord = { enabled: false, gg: 10, hype: 5, cracked: 2, respect: 20, mvp: 1 };
    expect(kudosRecord.safeParse(validRecord).success).toBe(true);
  });

  it("validates RPG skill matrix configuration with enabled flag", () => {
    const validMatrix = {
      enabled: false,
      title: "COMBAT RADAR",
      archetype: "ENTRY FRAGGER",
      primaryRole: "Duelist",
      signatureAgent: "Jett",
      winRate: "65%",
      kda: "1.5",
      attributes: [
        { attribute: "AIM", value: 95, fullMark: 100 },
        { attribute: "MACRO", value: 85, fullMark: 100 },
        { attribute: "CLUTCH", value: 90, fullMark: 100 },
      ],
    };
    expect(skillMatrixConfig.safeParse(validMatrix).success).toBe(true);
  });
});
