"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function RevenueTrendChart({
  data,
}: {
  data: { month: string; gross: number; trueRev: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trueRevFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4169a5" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#4169a5" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ed" />
          <XAxis dataKey="month" stroke="#8a9ab0" tick={{ fontSize: 12 }} />
          <YAxis
            stroke="#8a9ab0"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) =>
              v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
            }
          />
          <Tooltip
            formatter={(v) => {
              const n = typeof v === "number" ? v : Number(v);
              return Number.isFinite(n)
                ? n.toLocaleString("en-US", { style: "currency", currency: "USD" })
                : String(v);
            }}
            contentStyle={{
              border: "1px solid #e3e8ed",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="gross"
            stroke="#8da5c9"
            fill="none"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            name="Gross"
          />
          <Area
            type="monotone"
            dataKey="trueRev"
            stroke="#273f63"
            fill="url(#trueRevFill)"
            strokeWidth={2}
            name="True revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
