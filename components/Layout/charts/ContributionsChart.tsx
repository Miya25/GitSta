"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ContributionsChartProps {
  data: { date: string; commits: number }[];
}

export function ContributionsChart({ data }: ContributionsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#888888" }}
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis tick={{ fill: "#888888" }} />
        <Tooltip
          contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
          labelStyle={{ color: "#333" }}
          itemStyle={{ color: "#8884d8" }}
        />
        <Line
          type="monotone"
          dataKey="commits"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ fill: "#8884d8", strokeWidth: 2 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
