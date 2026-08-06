import { InfinityLoop } from "@/components/infinity";

type LoadingIndicatorProps = {
  label?: string;
  className?: string;
  iconClassName?: string;
};

export default function LoadingIndicator({
  label = "Loading...",
  className = "",
  iconClassName = "h-12 w-16",
}: LoadingIndicatorProps) {
  return (
    <div className={`flex min-h-32 flex-col items-center justify-center gap-3 text-center text-slate-300 ${className}`}>
      <InfinityLoop className={`text-current ${iconClassName}`} aria-hidden="true" />
      {label ? <p className="muted">{label}</p> : null}
    </div>
  );
}

export function InlineLoadingIndicator({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <InfinityLoop className="h-4 w-5" aria-hidden="true" />
      {label}
    </span>
  );
}
