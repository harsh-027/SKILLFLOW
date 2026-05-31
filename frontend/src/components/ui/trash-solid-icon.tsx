type TrashSolidIconProps = {
  size?: number;
  className?: string;
};

export default function TrashSolidIcon({
  size = 18,
  className,
}: TrashSolidIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      focusable="false"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M9.25 3.5a1.25 1.25 0 0 1 1.25-1.25h3a1.25 1.25 0 0 1 1.25 1.25V5h4a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1 0-1.5h4V3.5Zm4 0a.25.25 0 0 0-.25-.25h-2a.25.25 0 0 0-.25.25V5h2.5V3.5Z" />
      <path d="M6.75 8.25c0-.69.56-1.25 1.25-1.25h8c.69 0 1.25.56 1.25 1.25v8.75A3.25 3.25 0 0 1 14 20.25h-4A3.25 3.25 0 0 1 6.75 17V8.25Z" />
    </svg>
  );
}
