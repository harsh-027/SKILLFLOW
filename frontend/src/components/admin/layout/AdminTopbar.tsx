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
      className="sticky top-0 z-30 h-16 border-b border-gray-300 bg-white"
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-gray-300 bg-white text-black md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-black sm:text-2xl">
              {title.replace("Admin ", "")}
            </h1>
            <p className="hidden truncate text-sm text-gray-600 xl:block">{description}</p>
          </div>

          <div className="ml-auto hidden h-10 min-w-[240px] max-w-[420px] flex-1 items-center gap-3 rounded border border-gray-300 bg-white px-3 text-gray-600 lg:flex">
            <Search className="h-4 w-4 shrink-0" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden h-10 items-center gap-2 rounded border border-gray-300 bg-white px-3 text-sm text-black xl:flex">
            <CalendarDays className="h-4 w-4 text-gray-600" />
            {new Date().toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-gray-300 bg-white text-black"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div
            className="flex h-10 w-10 items-center justify-center rounded border border-gray-300 bg-gray-100 text-sm font-bold text-black"
            title={currentUser?.name || "Admin"}
          >
            {currentUser?.name?.slice(0, 2).toUpperCase() || "AD"}
          </div>
        </div>
      </div>
    </header>
  );
}
