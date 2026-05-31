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
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <div className="flex min-h-screen">
        <aside
          className={`h-screen shrink-0 border-r border-white/10 bg-[#0f172a] transition-all duration-300 ${
            collapsed ? "w-20" : "w-[260px]"
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
            collapsed={collapsed}
            title={pageMeta.title}
            description={pageMeta.description}
            onOpenMobileSidebar={() => setMobileOpen(true)}
          />

          <main className="flex-1 px-4 pb-6 pt-24 sm:px-5 lg:px-6 lg:pb-8 lg:pt-[88px]">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 lg:gap-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
