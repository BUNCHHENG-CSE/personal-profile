import { ImageResponse } from "next/og";
import { ensureProfile } from "@/lib/data";
import { db } from "@/lib/db";
import { gamingGear } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const profile = await ensureProfile();
    const theme = await db.theme.findFirst({
      where: { profileId: "main", isActive: true },
      orderBy: { createdAt: "asc" },
    });

    const config = (theme?.configuration as Record<string, unknown>) || {};
    const accent = typeof config.accent === "string" ? config.accent : "#bb9aff";
    const gear = gamingGear.safeParse(profile.gamingSetup).data || {};

    const displayName = profile.displayName || "Gamer";
    const username = profile.username || "gamer";
    const bio = profile.bio || "Competitive gamer, tech enthusiast, and builder.";

    // Safely prefetch avatar to base64 data URI to prevent Satori fetch failed crash
    let avatarDataUri: string | null = null;
    if (profile.avatarUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(profile.avatarUrl, {
          signal: controller.signal,
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const contentType = res.headers.get("content-type") || "image/jpeg";
          avatarDataUri = `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
        }
      } catch {
        // Fallback gracefully to monogram on network error or timeout
        avatarDataUri = null;
      }
    }

    const gpu = gear.gpu || gear.laptopGpu || null;
    const cpu = gear.cpu || gear.laptopCpu || null;
    const hardwareBadge = gpu ? `${gpu}` : cpu ? `${cpu}` : "High-Performance Rig";

    const topGame = Array.isArray(profile.favoriteGames) && profile.favoriteGames.length > 0
      ? (profile.favoriteGames[0] as { title?: string })?.title
      : null;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#08090d",
            color: "#ffffff",
            padding: "50px 60px",
            fontFamily: "sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            style={{
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}33 0%, rgba(0,0,0,0) 70%)`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-150px",
              left: "-150px",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%)",
              display: "flex",
            }}
          />

          {/* Top Brand Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: accent,
                  boxShadow: `0 0 16px ${accent}`,
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  letterSpacing: "0.25em",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                GAMER SANCTUM // VERIFIED PROFILE CARD
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#e2e8f0",
                  textTransform: "uppercase",
                }}
              >
                LIVE PROFILE
              </span>
            </div>
          </div>

          {/* Center Identity & Showcase */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "36px",
              width: "100%",
              margin: "20px 0",
            }}
          >
            {/* Avatar or Monogram Frame */}
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "24px",
                border: `3px solid ${accent}`,
                boxShadow: `0 0 30px ${accent}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#13141f",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {avatarDataUri ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarDataUri}
                  alt={displayName}
                  width="140"
                  height="140"
                  style={{ width: "140px", height: "140px", objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{
                    fontSize: "52px",
                    fontWeight: "bold",
                    color: accent,
                  }}
                >
                  {displayName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            {/* Names & Description */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                flex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
                <h1
                  style={{
                    fontSize: "48px",
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: "-0.02em",
                    color: "#ffffff",
                  }}
                >
                  {displayName}
                </h1>
                <span
                  style={{
                    fontSize: "20px",
                    color: accent,
                    fontWeight: 600,
                  }}
                >
                  @{username}
                </span>
              </div>

              <p
                style={{
                  fontSize: "18px",
                  lineHeight: "1.4",
                  color: "#94a3b8",
                  margin: 0,
                  maxWidth: "750px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {bio}
              </p>
            </div>
          </div>

          {/* Bottom Badges & Hardware Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {hardwareBadge && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: accent }}>⚡</span>
                  <span>{hardwareBadge}</span>
                </div>
              )}

              {topGame && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    fontWeight: 600,
                  }}
                >
                  <span>🎮</span>
                  <span>{topGame}</span>
                </div>
              )}

              {profile.steamId && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(102, 192, 244, 0.08)",
                    border: "1px solid rgba(102, 192, 244, 0.25)",
                    fontSize: "13px",
                    color: "#66c0f4",
                    fontWeight: 600,
                  }}
                >
                  <span>STEAM SYNCED</span>
                </div>
              )}

              {profile.discordId && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(88, 101, 242, 0.08)",
                    border: "1px solid rgba(88, 101, 242, 0.25)",
                    fontSize: "13px",
                    color: "#818cf8",
                    fontWeight: 600,
                  }}
                >
                  <span>DISCORD LIVE</span>
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              arzursanctum.space
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    return new Response(`Failed to generate image: ${error instanceof Error ? error.message : "Unknown"}`, {
      status: 500,
    });
  }
}
