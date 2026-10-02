"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { ScoreDistributionItem } from "@/lib/data/dashboard-data";

export function ScoreChart({ data }: { data: ScoreDistributionItem[] }) {
  return (
    <div className="h-64 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
          />
          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
