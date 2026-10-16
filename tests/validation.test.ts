import { describe, expect, it } from "vitest";
import { eventInput, messageInput, profileInput, themeInput } from "../lib/validation";
describe("server validation", () => {
  it("rejects script URLs and malformed social links", () => { const sample = { displayName: "A", username: "alice", bio: "Hi", seoTitle: "A", seoDescription: "A", socialLinks: [{ id: "site", label: "Site", url: "javascript:alert(1)" }] }; expect(profileInput.safeParse(sample).success).toBe(false); });
  it("rejects arbitrary theme CSS and out of range settings", () => { expect(themeInput.safeParse({ name: "x", configuration: { accent: "red", background: "aurora", card: "glass", font: "sans", glow: 101, blur: 0, customCss: "body{}" } }).success).toBe(false); });
  it("requires message length and caps input", () => { expect(messageInput.safeParse({ content: "a" }).success).toBe(false); expect(messageInput.safeParse({ content: "a".repeat(1001) }).success).toBe(false); expect(messageInput.safeParse({ content: "Hello" }).success).toBe(true); });
  it("rejects unsupported event types and external paths", () => { expect(eventInput.safeParse({ eventType: "purchase", pagePath: "/" }).success).toBe(false); expect(eventInput.safeParse({ eventType: "profile_view", pagePath: "/admin" }).success).toBe(false); });
  it("requires unique social link identifiers", () => { expect(profileInput.safeParse({ displayName: "A", username: "alice", bio: "Hi", seoTitle: "A", seoDescription: "A", socialLinks: [{ id: "site", label: "One", url: "https://example.com" }, { id: "site", label: "Two", url: "https://example.org" }] }).success).toBe(false); });
  it("validates competitive game settings and crosshair codes", () => {
    const validProfile = {
      displayName: "Player",
      username: "player1",
      bio: "Pro Gamer",
      seoTitle: "Player Profile",
      seoDescription: "Competitive player",
      socialLinks: [],
      gamingSetup: {
        setupType: "desktop",
        gameSettings: [
          {
            id: "val-1",
            game: "Valorant",
            dpi: 800,
            sens: "0.35",
            edpi: "280",
            resolution: "1920x1080 (16:9)",
            crosshairCode: "0;s;1;P;c;5;h;0;m;1;0l;4;0o;0;0a;1;0f;0;1b;0",
            pollingRate: "1000Hz",
            mousepad: "Artisan Zero Soft",
            notes: "Claw grip",
          },
        ],
      },
    };
    expect(profileInput.safeParse(validProfile).success).toBe(true);

    const invalidProfile = {
      ...validProfile,
      gamingSetup: {
        gameSettings: [
          {
            id: "bad id with spaces!",
            game: "Valorant",
          },
        ],
      },
    };
    expect(profileInput.safeParse(invalidProfile).success).toBe(false);
  });
  it("validates gaming clips and video URLs", () => {
    const validProfile = {
      displayName: "Player",
      username: "player1",
      bio: "Pro Gamer",
      seoTitle: "Player Profile",
      seoDescription: "Competitive player",
      socialLinks: [],
      gamingSetup: {
        clips: [
          {
            id: "clip-1",
            title: "1v5 Ace Clutch",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            game: "Valorant",
            thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
            description: "Match point clutch",
          },
        ],
      },
    };
    expect(profileInput.safeParse(validProfile).success).toBe(true);

    const invalidClip = {
      ...validProfile,
      gamingSetup: {
        clips: [
          {
            id: "clip-1",
            title: "Bad Clip",
            videoUrl: "http://insecure-http-not-allowed.com/video.mp4",
          },
        ],
      },
    };
    expect(profileInput.safeParse(invalidClip).success).toBe(false);
  });
});
