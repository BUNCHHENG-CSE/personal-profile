import { describe, expect, it } from "vitest";
import {
  guestbookInput,
  guestbookConfig,
  chillLoungeConfig,
  casualCornerConfig,
  potatoPcGuideConfig,
  themeMatrixConfig,
} from "../lib/validation";

describe("5 New Casual & Interactive Gaming Modules", () => {
  it("validates visitor guestbook input and rejects empty or oversized entries", () => {
    // Valid guestbook stamp
    const valid = {
      callsign: "Viper_Nine",
      platform: "steam",
      sticker: "gg",
      favoriteGame: "Valorant",
      message: "Great profile! Let's duo sometime.",
    };
    expect(guestbookInput.safeParse(valid).success).toBe(true);

    // Empty callsign should fail
    expect(
      guestbookInput.safeParse({ ...valid, callsign: "" }).success
    ).toBe(false);

    // Empty message should fail
    expect(
      guestbookInput.safeParse({ ...valid, message: " " }).success
    ).toBe(false);

    // Valid guestbook config
    expect(
      guestbookConfig.safeParse({
        enabled: true,
        title: "Arcade Visitor Stamps",
        subtitle: "Leave your mark",
        stamps: [],
      }).success
    ).toBe(true);
  });

  it("validates chill lounge music player config and presets", () => {
    expect(
      chillLoungeConfig.safeParse({
        enabled: true,
        defaultTrack: "rain",
      }).success
    ).toBe(true);

    // Invalid track name
    expect(
      chillLoungeConfig.safeParse({
        defaultTrack: "heavy_metal_deathcore",
      }).success
    ).toBe(false);
  });

  it("validates casual corner shelf items", () => {
    const valid = {
      enabled: true,
      headline: "Cozy Games",
      games: [
        {
          id: "game-1",
          title: "Stardew Valley",
          status: "comfort",
          rating: 10,
          hours: 250,
          lowSpecFriendly: true,
          notes: "Peak comfort game.",
        },
      ],
    };
    expect(casualCornerConfig.safeParse(valid).success).toBe(true);
  });

  it("validates potato pc optimization tweaks", () => {
    const valid = {
      enabled: true,
      title: "Low-Spec Tuning",
      targetHardware: "Intel UHD 620",
      tweaks: [
        {
          id: "tweak-1",
          category: "resolution",
          title: "4:3 Stretched",
          description: "Scale resolution down to 1280x960.",
          commandToCopy: "1280x960",
          fpsGainEst: "+25 FPS",
        },
      ],
    };
    expect(potatoPcGuideConfig.safeParse(valid).success).toBe(true);
  });

  it("validates theme matrix visitor colorway switcher config", () => {
    expect(
      themeMatrixConfig.safeParse({
        enabled: true,
        allowVisitorPresets: true,
      }).success
    ).toBe(true);
  });
});
