import { useEffect, useMemo, useState } from "react";
import { RefreshCw, ShieldAlert, UserCheck, Users } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
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
      users
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
        }))
        .filter((row) => {
          const query = search.trim().toLowerCase();
          const matchesSearch = query
            ? [row.name, row.email, row.role].some((value) =>
                String(value || "").toLowerCase().includes(query)
              )
            : true;
          const matchesRole =
            roleFilter === "All Roles" || row.role.toLowerCase() === roleFilter.toLowerCase();
          const matchesStatus = statusFilter === "All Status" || row.status === statusFilter;

          return matchesSearch && matchesRole && matchesStatus;
        }),
    [roleFilter, search, statusFilter, users]
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Accounts",
        value: String(users.length || 0),
        trend: String(users.filter((user) => user.role === "admin").length || 0),
        helper: "admin accounts",
        icon: Users,
      },
      {
        label: "Verified Users",
        value: String(users.filter((user) => user.isVerified).length || 0),
        trend: String(users.filter((user) => !user.isVerified && !user.isBanned).length || 0),
        helper: "trust verified",
        icon: UserCheck,
      },
      {
        label: "Accounts Under Review",
        value: String(
          users.filter((user) => !user.isVerified && !user.isBanned).length || 0
        ),
        trend: String(users.filter((user) => user.isBanned).length || 0),
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
    <div className="flex flex-col gap-5 lg:gap-6">
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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 rounded-full border border-white/10 bg-white/[0.045] px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
          />

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="h-10 rounded-full border border-white/10 bg-[#10191d] px-3 text-sm text-slate-300"
          >
            <option>All Roles</option>
            <option>User</option>
            <option>Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-full border border-white/10 bg-[#10191d] px-3 text-sm text-slate-300"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Review</option>
            <option>Suspended</option>
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
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">All Users</h2>
            <p className="text-xs text-slate-400">
              Search, review, and moderate accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.08]">
              Export
            </button>
            <button className="rounded-full border border-rose-400/20 bg-rose-500/15 px-3 py-1.5 text-xs text-rose-100 hover:bg-rose-500/20">
              Bulk Suspend
            </button>
          </div>
        </div>

        <UsersTable rows={rows} />
      </section>
    </div>
  );
}
