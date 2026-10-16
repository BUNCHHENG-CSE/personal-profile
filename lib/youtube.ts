/**
 * Extracts YouTube video ID from various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    // If it's already just an 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const hostname = parsed.hostname.toLowerCase();

    // youtu.be/VIDEO_ID
    if (hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0]?.split("?")[0];
      return id && id.length === 11 ? id : null;
    }

    // youtube.com / m.youtube.com / music.youtube.com
    if (
      hostname === "www.youtube.com" ||
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com" ||
      hostname.endsWith(".youtube.com")
    ) {
      // /watch?v=VIDEO_ID
      const v = parsed.searchParams.get("v");
      if (v && v.length === 11) return v;

      // /embed/VIDEO_ID
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.replace("/embed/", "").split("/")[0]?.split("?")[0];
        if (id && id.length === 11) return id;
      }

      // /shorts/VIDEO_ID
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.replace("/shorts/", "").split("/")[0]?.split("?")[0];
        if (id && id.length === 11) return id;
      }
    }
  } catch {
    // Not a valid URL
  }

  // Regex fallback
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
  );
  return match ? match[1] : null;
}

export function isYouTubeUrl(url: string | null | undefined): boolean {
  return extractYouTubeId(url) !== null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export interface YouTubeTimeParams {
  id: string | null;
  start?: number;
  end?: number;
  autoplay?: boolean;
}

export function parseYouTubeTime(timeStr: string | null | undefined): number | undefined {
  if (!timeStr) return undefined;
  const str = timeStr.trim().toLowerCase();
  if (/^\d+$/.test(str)) {
    const val = parseInt(str, 10);
    return isNaN(val) || val < 0 ? undefined : val;
  }
  let totalSeconds = 0;
  let matched = false;
  const hoursMatch = str.match(/(\d+)\s*h/);
  if (hoursMatch) {
    totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
    matched = true;
  }
  const minsMatch = str.match(/(\d+)\s*m/);
  if (minsMatch) {
    totalSeconds += parseInt(minsMatch[1], 10) * 60;
    matched = true;
  }
  const secsMatch = str.match(/(\d+)\s*s/);
  if (secsMatch) {
    totalSeconds += parseInt(secsMatch[1], 10);
    matched = true;
  }
  return matched ? totalSeconds : undefined;
}

export function extractYouTubeParams(url: string | null | undefined): YouTubeTimeParams {
  const id = extractYouTubeId(url);
  if (!id || !url) return { id: id || null };

  try {
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return { id };
    }

    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const rawStart = parsed.searchParams.get("start") || parsed.searchParams.get("t");
    const rawEnd = parsed.searchParams.get("end");
    const rawAutoplay = parsed.searchParams.get("autoplay");

    const start = parseYouTubeTime(rawStart);
    const end = parseYouTubeTime(rawEnd);
    const autoplay = rawAutoplay === "1" || rawAutoplay === "true" ? true : undefined;

    return {
      id,
      ...(start !== undefined ? { start } : {}),
      ...(end !== undefined ? { end } : {}),
      ...(autoplay !== undefined ? { autoplay } : {}),
    };
  } catch {
    return { id };
  }
}

export function buildYouTubeWatchUrl(
  videoId: string,
  start?: number,
  end?: number
): string {
  let url = `https://www.youtube.com/watch?v=${videoId}`;
  const params: string[] = [];
  if (typeof start === "number" && !isNaN(start) && start >= 0) {
    params.push(`start=${Math.floor(start)}`);
  }
  if (typeof end === "number" && !isNaN(end) && end > (start ?? 0)) {
    params.push(`end=${Math.floor(end)}`);
  }
  if (params.length > 0) {
    url += `&${params.join("&")}`;
  }
  return url;
}

export function getYouTubeEmbedUrl(
  urlOrId: string,
  options?: { start?: number; end?: number; autoplay?: boolean }
): string {
  const params = extractYouTubeParams(urlOrId);
  const videoId = params.id || urlOrId;

  const start = options?.start !== undefined ? options.start : params.start;
  const end = options?.end !== undefined ? options.end : params.end;
  const autoplay = options?.autoplay !== undefined ? options.autoplay : false;

  let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
  if (autoplay) {
    embedUrl += `&autoplay=1`;
  }
  if (typeof start === "number" && !isNaN(start) && start >= 0) {
    embedUrl += `&start=${Math.floor(start)}`;
  }
  if (typeof end === "number" && !isNaN(end) && end > (start ?? 0)) {
    embedUrl += `&end=${Math.floor(end)}`;
  }
  return embedUrl;
}
