import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, UserCheck, Users } from "lucide-react";
import UsersTable from "@/components/admin/dashboard/UsersTable";
import KpiCard from "@/components/admin/dashboard/KpiCard";
import API from "@/api/axios";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  isVerified: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await API.get("/admin/users");
        setUsers(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const rows = useMemo(
    () =>
      users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.isBanned
          ? ("Suspended" as const)
          : user.isVerified
            ? ("Active" as const)
            : ("Review" as const),
      })),
    [users]
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Accounts",
        value: String(users.length || 0),
        trend: "+4.1%",
        helper: "this week",
        icon: Users,
      },
      {
        label: "Verified Users",
        value: String(users.filter((user) => user.isVerified).length || 0),
        trend: "+2.3%",
        helper: "trust verified",
        icon: UserCheck,
      },
      {
        label: "Accounts Under Review",
        value: String(
          users.filter((user) => !user.isVerified && !user.isBanned).length || 0
        ),
        trend: "-1.2%",
        helper: "needs follow-up",
        icon: ShieldAlert,
      },
    ],
    [users]
  );

  if (loading) {
    return (
      <div className="loading-copy">
        Loading user operations...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">User Management</h1>
          <p className="text-sm text-slate-400">
            Review, verify, and moderate platform users.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search users..."
            className="h-10 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
          />

          <select className="h-10 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-300">
            <option>All Roles</option>
            <option>User</option>
            <option>Admin</option>
          </select>

          <select className="h-10 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-300">
            <option>All Status</option>
            <option>Active</option>
            <option>Review</option>
            <option>Suspended</option>
          </select>

          <button className="h-10 rounded-lg bg-white px-4 text-sm font-medium text-black transition hover:bg-slate-200">
            Refresh
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 shadow-sm transition hover:shadow-md"
          >
            <KpiCard {...card} />
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">All Users</h2>
            <p className="text-xs text-slate-400">
              Search, review, and moderate accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-md bg-white/[0.05] px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.08]">
              Export
            </button>
            <button className="rounded-md bg-red-500/90 px-3 py-1.5 text-xs text-white hover:bg-red-500">
              Bulk Suspend
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/5">
          <UsersTable rows={rows} />
        </div>
      </section>
    </div>
  );
}
