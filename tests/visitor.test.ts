import { describe, expect, it } from "vitest";
import {
  getCountryInfo,
  parseReferrer,
  parseUserAgent,
  recordVisitorSession,
  getVisitorAnalyticsSummary,
} from "../lib/visitor";

describe("Visitor Telemetry & Parser Engine", () => {
  it("accurately detects operating systems and device types from User-Agent", () => {
    // Windows 11 Desktop
    const winUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    const winResult = parseUserAgent(winUA);
    expect(winResult.deviceType).toBe("desktop");
    expect(winResult.os).toBe("Windows 11 / 10");
    expect(winResult.browser).toBe("Chrome");

    // iPhone Mobile Safari
    const iphoneUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1";
    const iphoneResult = parseUserAgent(iphoneUA);
    expect(iphoneResult.deviceType).toBe("mobile");
    expect(iphoneResult.os).toBe("iOS");
    expect(iphoneResult.browser).toBe("Safari");

    // SteamDeck / Console
    const steamDeckUA = "Mozilla/5.0 (Linux; SteamDeck; Valve Steam Gamepad) AppleWebKit/537.36 (KHTML, like Gecko) Steam/1.0";
    const consoleResult = parseUserAgent(steamDeckUA);
    expect(consoleResult.deviceType).toBe("console");
    expect(consoleResult.browser).toBe("Steam Client");
  });

  it("identifies gaming community traffic sources from referrers", () => {
    expect(parseReferrer("https://discord.com/channels/123/456").referrer).toBe("Discord Community");
    expect(parseReferrer("https://steamcommunity.com/id/player").referrer).toBe("Steam Community");
    expect(parseReferrer("https://www.twitch.tv/streamer").referrer).toBe("Twitch Stream");
    expect(parseReferrer("https://youtube.com/watch?v=123").referrer).toBe("YouTube Channel");
    expect(parseReferrer("").referrer).toBe("Direct Traffic");
    expect(parseReferrer(null).referrer).toBe("Direct Traffic");
  });

  it("translates country codes into friendly names and flag emojis", () => {
    const us = getCountryInfo("US");
    expect(us.countryName).toBe("United States");
    expect(us.countryFlag).toBe("🇺🇸");

    const id = getCountryInfo("ID");
    expect(id.countryName).toBe("Indonesia");
    expect(id.countryFlag).toBe("🇮🇩");

    const jp = getCountryInfo("JP");
    expect(jp.countryName).toBe("Japan");
    expect(jp.countryFlag).toBe("🇯🇵");

    const global = getCountryInfo(null);
    expect(global.countryName).toBe("Worldwide");
    expect(global.countryFlag).toBe("🌐");
  });

  it("records visitor sessions and computes demographic summary", () => {
    recordVisitorSession({
      id: "test-session-1",
      timestamp: new Date().toISOString(),
      pagePath: "/",
      countryCode: "US",
      countryName: "United States",
      countryFlag: "🇺🇸",
      deviceType: "desktop",
      os: "Windows 11 / 10",
      browser: "Chrome",
      referrer: "Discord Community",
      referrerDomain: "discord.com",
      action: "Copied Steam Tag",
      isNewVisitor: true,
    });

    const summary = getVisitorAnalyticsSummary();
    expect(summary.totalTrackedSessions).toBeGreaterThan(0);
    expect(summary.recentSessions[0].id).toBe("test-session-1");
    expect(summary.recentSessions[0].action).toBe("Copied Steam Tag");
  });
});
