"use client";

import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  Flame,
  Sparkles,
  Swords,
  Target,
} from "lucide-react";
import type { SkillMatrixConfig, SkillAttribute } from "@/lib/validation";

interface SkillMatrixProps {
  config?: SkillMatrixConfig | null;
  className?: string;
}

const DEFAULT_ATTRIBUTES: SkillAttribute[] = [
  { attribute: "AIM / FLICK", value: 94, fullMark: 100 },
  { attribute: "MACRO SENSE", value: 86, fullMark: 100 },
  { attribute: "CLUTCH (1vX)", value: 91, fullMark: 100 },
  { attribute: "COMMS & IGL", value: 88, fullMark: 100 },
  { attribute: "MENTAL / TILT", value: 95, fullMark: 100 },
  { attribute: "VERSATILITY", value: 84, fullMark: 100 },
];

export function SkillMatrix({ config, className = "" }: SkillMatrixProps) {
  const isEnabled = config?.enabled !== false;

  const title = config?.title || "COMBAT CAPABILITY RADAR";
  const archetype = config?.archetype || "AGGRESSIVE ENTRY FRAGGER";
  const primaryRole = config?.primaryRole || "Duelist / In-Game Leader";
  const signatureAgent = config?.signatureAgent || "Jett / Omen / Reyna";
  const winRate = config?.winRate || "64.8% WR";
  const kda = config?.kda || "1.42 K/D";

  const rawAttributes = config?.attributes && config.attributes.length >= 3
    ? config.attributes
    : DEFAULT_ATTRIBUTES;

  const chartData = useMemo(() => {
    return rawAttributes.map((attr) => ({
      attribute: attr.attribute,
      score: attr.value,
      fullMark: attr.fullMark || 100,
    }));
  }, [rawAttributes]);

  // Overall combat rating average
  const averageRating = useMemo(() => {
    const sum = rawAttributes.reduce((acc, curr) => acc + curr.value, 0);
    return Math.round(sum / rawAttributes.length);
  }, [rawAttributes]);

  if (!isEnabled) return null;

  return (
    <div
      className={`skill-matrix-container w-full my-6 p-6 sm:p-10 rounded-2xl border border-white/10 bg-gradient-to-b from-[#140e26]/90 via-[#0d091b]/90 to-[#07050e]/90 backdrop-blur-xl shadow-2xl relative overflow-hidden ${className}`}
      id="skills"
    >
      {/* Background Circuit Grid */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "2.5rem 2.5rem",
        }}
      />

      {/* Glowing Accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded bg-[var(--accent)]/15 text-[var(--accent)]">
              <Swords size={16} />
            </span>
            <span className="text-[10px] font-mono tracking-[0.25em] text-white/50 uppercase">
              ESPORTS PLAYER SPECIFICATION // HEXAGON RADAR
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            {title}
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 font-semibold">
              RATING: {averageRating}
            </span>
          </h3>
          <p className="text-xs font-mono text-white/60 tracking-wider mt-1">
            ARCHETYPE: <span className="text-white font-semibold">{archetype}</span>
          </p>
        </div>

        {/* Tactical Stat Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2">
            <Target size={13} className="text-amber-400" />
            <div className="text-left">
              <span className="text-[9px] font-mono text-white/40 block leading-tight">ROLE</span>
              <span className="text-xs font-mono text-white font-medium">{primaryRole}</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2">
            <Sparkles size={13} className="text-cyan-400" />
            <div className="text-left">
              <span className="text-[9px] font-mono text-white/40 block leading-tight">MAINS</span>
              <span className="text-xs font-mono text-white font-medium">{signatureAgent}</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2">
            <Flame size={13} className="text-rose-400" />
            <div className="text-left">
              <span className="text-[9px] font-mono text-white/40 block leading-tight">STATS</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                {winRate} · {kda}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar Chart + Attribute Rating Bars */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Radar Chart (Left / Center) */}
        <div className="lg:col-span-7 h-[340px] sm:h-[400px] w-full flex items-center justify-center relative select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 [&_*]:outline-none [&_*]:focus:outline-none">
          <ResponsiveContainer
            width="100%"
            height="100%"
            className="outline-none focus:outline-none focus-visible:outline-none [&_*]:outline-none"
            style={{ outline: "none" }}
          >
            <RadarChart
              data={chartData}
              margin={{ top: 10, right: 25, bottom: 10, left: 25 }}
              className="outline-none focus:outline-none focus-visible:outline-none"
              style={{ outline: "none" }}
            >
              <PolarGrid stroke="rgba(255, 255, 255, 0.12)" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="attribute"
                tick={{ fill: "rgba(255, 255, 255, 0.75)", fontSize: 11, fontFamily: "monospace" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "rgba(255, 255, 255, 0.3)", fontSize: 9, fontFamily: "monospace" }}
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <Radar
                name="Combat Score"
                dataKey="score"
                stroke="var(--accent)"
                strokeWidth={2.5}
                fill="var(--accent)"
                fillOpacity={0.35}
                dot={{
                  r: 4,
                  fill: "var(--accent)",
                  stroke: "#ffffff",
                  strokeWidth: 1.5,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Attribute Breakdown (Right) */}
        <div className="lg:col-span-5 space-y-3.5">
          <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase block mb-1">
            ATTRIBUTE CALIBRATION // 100-POINT SCALE
          </span>

          {rawAttributes.map((attr, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/80 font-medium flex items-center gap-1.5">
                  <Activity size={12} className="text-[var(--accent)]" />
                  {attr.attribute}
                </span>
                <span className="text-[var(--accent)] font-bold">{attr.value} / 100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, attr.value))}%`,
                    background: `linear-gradient(90deg, var(--accent) 0%, #38bdf8 100%)`,
                    boxShadow: "0 0 8px var(--glow)",
                  }}
                />
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
            <span>CALIBRATED FOR COMPETITIVE PLAY</span>
            <span className="text-emerald-400 font-semibold">TIER 1 RATED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
