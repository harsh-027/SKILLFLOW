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
              <stop offset="0%" stopColor="#3f6f43" />
              <stop offset="100%" stopColor="#75c66a" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
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
              background: "#071014",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 8,
              color: "#fff",
            }}
          />
          <Line
            type="monotone"
            dataKey="users"
            stroke="url(#userGrowthStroke)"
            strokeWidth={3}
            dot={{ r: 0 }}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#75c66a" }}
          />
          {hasActiveSeries ? (
            <Line
              type="monotone"
              dataKey="active"
              stroke="#8f989a"
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
