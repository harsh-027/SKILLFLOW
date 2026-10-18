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
    <article className="glass-card flex min-h-[148px] flex-col justify-between rounded border border-gray-300 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="mt-5 text-3xl font-semibold text-black">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded border border-gray-300 bg-gray-100 text-black">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <div className="inline-flex items-center gap-1.5 font-medium text-green-700">
          <TrendingUp className="h-3.5 w-3.5" />
          {trend}
        </div>
        <p className="truncate text-gray-600">{helper}</p>
      </div>
    </article>
  );
}
