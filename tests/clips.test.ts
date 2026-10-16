import { describe, expect, it } from "vitest";
import { parseClipUrl } from "../lib/clips";

describe("clips parser", () => {
  it("parses standard YouTube watch URLs", () => {
    const res = parseClipUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(res).not.toBeNull();
    expect(res?.platform).toBe("youtube");
    expect(res?.embedUrl).toContain("dQw4w9WgXcQ");
    expect(res?.defaultThumbnail).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("parses YouTube Shorts URLs", () => {
    const res = parseClipUrl("https://youtube.com/shorts/dQw4w9WgXcQ?feature=share");
    expect(res).not.toBeNull();
    expect(res?.platform).toBe("youtube");
    expect(res?.embedUrl).toContain("dQw4w9WgXcQ");
    expect(res?.defaultThumbnail).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("parses youtu.be short URLs", () => {
    const res = parseClipUrl("https://youtu.be/dQw4w9WgXcQ");
    expect(res?.platform).toBe("youtube");
    expect(res?.embedUrl).toContain("dQw4w9WgXcQ");
  });

  it("parses Twitch clips", () => {
    const res = parseClipUrl("https://clips.twitch.tv/GloriousTameOryxChefFrank-12345");
    expect(res?.platform).toBe("twitch");
    expect(res?.embedUrl).toContain("GloriousTameOryxChefFrank-12345");
  });

  it("parses direct MP4 video URLs", () => {
    const res = parseClipUrl("https://example.com/videos/ace-round.mp4");
    expect(res?.platform).toBe("direct");
    expect(res?.isDirectVideo).toBe(true);
    expect(res?.embedUrl).toBe("https://example.com/videos/ace-round.mp4");
  });

  it("handles empty or invalid inputs safely", () => {
    expect(parseClipUrl("")).toBeNull();
    expect(parseClipUrl("not a valid url")).toBeNull();
  });
});
