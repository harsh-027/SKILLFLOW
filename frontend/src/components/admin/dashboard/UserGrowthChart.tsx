import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type GrowthPoint = {
  name: string;
  users: number;
  active?: number;
};

export default function UserGrowthChart({ data }: { data: GrowthPoint[] }) {
  const hasActiveSeries = data.some((point) => typeof point.active === "number");

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="userGrowthStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <YAxis
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={44}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.12)", strokeDasharray: "4 4" }}
            contentStyle={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              color: "#fff",
            }}
          />
          <Line
            type="monotone"
            dataKey="users"
            stroke="url(#userGrowthStroke)"
            strokeWidth={3}
            dot={{ r: 0 }}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#22d3ee" }}
          />
          {hasActiveSeries ? (
            <Line
              type="monotone"
              dataKey="active"
              stroke="#93c5fd"
              strokeDasharray="6 6"
              strokeWidth={2}
              dot={{ r: 0 }}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#93c5fd" }}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
