"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  CloudRain,
  Headphones,
  Maximize2,
  Minimize2,
  Music,
  Pause,
  Play,
  Radio,
  Sliders,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import type { ChillLoungeConfig, ChillLoungeTrack } from "@/lib/validation";

interface ChillLoungePlayerProps {
  config?: ChillLoungeConfig | null;
  className?: string;
}

const PRESET_TRACKS: Record<
  ChillLoungeTrack,
  {
    name: string;
    description: string;
    tag: string;
    icon: typeof Music;
    color: string;
  }
> = {
  lofi: {
    name: "Lo-Fi Study & Chill",
    description: "Cozy mellow chords & warm vinyl crunch",
    tag: "CHILL BEATS",
    icon: Headphones,
    color: "#a855f7",
  },
  rain: {
    name: "Cyberpunk Rainstorm",
    description: "Gentle rain on neon rooftop glass",
    tag: "ATMOSPHERE",
    icon: CloudRain,
    color: "#06b6d4",
  },
  arcade: {
    name: "Retro 8-Bit Arcade",
    description: "Chiptune arpeggios & vintage memories",
    tag: "VINTAGE PIXEL",
    icon: Zap,
    color: "#f59e0b",
  },
  synthwave: {
    name: "Synthwave Highway",
    description: "Analog retro-future drive at dusk",
    tag: "OUTRUN SYNTH",
    icon: Radio,
    color: "#ec4899",
  },
};

export function ChillLoungePlayer({ config, className = "" }: ChillLoungePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [track, setTrack] = useState<ChillLoungeTrack>(config?.defaultTrack || "lofi");
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Web Audio Context & Synthesizer Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const soundNodesRef = useRef<{ stop: () => void } | null>(null);

  // Initialize Web Audio Engine
  const startAudioEngine = useCallback(() => {
    if (typeof window === "undefined") return;

    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    if (!masterGainRef.current) {
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      gain.connect(ctx.destination);
      masterGainRef.current = gain;
    }
  }, [isMuted, volume]);

  // Generate Real-Time Procedural Soundscapes (Zero external audio bandwidth!)
  const playSoundscape = useCallback(
    (currentTrack: ChillLoungeTrack) => {
      startAudioEngine();
      const ctx = audioCtxRef.current;
      const master = masterGainRef.current;
      if (!ctx || !master) return;

      // Stop previous generator
      if (soundNodesRef.current) {
        try {
          soundNodesRef.current.stop();
        } catch {}
        soundNodesRef.current = null;
      }

      if (currentTrack === "rain") {
        // Procedural Pink Noise Rain Generator
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2) * 0.12;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        whiteNoise.start();

        soundNodesRef.current = {
          stop: () => {
            try {
              whiteNoise.stop();
              whiteNoise.disconnect();
            } catch {}
          },
        };
      } else if (currentTrack === "arcade") {
        // 8-Bit Chiptune Arpeggiator Loop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";

        const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63]; // C-E-G-C arpeggio
        let noteIdx = 0;

        const interval = setInterval(() => {
          if (ctx.state === "closed") return;
          osc.frequency.setValueAtTime(notes[noteIdx % notes.length], ctx.currentTime);
          noteIdx++;
        }, 140);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.connect(gain);
        gain.connect(master);
        osc.start();

        soundNodesRef.current = {
          stop: () => {
            clearInterval(interval);
            try {
              osc.stop();
              osc.disconnect();
            } catch {}
          },
        };
      } else if (currentTrack === "synthwave") {
        // Warm Outrun Synth Drone Chord
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2

        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(650, ctx.currentTime);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc1.start();
        osc2.start();

        soundNodesRef.current = {
          stop: () => {
            try {
              osc1.stop();
              osc2.stop();
              osc1.disconnect();
              osc2.disconnect();
            } catch {}
          },
        };
      } else {
        // Lo-Fi Warm Rhodes/Sine Chord Loop
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(130.81, ctx.currentTime); // C3 warm drone

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        osc.start();

        soundNodesRef.current = {
          stop: () => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {}
          },
        };
      }
    },
    [startAudioEngine]
  );

  // Volume & Mute listener
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Track change
  const selectTrack = (newTrack: ChillLoungeTrack) => {
    setTrack(newTrack);
    if (isPlaying) {
      playSoundscape(newTrack);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (soundNodesRef.current) {
        soundNodesRef.current.stop();
        soundNodesRef.current = null;
      }
      setIsPlaying(false);
    } else {
      playSoundscape(track);
      setIsPlaying(true);
      if (typeof window !== "undefined" && window.__trackVisitorAction) {
        window.__trackVisitorAction(`Tuned into ${PRESET_TRACKS[track].name}`);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundNodesRef.current) {
        try {
          soundNodesRef.current.stop();
        } catch {}
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close().catch(() => {});
        } catch {}
      }
    };
  }, []);

  if (config?.enabled === false) return null;

  const currentInfo = PRESET_TRACKS[track];
  const Icon = currentInfo.icon;

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 select-none transition-all duration-300 ${className}`}
    >
      {/* Minimized Pill */}
      {isMinimized ? (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-slate-200/80 dark:border-white/15 bg-white/90 dark:bg-black/80 backdrop-blur-xl text-slate-800 dark:text-white shadow-xl hover:border-[var(--accent)] transition-all group"
          title="Open Chill Gaming Lounge"
        >
          <div className="relative">
            <Icon size={15} style={{ color: currentInfo.color }} />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span className="text-xs font-mono font-medium truncate max-w-[120px]">
            {isPlaying ? currentInfo.name : "Chill Lounge"}
          </span>
          <Maximize2 size={12} className="text-slate-400 dark:text-white/40 group-hover:text-slate-900 dark:group-hover:text-white" />
        </button>
      ) : (
        /* Full Deck */
        <div className="w-[300px] sm:w-[330px] rounded-2xl border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-gradient-to-b dark:from-black/90 dark:to-black/95 backdrop-blur-2xl shadow-2xl p-4 text-slate-900 dark:text-white relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Subtle Cyber Top Stripe */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ backgroundColor: currentInfo.color }}
          />

          {/* Top Bar: Title & Minimize */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500 dark:text-white/50">
                CHILL GAMING LOUNGE
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowPresets((p) => !p)}
                className={`p-1.5 rounded-lg text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors ${
                  showPresets ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" : ""
                }`}
                title="Change Ambient Soundscape"
              >
                <Sliders size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Minimize player"
              >
                <Minimize2 size={13} />
              </button>
            </div>
          </div>

          {/* Presets Tray */}
          {showPresets && (
            <div className="mb-3 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 grid grid-cols-2 gap-1.5 animate-in fade-in duration-150">
              {(Object.keys(PRESET_TRACKS) as ChillLoungeTrack[]).map((key) => {
                const item = PRESET_TRACKS[key];
                const ItemIcon = item.icon;
                const isCurrent = track === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectTrack(key)}
                    className={`p-2 rounded-lg text-left transition-all border ${
                      isCurrent
                        ? "bg-white dark:bg-white/15 border-slate-300 dark:border-white/30 text-slate-900 dark:text-white font-bold shadow-sm"
                        : "bg-slate-100/60 dark:bg-white/[0.02] border-transparent text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <ItemIcon size={13} style={{ color: item.color }} />
                      <span className="text-[10px] font-mono">{item.tag}</span>
                    </div>
                    <div className="text-xs truncate">{item.name}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Current Playing Track Info */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 relative overflow-hidden"
              style={{ backgroundColor: `${currentInfo.color}15` }}
            >
              <Icon size={20} style={{ color: currentInfo.color }} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60">
                  {currentInfo.tag}
                </span>
                {isPlaying && (
                  <span className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                    LIVE
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5 font-mono">
                {currentInfo.name}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-white/50 truncate font-mono">
                {currentInfo.description}
              </p>
            </div>
          </div>

          {/* Equalizer Visualizer Bars */}
          <div className="flex items-end justify-between h-5 px-1 mb-3 gap-1">
            {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65].map((height, idx) => (
              <span
                key={idx}
                className="w-full rounded-full transition-all duration-300"
                style={{
                  height: isPlaying ? `${height}%` : "15%",
                  backgroundColor: currentInfo.color,
                  opacity: isPlaying ? 0.8 : 0.25,
                  transform: isPlaying ? `scaleY(${0.6 + ((idx % 3) * 0.2)})` : "none",
                }}
              />
            ))}
          </div>

          {/* Controls: Play/Pause, Mute, Volume */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={togglePlay}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-fg,#090d16)] hover:brightness-110 active:scale-95 shadow-md shadow-[var(--accent)]/20"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
              <span>{isPlaying ? "Pause Ambient" : "Play Ambient"}</span>
            </button>

            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 sm:w-20 accent-[var(--accent)] cursor-pointer h-1 bg-slate-200 dark:bg-white/10 rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
