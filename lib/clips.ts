export type ClipPlatform = "youtube" | "twitch" | "medal" | "direct" | "unknown";

export interface ParsedClip {
  platform: ClipPlatform;
  embedUrl: string;
  defaultThumbnail?: string;
  isDirectVideo?: boolean;
}

export function parseClipUrl(rawUrl: string, hostOrigin = "localhost"): ParsedClip | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();

  // Direct MP4 / WebM video files
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(trimmed)) {
    return {
      platform: "direct",
      embedUrl: trimmed,
      isDirectVideo: true,
    };
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    // YouTube URLs (Standard, youtu.be, Shorts)
    if (
      hostname.includes("youtube.com") ||
      hostname.includes("youtu.be") ||
      hostname.includes("youtube-nocookie.com")
    ) {
      let videoId: string | null = null;

      if (hostname.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1).split("/")[0] || null;
      } else if (parsed.pathname.includes("/shorts/")) {
        const parts = parsed.pathname.split("/shorts/");
        videoId = parts[1]?.split("/")[0]?.split("?")[0] || null;
      } else if (parsed.pathname.includes("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0]?.split("?")[0] || null;
      } else {
        videoId = parsed.searchParams.get("v");
      }

      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return {
          platform: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
          defaultThumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        };
      }
    }

    // Twitch Clips
    if (hostname.includes("twitch.tv")) {
      let clipSlug: string | null = null;
      if (hostname === "clips.twitch.tv") {
        clipSlug = parsed.pathname.slice(1).split("/")[0] || null;
      } else if (parsed.pathname.includes("/clip/")) {
        clipSlug = parsed.pathname.split("/clip/")[1]?.split("/")[0]?.split("?")[0] || null;
      }

      if (clipSlug) {
        const cleanParent = hostOrigin.replace(/^https?:\/\//i, "").split(":")[0] || "localhost";
        return {
          platform: "twitch",
          embedUrl: `https://clips.twitch.tv/embed?clip=${clipSlug}&parent=${cleanParent}&autoplay=true`,
        };
      }
    }

    // Medal.tv Clips
    if (hostname.includes("medal.tv")) {
      const match = parsed.pathname.match(/\/clips\/([a-zA-Z0-9_-]+)/i);
      const clipId = match?.[1] || parsed.pathname.split("/clip/")[1]?.split("/")[0];
      if (clipId) {
        return {
          platform: "medal",
          embedUrl: `https://medal.tv/clip/${clipId}?autoplay=1&muted=0`,
        };
      }
    }

    // Fallback: regular web URL
    return {
      platform: "unknown",
      embedUrl: trimmed,
    };
  } catch {
    return null;
  }
}
