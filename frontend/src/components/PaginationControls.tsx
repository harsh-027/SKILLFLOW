import type { PaginationMeta } from "@/lib/pagination";

type PaginationControlsProps = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

export default function PaginationControls({ meta, onPageChange }: PaginationControlsProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
      <span>
        Page {meta.currentPage} of {meta.totalPages} · {meta.totalItems} total
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(meta.currentPage - 1)}
          disabled={!meta.hasPreviousPage}
          className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-slate-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(meta.currentPage + 1)}
          disabled={!meta.hasNextPage}
          className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-slate-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
