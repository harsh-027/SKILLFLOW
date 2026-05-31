import { useEffect, useMemo, useState } from "react";

import API from "@/api/axios";
import SectionCard from "@/components/admin/dashboard/SectionCard";
import SkillCategoryChart from "@/components/admin/dashboard/SkillCategoryChart";
import UserGrowthChart from "@/components/admin/dashboard/UserGrowthChart";

type GrowthPoint = {
  name: string;
  count: number;
};

type CategoryPoint = {
  name: string;
  value: number;
  count: number;
};

type AnalyticsResponse = {
  totalUsers: number;
  totalListings: number;
  totalExchanges: number;
  skillCategories: CategoryPoint[];
  growth: {
    users: GrowthPoint[];
    listings: GrowthPoint[];
    exchanges: GrowthPoint[];
  };
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const { data } = await API.get("/admin/analytics");
        setAnalytics(data);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const userGrowthData = useMemo(
    () =>
      (analytics?.growth.users || []).map((point) => ({
        name: point.name,
        users: point.count,
      })),
    [analytics?.growth.users]
  );

  const topCategory = analytics?.skillCategories?.[0];

  if (loading) {
    return <div className="loading-copy">Loading analytics overview...</div>;
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Analytics Overview</h1>
        <p className="text-sm text-slate-400">
          Understand platform growth, supply distribution, and user engagement trends.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="User Acquisition Trend"
            description="Track real account creation over the last 6 months."
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Updated from live database activity
              </div>

              <div className="flex gap-2">
                <span className="rounded-md bg-white/[0.05] px-2 py-1 text-xs text-slate-300">
                  Monthly
                </span>
              </div>
            </div>

            <UserGrowthChart data={userGrowthData} />
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Skill Category Mix"
            description="Where marketplace supply is currently concentrated"
          >
            <SkillCategoryChart data={analytics?.skillCategories || []} />
          </SectionCard>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5">
            <h3 className="text-sm font-semibold text-white">Key Insight</h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {topCategory
                ? `${topCategory.name} currently leads with ${topCategory.count} active listings, which represents ${topCategory.value}% of live marketplace supply.`
                : "No listing categories are available yet, so this panel will fill in once real marketplace data exists."}
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-emerald-300">
                {analytics?.totalUsers || 0} users
              </span>
              <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-cyan-300">
                {analytics?.totalListings || 0} active listings
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
