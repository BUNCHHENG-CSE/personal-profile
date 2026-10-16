"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
import {
  ArrowUpRight,
  Code2,
  Gamepad2,
  Headphones,
  MessageSquare,
  Radio,
} from "lucide-react";

interface LanyardActivity {
  type: number;
  name: string;
  details?: string;
  state?: string;
  emoji?: {
    name?: string;
  };
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  application_id?: string;
}

interface LanyardData {
  discord_status: "online" | "idle" | "dnd" | "offline";
  discord_user: {
    id: string;
    username: string;
    avatar: string | null;
    global_name: string | null;
  };
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify?: {
    song: string;
    artist: string;
    album_art_url: string;
  };
}

function formatElapsed(startMs?: number): string | null {
  if (!startMs) return null;
  const elapsedSec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const hrs = Math.floor(elapsedSec / 3600);
  const mins = Math.floor((elapsedSec % 3600) / 60);

  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function getActivityAssetUrl(appId?: string, assetId?: string): string | null {
  if (!appId || !assetId) return null;
  if (assetId.startsWith("mp:external/")) {
    return `https://media.discordapp.net/external/${assetId.replace("mp:external/", "")}`;
  }
  return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
}

export function DiscordPresence({
  discordId,
  initialPresence,
}: {
  discordId?: string | null;
  initialPresence?: LanyardData | null;
}) {
  const [data, setData] = useState<LanyardData | null>(initialPresence || null);
  const [notMonitored, setNotMonitored] = useState(false);
  const [error, setError] = useState(false);
  const [, setTick] = useState(0);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Re-render every 30s to update elapsed time
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const id = discordId?.trim();
    if (!id || !/^\d{17,20}$/.test(id)) return;

    let isMounted = true;
    let ws: WebSocket | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    async function fetchPresence() {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${id}?_t=${Date.now()}`, {
          cache: "no-store",
          headers: { Pragma: "no-cache" },
        });
        const json = await res.json().catch(() => null);

        if (!isMounted) return;

        if (json?.error?.code === "user_not_monitored" || res.status === 404) {
          setNotMonitored(true);
          return;
        }

        if (json?.success && json?.data) {
          setData(json.data);
          setNotMonitored(false);
          setError(false);
        } else {
          setError(true);
        }
      } catch {
        if (isMounted) setError(true);
      }
    }

    void fetchPresence();

    // WebSocket real-time connection
    try {
      ws = new WebSocket("wss://api.lanyard.rest/socket");

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { op, t, d } = message;

          if (op === 1) {
            const interval = d.heartbeat_interval;
            heartbeatInterval = setInterval(() => {
              if (ws?.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ op: 3 }));
              }
            }, interval);

            ws?.send(
              JSON.stringify({
                op: 2,
                d: { subscribe_to_id: id },
              }),
            );
          } else if (op === 0) {
            if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
              if (isMounted && d) {
                setData(d);
                setNotMonitored(false);
                setError(false);
              }
            }
          }
        } catch {
          // Ignore
        }
      };
    } catch {
      // Ignore
    }

    const pollTimer = setInterval(fetchPresence, 10000);

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    };
  }, [discordId]);

  if (!discordId) return null;

  if (notMonitored || (!data && error)) {
    return (
      <div
        className="discord-presence-widget p-3 border border-white/10 bg-white/[0.03] backdrop-blur-md rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-mono"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2 text-white/70">
          <MessageSquare size={13} className="text-[#5865F2] shrink-0" />
          <span>
            DISCORD // <strong className="text-white">Connecting...</strong>
          </span>
        </div>
        <a
          href="https://discord.gg/lanyard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-1 font-mono tracking-wider uppercase opacity-85 hover:opacity-100"
        >
          <span>Join discord.gg/lanyard to sync</span>
          <ArrowUpRight size={11} />
        </a>
      </div>
    );
  }

  if (!data) return null;

  const gameActivity = data.activities.find((a) => a.type === 0);
  const elapsed = formatElapsed(gameActivity?.timestamps?.start);
  const assetImg = getActivityAssetUrl(
    gameActivity?.application_id,
    gameActivity?.assets?.large_image,
  );

  const isCoding = gameActivity?.name.toLowerCase().includes("code");

  return (
    <div
      className="discord-presence-widget p-3 border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg text-xs font-mono relative overflow-hidden group hover:border-[var(--accent)] transition-all"
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
      }}
    >
      {/* Main Activity Row */}
      {gameActivity ? (
        <div className="flex items-center gap-3">
          {assetImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={assetImg}
              alt={gameActivity.name}
              className="w-10 h-10 rounded-md object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 border border-white/10"
              style={{
                backgroundColor: "rgba(var(--accent-rgb, 187, 154, 255), 0.1)",
                color: "var(--accent)",
              }}
            >
              {isCoding ? <Code2 size={20} /> : <Gamepad2 size={20} className="animate-pulse" />}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-white truncate">
                {gameActivity.name}
              </span>
              {mounted && elapsed && (
                <span className="text-[10px] text-white/40 shrink-0" suppressHydrationWarning>
                  {elapsed} elapsed
                </span>
              )}
            </div>

            {gameActivity.details && (
              <p className="text-[11px] text-white/70 truncate">
                {gameActivity.details}
              </p>
            )}

            {gameActivity.state && (
              <p className="text-[10px] text-white/40 truncate">
                {gameActivity.state}
              </p>
            )}
          </div>
        </div>
      ) : data.listening_to_spotify && data.spotify ? (
        <div className="flex items-center gap-3 pt-0.5">
          {data.spotify.album_art_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.spotify.album_art_url}
              alt={data.spotify.song}
              className="w-10 h-10 rounded-md object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-[#1db954]/10 border border-[#1db954]/20 flex items-center justify-center text-[#1db954] shrink-0">
              <Headphones size={20} />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-white truncate">
                {data.spotify.song}
              </span>
              <span className="text-[10px] text-[#1db954] font-semibold tracking-wider">
                SPOTIFY
              </span>
            </div>
            <p className="text-[11px] text-white/60 truncate">
              by {data.spotify.artist}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-white/40 text-[11px] pt-0.5">
          <span className="flex items-center gap-1.5">
            <Radio size={12} className="text-white/30" />
            No active game or music
          </span>
          <span className="text-[9px] tracking-widest uppercase text-white/20">
            DISCORD SYNC
          </span>
        </div>
      )}
    </div>
  );
}
