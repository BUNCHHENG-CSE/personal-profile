"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Camera,
  Check,
  Code2,
  Copy,
  Eye,
  Link2,
  MessageCircle,
  Music2,
  Pause,
  Play,
  PlaySquare,
  Send,
  Volume2,
  Zap,
} from "lucide-react";
import type { publicProfile } from "@/lib/data";
import {
  isYouTubeUrl,
  extractYouTubeId,
  getYouTubeEmbedUrl,
} from "@/lib/youtube";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { DiscordPresence } from "@/components/discord-presence";
import { SteamPresence } from "@/components/steam-presence";
import { ClipsShowcase } from "@/components/clips-showcase";
import { TournamentsTimeline } from "@/components/tournaments-timeline";
import { GamerPassport } from "@/components/gamer-passport";
import { SkillMatrix } from "@/components/skill-matrix";
import { ArcadeKudos } from "@/components/arcade-kudos";
import { VisitorTracker } from "@/components/visitor-tracker";
import { VisitorGuestbook } from "@/components/visitor-guestbook";
import { ChillLoungePlayer } from "@/components/chill-lounge-player";
import { CasualCorner } from "@/components/casual-corner";
import { PotatoPcGuide } from "@/components/potato-pc-guide";
import { ThemeMatrixSwitcher } from "@/components/theme-matrix-switcher";
import { BattlestationRig } from "@/components/battlestation-rig";
import { ReactionChallenge } from "@/components/reaction-challenge";
import { LowSpecAdvisor } from "@/components/low-spec-advisor";
import { PartyBeacon } from "@/components/party-beacon";
import { GamingJournal } from "@/components/gaming-journal";

type Profile = Awaited<ReturnType<typeof publicProfile>>;
type SocialIcon = typeof Link2;
const icons: Record<string, SocialIcon> = {
  github: Code2,
  instagram: Camera,
  youtube: PlaySquare,
  discord: MessageCircle,
  telegram: Send,
  tiktok: PlaySquare,
};

export function ProfileView({
  profile,
  views,
  messages,
}: {
  profile: Profile;
  views: number;
  messages: { id: string; content: string }[];
}) {
  const theme = profile.theme.configuration;
  const [visitorColorway, setVisitorColorway] = useState<{ accent: string; glow: number; fg?: string } | null>(null);
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState("");
  const [feedback, setFeedback] = useState<{
    text: string;
    error: boolean;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(100);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      if (!window.location.hash || window.location.hash === "#top") {
        window.scrollTo(0, 0);
      }
    }
  }, []);



  useEffect(() => {
    if (!profile.musicUrl || !isYouTubeUrl(profile.musicUrl)) return;
    const playIframe = () => {
      const iframe = document.querySelector<HTMLIFrameElement>(".youtube-player-iframe");
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      }
    };
    window.addEventListener("click", playIframe, { once: true });
    window.addEventListener("touchstart", playIframe, { once: true });
    window.addEventListener("keydown", playIframe, { once: true });
    return () => {
      window.removeEventListener("click", playIframe);
      window.removeEventListener("touchstart", playIframe);
      window.removeEventListener("keydown", playIframe);
    };
  }, [profile.musicUrl]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, website }),
      });
      if (!response.ok) throw new Error();
      setContent("");
      setFeedback({
        text: "Your note is on its way. Thanks for reaching out!",
        error: false,
      });
    } catch {
      setFeedback({
        text: "Your note could not be sent. Please try again later.",
        error: true,
      });
    } finally {
      setSending(false);
    }
  }

  function track(id: string) {
    if (profile.analyticsEnabled)
      void fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "social_link_click",
          pagePath: "/",
          linkId: id,
        }),
        keepalive: true,
      }).catch(() => {});
  }

  async function toggleAudio() {
    const element = audio.current;
    if (!element) return;
    try {
      if (element.paused) {
        element.volume = volume / 100;
        await element.play();
        setPlaying(true);
      } else {
        element.pause();
        setPlaying(false);
      }
    } catch {
      setFeedback({
        text: "This audio could not be played right now.",
        error: true,
      });
    }
  }

  async function copyLink() {
    try {
      const shareUrl = `${window.location.origin}/about-introduction`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setFeedback({
        text: "Could not copy the link. You can copy it from your address bar.",
        error: true,
      });
    }
  }

  const currentAccent = visitorColorway?.accent ?? theme.accent;
  const currentGlow = visitorColorway?.glow ?? theme.glow;
  const currentAccentFg = visitorColorway?.fg ?? (currentAccent === "#ef4444" ? "#ffffff" : "#0d091a");

  const style = {
    "--accent": currentAccent,
    "--glow": `${currentGlow}`,
    "--blur": theme.blur,
    "--accent-fg": currentAccentFg,
    "--profile-font":
      theme.font === "mono"
        ? "var(--font-mono)"
        : "var(--font-sans)",
  } as React.CSSProperties;

  const isPassportEnabled = profile.gamingSetup?.passport?.enabled !== false;
  const isSkillsEnabled = profile.gamingSetup?.skillMatrix?.enabled !== false;
  const isKudosEnabled = profile.gamingSetup?.kudos?.enabled !== false;
  const isCasualCornerEnabled = profile.gamingSetup?.casualCorner?.enabled !== false;
  const isPotatoPcEnabled = profile.gamingSetup?.potatoPcGuide?.enabled !== false;
  const isPotatoRigEnabled = profile.gamingSetup?.potatoRig?.enabled !== false;
  const isSpecAdvisorEnabled = profile.gamingSetup?.specAdvisor?.enabled !== false;
  const isReactionGameEnabled = profile.gamingSetup?.reactionGame?.enabled !== false;
  const isPartyBeaconEnabled = profile.gamingSetup?.partyBeacon?.enabled !== false;
  const isJournalEnabled = profile.gamingSetup?.gamingJournal?.enabled !== false;
  const hasClips = Boolean(profile.gamingSetup?.clips?.length);
  const hasTournaments = Boolean(profile.gamingSetup?.tournaments?.length);
  const isGuestbookEnabled = profile.gamingSetup?.guestbook?.enabled !== false;

  let counter = 1;
  const passportNumber = isPassportEnabled ? ++counter : null;
  const skillsNumber = isSkillsEnabled ? ++counter : null;
  const casualNumber = isCasualCornerEnabled ? ++counter : null;
  const potatoNumber = isPotatoPcEnabled ? ++counter : null;
  const rigNumber = isPotatoRigEnabled ? ++counter : null;
  const advisorNumber = isSpecAdvisorEnabled ? ++counter : null;
  const reactionNumber = isReactionGameEnabled ? ++counter : null;
  const beaconNumber = isPartyBeaconEnabled ? ++counter : null;
  const journalNumber = isJournalEnabled ? ++counter : null;
  const clipsNumber = hasClips ? ++counter : null;
  const tournamentsNumber = hasTournaments ? ++counter : null;
  const guestbookNumber = isGuestbookEnabled ? ++counter : null;
  const messageNumber = ++counter;

  return (
    <main id="top" className={`public-scene scene ${theme.background}`} style={style}>
      <ThemeMatrixSwitcher
        config={profile.gamingSetup?.themeMatrix}
        defaultAccent={theme.accent}
        defaultGlow={theme.glow}
        onColorwayChange={setVisitorColorway}
      />
      <ChillLoungePlayer config={profile.gamingSetup?.chillLounge} />
      <VisitorTracker analyticsEnabled={profile.analyticsEnabled} />
      <div className="public-shell">
        <header className="public-topbar">
          <a href="#top" className="public-brand">
            <span className="public-brand-mark">
              <Zap size={18} fill="currentColor" />
            </span>
            <strong>
              Arzur Sanctum<span>.</span>
            </strong>
          </a>
          <nav aria-label="Public navigation">
            <a href="#about">About</a>
            <a href="#links">Links</a>
            {profile.messagesEnabled && <a href="#message">Say hello</a>}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ModeToggle />
            <a className="public-top-action" href="#links">
              Explore <ArrowUpRight size={15} />
            </a>
          </div>
        </header>

        <div className="public-overline">
          <span className="public-overline-rule" />
          <span>THE PERSON BEHIND THE PROFILE</span>
          <span className="public-overline-index">001 / DIGITAL SPACE</span>
        </div>

        <section className="public-hero">
          <div className="public-hero-copy">
            <div className="public-presence">
              <span className="presence-dot" /> Welcome to {profile.displayName}{" "}
              Sanctum.
            </div>
            <h1 className="font-display tracking-tighter">
              Hey, I&apos;m
              <br />
              <em>{profile.displayName}.</em>
            </h1>

            <p className="public-hero-description">{profile.bio}</p>
            <div className="public-hero-actions">
              <a className="public-button public-button-primary" href="#links">
                Find me online <ArrowUpRight size={18} />
              </a>
              {profile.messagesEnabled && (
                <a
                  className="public-button public-button-outline"
                  href="#message"
                >
                  Leave a note <ArrowDownRight size={18} />
                </a>
              )}
            </div>
            <div className="public-hero-proof">
              <span className="proof-line" />
              <span>
                <Eye size={15} /> {views.toLocaleString()} visits to this space
              </span>
            </div>
          </div>

          <div className="public-card-wrap">
            <div className="public-card-orbit" aria-hidden="true" />
            <article className={`profile-card ${theme.card}`} id="links">
              <div className="profile-banner">
                {profile.bannerUrl && <img src={profile.bannerUrl} alt="" />}
                <span className="banner-mark">✦</span>
              </div>
              <div className="profile-card-body">
                <div className="profile-card-heading">
                  <div className="profile-avatar">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={`${profile.displayName} avatar`}
                      />
                    ) : (
                      profile.displayName.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  {profile.status && (
                    <span className="profile-status">
                      <span />
                      {profile.status}
                    </span>
                  )}
                </div>
                <h2>{profile.displayName}</h2>
                <span className="profile-handle">
                  <AtSign size={13} />
                  {profile.username}
                </span>
                <p className="profile-card-bio">{profile.bio}</p>
                {profile.discordId && (
                  <div className="mt-3">
                    <DiscordPresence
                      discordId={profile.discordId}
                      initialPresence={profile.discordPresence}
                    />
                  </div>
                )}
                {profile.steamId && (
                  <div className="mt-2.5">
                    <SteamPresence
                      steamId={profile.steamId}
                      initialData={profile.steamProfile}
                      variant="compact"
                    />
                  </div>
                )}
                <div className="profile-separator" />
                <div className="profile-links-heading">
                  <span>CONNECT WITH ME</span>
                  <span>
                    {String(profile.socialLinks.length).padStart(2, "0")} LINKS
                  </span>
                </div>
                <div className="profile-links">
                  {profile.socialLinks.length ? (
                    profile.socialLinks.map((link) => {
                      const Icon = icons[link.id] || Link2;
                      return (
                        <a
                          href={link.url}
                          key={link.id}
                          className="profile-social-link"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track(link.id)}
                        >
                          <span className="social-icon">
                            <Icon size={18} />
                          </span>
                          <strong>{link.label}</strong>
                          <ArrowUpRight size={17} className="social-arrow" />
                        </a>
                      );
                    })
                  ) : (
                    <p className="profile-empty-links">
                      Links will appear here soon.
                    </p>
                  )}
                </div>
                {profile.musicUrl && (
                  <>
                    <div className="profile-separator" />
                    {isYouTubeUrl(profile.musicUrl) && extractYouTubeId(profile.musicUrl) ? (
                      <div className="youtube-music-container">
                        <div className="music-player">
                          <div className="music-cover youtube">
                            <PlaySquare size={21} />
                          </div>
                          <div className="music-meta">
                            <strong>
                              {profile.trackTitle || "Profile soundtrack"}
                            </strong>
                            <span>{profile.trackArtist || "YouTube Soundtrack"}</span>
                          </div>
                          <span className="badge-youtube">
                            <PlaySquare size={12} /> YouTube
                          </span>
                        </div>
                        <div className="youtube-player-frame-wrap">
                          <iframe
                            src={getYouTubeEmbedUrl(profile.musicUrl, { autoplay: true })}
                            title="Profile soundtrack"
                            className="youtube-player-iframe"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="music-player">
                          <div className="music-cover">
                            <Music2 size={21} />
                          </div>
                          <div className="music-meta">
                            <strong>
                              {profile.trackTitle || "Untitled track"}
                            </strong>
                            <span>{profile.trackArtist || "Unknown artist"}</span>
                          </div>
                          <button
                            type="button"
                            className="music-toggle"
                            aria-label={playing ? "Pause music" : "Play music"}
                            onClick={toggleAudio}
                          >
                            {playing ? (
                              <Pause size={16} fill="currentColor" />
                            ) : (
                              <Play size={16} fill="currentColor" />
                            )}
                          </button>
                        </div>
                        <div className="music-controls">
                          <span>
                            {Math.floor(progress / 60)}:
                            {String(Math.floor(progress % 60)).padStart(2, "0")}
                          </span>
                          <input
                            type="range"
                            aria-label="Track position"
                            min={0}
                            max={duration}
                            value={progress}
                            onChange={(event) => {
                              if (audio.current)
                                audio.current.currentTime = Number(
                                  event.target.value,
                                );
                              setProgress(Number(event.target.value));
                            }}
                          />
                          <Volume2 size={14} />
                          <input
                            type="range"
                            aria-label="Volume"
                            min={0}
                            max={100}
                            value={volume}
                            onChange={(event) => {
                              setVolume(Number(event.target.value));
                              if (audio.current)
                                audio.current.volume =
                                  Number(event.target.value) / 100;
                            }}
                          />
                          <audio
                            ref={audio}
                            src={profile.musicUrl}
                            onLoadedMetadata={(event) =>
                              setDuration(
                                Number.isFinite(event.currentTarget.duration)
                                  ? event.currentTarget.duration
                                  : 100,
                              )
                            }
                            onTimeUpdate={(event) =>
                              setProgress(event.currentTarget.currentTime)
                            }
                            onEnded={() => setPlaying(false)}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </article>
            <div className="public-card-caption">
              <span>● &nbsp; LIVE PROFILE</span>
              <span>CURATED BY {profile.username.toUpperCase()}</span>
            </div>
          </div>
        </section>

        <section className="public-about" id="about">
          <div className="public-section-label">
            <span>01 / ABOUT</span>
            <span className="public-section-rule" />
          </div>
          <div className="about-content">
            <div>
              <p className="public-kicker">A QUICK INTRODUCTION</p>
              <h2>
                More than
                <br />
                <em>what’s on screen.</em>
              </h2>
            </div>
            <div className="about-aside">
              <p>{profile.bio}</p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", marginTop: "11px" }}>
                <Link href="/about-introduction" className="copy-link">
                  <span>Explore full sanctum & battlestation</span>
                  <ArrowRight size={16} />
                </Link>
                <button type="button" className="copy-link" onClick={copyLink}>
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                  {copied ? "Profile link copied" : "Copy profile link"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3D Holographic Gamer Passport */}
        {isPassportEnabled && (
          <section className="public-passport-section" id="passport">
            <div className="public-section-label">
              <span>{String(passportNumber).padStart(2, "0")} / GAMER PASSPORT</span>
              <span className="public-section-rule" />
            </div>
            <GamerPassport
              passport={profile.gamingSetup?.passport}
              displayName={profile.displayName}
              username={profile.username}
              avatarUrl={profile.avatarUrl}
              status={profile.status}
              discordId={profile.discordId}
              steamId={profile.steamId}
            />
          </section>
        )}

        {/* RPG Skill Matrix & Playstyle Hexagon */}
        {isSkillsEnabled && (
          <section className="public-skills-section" id="skills">
            <div className="public-section-label">
              <span>{String(skillsNumber).padStart(2, "0")} / COMBAT MATRIX</span>
              <span className="public-section-rule" />
            </div>
            <SkillMatrix config={profile.gamingSetup?.skillMatrix} />
          </section>
        )}

        {isCasualCornerEnabled && (
          <section className="public-casual-section" id="casual-corner">
            <div className="public-section-label">
              <span>{String(casualNumber).padStart(2, "0")} / CASUAL CORNER &amp; COZY SHELF</span>
              <span className="public-section-rule" />
            </div>
            <CasualCorner config={profile.gamingSetup?.casualCorner} />
          </section>
        )}

        {isPotatoPcEnabled && (
          <section className="public-potato-section" id="potato-pc-guide">
            <div className="public-section-label">
              <span>{String(potatoNumber).padStart(2, "0")} / LOW-SPEC PC &amp; FPS TUNING</span>
              <span className="public-section-rule" />
            </div>
            <PotatoPcGuide config={profile.gamingSetup?.potatoPcGuide} />
          </section>
        )}

        {isPotatoRigEnabled && (
          <section className="public-rig-section" id="battlestation-rig">
            <div className="public-section-label">
              <span>{String(rigNumber).padStart(2, "0")} / BATTLESTATION &amp; HARDWARE TELEMETRY</span>
              <span className="public-section-rule" />
            </div>
            <BattlestationRig config={profile.gamingSetup?.potatoRig} />
          </section>
        )}

        {isSpecAdvisorEnabled && (
          <section className="public-advisor-section" id="low-spec-advisor">
            <div className="public-section-label">
              <span>{String(advisorNumber).padStart(2, "0")} / CAN MY PC RUN IT? // SPEC ADVISOR</span>
              <span className="public-section-rule" />
            </div>
            <LowSpecAdvisor config={profile.gamingSetup?.specAdvisor} />
          </section>
        )}

        {isReactionGameEnabled && (
          <section className="public-reaction-section" id="reaction-challenge">
            <div className="public-section-label">
              <span>{String(reactionNumber).padStart(2, "0")} / ARCADE REACTION CHALLENGE</span>
              <span className="public-section-rule" />
            </div>
            <ReactionChallenge config={profile.gamingSetup?.reactionGame} />
          </section>
        )}

        {isPartyBeaconEnabled && (
          <section className="public-beacon-section" id="party-beacon">
            <div className="public-section-label">
              <span>{String(beaconNumber).padStart(2, "0")} / LOOKING FOR PARTY // LFP BEACON</span>
              <span className="public-section-rule" />
            </div>
            <PartyBeacon config={profile.gamingSetup?.partyBeacon} discordId={profile.discordId} />
          </section>
        )}

        {isJournalEnabled && (
          <section className="public-journal-section" id="gaming-journal">
            <div className="public-section-label">
              <span>{String(journalNumber).padStart(2, "0")} / DAILY GAMING MICRO-LOG</span>
              <span className="public-section-rule" />
            </div>
            <GamingJournal config={profile.gamingSetup?.gamingJournal} />
          </section>
        )}

        {hasClips && (
          <section className="public-clips-section" id="clips">
            <div className="public-section-label">
              <span>{String(clipsNumber).padStart(2, "0")} / CLIPS & HIGHLIGHTS</span>
              <span className="public-section-rule" />
            </div>
            <ClipsShowcase clips={profile.gamingSetup?.clips} />
          </section>
        )}

        {hasTournaments && (
          <section className="public-tournaments-section" id="tournaments">
            <div className="public-section-label">
              <span>{String(tournamentsNumber).padStart(2, "0")} / TOURNAMENT HISTORY</span>
              <span className="public-section-rule" />
            </div>
            <TournamentsTimeline tournaments={profile.gamingSetup?.tournaments} />
          </section>
        )}

        {isGuestbookEnabled && (
          <section className="public-guestbook-section" id="guestbook">
            <div className="public-section-label">
              <span>{String(guestbookNumber).padStart(2, "0")} / VISITOR GUESTBOOK &amp; STAMPS</span>
              <span className="public-section-rule" />
            </div>
            <VisitorGuestbook config={profile.gamingSetup?.guestbook} className="mb-10" />
          </section>
        )}

        <section className="public-message-section" id="message">
          <div className="public-section-label">
            <span>
              {String(messageNumber).padStart(2, "0")} / {isKudosEnabled ? "COMMUNITY & KUDOS" : "GET IN TOUCH"}
            </span>
            <span className="public-section-rule" />
          </div>

          {/* 1-Click GG Arcade Kudos Deck */}
          {isKudosEnabled && (
            <ArcadeKudos initialKudos={profile.gamingSetup?.kudos} className="mb-8" />
          )}

          <div className="message-section-grid">
            <div>
              <p className="public-kicker">OPEN LINE</p>
              <h2>
                Say something.
                <br />
                <em>Stay anonymous.</em>
              </h2>
              <p className="message-section-copy">
                A thought, a question, a simple hello. Your note lands privately
                and is reviewed before anything can appear here.
              </p>
              <div className="message-illustration">
                <MessageCircle size={42} strokeWidth={1} />
                <span>GOOD CONVERSATIONS START SOMEWHERE</span>
              </div>
            </div>
            <div className="public-message-card">
              <div className="message-card-heading">
                <span className="message-card-icon">
                  <Send size={20} />
                </span>
                <div>
                  <strong>Leave a note</strong>
                  <span>No account needed</span>
                </div>
              </div>
              {profile.messagesEnabled ? (
                <form onSubmit={submit}>
                  <label
                    className="public-field-label"
                    htmlFor="anonymous-message"
                  >
                    YOUR MESSAGE
                  </label>
                  <textarea
                    id="anonymous-message"
                    className="public-textarea"
                    placeholder="What's on your mind?"
                    rows={6}
                    minLength={2}
                    maxLength={1000}
                    required
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                  />
                  <input
                    className="honeypot"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                  />
                  <div className="message-form-foot">
                    <span>{content.length} / 1000 characters</span>
                    <button
                      className="public-button public-button-primary"
                      type="submit"
                      disabled={sending}
                    >
                      {sending ? "Sending..." : "Send message"}
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                  {feedback && (
                    <p
                      className={`public-feedback ${feedback.error ? "error" : "success"}`}
                      role="status"
                    >
                      {feedback.text}
                    </p>
                  )}
                </form>
              ) : (
                <div className="closed-message">
                  <MessageCircle size={25} />
                  <strong>Messages are closed for now.</strong>
                  <p>Check back another time.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {profile.publicMessages && messages.length > 0 && (
          <section className="public-wall">
            <div className="public-section-label">
              <span>03 / THE WALL</span>
              <span className="public-section-rule" />
            </div>
            <p className="public-kicker">WORDS FROM VISITORS</p>
            <h2>
              Little notes,
              <br />
              <em>big energy.</em>
            </h2>
            <div className="wall-grid">
              {messages.map((message) => (
                <blockquote key={message.id}>
                  <span>“</span>
                  <p>{message.content}</p>
                  <footer>ANONYMOUS VISITOR</footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        <footer className="public-footer">
          <a href="#top" className="public-brand">
            <span className="public-brand-mark">
              <Zap size={16} fill="currentColor" />
            </span>
            <strong>
              Arzur Sanctum<span>.</span>
            </strong>
          </a>
          <span>
            © {new Date().getFullYear()} Arzur Sanctum. All rights reserved.
          </span>
          <a href="#top">Back to top ↑</a>
        </footer>
      </div>
    </main>
  );
}
