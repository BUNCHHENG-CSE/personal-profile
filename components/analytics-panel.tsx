"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Clock,
  Compass,
  Cpu,
  Eye,
  Gamepad2,
  Globe,
  Laptop,
  MousePointer2,
  Radio,
  RotateCw,
  Share2,
  ShieldCheck,
  Smartphone,
  Tablet,
  Users,
  Zap,
} from "lucide-react";
import { EmptyState, SectionHeader } from "@/components/dashboard-ui";
import { OverviewChart } from "@/components/overview-chart";
import type { VisitorSessionLog } from "@/lib/visitor";

type VisitorTelemetry = {
  recentSessions: VisitorSessionLog[];
  deviceCounts: { desktop: number; mobile: number; tablet: number; console: number };
  topOS: { os: string; count: number; percentage: number }[];
  topBrowsers: { browser: string; count: number; percentage: number }[];
  topSources: { source: string; domain: string; count: number; percentage: number }[];
  topCountries: { code: string; name: string; flag: string; count: number; percentage: number }[];
  totalTrackedSessions: number;
};

type Data = {
  totalViews: number;
  rangeViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  views7Days: number;
  daily: { date: string; views: number }[];
  links: { id: string; clicks: number }[];
  visitorDetails?: VisitorTelemetry;
};

function formatTimeAgo(timestamp: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "Recent";
  }
}

export function AnalyticsPanel() {
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<"overview" | "demographics" | "stream">("overview");
  const [reload, setReload] = useState(0);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/analytics?days=${days}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error || "Analytics are unavailable.");
        return payload.data as Data;
      })
      .then((result) => {
        setData(result);
        setError("");
        setLoading(false);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Analytics are unavailable.",
          );
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [days, reload]);

  // Optional live stream auto-refresh every 20 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setReload((prev) => prev + 1);
    }, 20000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  function chooseRange(value: number) {
    setDays(value);
    setLoading(true);
    setError("");
  }

  const maxClicks = Math.max(
    1,
    ...(data?.links.map((link) => link.clicks) || []),
  );

  const visitors = data?.visitorDetails;
  const totalDeviceSessions = visitors
    ? Object.values(visitors.deviceCounts).reduce((a, b) => a + b, 0) || 1
    : 1;

  return (
    <div className="content-stack">
      {/* Top Toolbar: Date Range + Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-line bg-panel">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-well border border-line-2">
          <button
            type="button"
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] font-bold shadow"
                : "text-fg-3 hover:text-fg"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview & Trends
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "demographics"
                ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] font-bold shadow"
                : "text-fg-3 hover:text-fg"
            }`}
            onClick={() => setActiveTab("demographics")}
          >
            <Laptop size={13} /> Hardware & Geo
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "stream"
                ? "bg-[var(--accent)] text-[var(--accent-fg,#090d16)] font-bold shadow"
                : "text-fg-3 hover:text-fg"
            }`}
            onClick={() => setActiveTab("stream")}
          >
            <Radio size={13} className="text-emerald-400 animate-pulse" /> Live Stream
            {visitors?.recentSessions.length ? (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300">
                {visitors.recentSessions.length}
              </span>
            ) : null}
          </button>
        </div>

        {/* Range Selector & Live Poll Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRefresh((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 border transition-all ${
              autoRefresh
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                : "border-line text-fg-3 hover:text-fg"
            }`}
            title="Auto-refresh visitor feed every 20s"
          >
            <Radio size={12} className={autoRefresh ? "animate-pulse text-emerald-400" : ""} />
            <span>{autoRefresh ? "Auto-Live: ON" : "Auto-Live: OFF"}</span>
          </button>

          <div
            className="segmented-control"
            role="group"
            aria-label="Analytics date range"
          >
            {[7, 30, 90].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={days === value}
                className={days === value ? "selected" : ""}
                onClick={() => chooseRange(value)}
              >
                {value}d
              </button>
            ))}
          </div>

          <button
            type="button"
            className="button button-secondary button-small p-2"
            onClick={() => {
              setLoading(true);
              setReload((v) => v + 1);
            }}
            title="Refresh analytics data"
          >
            <RotateCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="notice notice-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={() => {
              setLoading(true);
              setReload((value) => value + 1);
            }}
          >
            <RotateCw size={14} /> Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-panels" aria-label="Loading analytics">
          <div />
          <div />
          <div />
          <div />
        </div>
      )}

      {!loading && data && (
        <>
          {/* Top 4 Core Metrics */}
          <div className="metric-grid">
            {[
              {
                label: "Total views",
                value: data.totalViews,
                icon: Eye,
                detail: "All time recorded",
              },
              {
                label: "Views in range",
                value: data.rangeViews,
                icon: Activity,
                detail: `Past ${days} days`,
              },
              {
                label: "Unique visitors",
                value: data.uniqueVisitors,
                icon: Users,
                detail: "Estimated cookies",
              },
              {
                label: "Live tracked sessions",
                value: visitors?.totalTrackedSessions || data.viewsToday,
                icon: Radio,
                detail: "Recent detailed visits",
              },
            ].map(({ label, value, icon: Icon, detail }) => (
              <div className="metric-card" key={label}>
                <div className="metric-top">
                  <span>{label}</span>
                  <span className="metric-icon">
                    <Icon size={19} strokeWidth={1.8} />
                  </span>
                </div>
                <strong>{value.toLocaleString()}</strong>
                <span className="metric-detail">{detail}</span>
              </div>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & TRENDS */}
          {activeTab === "overview" && (
            <div className="dashboard-columns analytics-columns">
              <section className="surface-card chart-card">
                <SectionHeader
                  title="Views over time"
                  detail={`Daily traffic timeline for the last ${days} days`}
                />
                {data.rangeViews ? (
                  <OverviewChart data={data.daily} />
                ) : (
                  <EmptyState
                    title="No views in this range"
                    description="Try a longer range or check back after visitors arrive."
                    icon={<Eye size={25} strokeWidth={1.5} />}
                  />
                )}
              </section>

              <section className="surface-card">
                <SectionHeader
                  title="Popular links"
                  detail="Where visitors click through from your profile"
                  action={<MousePointer2 size={19} className="section-icon" />}
                />
                {data.links.length ? (
                  <div className="link-performance">
                    {data.links.map((link, index) => (
                      <div className="link-performance-row" key={link.id}>
                        <div>
                          <span className="link-rank">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <strong>{link.id}</strong>
                          <span>{link.clicks} clicks</span>
                        </div>
                        <div className="performance-track">
                          <span
                            style={{
                              width: `${(link.clicks / maxClicks) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No link clicks yet"
                    description="Add social links to your profile to track where people go."
                    icon={<MousePointer2 size={25} strokeWidth={1.5} />}
                  />
                )}
              </section>
            </div>
          )}

          {/* TAB 2: VISITOR HARDWARE, DEMOGRAPHICS & TRAFFIC SOURCES */}
          {activeTab === "demographics" && visitors && (
            <div className="space-y-6">
              {/* Devices Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    type: "Desktop PC",
                    count: visitors.deviceCounts.desktop,
                    icon: Laptop,
                    color: "#a855f7",
                  },
                  {
                    type: "Mobile Phone",
                    count: visitors.deviceCounts.mobile,
                    icon: Smartphone,
                    color: "#06b6d4",
                  },
                  {
                    type: "Tablet",
                    count: visitors.deviceCounts.tablet,
                    icon: Tablet,
                    color: "#f59e0b",
                  },
                  {
                    type: "Console / Deck",
                    count: visitors.deviceCounts.console,
                    icon: Gamepad2,
                    color: "#10b981",
                  },
                ].map((item) => {
                  const pct = Math.round((item.count / totalDeviceSessions) * 100) || 0;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.type}
                      className="p-4 rounded-xl border border-line bg-panel flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-fg-3">{item.type}</span>
                        <Icon size={16} style={{ color: item.color }} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold font-mono text-fg">
                          {pct}%
                        </div>
                        <div className="text-xs text-fg-4 font-mono">
                          {item.count} visitor sessions
                        </div>
                      </div>
                      <div className="w-full bg-well h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3-Column Breakdown: OS, Browsers, Referrers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Operating Systems */}
                <section className="surface-card p-5 rounded-2xl border border-line bg-panel">
                  <SectionHeader
                    title="Operating Systems"
                    detail="Hardware OS used by your visitors"
                    action={<Cpu size={18} className="text-purple-400" />}
                  />
                  <div className="space-y-3 mt-4">
                    {visitors.topOS.map((item) => (
                      <div key={item.os} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-fg-2 font-medium">{item.os}</span>
                          <span className="text-fg-3">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-well h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Browsers */}
                <section className="surface-card p-5 rounded-2xl border border-line bg-panel">
                  <SectionHeader
                    title="Browsers"
                    detail="Web & app clients"
                    action={<Compass size={18} className="text-cyan-400" />}
                  />
                  <div className="space-y-3 mt-4">
                    {visitors.topBrowsers.map((item) => (
                      <div key={item.browser} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-fg-2 font-medium">{item.browser}</span>
                          <span className="text-fg-3">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-well h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Traffic Sources */}
                <section className="surface-card p-5 rounded-2xl border border-line bg-panel">
                  <SectionHeader
                    title="Traffic Sources"
                    detail="Where visitors discover you"
                    action={<Share2 size={18} className="text-amber-400" />}
                  />
                  <div className="space-y-3 mt-4">
                    {visitors.topSources.map((item) => (
                      <div key={item.source} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-fg-2 font-medium truncate max-w-[150px]">
                            {item.source}
                          </span>
                          <span className="text-fg-3">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-well h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Geographic Country Distribution */}
              <section className="surface-card p-5 rounded-2xl border border-line bg-panel">
                <SectionHeader
                  title="Geographic Visitor Distribution"
                  detail="Global regions exploring your gaming profile"
                  action={<Globe size={18} className="text-emerald-400" />}
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                  {visitors.topCountries.map((c) => (
                    <div
                      key={c.code}
                      className="p-3 rounded-lg border border-line-2 bg-well flex items-center gap-2.5"
                    >
                      <span className="text-2xl leading-none">{c.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-fg truncate">{c.name}</div>
                        <div className="text-[11px] font-mono text-fg-4">
                          {c.count} {c.count === 1 ? "visit" : "visits"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: LIVE VISITOR ACTIVITY STREAM */}
          {activeTab === "stream" && visitors && (
            <section className="surface-card p-5 rounded-2xl border border-line bg-panel">
              <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
                <div>
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-fg flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Live Visitor Telemetry Stream
                  </h3>
                  <p className="text-xs text-fg-3 font-mono mt-0.5">
                    Real-time chronological events, locations, hardware, and actions taken
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-well text-fg-3">
                  {visitors.recentSessions.length} Recent Events
                </span>
              </div>

              {visitors.recentSessions.length === 0 ? (
                <EmptyState
                  title="No visitor sessions recorded yet"
                  description="Sessions will automatically populate in real-time as visitors explore your profile."
                  icon={<Radio size={25} strokeWidth={1.5} />}
                />
              ) : (
                <div className="divide-y divide-line-2 overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-fg-4 border-b border-line uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Location</th>
                        <th className="py-2.5 px-3">Device & Browser</th>
                        <th className="py-2.5 px-3">Source Referrer</th>
                        <th className="py-2.5 px-3">Page Visited</th>
                        <th className="py-2.5 px-3">Action Recorded</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-2">
                      {visitors.recentSessions.map((session) => (
                        <tr
                          key={session.id}
                          className="hover:bg-panel-3 transition-colors group"
                        >
                          {/* Time */}
                          <td className="py-3 px-3 text-fg-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock size={12} className="text-fg-4" />
                              {formatTimeAgo(session.timestamp)}
                            </span>
                          </td>

                          {/* Country */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-fg">
                              <span className="text-base">{session.countryFlag}</span>
                              <span>{session.countryName}</span>
                            </span>
                          </td>

                          {/* Device & Browser */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-well text-fg-2">
                              {session.deviceType === "desktop" && <Laptop size={12} className="text-purple-400" />}
                              {session.deviceType === "mobile" && <Smartphone size={12} className="text-cyan-400" />}
                              {session.deviceType === "tablet" && <Tablet size={12} className="text-amber-400" />}
                              {session.deviceType === "console" && <Gamepad2 size={12} className="text-emerald-400" />}
                              <span>{session.os}</span>
                              <span className="text-fg-4">·</span>
                              <span className="text-fg-3">{session.browser}</span>
                            </span>
                          </td>

                          {/* Source */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-line bg-well text-fg-2">
                              <Share2 size={11} className="text-fg-4" />
                              <span>{session.referrer}</span>
                            </span>
                          </td>

                          {/* Page */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-well text-fg-3">
                              {session.pagePath}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">
                              <Zap size={11} />
                              <span>{session.action || "Explored Profile"}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Privacy Footnote */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-fg-4 font-mono pt-3 border-t border-line-2 gap-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              Privacy-first analytics: All visitor identifiers are cryptographically hashed. Zero third-party trackers.
            </span>
            <span>GDPR & Cookie Compliant</span>
          </div>
        </>
      )}
    </div>
  );
}
