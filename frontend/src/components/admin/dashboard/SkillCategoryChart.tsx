import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type CategoryPoint = {
  name: string;
  value: number;
};

const colors = ["#22d3ee", "#8b5cf6", "#38bdf8", "#a855f7", "#06b6d4"];

export default function SkillCategoryChart({ data }: { data: CategoryPoint[] }) {
  return (
    <div className="flex h-[320px] flex-col gap-4 lg:flex-row lg:items-center">
      <div className="h-[220px] w-full lg:h-full lg:flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                color: "#fff",
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              outerRadius={92}
              paddingAngle={4}
              stroke="rgba(15,23,42,0.8)"
              strokeWidth={4}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid flex-1 gap-3">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-[#111827] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm font-medium text-slate-200">{item.name}</span>
            </div>
            <span className="text-sm text-slate-400">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
