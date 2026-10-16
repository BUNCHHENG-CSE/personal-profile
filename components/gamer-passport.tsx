"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import {
  Check,
  Copy,
  Flame,
  Globe,
  IdCard,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import type { GamerPassportConfig, GamerPassportTag } from "@/lib/validation";
import { PASSPORT_PLATFORMS, playTechSound } from "@/lib/passport";

interface GamerPassportProps {
  passport?: GamerPassportConfig | null;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  status?: string | null;
  discordId?: string | null;
  steamId?: string | null;
}

export function GamerPassport({
  passport,
  displayName,
  username,
  avatarUrl,
  status,
  discordId,
  steamId,
}: GamerPassportProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [passportLinkCopied, setPassportLinkCopied] = useState(false);
  const [muted, setMuted] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Construct effective tags, falling back to discord & steam if not explicitly provided
  const config: Partial<GamerPassportConfig> = passport || {};
  const tags: GamerPassportTag[] = (config.tags && config.tags.length > 0)
    ? config.tags
    : [
        {
          id: "riot-default",
          platform: "riot",
          label: "Riot ID",
          tag: `${username}#SEA`,
          verified: true,
        },
        ...(steamId
          ? [
              {
                id: "steam-auto",
                platform: "steam" as const,
                label: "Steam ID",
                tag: steamId,
                verified: true,
              },
            ]
          : [
              {
                id: "steam-default",
                platform: "steam" as const,
                label: "Steam Code",
                tag: "76561198000000000",
                verified: false,
              },
            ]),
        ...(discordId
          ? [
              {
                id: "discord-auto",
                platform: "discord" as const,
                label: "Discord ID",
                tag: discordId,
                verified: true,
              },
            ]
          : [
              {
                id: "discord-default",
                platform: "discord" as const,
                label: "Discord",
                tag: `@${username}`,
                verified: false,
              },
            ]),
        {
          id: "battlenet-default",
          platform: "battlenet",
          label: "Battle.net",
          tag: `${username}#1337`,
          verified: false,
        },
      ];

  const callsign = config.callsign || username.toUpperCase();
  const title = config.title || "SANCTUM OPERATOR PASSPORT";
  const tagline = config.tagline || "COMPETITIVE GAMING // MULTI-PLATFORM ID";
  const region = config.region || "GLOBAL // APAC";
  const rankTier = config.rankTier || "ELITE DIVISION";
  const clearanceLevel = config.clearanceLevel || "CLEARANCE S-TIER";

  // Generate high-resolution QR code (standard polarity for 100% phone scanner compatibility)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    QRCode.toDataURL(url, {
      width: 320,
      margin: 1.5,
      color: {
        dark: "#090d16",
        light: "#ffffff",
      },
    })
      .then((data) => setQrDataUrl(data))
      .catch(() => {});
  }, []);


  // 3D Tilt calculation
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 14;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    playTechSound("scan", muted);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  const flipCard = () => {
    playTechSound("flip", muted);
    setIsFlipped((prev) => !prev);
  };

  const copyTag = (tag: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(tag).then(() => {
        playTechSound("copy", muted);
        setCopiedId(id);
        if (typeof window !== "undefined" && window.__trackVisitorAction) {
          window.__trackVisitorAction(`Copied ${id.toUpperCase()} Tag`);
        }
        setTimeout(() => setCopiedId(null), 2200);
      }).catch(() => {});
    }
  };

  const copyPassportShareLink = () => {
    if (typeof window === "undefined" || !navigator?.clipboard) return;
    const shareUrl = `${window.location.origin}#passport`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      playTechSound("copy", muted);
      setPassportLinkCopied(true);
      setTimeout(() => setPassportLinkCopied(false), 2200);
    }).catch(() => {});
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted((prev) => !prev);
  };

  if (passport?.enabled === false) return null;

  return (
    <div className="gamer-passport-container w-full my-6 perspective-[1200px] select-none" id="passport">
      {/* Outer Section Controls */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
          </span>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-600 dark:text-white/70 flex items-center gap-1.5 font-medium">
            <IdCard size={14} className="text-[var(--accent)]" />
            OFFICIAL GAMER PASSPORT // 3D HOLOGRAPHIC
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5 transition-colors text-xs flex items-center gap-1 font-mono cursor-pointer"
            title={muted ? "Unmute tech audio" : "Mute tech audio"}
            aria-label={muted ? "Unmute tech audio" : "Mute tech audio"}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[var(--accent)]" />}
            <span className="hidden sm:inline text-[10px]">{muted ? "MUTED" : "AUDIO ON"}</span>
          </button>

          <button
            type="button"
            onClick={flipCard}
            className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/80 dark:hover:text-white dark:border-white/10 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer font-medium shadow-xs"
          >
            <RotateCcw size={12} className={isFlipped ? "rotate-180 transition-transform duration-500" : "transition-transform duration-500"} />
            <span>{isFlipped ? "Show Front" : "Flip to QR Pass"}</span>
          </button>
        </div>
      </div>

      {/* 3D Tilt Wrapper */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full cursor-pointer transition-transform duration-200 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.015 : 1})`,
        }}
      >
        {/* Holographic Specular Foil Rainbow Layer */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-30 opacity-30 dark:opacity-40 mix-blend-overlay dark:mix-blend-color-dodge transition-opacity duration-300"
          style={{
            background: isHovered
              ? `radial-gradient(circle 350px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(240, 90, 255, 0.25) 25%, rgba(60, 220, 255, 0.25) 50%, rgba(255, 220, 90, 0.2) 75%, transparent 100%)`
              : "none",
            borderRadius: "1rem",
          }}
        />

        {/* Card Body with 3D Flip */}
        <div
          className="relative w-full transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ======================================================== */}
          {/* FRONT SIDE */}
          {/* ======================================================== */}
          <div
            className="gamer-passport-card-front relative w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-gradient-to-b dark:from-[#161226]/95 dark:via-[#0e0a1b]/95 dark:to-[#07050d]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              boxShadow: isHovered
                ? "var(--passport-shadow-hover, 0 25px 60px -15px rgba(139, 92, 246, 0.35))"
                : "var(--passport-shadow-idle, 0 20px 45px -15px rgba(0, 0, 0, 0.7))",
            }}
          >
            {/* Cyber Circuit Lines & Watermark Background */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 10% 20%, var(--passport-circuit-dot, rgba(255, 255, 255, 0.2)) 1px, transparent 1px),
                  linear-gradient(45deg, var(--passport-circuit-line, rgba(255, 255, 255, 0.05)) 25%, transparent 25%),
                  linear-gradient(-45deg, var(--passport-circuit-line, rgba(255, 255, 255, 0.05)) 25%, transparent 25%)
                `,
                backgroundSize: "24px 24px, 60px 60px, 60px 60px",
              }}
            />

            {/* Glowing Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--accent)] rounded-tl-xl pointer-events-none opacity-80" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--accent)] rounded-tr-xl pointer-events-none opacity-80" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--accent)] rounded-bl-xl pointer-events-none opacity-80" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--accent)] rounded-br-xl pointer-events-none opacity-80" />

            {/* Top Bar: Security & Chip */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                {/* Metallic Smart-Chip Visual */}
                <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-[1.5px] shadow-xs flex items-center justify-center">
                  <div className="w-full h-full bg-amber-950 dark:bg-[#181308] rounded-[2px] grid grid-cols-2 grid-rows-2 gap-[2px] p-[2px] opacity-90">
                    <div className="border-r border-b border-amber-400/50" />
                    <div className="border-b border-amber-400/50" />
                    <div className="border-r border-amber-400/50" />
                    <div />
                  </div>
                </div>

                <div>
                  <h4 className="text-[13px] font-mono font-bold tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    {title}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-semibold border border-[var(--accent)]/30">
                      LIVE ID
                    </span>
                  </h4>
                  <p className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-white/50 uppercase">
                    {tagline}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono tracking-widest text-[var(--accent)] block font-semibold">
                  {clearanceLevel}
                </span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-white/40 block">
                  HEX: #{username.toUpperCase()}-77
                </span>
              </div>
            </div>

            {/* Operator Identification Area */}
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-slate-50/90 dark:bg-white/[0.03] p-4 rounded-xl border border-slate-200/80 dark:border-white/5">
              <div className="flex items-center gap-4">
                {/* Avatar with cyber frame */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-2 ring-[var(--accent)]/50 ring-offset-2 ring-offset-white dark:ring-offset-[#0d091a] shadow-lg flex-shrink-0 bg-slate-100 dark:bg-neutral-900">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold font-mono text-[var(--accent)]">
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0d091a]" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {displayName}
                    </h3>
                    <span className="text-xs font-mono text-slate-500 dark:text-white/60">
                      @{username}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-mono bg-purple-500/10 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-500/25 dark:border-purple-500/30 flex items-center gap-1 font-medium">
                      <Sparkles size={10} /> CALLSIGN: {callsign}
                    </span>
                    <span className="text-[10px] font-mono bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-500/25 dark:border-blue-500/30 flex items-center gap-1 font-medium">
                      <Globe size={10} /> {region}
                    </span>
                    <span className="text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-500/25 dark:border-amber-500/30 flex items-center gap-1 font-medium">
                      <Flame size={10} /> {rankTier}
                    </span>
                  </div>
                </div>
              </div>

              {status && (
                <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-slate-200 dark:border-white/5 pt-2 sm:pt-0">
                  <span className="text-[9px] font-mono text-slate-400 dark:text-white/40 uppercase block">
                    CURRENT STATUS
                  </span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center sm:justify-end gap-1.5 mt-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    {status}
                  </span>
                </div>
              )}
            </div>

            {/* Gamer Tags Grid (1-Click Copy) */}
            <div className="relative z-10 mb-4">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-white/60 mb-2.5 px-0.5">
                <span className="uppercase tracking-widest text-[10px]">
                  PLATFORM IDS // CLICK TO COPY
                </span>
                <span className="text-[10px] text-[var(--accent)] font-semibold">
                  {tags.length} REGISTERED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {tags.map((tagItem) => {
                  const meta = PASSPORT_PLATFORMS[tagItem.platform] || PASSPORT_PLATFORMS.custom;
                  const isCopied = copiedId === tagItem.id;

                  return (
                    <div
                      key={tagItem.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyTag(tagItem.tag, tagItem.id);
                      }}
                      className="group relative flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-[var(--accent)]/40 transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider"
                          style={{
                            backgroundColor: `${meta.color}18`,
                            color: meta.color === "#1b2838" ? "var(--passport-steam-color, #0e5a8a)" : meta.color,
                            border: `1px solid ${meta.color}35`,
                          }}
                        >
                          {meta.badge}
                        </span>

                        <div className="truncate">
                          <span className="text-[10px] font-mono text-slate-500 dark:text-white/50 block leading-tight">
                            {tagItem.label}
                          </span>
                          <span className="text-xs font-mono font-medium text-slate-900 dark:text-white/95 truncate block">
                            {tagItem.tag}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center ml-2 flex-shrink-0">
                        {isCopied ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 dark:border-emerald-500/40 animate-fade-in">
                            <Check size={11} /> COPIED!
                          </span>
                        ) : (
                          <span className="p-1 rounded text-slate-400 dark:text-white/40 group-hover:text-slate-700 dark:group-hover:text-white/90 group-hover:bg-slate-200/60 dark:group-hover:bg-white/10 transition-colors">
                            <Copy size={13} />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Bar: Barcode & Flip Hint */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50">
              {/* Decorative High-Tech Barcode */}
              <div className="flex items-center gap-1 opacity-70">
                <div className="flex items-center gap-[2px] h-4">
                  <div className="w-[1.5px] h-full bg-slate-800 dark:bg-white" />
                  <div className="w-[3px] h-full bg-slate-800 dark:bg-white" />
                  <div className="w-[1px] h-full bg-slate-800 dark:bg-white" />
                  <div className="w-[2px] h-full bg-slate-800 dark:bg-white" />
                  <div className="w-[4px] h-full bg-slate-800 dark:bg-white" />
                  <div className="w-[1px] h-full bg-slate-800 dark:bg-white" />
                  <div className="w-[2.5px] h-full bg-slate-800 dark:bg-white" />
                  <div className="w-[1px] h-full bg-slate-800 dark:bg-white" />
                  <div className="w-[3.5px] h-full bg-slate-800 dark:bg-white" />
                </div>
                <span className="text-[9px] font-mono tracking-widest ml-1 text-slate-500 dark:text-white/50">
                  SN-7729-PASSPORT
                </span>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  flipCard();
                }}
                className="text-[11px] font-mono text-[var(--accent)] hover:opacity-80 transition-opacity flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <span>Click card to view QR Pass &amp; Verification</span>
                <RotateCcw size={12} />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BACK SIDE (QR PASS & EXPORT) */}
          {/* ======================================================== */}
          <div
            className="gamer-passport-card-back absolute inset-0 w-full h-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-gradient-to-b dark:from-[#130f24]/98 dark:via-[#0b0818]/98 dark:to-[#06040c]/98 p-6 sm:p-10 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              boxShadow: isHovered
                ? "var(--passport-shadow-hover, 0 25px 60px -15px rgba(139, 92, 246, 0.35))"
                : "var(--passport-shadow-idle, 0 20px 45px -15px rgba(0, 0, 0, 0.7))",
            }}
          >
            {/* Background Circuit Matrix */}
            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(var(--passport-circuit-dot, rgba(255, 255, 255, 0.4)) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Back Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                    VERIFIED SANCTUM PASSPORT
                  </h4>
                  <p className="text-[9px] font-mono text-slate-500 dark:text-white/50 tracking-widest">
                    PUBLIC CREDENTIAL MATRIX
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                AUTHENTICATED
              </span>
            </div>

            {/* Center QR Code Display */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 my-auto py-2">
              <div className="relative p-3 bg-white rounded-2xl border border-slate-200 dark:border-white/20 shadow-xl flex flex-col items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Sanctum Passport QR"
                    className="w-40 h-40 rounded-lg filter drop-shadow-sm"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center">
                    <QrCode size={48} className="text-black/30 animate-pulse" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-[#0a0714] border-2 border-[var(--accent)] flex items-center justify-center shadow-lg">
                    <Zap size={15} className="text-[var(--accent)]" />
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-600 dark:text-neutral-600 font-bold tracking-wider mt-2 uppercase">
                  SCAN WITH PHONE CAMERA
                </span>
              </div>

              <div className="text-center sm:text-left max-w-xs space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {displayName} Sanctum Card
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-white/60 font-mono mt-1 leading-relaxed">
                    Instantly view full battle specs, verified clips, live steam presence, and tournament milestones.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyPassportShareLink();
                    }}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-[var(--accent)] text-[var(--accent-fg,#090d16)] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
                  >
                    {passportLinkCopied ? (
                      <>
                        <Check size={14} /> LINK COPIED TO CLIPBOARD
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> COPY PASSPORT SHARE LINK
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      flipCard();
                    }}
                    className="w-full px-3.5 py-1.5 rounded-xl text-xs font-mono text-slate-700 hover:text-slate-900 dark:text-white/70 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                  >
                    <RotateCcw size={12} /> Return to Front Details
                  </button>
                </div>
              </div>
            </div>

            {/* Back Footer */}
            <div className="relative z-10 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[9px] font-mono text-slate-500 dark:text-white/40">
              <span>SHA256: 7F4A...B901</span>
              <span>SANCTUM PROTOCOL V2 // 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
