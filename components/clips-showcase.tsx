"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  Clapperboard,
  Film,
  Maximize2,
  Play,
  Sparkles,
  Tv,
  X,
} from "lucide-react";
import { parseClipUrl, type ParsedClip } from "@/lib/clips";

export interface ClipItem {
  id: string;
  title: string;
  videoUrl: string;
  game?: string | null;
  thumbnailUrl?: string | null;
  description?: string | null;
}

export function ClipsShowcase({ clips }: { clips?: ClipItem[] | null }) {
  const [activeClip, setActiveClip] = useState<ClipItem | null>(null);

  const parsedMap = useMemo(() => {
    if (!clips) return {};
    const origin = typeof window !== "undefined" ? window.location.origin : "localhost";
    const mapped: Record<string, ParsedClip | null> = {};
    for (const c of clips) {
      mapped[c.id] = parseClipUrl(c.videoUrl, origin);
    }
    return mapped;
  }, [clips]);

  // Handle escape key to close lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveClip(null);
      }
    }
    if (activeClip) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeClip]);

  if (!clips || clips.length === 0) return null;

  return (
    <section className="clips-showcase-section mt-12 w-full" id="clips">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Film size={16} style={{ color: "var(--accent)" }} />
          <h3 className="text-xs font-mono tracking-[0.25em] uppercase text-white/70">
            CLIPS & HIGHLIGHTS // {clips.length} {clips.length === 1 ? "MOMENT" : "MOMENTS"}
          </h3>
        </div>
        <div className="text-[10px] font-mono text-white/40 tracking-widest uppercase flex items-center gap-1.5">
          <Clapperboard size={12} className="text-[var(--accent)]" />
          <span>CLICK TO WATCH IN THEATER</span>
        </div>
      </div>

      {/* Grid of Clip Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clips.map((clip) => {
          const parsed = parsedMap[clip.id];
          const thumb = clip.thumbnailUrl || parsed?.defaultThumbnail;

          return (
            <div
              key={clip.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveClip(clip)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveClip(clip);
                }
              }}
              className="group cursor-pointer border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden transition-all hover:border-[var(--accent)] relative flex flex-col justify-between"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
              }}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-black/60 overflow-hidden flex items-center justify-center">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={clip.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/30 bg-white/[0.02]">
                    <Tv size={32} className="mb-2" />
                    <span className="text-[10px] font-mono tracking-widest uppercase">
                      VIDEO HIGHLIGHT
                    </span>
                  </div>
                )}

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Play Button Overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all"
                  aria-hidden="true"
                >
                  <div className="w-12 h-12 rounded-full border border-white/30 bg-black/60 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all shadow-lg">
                    <Play size={18} className="translate-x-0.5 fill-current" />
                  </div>
                </div>

                {/* Platform Badge */}
                {parsed?.platform && (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/80 border border-white/15 text-white/80 font-medium backdrop-blur-sm">
                      {parsed.platform}
                    </span>
                  </div>
                )}
              </div>

              {/* Clip Metadata */}
              <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {clip.game && (
                      <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.2 rounded border border-purple-500/40 bg-purple-500/10 text-purple-300 font-semibold">
                        {clip.game}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-mono font-bold text-white group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                    {clip.title}
                  </h4>
                  {clip.description && (
                    <p className="text-[11px] font-mono text-white/50 line-clamp-2 mt-1">
                      {clip.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span className="flex items-center gap-1 group-hover:text-white/70 transition-colors">
                    <Maximize2 size={11} /> Watch Clip
                  </span>
                  <span className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                    ▶ Play
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Video Theater Modal */}
      {activeClip && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeClip.title}
          onClick={() => setActiveClip(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl border border-white/20 bg-[#0d0e14] shadow-2xl overflow-hidden clip-corner"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <Film size={16} className="text-[var(--accent)] shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-mono font-bold text-white truncate">
                    {activeClip.title}
                  </h3>
                  {activeClip.game && (
                    <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                      GAME // {activeClip.game}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveClip(null)}
                className="p-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
                aria-label="Close theater"
              >
                <X size={16} />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video w-full bg-black">
              {parsedMap[activeClip.id]?.isDirectVideo ? (
                <video
                  src={activeClip.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={parsedMap[activeClip.id]?.embedUrl || activeClip.videoUrl}
                  title={activeClip.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Modal Footer Description */}
            {activeClip.description && (
              <div className="p-3.5 border-t border-white/10 bg-white/[0.015] text-xs font-mono text-white/70 flex items-start gap-2">
                <Sparkles size={13} className="text-[var(--accent)] shrink-0 mt-0.5" />
                <p>{activeClip.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
