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
    <article className="group flex h-[132px] flex-col justify-between rounded-2xl border border-white/5 bg-[#1f2937] p-4 shadow-[0_10px_24px_rgba(2,8,23,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/18 hover:bg-[#243042]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/16 via-sky-500/12 to-violet-500/16 text-cyan-300 ring-1 ring-inset ring-white/6">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/12 bg-emerald-400/8 px-2.5 py-1 text-xs font-medium text-emerald-300">
          <TrendingUp className="h-3.5 w-3.5" />
          {trend}
        </div>
        <p className="text-xs text-slate-500">{helper}</p>
      </div>
    </article>
  );
}
