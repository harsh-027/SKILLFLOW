import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Flag,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

type AdminNavigationItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

type AdminSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
};

export const adminNavigation: AdminNavigationItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/skills", label: "Skills", icon: Tags },
  { to: "/admin/reports", label: "Reports", icon: Flag },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();

  const handleLogout = async () => {
    await logout(true);
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
      />

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-white/12 bg-[#071014]/98
          transition-all duration-300

          ${collapsed ? "w-20" : "w-[260px]"}

          md:static md:h-full md:translate-x-0 md:border-r-0 md:bg-transparent
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-white/12 bg-white/[0.06] text-lg font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              S
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <p className="font-serif text-2xl font-black tracking-tight text-white">SkillFlow</p>
                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            )}
          </div>

          <button
            onClick={mobileOpen ? onCloseMobile : onToggleCollapse}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] md:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={onCloseMobile}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4">
          {adminNavigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `
                relative flex items-center gap-3 rounded-[8px] px-3 py-3 transition-all

                ${
                  isActive
                    ? "border border-white/10 bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "border border-transparent text-slate-300 hover:border-white/8 hover:bg-white/[0.04] hover:text-white"
                }

                ${collapsed ? "justify-center" : ""}
                `
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`
                      flex h-8 w-8 items-center justify-center rounded-[7px]
                      ${isActive ? "bg-white/[0.08] text-emerald-300" : collapsed ? "bg-transparent" : "bg-white/[0.03]"}
                    `}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {!collapsed && (
                    <span className="text-sm font-medium">{label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 p-4">
          {!collapsed ? (
            <div className="rounded-[8px] border border-white/12 bg-white/[0.035] p-4">
              <p className="text-sm font-semibold text-white">Admin Workspace</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Manage users, listings, reports, and platform signals.
              </p>
            </div>
          ) : null}

          <div
            className={`
              flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-3
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#b36a40] to-[#6c3225] text-sm font-bold text-white">
              {currentUser?.name?.slice(0, 2).toUpperCase() || "AD"}
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <p className="text-white text-sm font-medium truncate">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  @{currentUser?.userId}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Help center"
              title="Help center"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-400/10 hover:text-rose-200"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
