import { ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar, { adminNavigation } from "@/components/admin/layout/AdminSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";

function getPageMeta(pathname: string) {
  const matchedItem = adminNavigation.find((item) => pathname.startsWith(item.to));

  if (!matchedItem) {
    return {
      title: "Admin Dashboard",
      description:
        "Operational visibility across users, skills, reports, analytics, and settings.",
    };
  }

  const metadataByRoute: Record<string, { title: string; description: string }> = {
    "/admin/dashboard": {
      title: "Admin Dashboard",
      description:
        "Monitor core SaaS health signals, adoption, and flagged activity in one view.",
    },
    "/admin/users": {
      title: "User Operations",
      description:
        "Review account health, role posture, status, and moderation actions.",
    },
    "/admin/skills": {
      title: "Skill Catalog",
      description:
        "Track inventory quality, category coverage, and supply trends across listings.",
    },
    "/admin/reports": {
      title: "Reports Queue",
      description:
        "Resolve abuse, safety, and trust complaints with fast operator workflows.",
    },
    "/admin/analytics": {
      title: "Platform Analytics",
      description:
        "Inspect growth, retention, and marketplace activity with deeper chart views.",
    },
    "/admin/settings": {
      title: "Workspace Settings",
      description:
        "Manage guardrails, alerts, access rules, and operational preferences.",
    },
  };

  return metadataByRoute[matchedItem.to] || {
    title: matchedItem.label,
    description: "Platform operations and moderation workspace.",
  };
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageMeta = useMemo(() => getPageMeta(location.pathname), [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#03090c] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(39,82,61,0.2),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(65,86,98,0.16),transparent_28%),linear-gradient(135deg,#03090c_0%,#071013_48%,#020506_100%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1720px] p-3 sm:p-5 lg:p-7">
        <div className="flex min-h-[calc(100vh-1.5rem)] w-full overflow-hidden rounded-[10px] border border-white/15 bg-[#071014]/88 shadow-[0_30px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3.5rem)]">
        <aside
          className={`w-0 shrink-0 border-r border-white/12 bg-black/10 transition-all duration-300 md:block ${
            collapsed ? "md:w-20" : "md:w-[260px]"
          }`}
        >
          <AdminSidebar
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
            onToggleCollapse={() => setCollapsed((prev) => !prev)}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar
            title={pageMeta.title}
            description={pageMeta.description}
            onOpenMobileSidebar={() => setMobileOpen(true)}
          />

          <main className="flex-1 overflow-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <div className="mx-auto flex w-full max-w-[1460px] flex-col gap-5 lg:gap-6">
              {children}
            </div>
          </main>
        </div>
        </div>
      </div>
    </div>
  );
}
