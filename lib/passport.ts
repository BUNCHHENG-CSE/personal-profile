export interface PlatformMeta {
  id: string;
  name: string;
  placeholder: string;
  color: string;
  badge: string;
  defaultLabel: string;
}

export const PASSPORT_PLATFORMS: Record<string, PlatformMeta> = {
  riot: {
    id: "riot",
    name: "Riot Games",
    placeholder: "Player#TAG (e.g. Arzur#SEA)",
    color: "#ff4655",
    badge: "VAL / LOL",
    defaultLabel: "Riot ID",
  },
  steam: {
    id: "steam",
    name: "Steam",
    placeholder: "Friend Code or Custom URL",
    color: "#1b2838",
    badge: "VALVE",
    defaultLabel: "Steam Code",
  },
  discord: {
    id: "discord",
    name: "Discord",
    placeholder: "@username or tag",
    color: "#5865f2",
    badge: "VOICE",
    defaultLabel: "Discord",
  },
  battlenet: {
    id: "battlenet",
    name: "Battle.net",
    placeholder: "Battletag#0000",
    color: "#00aeff",
    badge: "BLIZZARD",
    defaultLabel: "Battle.net",
  },
  epic: {
    id: "epic",
    name: "Epic Games",
    placeholder: "Display Name",
    color: "#0078f2",
    badge: "EPIC",
    defaultLabel: "Epic ID",
  },
  xbox: {
    id: "xbox",
    name: "Xbox Network",
    placeholder: "Gamertag",
    color: "#107c10",
    badge: "XBOX",
    defaultLabel: "Gamertag",
  },
  playstation: {
    id: "playstation",
    name: "PlayStation Network",
    placeholder: "PSN Online ID",
    color: "#003791",
    badge: "PSN",
    defaultLabel: "PSN ID",
  },
  switch: {
    id: "switch",
    name: "Nintendo Switch",
    placeholder: "SW-0000-0000-0000",
    color: "#e60012",
    badge: "SWITCH",
    defaultLabel: "Switch Code",
  },
  ea: {
    id: "ea",
    name: "EA App",
    placeholder: "EA ID",
    color: "#ff4747",
    badge: "EA",
    defaultLabel: "EA ID",
  },
  ubisoft: {
    id: "ubisoft",
    name: "Ubisoft Connect",
    placeholder: "Connect Username",
    color: "#0070d1",
    badge: "UBI",
    defaultLabel: "Ubisoft",
  },
  custom: {
    id: "custom",
    name: "Custom Platform",
    placeholder: "ID or Handle",
    color: "var(--accent)",
    badge: "TAG",
    defaultLabel: "Gamer Tag",
  },
};

// Web Audio API Synthesizer for high-tech holographic UI feedback
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export type TechSoundType =
  | "click"
  | "flip"
  | "copy"
  | "scan"
  | "kudos_gg"
  | "kudos_hype"
  | "kudos_cracked"
  | "kudos_respect"
  | "kudos_mvp";

export function playTechSound(type: TechSoundType, muted = false) {
  if (muted || typeof window === "undefined") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      // Crisp mechanical cyber click
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "copy") {
      // Harmonic dual-tone positive chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.07); // A5
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1174.66, now + 0.07); // D6
      gain2.gain.setValueAtTime(0.09, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.22);
      osc2.start(now + 0.07);
      osc2.stop(now + 0.25);
    } else if (type === "flip") {
      // Holographic whoosh
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "scan") {
      // Radar sweep sound
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "kudos_gg") {
      // Energetic double-chime (C5 -> G5)
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.08);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === "kudos_hype") {
      // Rapid arcade power-up sweep
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "kudos_cracked") {
      // Cyber laser zap + glass ping
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === "kudos_respect") {
      // Warm synth chord
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "kudos_mvp") {
      // Triumphant 3-note arpeggio (F5 -> A5 -> C6)
      osc.type = "triangle";
      osc.frequency.setValueAtTime(698.46, now);
      osc.frequency.setValueAtTime(880, now + 0.07);
      osc.frequency.setValueAtTime(1046.5, now + 0.14);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch {
    // Ignore audio failures if browser blocks autoplay
  }
}
