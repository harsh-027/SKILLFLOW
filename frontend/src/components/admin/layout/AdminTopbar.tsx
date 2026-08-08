import {
  Bell,
  CalendarDays,
  Menu,
  Search,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

type AdminTopbarProps = {
  title: string;
  description: string;
  onOpenMobileSidebar: () => void;
};

export default function AdminTopbar({
  title,
  description,
  onOpenMobileSidebar,
}: AdminTopbarProps) {
  const { currentUser } = useApp();

  return (
    <header
      className="sticky top-0 z-30 h-[76px] border-b border-[var(--border-subtle)] bg-[var(--header-bg)] backdrop-blur-xl"
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-white sm:text-2xl">
              {title.replace("Admin ", "")}
            </h1>
            <p className="hidden truncate text-sm text-slate-500 xl:block">{description}</p>
          </div>

          <div className="ml-auto hidden h-10 min-w-[240px] max-w-[420px] flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 text-slate-400 lg:flex">
            <Search className="h-4 w-4 shrink-0" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm text-slate-200 xl:flex">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            {new Date().toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] text-sm font-bold text-[var(--accent-contrast)]"
            title={currentUser?.name || "Admin"}
          >
            {currentUser?.name?.slice(0, 2).toUpperCase() || "AD"}
          </div>
        </div>
      </div>
    </header>
  );
}
