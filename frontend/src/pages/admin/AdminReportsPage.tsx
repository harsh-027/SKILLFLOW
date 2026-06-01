import { useEffect, useMemo, useState } from "react";
import { Flag, RefreshCw, ShieldAlert, TriangleAlert } from "lucide-react";
import KpiCard from "@/components/admin/dashboard/KpiCard";
import API from "@/api/axios";

type ReportRow = {
  _id: string;
  targetType: "user" | "listing" | "exchange";
  targetId: string;
  reason: string;
  status: "open" | "resolved";
  createdAt: string;
  reportedBy?: {
    name: string;
    email: string;
  };
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const { data } = await API.get("/admin/reports");
        setReports(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        label: "Open Reports",
        value: String(reports.filter((report) => report.status === "open").length || 0),
        trend: String(reports.length || 0),
        helper: "pending queue",
        icon: Flag,
      },
      {
        label: "Resolved Reports",
        value: String(reports.filter((report) => report.status === "resolved").length || 0),
        trend: String(reports.filter((report) => report.status === "open").length || 0),
        helper: "operator output",
        icon: ShieldAlert,
      },
      {
        label: "Priority Cases",
        value: String(reports.filter((report) => report.targetType === "exchange").length || 0),
        trend: String(reports.filter((report) => report.targetType === "user").length || 0),
        helper: "exchange disputes",
        icon: TriangleAlert,
      },
    ],
    [reports]
  );

  const visibleReports = useMemo(
    () =>
      reports.filter((report) => {
        const matchesType =
          typeFilter === "All Types" || report.targetType === typeFilter.toLowerCase();
        const matchesStatus =
          statusFilter === "All Status" || report.status === statusFilter.toLowerCase();

        return matchesType && matchesStatus;
      }),
    [reports, statusFilter, typeFilter]
  );

  if (loading) {
    return (
      <div className="loading-copy">
        Loading reports queue...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Moderation Queue</h1>
          <p className="text-sm text-slate-400">
            Review and resolve platform reports across all entities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-10 rounded-full border border-white/10 bg-[#10191d] px-3 text-sm text-slate-300"
          >
            <option>All Types</option>
            <option>User</option>
            <option>Listing</option>
            <option>Exchange</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-full border border-white/10 bg-[#10191d] px-3 text-sm text-slate-300"
          >
            <option>All Status</option>
            <option>Open</option>
            <option>Resolved</option>
          </select>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 text-sm font-medium text-white transition hover:bg-white/[0.09]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="rounded-[8px] border border-white/14 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="mb-5 flex flex-col gap-2">
          <h2 className="text-base font-semibold text-white">Reports Queue</h2>
          <p className="text-xs text-slate-400">
            Prioritize and resolve moderation tickets efficiently
          </p>
        </div>

        <div className="grid gap-4">
          {visibleReports.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-white/12 bg-white/[0.025] px-6 py-10 text-center text-sm text-slate-400">
              No reports in the moderation queue.
            </div>
          ) : (
            visibleReports.map((report) => (
              <article
                key={report._id}
                className="group rounded-[8px] border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/20 hover:bg-white/[0.055]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        {report.targetType}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${
                          report.status === "resolved"
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Reporter
                      </p>
                      <p className="text-base font-semibold text-white">
                        {report.reportedBy?.name || "Unknown user"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {report.reportedBy?.email || "No email"}
                      </p>
                    </div>

                    <p className="max-w-3xl text-sm leading-7 text-slate-300">
                      {report.reason}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-4 lg:w-[260px]">
                    <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Target ID
                      </p>
                      <p className="mt-2 break-all text-sm text-slate-300">
                        {report.targetId}
                      </p>

                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                        Submitted
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 rounded-full border border-emerald-400/20 bg-emerald-500/15 px-3 py-2 text-xs text-emerald-100 hover:bg-emerald-500/20">
                        Resolve
                      </button>
                      <button className="flex-1 rounded-full border border-rose-400/20 bg-rose-500/15 px-3 py-2 text-xs text-rose-100 hover:bg-rose-500/20">
                        Escalate
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
