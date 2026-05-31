const DASHBOARD_ROUTES = [
  "/home",
  "/dashboard",
  "/ai",
  "/community",
  "/users",
  "/requests",
  "/create-post",
] as const;

export function isDashboardShellPath(pathname: string) {
  return (
    DASHBOARD_ROUTES.includes(pathname as (typeof DASHBOARD_ROUTES)[number]) ||
    pathname.startsWith("/profile/") ||
    pathname.startsWith("/messages/")
  );
}
