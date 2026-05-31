import {
  Bell,
  ChevronsUpDown,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

type AdminTopbarProps = {
  title: string;
  description: string;
  collapsed: boolean;
  onOpenMobileSidebar: () => void;
};

export default function AdminTopbar({
  title,
  description,
  collapsed,
  onOpenMobileSidebar,
}: AdminTopbarProps) {
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();

  const handleLogout = async () => {
    await logout(true);
    navigate("/login", { replace: true });
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 border-b border-white/5 bg-[#111827]/90 backdrop-blur-xl transition-[left] duration-300 ease-out ${
        collapsed ? "lg:left-20" : "lg:left-[260px]"
      } left-0`}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-slate-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="hidden min-w-0 xl:block">
            <h1 className="truncate text-base font-semibold text-white">{title}</h1>
            <p className="truncate text-sm text-slate-400">{description}</p>
          </div>

          <div className="flex h-11 min-w-[220px] max-w-[460px] flex-1 items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:min-w-[280px]">
            <Search className="h-4 w-4 shrink-0" />
            <input
              type="search"
              placeholder="Search users, skills, reports, settings..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-400/15 bg-rose-400/10 px-3 text-sm font-medium text-rose-200 transition hover:border-rose-400/30 hover:bg-rose-400/16 hover:text-white"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-slate-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2 text-left transition hover:border-white/15 hover:bg-white/[0.08]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium text-white">{currentUser?.name}</p>
              <p className="truncate text-xs text-slate-400">Admin</p>
            </div>
            <ChevronsUpDown className="hidden h-4 w-4 text-slate-500 sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
