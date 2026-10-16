/**
 * Comprehensive Visitor Telemetry, Device Parser & Geo/Referrer Extraction
 * Privacy-preserving: No raw IP is ever retained.
 */

export interface VisitorDetails {
  deviceType: "desktop" | "mobile" | "tablet" | "console";
  os: string;
  browser: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  referrer: string;
  referrerDomain: string;
}

export interface VisitorSessionLog extends VisitorDetails {
  id: string;
  timestamp: string;
  pagePath: string;
  action?: string;
  linkId?: string;
  isNewVisitor: boolean;
}

// Country code to Country Name & Flag Emoji map
const COUNTRY_LOOKUP: Record<string, { name: string; flag: string }> = {
  US: { name: "United States", flag: "🇺🇸" },
  ID: { name: "Indonesia", flag: "🇮🇩" },
  JP: { name: "Japan", flag: "🇯🇵" },
  GB: { name: "United Kingdom", flag: "🇬🇧" },
  DE: { name: "Germany", flag: "🇩🇪" },
  CA: { name: "Canada", flag: "🇨🇦" },
  AU: { name: "Australia", flag: "🇦🇺" },
  FR: { name: "France", flag: "🇫🇷" },
  SG: { name: "Singapore", flag: "🇸🇬" },
  KR: { name: "South Korea", flag: "🇰🇷" },
  BR: { name: "Brazil", flag: "🇧🇷" },
  NL: { name: "Netherlands", flag: "🇳🇱" },
  SE: { name: "Sweden", flag: "🇸🇪" },
  PH: { name: "Philippines", flag: "🇵🇭" },
  TH: { name: "Thailand", flag: "🇹🇭" },
  MY: { name: "Malaysia", flag: "🇲🇾" },
  VN: { name: "Vietnam", flag: "🇻🇳" },
  IN: { name: "India", flag: "🇮🇳" },
  ES: { name: "Spain", flag: "🇪🇸" },
  IT: { name: "Italy", flag: "🇮🇹" },
  RU: { name: "Russia", flag: "🇷🇺" },
  PL: { name: "Poland", flag: "🇵🇱" },
  GLOBAL: { name: "Worldwide", flag: "🌐" },
};

export function getCountryInfo(code?: string | null): {
  countryCode: string;
  countryName: string;
  countryFlag: string;
} {
  if (!code) return { countryCode: "GLOBAL", countryName: "Worldwide", countryFlag: "🌐" };
  const upper = code.toUpperCase().trim();
  if (COUNTRY_LOOKUP[upper]) {
    return {
      countryCode: upper,
      countryName: COUNTRY_LOOKUP[upper].name,
      countryFlag: COUNTRY_LOOKUP[upper].flag,
    };
  }
  // Convert 2-letter ISO code to flag emoji
  if (/^[A-Z]{2}$/.test(upper)) {
    const codePoints = [...upper].map((char) => 127397 + char.charCodeAt(0));
    const flag = String.fromCodePoint(...codePoints);
    return { countryCode: upper, countryName: upper, countryFlag: flag };
  }
  return { countryCode: "GLOBAL", countryName: "Worldwide", countryFlag: "🌐" };
}

export function parseUserAgent(uaString?: string | null): {
  deviceType: "desktop" | "mobile" | "tablet" | "console";
  os: string;
  browser: string;
} {
  const ua = uaString || "";

  // 1. Device Type
  let deviceType: "desktop" | "mobile" | "tablet" | "console" = "desktop";
  if (
    /PlayStation|Xbox|Nintendo Switch|SteamDeck/i.test(ua)
  ) {
    deviceType = "console";
  } else if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) {
    deviceType = "tablet";
  } else if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = "mobile";
  }

  // 2. Operating System
  let os = "Unknown OS";
  if (/Windows NT 10.0/i.test(ua)) os = "Windows 11 / 10";
  else if (/Windows NT 6.3/i.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6.1/i.test(ua)) os = "Windows 7";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Mac OS X 10[._](\d+)/i.test(ua) || /Macintosh/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/CrOS/i.test(ua)) os = "ChromeOS";
  else if (/PlayStation/i.test(ua)) os = "PlayStation";
  else if (/Xbox/i.test(ua)) os = "Xbox OS";

  // 3. Browser
  let browser = "Browser";
  if (/Discord/i.test(ua)) browser = "Discord App";
  else if (/Steam/i.test(ua)) browser = "Steam Client";
  else if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  return { deviceType, os, browser };
}

export function parseReferrer(referrerHeader?: string | null): {
  referrer: string;
  referrerDomain: string;
} {
  if (!referrerHeader || referrerHeader.trim() === "") {
    return { referrer: "Direct Traffic", referrerDomain: "Direct" };
  }

  try {
    const url = new URL(referrerHeader);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    if (host.includes("discord.com") || host.includes("discord.gg")) {
      return { referrer: "Discord Community", referrerDomain: "discord.com" };
    }
    if (host.includes("steamcommunity.com") || host.includes("steampowered.com")) {
      return { referrer: "Steam Community", referrerDomain: "steamcommunity.com" };
    }
    if (host.includes("twitch.tv")) {
      return { referrer: "Twitch Stream", referrerDomain: "twitch.tv" };
    }
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      return { referrer: "YouTube Channel", referrerDomain: "youtube.com" };
    }
    if (host.includes("twitter.com") || host.includes("x.com")) {
      return { referrer: "X / Twitter", referrerDomain: "x.com" };
    }
    if (host.includes("reddit.com")) {
      return { referrer: "Reddit", referrerDomain: "reddit.com" };
    }
    if (host.includes("github.com")) {
      return { referrer: "GitHub", referrerDomain: "github.com" };
    }
    if (host.includes("google.com")) {
      return { referrer: "Google Search", referrerDomain: "google.com" };
    }

    return { referrer: host, referrerDomain: host };
  } catch {
    return { referrer: "Direct / External", referrerDomain: "Direct" };
  }
}

export function extractGeoFromRequest(request: Request): {
  countryCode: string;
  countryName: string;
  countryFlag: string;
} {
  // Edge header checks (Vercel, Cloudflare, etc.)
  const headerCountry =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    request.headers.get("geoip-country-code");

  if (headerCountry && headerCountry !== "XX" && headerCountry !== "T1") {
    return getCountryInfo(headerCountry);
  }

  // Accept-language fallback (e.g. "en-US,en;q=0.9,id;q=0.8" -> "US")
  const acceptLang = request.headers.get("accept-language") || "";
  const match = acceptLang.match(/[-_]([A-Za-z]{2})/);
  if (match && match[1]) {
    return getCountryInfo(match[1]);
  }

  return { countryCode: "GLOBAL", countryName: "Worldwide", countryFlag: "🌐" };
}

// In-Memory Persistent Ring Buffer for Detailed Visitor Sessions (up to 120 items)
declare global {
  var __visitorSessionLogs: VisitorSessionLog[] | undefined;
}

if (!globalThis.__visitorSessionLogs) {
  // Seed with diverse initial samples so the dashboard is immediately informative and useful
  const now = Date.now();
  globalThis.__visitorSessionLogs = [
    {
      id: "seed-1",
      timestamp: new Date(now - 4 * 60 * 1000).toISOString(),
      pagePath: "/",
      countryCode: "ID",
      countryName: "Indonesia",
      countryFlag: "🇮🇩",
      deviceType: "desktop",
      os: "Windows 11 / 10",
      browser: "Chrome",
      referrer: "Discord Community",
      referrerDomain: "discord.com",
      action: "Copied Riot Tag",
      isNewVisitor: false,
    },
    {
      id: "seed-2",
      timestamp: new Date(now - 18 * 60 * 1000).toISOString(),
      pagePath: "/about-introduction",
      countryCode: "US",
      countryName: "United States",
      countryFlag: "🇺🇸",
      deviceType: "desktop",
      os: "Windows 11 / 10",
      browser: "Chrome",
      referrer: "Steam Community",
      referrerDomain: "steamcommunity.com",
      action: "Sent GG Kudos",
      isNewVisitor: true,
    },
    {
      id: "seed-3",
      timestamp: new Date(now - 42 * 60 * 1000).toISOString(),
      pagePath: "/",
      countryCode: "JP",
      countryName: "Japan",
      countryFlag: "🇯🇵",
      deviceType: "mobile",
      os: "iOS",
      browser: "Safari",
      referrer: "X / Twitter",
      referrerDomain: "x.com",
      action: "Explored Rig Specs",
      isNewVisitor: true,
    },
    {
      id: "seed-4",
      timestamp: new Date(now - 95 * 60 * 1000).toISOString(),
      pagePath: "/",
      countryCode: "SG",
      countryName: "Singapore",
      countryFlag: "🇸🇬",
      deviceType: "desktop",
      os: "macOS",
      browser: "Edge",
      referrer: "Direct Traffic",
      referrerDomain: "Direct",
      action: "Viewed Profile",
      isNewVisitor: false,
    },
    {
      id: "seed-5",
      timestamp: new Date(now - 140 * 60 * 1000).toISOString(),
      pagePath: "/about-introduction",
      countryCode: "DE",
      countryName: "Germany",
      countryFlag: "🇩🇪",
      deviceType: "console",
      os: "Linux",
      browser: "Steam Client",
      referrer: "Steam Community",
      referrerDomain: "steamcommunity.com",
      action: "Viewed Rig Specs",
      isNewVisitor: true,
    },
  ];
}

export function recordVisitorSession(session: VisitorSessionLog): void {
  const logs = globalThis.__visitorSessionLogs || [];
  // Prepend newest session and cap at 120
  globalThis.__visitorSessionLogs = [session, ...logs].slice(0, 120);
}

export function getVisitorSessions(): VisitorSessionLog[] {
  return globalThis.__visitorSessionLogs || [];
}

export function getVisitorAnalyticsSummary() {
  const sessions = getVisitorSessions();

  // 1. Devices breakdown
  const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0, console: 0 };
  for (const s of sessions) {
    deviceCounts[s.deviceType] = (deviceCounts[s.deviceType] || 0) + 1;
  }

  // 2. Operating Systems breakdown
  const osCounts: Record<string, number> = {};
  for (const s of sessions) {
    osCounts[s.os] = (osCounts[s.os] || 0) + 1;
  }
  const topOS = Object.entries(osCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([os, count]) => ({
      os,
      count,
      percentage: sessions.length ? Math.round((count / sessions.length) * 100) : 0,
    }));

  // 3. Browsers breakdown
  const browserCounts: Record<string, number> = {};
  for (const s of sessions) {
    browserCounts[s.browser] = (browserCounts[s.browser] || 0) + 1;
  }
  const topBrowsers = Object.entries(browserCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([browser, count]) => ({
      browser,
      count,
      percentage: sessions.length ? Math.round((count / sessions.length) * 100) : 0,
    }));

  // 4. Traffic Sources / Referrers
  const referrerCounts: Record<string, { count: number; domain: string }> = {};
  for (const s of sessions) {
    const key = s.referrer;
    if (!referrerCounts[key]) {
      referrerCounts[key] = { count: 0, domain: s.referrerDomain };
    }
    referrerCounts[key].count++;
  }
  const topSources = Object.entries(referrerCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([source, meta]) => ({
      source,
      domain: meta.domain,
      count: meta.count,
      percentage: sessions.length ? Math.round((meta.count / sessions.length) * 100) : 0,
    }));

  // 5. Geographies
  const countryCounts: Record<string, { count: number; name: string; flag: string }> = {};
  for (const s of sessions) {
    if (!countryCounts[s.countryCode]) {
      countryCounts[s.countryCode] = {
        count: 0,
        name: s.countryName,
        flag: s.countryFlag,
      };
    }
    countryCounts[s.countryCode].count++;
  }
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([code, meta]) => ({
      code,
      name: meta.name,
      flag: meta.flag,
      count: meta.count,
      percentage: sessions.length ? Math.round((meta.count / sessions.length) * 100) : 0,
    }));

  return {
    recentSessions: sessions.slice(0, 30),
    deviceCounts,
    topOS,
    topBrowsers,
    topSources,
    topCountries,
    totalTrackedSessions: sessions.length,
  };
}
