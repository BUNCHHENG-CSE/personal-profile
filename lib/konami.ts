/**
 * Konami Code Sequence Matcher & Retro Web Audio Synthesizer
 *
 * Sequence: Up Up Down Down Left Right Left Right B A
 */

export const KONAMI_CODE: readonly string[] = [
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

export function normalizeKey(rawKey: string): string {
  const k = rawKey.trim();
  const lower = k.toLowerCase();

  if (lower === "arrowup" || lower === "up") return "ArrowUp";
  if (lower === "arrowdown" || lower === "down") return "ArrowDown";
  if (lower === "arrowleft" || lower === "left") return "ArrowLeft";
  if (lower === "arrowright" || lower === "right") return "ArrowRight";
  if (lower === "b") return "b";
  if (lower === "a") return "a";

  return lower;
}

export function pushKey(
  buffer: readonly string[],
  key: string,
  maxLen = KONAMI_CODE.length
): string[] {
  const normalized = normalizeKey(key);
  const next = [...buffer, normalized];
  if (next.length > maxLen) {
    return next.slice(next.length - maxLen);
  }
  return next;
}

export function isKonamiMatch(
  buffer: readonly string[],
  target: readonly string[] = KONAMI_CODE
): boolean {
  if (buffer.length < target.length) return false;
  const tail = buffer.slice(buffer.length - target.length);
  return tail.every((k, idx) => k === target[idx]);
}

export function isEditableElement(target: EventTarget | null): boolean {
  if (!target) return false;
  if (typeof HTMLElement !== "undefined" && !(target instanceof HTMLElement)) {
    return false;
  }
  const el = target as { tagName?: string; isContentEditable?: boolean };
  const tag = el.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  return false;
}

// -------------------------------------------------------------
// Pure Web Audio API 8-Bit Synthesizer (Zero External Assets)
// -------------------------------------------------------------

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function playKonamiFanfare(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // 8-bit classic arpeggio fanfare (C4, E4, G4, C5, E5, G5, B5, C6)
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 987.77, 1046.5];
    const noteDuration = 0.085;
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx >= notes.length - 2 ? "triangle" : "square";
      osc.frequency.setValueAtTime(freq, now + idx * noteDuration);

      const startTime = now + idx * noteDuration;
      const endTime = startTime + (idx === notes.length - 1 ? 0.35 : noteDuration * 0.9);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, endTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(endTime);
    });
  } catch {
    // Audio context may fail if user hasn't interacted or browser blocked audio
  }
}

export type RetroSfxType = "coin" | "laser" | "jump" | "powerup" | "explosion";

export function playRetroSfx(type: RetroSfxType): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (type) {
      case "coin": {
        // High 2-tone ping (B5 -> E6)
        osc.type = "sine";
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case "laser": {
        // Fast pitch drop
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case "jump": {
        // Upward pitch bend
        osc.type = "square";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case "powerup": {
        // Rapid 3-note chime
        const freqs = [330, 440, 660, 880];
        freqs.forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "triangle";
          o.frequency.setValueAtTime(f, now + i * 0.06);
          g.gain.setValueAtTime(0.25, now + i * 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.12);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(now + i * 0.06);
          o.stop(now + i * 0.06 + 0.12);
        });
        break;
      }
      case "explosion": {
        // Low rumble drop
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.3);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
    }
  } catch {
    // Graceful fallback if Web Audio is unsupported
  }
}
