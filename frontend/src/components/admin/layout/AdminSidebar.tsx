import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Flag,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Sparkles,
  Tags,
  Users,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
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
  const { currentUser } = useApp();

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
          fixed left-0 top-0 z-50 h-screen flex flex-col
          bg-[#0b1220] border-r border-white/10
          transition-all duration-300

          ${collapsed ? "w-20" : "w-[260px]"}

          md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-400 to-violet-500 flex items-center justify-center text-black shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <p className="text-white font-semibold">SkillFlow</p>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            )}
          </div>

          <button
            onClick={mobileOpen ? onCloseMobile : onToggleCollapse}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={onCloseMobile}
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {adminNavigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `
                relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all

                ${
                  isActive
                    ? "bg-white/10 text-white shadow-inner border border-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }

                ${collapsed ? "justify-center" : ""}
                `
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition ${
                      isActive ? "bg-cyan-400" : "bg-transparent"
                    }`}
                  />

                  <div
                    className={`
                      h-9 w-9 flex items-center justify-center rounded-lg
                      ${collapsed ? "bg-transparent" : "bg-white/5"}
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

        <div className="p-3 border-t border-white/10">
          <div
            className={`
              flex items-center gap-3 p-3 rounded-xl
              bg-gradient-to-r from-white/5 to-white/0
              border border-white/10
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-black font-bold text-sm">
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
        </div>
      </aside>
    </>
  );
}
