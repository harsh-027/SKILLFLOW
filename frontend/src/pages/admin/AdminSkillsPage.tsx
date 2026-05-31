import { useEffect, useMemo, useState } from "react";
import { Layers3, ListChecks, Sparkles } from "lucide-react";

import API from "@/api/axios";
import KpiCard from "@/components/admin/dashboard/KpiCard";

type Listing = {
  _id: string;
  category: string;
  status: "active" | "removed";
};

type CategoryPoint = {
  name: string;
  value: number;
  count: number;
};

export default function AdminSkillsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [skillCategories, setSkillCategories] = useState<CategoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkillsData = async () => {
      try {
        const [{ data: listingsData }, { data: analyticsData }] = await Promise.all([
          API.get("/admin/listings"),
          API.get("/admin/analytics"),
        ]);

        setListings(Array.isArray(listingsData) ? listingsData : []);
        setSkillCategories(Array.isArray(analyticsData?.skillCategories) ? analyticsData.skillCategories : []);
      } finally {
        setLoading(false);
      }
    };

    loadSkillsData();
  }, []);

  const activeListings = listings.filter((listing) => listing.status === "active");
  const removedListings = listings.filter((listing) => listing.status === "removed");
  const topCategory = skillCategories[0];

  const kpiCards = useMemo(
    () => [
      {
        label: "Live Skills",
        value: String(activeListings.length),
        trend: String(skillCategories.length),
        helper: "active categories",
        icon: Layers3,
      },
      {
        label: "Top Category",
        value: topCategory ? `${topCategory.value}%` : "0%",
        trend: topCategory ? String(topCategory.count) : "0",
        helper: topCategory ? `${topCategory.name} listings` : "no listings yet",
        icon: Sparkles,
      },
      {
        label: "Removed Listings",
        value: String(removedListings.length),
        trend: String(listings.length),
        helper: "total listings reviewed",
        icon: ListChecks,
      },
    ],
    [activeListings.length, listings.length, removedListings.length, skillCategories.length, topCategory]
  );

  if (loading) {
    return <div className="loading-copy">Loading skills marketplace data...</div>;
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Skills Management</h1>
          <p className="text-sm text-slate-400">
            Monitor marketplace supply, categories, and listing moderation from live data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-10 rounded-lg bg-white px-4 text-sm font-medium text-black transition hover:bg-slate-200"
          >
            Refresh
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-5 shadow-sm"
          >
            <KpiCard {...card} />
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-5 flex flex-col gap-2">
          <h2 className="text-base font-semibold text-white">Skill Category Coverage</h2>
          <p className="text-xs text-slate-400">
            Live marketplace composition based on active listings
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {skillCategories.map((category) => (
            <div
              key={category.name}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-[#111827] to-[#0b1220] p-4 transition hover:border-cyan-400/20 hover:shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition group-hover:opacity-100" />

              <p className="relative text-sm font-medium text-slate-300">{category.name}</p>

              <p className="relative mt-3 text-3xl font-bold tracking-tight text-white">
                {category.value}%
              </p>
              <p className="relative mt-1 text-xs text-slate-500">{category.count} live listings</p>

              <div className="relative mt-3 h-1.5 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-400/70 transition-all"
                  style={{ width: `${category.value}%` }}
                />
              </div>

              <p className="relative mt-2 text-xs text-slate-500">of marketplace volume</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
