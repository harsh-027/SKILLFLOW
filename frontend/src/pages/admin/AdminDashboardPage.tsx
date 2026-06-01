import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, Flag, RefreshCw, ShieldAlert, Tags, Users } from "lucide-react";

import API from "@/api/axios";
import KpiCard from "@/components/admin/dashboard/KpiCard";
import SkillCategoryChart from "@/components/admin/dashboard/SkillCategoryChart";
import UserGrowthChart from "@/components/admin/dashboard/UserGrowthChart";
import UsersTable from "@/components/admin/dashboard/UsersTable";

type DashboardUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  isVerified: boolean;
};

type GrowthPoint = {
  name: string;
  count: number;
};

type CategoryPoint = {
  name: string;
  value: number;
  count: number;
};

type DashboardResponse = {
  totalUsers: number;
  totalAdmins: number;
  totalListings: number;
  totalExchanges: number;
  openReports: number;
  activeUsers: number;
  recentUsers: DashboardUser[];
  userGrowth: GrowthPoint[];
  skillCategories: CategoryPoint[];
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await API.get("/admin/dashboard");
        setDashboard(data);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const rows = useMemo(() => {
    const users = Array.isArray(dashboard?.recentUsers) ? dashboard.recentUsers : [];
    const query = search.trim().toLowerCase();

    return users
      .filter((user) => {
        if (!query) {
          return true;
        }

        return [user.name, user.email, user.role].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        );
      })
      .map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.isBanned
          ? ("Suspended" as const)
          : user.isVerified
          ? ("Active" as const)
          : ("Review" as const),
      }));
  }, [dashboard?.recentUsers, search]);

  const kpiCards = useMemo(
    () => [
      {
        label: "Total Users",
        value: String(dashboard?.totalUsers || 0),
        trend: String(dashboard?.totalAdmins || 0),
        helper: "admin accounts",
        icon: Users,
      },
      {
        label: "Active Users",
        value: String(dashboard?.activeUsers || 0),
        trend:
          dashboard?.totalUsers && dashboard.totalUsers > 0
            ? `${Math.round((dashboard.activeUsers / dashboard.totalUsers) * 100)}%`
            : "0%",
        helper: "7-day active",
        icon: BarChart3,
      },
      {
        label: "Skills Posted",
        value: String(dashboard?.totalListings || 0),
        trend: String(dashboard?.totalExchanges || 0),
        helper: "total exchanges",
        icon: Tags,
      },
      {
        label: "Reports Flagged",
        value: String(dashboard?.openReports || 0),
        trend: String(rows.filter((row) => row.status === "Review").length),
        helper: "users in review",
        icon: ShieldAlert,
      },
    ],
    [dashboard, rows]
  );

  const userGrowthData = useMemo(
    () =>
      (dashboard?.userGrowth || []).map((point, index, allPoints) => ({
        name: point.name,
        users: point.count,
        active:
          index === 0 ? point.count : point.count + allPoints[index - 1].count,
      })),
    [dashboard?.userGrowth]
  );

  if (loading) {
    return <div className="loading-copy">Loading admin dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {["Day", "Week", "Month", "Year"].map((range) => (
            <button
              key={range}
              type="button"
              className={`h-10 rounded-full border px-5 text-sm transition ${
                range === "Month"
                  ? "border-white/15 bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search recent users..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 rounded-full border border-white/10 bg-white/[0.045] px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
          />

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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-[8px] border border-white/14 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">User Growth</h2>
                <p className="text-xs text-slate-400">
                  Account creation trend pulled from your real database records
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1">Last 6 months</span>
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-slate-200" aria-label="Open user growth">
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <UserGrowthChart data={userGrowthData} />
          </div>
        </div>

        <div className="rounded-[8px] border border-white/14 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Skill Categories</h2>
              <p className="text-xs text-slate-400">Active listing distribution</p>
            </div>

            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
              <Flag className="h-3.5 w-3.5" />
              Live data
            </div>
          </div>

          <SkillCategoryChart data={dashboard?.skillCategories || []} />
        </div>
      </section>

      <section className="rounded-[8px] border border-white/14 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">User Operations</h2>
            <p className="text-xs text-slate-400">
              Latest accounts from the live user collection
            </p>
          </div>
        </div>

        <UsersTable rows={rows} />
      </section>
    </div>
  );
}
