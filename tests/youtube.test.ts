import { describe, expect, it } from "vitest";
import {
  extractYouTubeId,
  isYouTubeUrl,
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
} from "../lib/youtube";
import { profileInput } from "../lib/validation";

describe("YouTube integration", () => {
  it("extracts video ID from standard watch URLs", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
    expect(
      extractYouTubeId("https://youtube.com/watch?v=dQw4w9WgXcQ&feature=share"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from youtu.be short URLs", () => {
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ?t=42")).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from music.youtube.com URLs", () => {
    expect(
      extractYouTubeId("https://music.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from embed and shorts URLs", () => {
    expect(
      extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
    expect(
      extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    ).toBe("dQw4w9WgXcQ");
  });

  it("returns null for non-YouTube URLs", () => {
    expect(extractYouTubeId("https://example.com/audio.mp3")).toBeNull();
    expect(extractYouTubeId("https://soundcloud.com/track")).toBeNull();
    expect(extractYouTubeId("")).toBeNull();
    expect(extractYouTubeId(null)).toBeNull();
  });

  it("identifies YouTube URLs correctly", () => {
    expect(isYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      true,
    );
    expect(isYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(isYouTubeUrl("https://res.cloudinary.com/demo/video/track.mp3")).toBe(
      false,
    );
  });

  it("generates correct embed and thumbnail URLs", () => {
    expect(getYouTubeEmbedUrl("dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&enablejsapi=1",
    );
    expect(getYouTubeThumbnail("dQw4w9WgXcQ")).toBe(
      "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    );
  });

  it("validates YouTube URLs as musicUrl in profileInput", () => {
    const profileWithYouTube = {
      displayName: "Gamer",
      username: "gamer",
      bio: "Playing games",
      musicUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      trackTitle: "Never Gonna Give You Up",
      trackArtist: "Rick Astley",
      seoTitle: "Title",
      seoDescription: "Desc",
      socialLinks: [],
    };

    const parsed = profileInput.safeParse(profileWithYouTube);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.musicUrl).toBe(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );
    }
  });
});
