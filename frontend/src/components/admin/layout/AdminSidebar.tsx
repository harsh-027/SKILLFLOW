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
    navigate("/", { state: { authModal: "login" }, replace: true });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 md:hidden ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
      />

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          border-r border-gray-300 bg-white

          ${collapsed ? "w-20" : "w-[260px]"}

          md:static md:h-full md:translate-x-0 md:border-r-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded border border-gray-300 bg-gray-100 text-lg font-bold text-black">
              S
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <p className="text-lg font-bold text-black">SkillFlow</p>
                <p className="text-xs text-gray-600">Admin Panel</p>
              </div>
            )}
          </div>

          <button
            onClick={mobileOpen ? onCloseMobile : onToggleCollapse}
            className="hidden h-9 w-9 items-center justify-center rounded border border-gray-300 bg-white text-black md:flex"
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
            className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-white md:hidden"
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
                relative flex items-center gap-3 rounded border px-3 py-3

                ${
                  isActive
                    ? "border-gray-400 bg-gray-100 text-black"
                    : "border-transparent text-gray-700"
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
                      ${isActive ? "bg-gray-200 text-black" : "bg-gray-100 text-gray-700"}
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
            <div className="rounded border border-gray-300 bg-white p-4">
              <p className="text-sm font-semibold text-black">Admin Workspace</p>
              <p className="mt-2 text-xs leading-5 text-gray-600">
                Manage users, listings, reports, and platform signals.
              </p>
            </div>
          ) : null}

          <div
            className={`
              flex items-center gap-3 rounded border border-gray-300 bg-white p-3
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-gray-100 text-sm font-bold text-black">
              {currentUser?.name?.slice(0, 2).toUpperCase() || "AD"}
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <p className="text-black text-sm font-medium truncate">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  @{currentUser?.userId}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded border border-gray-300 bg-white text-black"
              aria-label="Help center"
              title="Help center"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center rounded border border-gray-300 bg-white text-black"
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
