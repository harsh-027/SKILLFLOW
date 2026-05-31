export default function AiSectionSkeleton({
  rows = 3,
  compact = false,
}: {
  rows?: number;
  compact?: boolean;
}) {
  return (
    <div className={`ai-loading-stack ${compact ? "compact" : ""}`} role="status" aria-live="polite">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="card ai-loading-card">
          <span className="loading-dot" aria-hidden="true" />
          <p className="loading-copy">Loading AI suggestions...</p>
        </div>
      ))}
    </div>
  );
}
