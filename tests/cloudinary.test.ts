import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { profileInput } from "../lib/validation";
import {
  getCloudinaryConfig,
  isCloudinaryConfigured,
  signCloudinaryUpload,
} from "../lib/cloudinary";

describe("Cloudinary integration", () => {
  it("detects Cloudinary configuration status", () => {
    const config = getCloudinaryConfig();
    expect(config).toBeDefined();
    expect(typeof isCloudinaryConfigured()).toBe("boolean");
  });

  it("generates valid signature for signed upload", () => {
    if (!isCloudinaryConfigured()) return;

    const timestamp = 1700000000;
    const signed = signCloudinaryUpload({
      folder: "gaming-profile/avatar",
      timestamp,
    });

    expect(signed.signature).toBeDefined();
    expect(typeof signed.signature).toBe("string");
    expect(signed.signature.length).toBeGreaterThan(10);
    expect(signed.folder).toBe("gaming-profile/avatar");
    expect(signed.timestamp).toBe(timestamp);
    expect(signed.apiKey).toBeDefined();
    expect(signed.cloudName).toBeDefined();
  });

  it("validates Cloudinary image and audio URLs in profileInput", () => {
    const validProfile = {
      displayName: "GamerPro",
      username: "gamerpro",
      bio: "Playing games every day.",
      avatarUrl: "https://res.cloudinary.com/rzvaqfgt/image/upload/v12345/avatar.jpg",
      bannerUrl: "https://res.cloudinary.com/rzvaqfgt/image/upload/v12345/banner.png",
      musicUrl: "https://res.cloudinary.com/rzvaqfgt/video/upload/v12345/track.mp3",
      trackTitle: "Synthwave Sunset",
      trackArtist: "RetroWave",
      seoTitle: "GamerPro - Official Gaming Profile",
      seoDescription: "Welcome to my personal gaming space.",
      socialLinks: [],
    };

    const parsed = profileInput.safeParse(validProfile);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.avatarUrl).toBe(
        "https://res.cloudinary.com/rzvaqfgt/image/upload/v12345/avatar.jpg",
      );
      expect(parsed.data.musicUrl).toBe(
        "https://res.cloudinary.com/rzvaqfgt/video/upload/v12345/track.mp3",
      );
    }
  });

  it("allows clearing media URLs (setting null or empty string)", () => {
    const clearedProfile = {
      displayName: "GamerPro",
      username: "gamerpro",
      bio: "Playing games every day.",
      avatarUrl: "",
      bannerUrl: null,
      musicUrl: "",
      seoTitle: "GamerPro",
      seoDescription: "Bio",
      socialLinks: [],
    };

    const parsed = profileInput.safeParse(clearedProfile);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.avatarUrl).toBeNull();
      expect(parsed.data.bannerUrl).toBeNull();
      expect(parsed.data.musicUrl).toBeNull();
    }
  });
});
