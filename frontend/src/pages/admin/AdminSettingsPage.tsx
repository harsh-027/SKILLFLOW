import SectionCard from "@/components/admin/dashboard/SectionCard";

const settingsSections = [
  {
    title: "Moderation Guardrails",
    description: "Escalation rules, queue thresholds, and auto-review heuristics.",
  },
  {
    title: "Notification Preferences",
    description: "Alert routing for suspicious activity, flags, and daily summaries.",
  },
  {
    title: "Operator Access",
    description: "Control which internal roles can access sensitive dashboard actions.",
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">System Settings</h1>
        <p className="text-sm text-slate-400">
          Configure moderation rules, notifications, and internal access controls.
        </p>
      </div>

      <SectionCard
        title="Administrative Controls"
        description="Manage platform behavior, safety rules, and operator permissions."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {settingsSections.map((section) => (
            <div
              key={section.title}
              className="group relative rounded-[8px] border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/20 hover:bg-white/[0.055]"
            >
              <div className="absolute inset-0 rounded-[8px] bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition group-hover:opacity-100" />

              <h3 className="relative text-base font-semibold text-white">
                {section.title}
              </h3>

              <p className="relative mt-2 text-sm leading-7 text-slate-400">
                {section.description}
              </p>

              <div className="relative mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">Click to configure</span>

                <button className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.08]">
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
