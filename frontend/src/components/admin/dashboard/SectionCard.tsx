import { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

export default function SectionCard({
  title,
  description,
  action,
  className = "",
  contentClassName = "",
  children,
}: SectionCardProps) {
  return (
    <section
      className={`glass-card overflow-hidden rounded border border-gray-300 bg-white ${className}`}
    >
      {title || description || action ? (
        <div className="flex flex-col gap-4 border-b border-gray-300 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className="text-base font-semibold text-black">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}

      <div className={`p-4 sm:p-5 ${contentClassName}`}>{children}</div>
    </section>
  );
}
