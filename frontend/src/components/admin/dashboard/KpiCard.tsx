import { LucideIcon, TrendingUp } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string;
  trend: string;
  helper: string;
  icon: LucideIcon;
};

export default function KpiCard({
  label,
  value,
  trend,
  helper,
  icon: Icon,
}: KpiCardProps) {
  return (
    <article className="glass-card group relative flex min-h-[148px] flex-col justify-between overflow-hidden rounded-[8px] p-5 transition duration-300 hover:border-white/25">
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full border border-white/10 opacity-30" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-300/85">{label}</p>
          <p className="mt-5 text-3xl font-semibold tracking-[-0.02em] text-white">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-slate-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <div className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" />
          {trend}
        </div>
        <p className="truncate text-slate-400">{helper}</p>
      </div>
    </article>
  );
}
