
export interface SteamGame {
  name: string;
  link?: string | null;
  icon?: string | null;
  logo?: string | null;
  hours2Weeks?: string | null;
  hoursTotal?: string | null;
}

export interface SteamProfileData {
  steamId64: string;
  personaName: string;
  profileUrl: string;
  avatar: string;
  onlineState: "in-game" | "online" | "offline";
  stateMessage?: string | null;
  currentGame?: {
    name: string;
    icon?: string | null;
    logo?: string | null;
  } | null;
  mostPlayedGames?: SteamGame[];
}

export function cleanSteamInput(raw?: string | null): { type: "profiles" | "id"; value: string } | null {
  if (!raw) return null;
  let trimmed = raw.trim();
  if (!trimmed) return null;

  // Handle full URL inputs like https://steamcommunity.com/id/username/ or https://steamcommunity.com/profiles/7656119.../
  trimmed = trimmed.replace(/\/+$/, ""); // Remove trailing slashes
  const profileUrlMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17,20})/i);
  if (profileUrlMatch?.[1]) {
    return { type: "profiles", value: profileUrlMatch[1] };
  }
  const vanityUrlMatch = trimmed.match(/steamcommunity\.com\/id\/([a-zA-Z0-9_.-]+)/i);
  if (vanityUrlMatch?.[1]) {
    return { type: "id", value: vanityUrlMatch[1] };
  }

  // If directly numeric 17+ digits, treat as SteamID64
  if (/^\d{17,20}$/.test(trimmed)) {
    return { type: "profiles", value: trimmed };
  }

  // Otherwise treat as vanity identifier
  if (/^[a-zA-Z0-9_.-]{2,60}$/.test(trimmed)) {
    return { type: "id", value: trimmed };
  }

  return null;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`, "i");
  const match = xml.match(regex);
  if (!match) return null;
  return (match[1] ?? match[2] ?? "").trim() || null;
}

export function parseSteamXml(xml: string): SteamProfileData | null {
  const steamId64 = extractTag(xml, "steamID64");
  const personaName = extractTag(xml, "steamID");
  if (!steamId64 || !personaName) return null;

  const rawState = (extractTag(xml, "onlineState") || "offline").toLowerCase();
  let onlineState: "in-game" | "online" | "offline" = "offline";
  if (rawState === "in-game") onlineState = "in-game";
  else if (rawState === "online") onlineState = "online";

  const stateMessage = extractTag(xml, "stateMessage");
  const avatar =
    extractTag(xml, "avatarFull") ||
    extractTag(xml, "avatarMedium") ||
    extractTag(xml, "avatarIcon") ||
    "";

  const customUrl = extractTag(xml, "customURL");
  const profileUrl = customUrl
    ? `https://steamcommunity.com/id/${customUrl}`
    : `https://steamcommunity.com/profiles/${steamId64}`;

  let currentGame: SteamProfileData["currentGame"] = null;
  if (onlineState === "in-game") {
    const gameName = extractTag(xml, "gameName");
    if (gameName) {
      currentGame = {
        name: gameName,
        icon: extractTag(xml, "gameIcon"),
        logo: extractTag(xml, "gameLogo"),
      };
    }
  }

  const mostPlayedGames: SteamGame[] = [];
  const mostPlayedMatches = [...xml.matchAll(/<mostPlayedGame>([\s\S]*?)<\/mostPlayedGame>/gi)];
  for (const match of mostPlayedMatches.slice(0, 5)) {
    const block = match[1];
    const name = extractTag(block, "gameName");
    if (name) {
      mostPlayedGames.push({
        name,
        link: extractTag(block, "gameLink"),
        icon: extractTag(block, "gameIcon"),
        logo: extractTag(block, "gameLogo"),
        hours2Weeks: extractTag(block, "hoursPlayed"),
        hoursTotal: extractTag(block, "hoursOnRecord"),
      });
    }
  }

  return {
    steamId64,
    personaName,
    profileUrl,
    avatar,
    onlineState,
    stateMessage,
    currentGame,
    mostPlayedGames: mostPlayedGames.length > 0 ? mostPlayedGames : undefined,
  };
}

export async function getSteamProfile(rawSteamId?: string | null): Promise<SteamProfileData | null> {
  const parsed = cleanSteamInput(rawSteamId);
  if (!parsed) return null;

  const url = `https://steamcommunity.com/${parsed.type}/${parsed.value}/?xml=1`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "PersonalGamingProfile/1.0 (+https://github.com)",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const text = await res.text();
    return parseSteamXml(text);
  } catch {
    return null;
  }
}
