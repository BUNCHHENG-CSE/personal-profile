import { describe, it, expect } from "vitest";
import {
  KONAMI_CODE,
  normalizeKey,
  pushKey,
  isKonamiMatch,
  isEditableElement,
} from "../lib/konami";

describe("Konami Code Detector", () => {
  it("normalizes keys properly", () => {
    expect(normalizeKey("ArrowUp")).toBe("ArrowUp");
    expect(normalizeKey("arrowup")).toBe("ArrowUp");
    expect(normalizeKey("UP")).toBe("ArrowUp");
    expect(normalizeKey("ArrowDown")).toBe("ArrowDown");
    expect(normalizeKey("down")).toBe("ArrowDown");
    expect(normalizeKey("ArrowLeft")).toBe("ArrowLeft");
    expect(normalizeKey("left")).toBe("ArrowLeft");
    expect(normalizeKey("ArrowRight")).toBe("ArrowRight");
    expect(normalizeKey("right")).toBe("ArrowRight");
    expect(normalizeKey("B")).toBe("b");
    expect(normalizeKey("b")).toBe("b");
    expect(normalizeKey("A")).toBe("a");
    expect(normalizeKey("a")).toBe("a");
    expect(normalizeKey("x")).toBe("x");
  });

  it("slides buffer to keep max length", () => {
    let buf: string[] = [];
    buf = pushKey(buf, "ArrowUp");
    expect(buf).toEqual(["ArrowUp"]);

    for (let i = 0; i < 15; i++) {
      buf = pushKey(buf, String(i), 5);
    }
    expect(buf.length).toBe(5);
    expect(buf).toEqual(["10", "11", "12", "13", "14"]);
  });

  it("detects exact Konami sequence", () => {
    const sequence = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];

    expect(isKonamiMatch(sequence)).toBe(true);
  });

  it("detects Konami sequence with leading noise", () => {
    let buf: string[] = ["x", "y", "z"];
    for (const key of KONAMI_CODE) {
      buf = pushKey(buf, key, 10);
    }
    expect(isKonamiMatch(buf)).toBe(true);
  });

  it("rejects incomplete or incorrect sequences", () => {
    expect(isKonamiMatch(["ArrowUp", "ArrowUp"])).toBe(false);
    expect(
      isKonamiMatch([
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "b",
        "b", // wrong key
      ])
    ).toBe(false);
  });

  it("handles editable element check safely", () => {
    expect(isEditableElement(null)).toBe(false);
    expect(isEditableElement({} as unknown as EventTarget)).toBe(false);
  });
});
