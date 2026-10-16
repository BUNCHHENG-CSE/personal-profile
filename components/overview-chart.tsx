"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function OverviewChart({
  data,
}: {
  data: { date: string; views: number }[];
}) {
  return (
    <div
      className="chart-wrap outline-none focus:outline-none focus-visible:outline-none select-none [&_*]:outline-none"
      role="img"
      aria-label="Area chart of profile views by day"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        className="outline-none focus:outline-none focus-visible:outline-none [&_*]:outline-none"
        style={{ outline: "none" }}
      >
        <AreaChart
          data={data}
          margin={{ top: 18, right: 8, bottom: 0, left: -25 }}
          className="outline-none focus:outline-none focus-visible:outline-none"
          style={{ outline: "none" }}
        >
          <defs>
            <linearGradient id="view-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent, #af9bff)" stopOpacity={0.42} />
              <stop offset="100%" stopColor="var(--accent, #af9bff)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--line, rgba(125, 125, 125, 0.15))"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--fg-3, #8d91a4)", fontSize: 11 }}
            tickFormatter={(value) => value.slice(5)}
            dy={12}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tick={{ fill: "var(--fg-3, #8d91a4)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: "var(--accent, #af9bff)", strokeWidth: 1 }}
            contentStyle={{
              background: "var(--panel-solid, #131927)",
              border: "1px solid var(--line-strong, rgba(255, 255, 255, 0.12))",
              borderRadius: 12,
              color: "var(--fg, #f7f6fb)",
              boxShadow: "0 18px 40px var(--panel-shadow, rgba(0, 0, 0, 0.45))",
            }}
            labelStyle={{ color: "var(--accent, #b3a3ff)", fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="var(--accent, #b49fff)"
            strokeWidth={2.5}
            fill="url(#view-gradient)"
            activeDot={{
              r: 5,
              fill: "var(--accent, #d7ccff)",
              stroke: "var(--panel-solid, #131927)",
              strokeWidth: 3,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
