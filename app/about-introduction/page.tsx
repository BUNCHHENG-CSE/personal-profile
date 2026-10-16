import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Link as LinkIcon,
  Mail,
  Play,
  Activity,
  Crosshair,
  Hexagon,
  Cpu,
  Terminal,
  Zap,
  Radio,
  Volume2,
} from "lucide-react";
import { publicProfile } from "@/lib/data";
import { isYouTubeUrl, extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/youtube";
import { ModeToggle } from "@/components/mode-toggle";
import { DiscordPresence } from "@/components/discord-presence";
import { SteamPresence } from "@/components/steam-presence";
import { GamingShelf } from "@/components/gaming-shelf";
import { ClipsShowcase } from "@/components/clips-showcase";
import { TournamentsTimeline } from "@/components/tournaments-timeline";
import { RigSpecs } from "@/components/rig-specs";
import { GamerPassport } from "@/components/gamer-passport";
import { SkillMatrix } from "@/components/skill-matrix";
import { ArcadeKudos } from "@/components/arcade-kudos";
import { VisitorTracker } from "@/components/visitor-tracker";
import { VisitorGuestbook } from "@/components/visitor-guestbook";
import { ChillLoungePlayer } from "@/components/chill-lounge-player";
import { CasualCorner } from "@/components/casual-corner";
import { PotatoPcGuide } from "@/components/potato-pc-guide";
import { ThemeMatrixSwitcher } from "@/components/theme-matrix-switcher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AboutIntroductionPage() {
  const profile = await publicProfile();
  const theme = profile.theme.configuration;

  const style = {
  "--accent": theme.accent,
  "--glow": theme.glow,
  "--blur": theme.blur,
  "--profile-font":
    theme.font === "mono"
      ? "var(--font-mono)"
      : "var(--font-sans)",
} as React.CSSProperties;

  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", { hour12: false });
  const dateString = now.toISOString().slice(0, 10);

  const hasAudio = Boolean(profile.musicUrl && profile.musicUrl.trim().length > 0);

  return (
    <main
      className={`min-h-screen bg-slate-50 dark:bg-[#0a0714] text-slate-900 dark:text-white selection:bg-[var(--accent)] selection:text-[var(--accent-fg,#090d16)] relative overflow-hidden ${theme.background}`}
      style={style}
    >
      <ThemeMatrixSwitcher config={profile.gamingSetup?.themeMatrix} />
      <ChillLoungePlayer config={profile.gamingSetup?.chillLounge} />
      <VisitorTracker analyticsEnabled={profile.analyticsEnabled} />
      {/* Dark Mode Ambient Glow tinted by accent */}
      <div
        className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 800px 500px at 50% -10%, color-mix(in srgb, var(--accent) 15%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 600px 400px at 80% 20%, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 50%),
            radial-gradient(ellipse 700px 500px at 10% 60%, color-mix(in srgb, var(--accent) 6%, transparent) 0%, transparent 55%),
            linear-gradient(180deg, #0a0714 0%, #080510 50%, #050308 100%)
          `,
        }}
      />
      {/* Light Mode Ambient Glow tinted by accent */}
      <div
        className="absolute inset-0 pointer-events-none z-0 block dark:hidden"
        style={{
          background: `
            radial-gradient(ellipse 800px 500px at 50% -10%, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 600px 400px at 80% 20%, color-mix(in srgb, var(--accent) 6%, transparent) 0%, transparent 50%),
            linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)
          `,
        }}
      />

      {/* High-Density Radar Grid Background (Dark) */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.12] hidden dark:block"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "3rem 3rem",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      {/* High-Density Radar Grid Background (Light) */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.16] block dark:hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "3rem 3rem",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      {/* Scanline Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.025] hidden dark:block"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)",
        }}
      />

      {/* Warm HUD Glow — top center, matching main page */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none z-0 opacity-[0.12] blur-[140px]"
        style={{ background: "var(--glow)" }}
      />

      {/* Vignette — darker edges (dark mode only) */}
      <div
        className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 pt-8 pb-32">
        {/* Angular HUD Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-24 gap-6 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-widest uppercase text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white bg-white/70 dark:bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 transition-all border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30"
              style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 0% 100%)" }}
            >
              <ArrowLeft size={14} />
              SYS.RETURN
            </Link>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] uppercase text-slate-400 dark:text-white/30">
              <Crosshair size={12} style={{ color: "var(--accent)" }} />
              ARZUR.SANCTUM // SEC-04
            </div>
          </div>

          <div className="flex items-center gap-6 text-[10px] font-mono tracking-widest uppercase">
            <span className="hidden md:flex items-center gap-2 text-slate-500 dark:text-white/40" suppressHydrationWarning>
              <Radio size={10} className="animate-pulse" />
              {dateString} · {timeString}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-white/40">STATUS:</span>
              <span
                className="flex items-center gap-2"
                style={{ color: "var(--accent)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-current" />
                {profile.status?.toUpperCase() || "ONLINE"}
              </span>
            </span>
            <ModeToggle />
          </div>
        </header>

        {/* Massive Kinetic Typography */}
        <section className="mb-32 md:mb-48 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.8] uppercase text-slate-900 dark:text-white">
                More Than <br />
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--accent), var(--fg, #0f172a))`,
                  }}
                >
                  What&apos;s On Screen.
                </span>
              </h1>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-end space-y-6 lg:pb-4">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-slate-500 dark:text-white/40">
                <Terminal size={12} />
                DATA.READOUT // 001
              </div>
              <p
                className="text-slate-600 dark:text-white/60 leading-relaxed font-mono text-sm border-l-2 pl-4"
                style={{ borderColor: "var(--accent)" }}
              >
                <span className="text-[var(--accent)]">&gt;</span> You clicked
                the link. Here is the full story. I&apos;m {profile.displayName},
                a developer building things for the web. This is my digital
                sanctum.
              </p>
            </div>
          </div>
        </section>

        {/* HUD Dashboard Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Module 1: The Story (DATA_STREAM) */}
          <div
            className="lg:col-span-7 border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-white/[0.02] shadow-sm dark:shadow-none backdrop-blur-md p-8 md:p-12 relative group"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-8 h-8 border-t border-r"
              style={{ borderColor: "var(--accent)" }}
            />
            <h2 className="text-xs font-mono tracking-[0.3em] uppercase mb-8 flex items-center gap-3 text-slate-600 dark:text-white/50">
              <Activity size={14} style={{ color: "var(--accent)" }} />
              01 // DATA_STREAM
            </h2>
            <div className="space-y-6 text-slate-700 dark:text-white/70 leading-relaxed font-mono text-sm">
              <p>
                <span className="text-[var(--accent)] mr-2">&gt;</span>
                {profile.bio}
              </p>
              <p>
                <span className="text-[var(--accent)] mr-2">&gt;</span>
                When I&apos;m not pushing pixels or debugging code, I&apos;m
                usually chilling in my own corner of the internet, exploring new
                tech, or curating the links you see on my profile.
              </p>
            </div>
          </div>

          {/* Module 2: Network Connections */}
          <div
            className="lg:col-span-5 border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-white/[0.02] shadow-sm dark:shadow-none backdrop-blur-md p-8 md:p-12 relative group"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
            }}
          >
            <div
              className="absolute top-0 left-0 w-8 h-8 border-t border-l"
              style={{ borderColor: "var(--accent)" }}
            />
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-mono tracking-[0.3em] uppercase flex items-center gap-3 text-slate-600 dark:text-white/50">
                <LinkIcon size={14} />
                02 // NETWORK_NODES
              </h2>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 dark:text-white/30">
                {String(profile.socialLinks.length).padStart(2, "0")} / 12
              </span>
            </div>

            {profile.socialLinks.length > 0 ? (
              <ul className="space-y-2">
                {profile.socialLinks.map((link, i) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2.5 border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] text-[10px] font-mono text-slate-700 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:border-[var(--accent)] hover:text-slate-900 dark:hover:text-white transition-all cursor-crosshair group/link"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: "var(--accent)" }}
                        />
                        <span className="tracking-widest uppercase truncate">
                          {link.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[8px] text-slate-400 dark:text-white/30 group-hover/link:text-slate-700 dark:group-hover/link:text-white/60">
                          CH.{String(i + 1).padStart(2, "0")}
                        </span>
                        <ArrowUpRight
                          size={10}
                          className="opacity-40 group-hover/link:opacity-100 transition-opacity"
                        />
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[10px] font-mono text-slate-400 dark:text-white/40 py-4">
                NO NODES CONNECTED
              </p>
            )}
          </div>

          {/* Module 3: Telemetry / Status */}
          <div
            className={`${
              hasAudio ? "lg:col-span-4" : "lg:col-span-12"
            } border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-white/[0.02] shadow-sm dark:shadow-none backdrop-blur-md p-8 relative group`}
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-8 h-8 border-t border-r"
              style={{ borderColor: "var(--accent)" }}
            />
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-mono tracking-[0.3em] uppercase flex items-center gap-3 text-slate-600 dark:text-white/50">
                <Zap size={14} style={{ color: "var(--accent)" }} />
                03 // TELEMETRY
              </h2>
              {!hasAudio && (
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-slate-500 dark:text-white/40">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "var(--accent)" }}
                  />
                  <span>SYS.ONLINE // NOMINAL</span>
                </div>
              )}
            </div>

            {hasAudio ? (
              <>
                <ul className="space-y-4">
                  {[
                    { label: "STATUS", value: profile.status || "CHILLING" },
                    { label: "HANDLE", value: `@${profile.username}` },
                    { label: "SYS_DATE", value: dateString },
                    { label: "SYS_TIME", value: timeString },
                  ].map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-2"
                    >
                      <span className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-white/40">
                        {item.label}
                      </span>
                      <span className="text-xs font-mono text-slate-800 dark:text-white/80 truncate ml-2">
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex items-center gap-2 text-[10px] font-mono text-slate-600 dark:text-white/50">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "var(--accent)" }}
                  />
                  SYS.ONLINE // NOMINAL
                </div>

                {profile.discordId && (
                  <div className="mt-4">
                    <DiscordPresence
                      discordId={profile.discordId}
                      initialPresence={profile.discordPresence}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className={profile.discordId ? "lg:col-span-5" : "lg:col-span-12"}>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                    {[
                      { label: "STATUS", value: profile.status || "CHILLING" },
                      { label: "HANDLE", value: `@${profile.username}` },
                      { label: "SYS_DATE", value: dateString },
                      { label: "SYS_TIME", value: timeString },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-3.5 border border-slate-200/60 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.015]"
                      >
                        <span className="text-[9px] font-mono tracking-widest uppercase text-slate-500 dark:text-white/40 block mb-1">
                          {item.label}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-800 dark:text-white/90 truncate block">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-white/40 flex items-center justify-between py-2 border-t border-slate-200/60 dark:border-white/5">
                    <span>TELEMETRY_LINK</span>
                    <span className="text-slate-700 dark:text-white/70 font-semibold">SYNCHRONIZED</span>
                  </div>
                </div>

                {profile.discordId ? (
                  <div className="lg:col-span-7">
                    <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400 dark:text-white/40 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE_TRANSMISSION // DISCORD_PRESENCE
                    </div>
                    <DiscordPresence
                      discordId={profile.discordId}
                      initialPresence={profile.discordPresence}
                    />
                  </div>
                ) : (
                  <div className="hidden lg:flex lg:col-span-12 pt-2 border-t border-slate-200/60 dark:border-white/5 items-center justify-between text-[10px] font-mono text-slate-400 dark:text-white/40">
                    <span>SEC-04 // SANCTUM TELEMETRY BUFFER</span>
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      ALL SYSTEMS OPERATIONAL
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Module 4: Audio Stream (only when musicUrl exists) */}
          {profile.musicUrl && (
            <div
              className="lg:col-span-8 border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-white/[0.02] shadow-sm dark:shadow-none backdrop-blur-md p-8 md:p-12 relative group flex flex-col md:flex-row items-start md:items-center gap-8"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
              }}
            >
              <div
                className="absolute top-0 right-0 w-8 h-8 border-t border-r"
                style={{ borderColor: "var(--accent)" }}
              />

              <div className="flex-1 min-w-0 w-full">
                <h2 className="text-xs font-mono tracking-[0.3em] uppercase mb-6 flex items-center gap-3 text-slate-600 dark:text-white/50">
                  <Volume2 size={14} style={{ color: "var(--accent)" }} />
                  04 // AUDIO_STREAM
                </h2>

                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-12 h-12 flex items-center justify-center shrink-0"
                    style={{
                      background: "var(--accent)",
                      color: "var(--accent-fg, #000)",
                      clipPath:
                        "polygon(0 0, 100% 0, 90% 100%, 0% 100%)",
                    }}
                  >
                    <Play size={16} className="ml-0.5" fill="currentColor" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-mono tracking-tight text-slate-900 dark:text-white truncate">
                      {profile.trackTitle || "UNTITLED_TRACK"}
                    </p>
                    <p className="text-[10px] font-mono tracking-widest text-slate-500 dark:text-white/40 uppercase truncate">
                      {profile.trackArtist || "UNKNOWN_ARTIST"}
                    </p>
                  </div>
                </div>

                {isYouTubeUrl(profile.musicUrl) && extractYouTubeId(profile.musicUrl) ? (
                  <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 mt-2 bg-black/40">
                    <iframe
                      src={getYouTubeEmbedUrl(profile.musicUrl, { autoplay: true })}
                      title="Audio Stream"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <>
                    {/* Audio Waveform */}
                    <div className="flex items-end gap-[2px] h-10 mb-5">
                      {[...Array(48)].map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 animate-pulse"
                          style={{
                            height: `${Math.abs(Math.sin(i * 0.5)) * 80 + 20}%`,
                            background:
                              i % 4 === 0
                                ? "var(--accent)"
                                : "var(--line-strong, rgba(125,125,125,0.2))",
                            animationDelay: `${i * 0.03}s`,
                          }}
                        />
                      ))}
                    </div>

                    <audio
                      controls
                      src={profile.musicUrl}
                      className="w-full h-8 opacity-60 hover:opacity-100 transition-opacity"
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Module: Game Vault & Battlestation */}
          {((profile.favoriteGames && profile.favoriteGames.length > 0) ||
            Boolean(profile.steamId) ||
            (profile.gamingSetup && Object.keys(profile.gamingSetup).length > 0)) && (
            <div
              className="lg:col-span-12 border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-white/[0.02] shadow-sm dark:shadow-none backdrop-blur-md p-8 md:p-12 relative group"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-8 h-8 border-t border-r"
                style={{ borderColor: "var(--accent)" }}
              />
              <div className="space-y-6">
                <GamerPassport
                  passport={profile.gamingSetup?.passport}
                  displayName={profile.displayName}
                  username={profile.username}
                  avatarUrl={profile.avatarUrl}
                  status={profile.status}
                  discordId={profile.discordId}
                  steamId={profile.steamId}
                />
                <SkillMatrix config={profile.gamingSetup?.skillMatrix} />
                {profile.steamId && (
                  <SteamPresence
                    steamId={profile.steamId}
                    initialData={profile.steamProfile}
                    variant="full"
                  />
                )}
                {profile.favoriteGames && profile.favoriteGames.length > 0 && (
                  <div id="games">
                    <GamingShelf games={profile.favoriteGames} />
                  </div>
                )}
                {profile.gamingSetup?.clips && profile.gamingSetup.clips.length > 0 && (
                  <div id="clips">
                    <ClipsShowcase clips={profile.gamingSetup.clips} />
                  </div>
                )}
                {profile.gamingSetup?.tournaments && profile.gamingSetup.tournaments.length > 0 && (
                  <div id="tournaments">
                    <TournamentsTimeline tournaments={profile.gamingSetup.tournaments} />
                  </div>
                )}
                {profile.gamingSetup && Object.keys(profile.gamingSetup).length > 0 && (
                  <div id="specs">
                    <RigSpecs gear={profile.gamingSetup} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module: Arcade Kudos Reactions */}
          {profile.gamingSetup?.kudos?.enabled !== false && (
            <div className="lg:col-span-12">
              <ArcadeKudos initialKudos={profile.gamingSetup?.kudos} />
            </div>
          )}

          {/* Module: Casual Corner & Cozy Games Shelf */}
          {profile.gamingSetup?.casualCorner?.enabled !== false && (
            <div className="lg:col-span-12">
              <CasualCorner config={profile.gamingSetup?.casualCorner} />
            </div>
          )}

          {/* Module: Potato PC / Low-Spec Tuning Guide */}
          {profile.gamingSetup?.potatoPcGuide?.enabled !== false && (
            <div className="lg:col-span-12">
              <PotatoPcGuide config={profile.gamingSetup?.potatoPcGuide} />
            </div>
          )}

          {/* Module: Arcade Visitor Guestbook */}
          {profile.gamingSetup?.guestbook?.enabled !== false && (
            <div className="lg:col-span-12">
              <VisitorGuestbook config={profile.gamingSetup?.guestbook} />
            </div>
          )}

          {/* Module: Connect */}
          <div
            className="lg:col-span-12 border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-white/[0.02] shadow-sm dark:shadow-none backdrop-blur-md p-8 md:p-12 relative group flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
            }}
          >
            <div
              className="absolute top-0 right-0 w-8 h-8 border-t border-r"
              style={{ borderColor: "var(--accent)" }}
            />
            <div>
              <h2 className="text-xs font-mono tracking-[0.3em] uppercase mb-4 flex items-center gap-3 text-slate-600 dark:text-white/50">
                <Cpu size={14} style={{ color: "var(--accent)" }} />
                {hasAudio ? "05" : "04"} {"//"} ESTABLISH_CONNECTION
              </h2>
              <p className="text-slate-600 dark:text-white/60 max-w-md leading-relaxed font-mono text-sm">
                I&apos;m always open to discussing new projects, creative ideas,
                or opportunities to be part of your vision.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link
                href="/#links"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-mono tracking-widest uppercase transition-transform hover:scale-105"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-fg, #000)",
                  clipPath: "polygon(0 0, 100% 0, 95% 100%, 0% 100%)",
                }}
              >
                Find me online <ArrowUpRight size={14} />
              </Link>
              <a
                href={`mailto:hello@${profile.username}.com`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] text-xs font-mono tracking-widest uppercase text-slate-800 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 95% 100%, 0% 100%)",
                }}
              >
                Email me <Mail size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Kinetic Marquee Footer */}
        <footer className="mt-32 pt-8 border-t border-slate-200 dark:border-white/10">
          <div className="flex overflow-hidden whitespace-nowrap">
            <div className="flex animate-[marquee_20s_linear_infinite]">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-8 mx-4 text-[10px] font-mono tracking-[0.3em] uppercase text-slate-400 dark:text-white/30"
                >
                  <span>© {new Date().getFullYear()} ARZUR SANCTUM.</span>
                  <Hexagon size={10} style={{ color: "var(--accent)" }} />
                  <span>ALL RIGHTS RESERVED</span>
                  <Hexagon size={10} style={{ color: "var(--accent)" }} />
                  <span>SEC-04 // DIGITAL SPACE</span>
                  <Hexagon size={10} style={{ color: "var(--accent)" }} />
                </div>
              ))}
            </div>
          </div>
        </footer>
      </div>

      {/* Marquee Animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `,
        }}
      />
    </main>
  );
}