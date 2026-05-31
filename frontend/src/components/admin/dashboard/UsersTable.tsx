import { Ban, Trash2 } from "lucide-react";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Review" | "Suspended";
};

const statusClasses: Record<AdminUserRow["status"], string> = {
  Active: "bg-emerald-400/10 text-emerald-300 border-emerald-400/10",
  Review: "bg-amber-400/10 text-amber-300 border-amber-400/10",
  Suspended: "bg-rose-400/10 text-rose-300 border-rose-400/10",
};

type UsersTableProps = {
  rows: AdminUserRow[];
};

export default function UsersTable({ rows }: UsersTableProps) {
  return (
    <div className="max-h-[60vh] overflow-auto rounded-xl border border-white/5">
      <table className="min-w-[720px] w-full border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-[#111827]/95 backdrop-blur">
          <tr className="border-b border-white/5 text-xs uppercase tracking-[0.18em] text-slate-500">
            <th className="px-4 py-3 font-medium">User Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-white/5 text-sm text-slate-200 transition hover:bg-white/[0.03]"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-semibold text-slate-950">
                    {row.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{row.name}</p>
                    <p className="text-xs text-slate-500">#{row.id.slice(0, 8)}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-slate-300">{row.email}</td>
              <td className="px-4 py-4">
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-slate-300">
                  {row.role}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[row.status]}`}>
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-slate-300 transition hover:border-amber-400/20 hover:bg-amber-400/10 hover:text-amber-300"
                    aria-label={`Ban ${row.name}`}
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04] text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-400/10 hover:text-rose-300"
                    aria-label={`Delete ${row.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
