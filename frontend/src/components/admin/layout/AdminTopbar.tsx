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
      className="sticky top-0 z-30 h-[82px] border-b border-white/8 bg-[#071014]/92 backdrop-blur-xl"
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-[-0.01em] text-white sm:text-3xl">
              {title.replace("Admin ", "")}
            </h1>
            <p className="hidden truncate text-sm text-slate-500 xl:block">{description}</p>
          </div>

          <div className="ml-auto hidden h-11 min-w-[240px] max-w-[420px] flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/[0.055] px-4 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] lg:flex">
            <Search className="h-4 w-4 shrink-0" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 text-sm text-slate-200 xl:flex">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            {new Date().toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-slate-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#b96c42] to-[#6b2f22] text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
            title={currentUser?.name || "Admin"}
          >
            {currentUser?.name?.slice(0, 2).toUpperCase() || "AD"}
          </div>
        </div>
      </div>
    </header>
  );
}
