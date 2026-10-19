import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { getPreferredUserLabel } from "@/lib/user-display";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useApp } from "@/context/AppContext";

type BasicUser = { _id: string; name: string; updatedAt?: string; location?: string; bio?: string; skillsOffered: string[]; skillsWanted: string[]; };
type PostItem = { _id: string; user: string | BasicUser; content?: string; image?: string; createdAt: string; likes: string[]; comments: Array<{ _id: string; user: string | BasicUser; text: string }>; };

export default function DashboardPage() {
  const {
    currentUser,
    sortedPosts,
    requests,
    bootstrapping,
  } = useApp();

  const userPosts = useMemo(() => {
    if (!currentUser) return [];
    return (sortedPosts as PostItem[]).filter((post) => {
      const postUserId = typeof post.user === "object" && post.user !== null ? post.user._id : post.user;
      return postUserId === currentUser._id;
    });
  }, [sortedPosts, currentUser]);

  if (bootstrapping) return <div className="grid gap-4 md:grid-cols-2"><div className="glass-card card"><LoadingIndicator label="Loading dashboard..." /></div><div className="glass-card card"><LoadingIndicator label="Loading activity..." /></div></div>;
  if (!currentUser) return null;

  const offeredCount = (currentUser.skillsOffered || []).length;
  const wantedCount = (currentUser.skillsWanted || []).length;

  const formatContributionKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const postCounts = new Map<string, number>();
  userPosts.forEach((post) => {
    const key = formatContributionKey(new Date(post.createdAt));
    postCounts.set(key, (postCounts.get(key) || 0) + 1);
  });
  const contributionWeekCount = 53;
  const contributionStart = new Date();
  contributionStart.setHours(0, 0, 0, 0);
  contributionStart.setDate(contributionStart.getDate() - ((contributionStart.getDay() + 6) % 7) - ((contributionWeekCount - 1) * 7));
  const contributionCells = Array.from({ length: contributionWeekCount * 7 }, (_, index) => {
    const date = new Date(contributionStart);
    date.setDate(contributionStart.getDate() + index);
    const key = formatContributionKey(date);
    const count = postCounts.get(key) || 0;
    return { key, date, count };
  });
  const contributionMonthLabels = Array.from({ length: contributionWeekCount }, (_, week) => {
    const date = contributionCells[week * 7].date;
    const previous = week ? contributionCells[(week - 1) * 7].date : null;
    return !previous || date.getMonth() !== previous.getMonth() || date.getFullYear() !== previous.getFullYear()
      ? date.toLocaleDateString("en-IN", { month: "short" })
      : "";
  });

  return (
    <div className="page min-w-0 dashboard-page">
      <header className="dashboard-page-head">
        <div>
          <p className="dashboard-kicker">Overview</p>
          <h1>Good to see you, {getPreferredUserLabel(currentUser)}.</h1>
          <p className="dashboard-page-lede">Keep your learning goals, exchanges, and next steps moving.</p>
        </div>
        <div className="dashboard-page-actions">
          <Link className="btn-outline-red" to="/users">Find people</Link>
          <Link className="btn-red" to="/create-post">Write update <ArrowUpRight size={14} /></Link>
        </div>
      </header>
      <article className="glass-card dashboard-summary-card dashboard-summary-primary">
        <div className="dashboard-section-head"><div><div className="dashboard-kicker">At a glance</div><h3 className="section-title">Your focus</h3></div><Sparkles size={18} /></div>
        <div className="dashboard-focus-row"><span>Skills you offer</span><strong>{offeredCount}</strong></div>
        <div className="dashboard-focus-row"><span>Skills you want</span><strong>{wantedCount}</strong></div>
        <div className="dashboard-focus-row"><span>Active requests</span><strong>{requests.length}</strong></div>
        <Link className="dashboard-summary-link" to={`/profile/${currentUser._id}`}>View your profile <ArrowUpRight size={14} /></Link>
      </article>

      <section className="glass-card dashboard-contribution-card" aria-label="Contribution activity">
        <div className="dashboard-contribution-head">
          <div><h2>Contributors</h2></div>
          <span className="dashboard-contribution-period">Last 12 months</span>
        </div>
        <div className="dashboard-contribution-months">{contributionMonthLabels.map((label, week) => <span key={week} style={{ gridColumn: week + 1 }}>{label}</span>)}</div>
        <div className="dashboard-contribution-chart">
          <div className="dashboard-contribution-weekdays"><span>Mon</span><span /><span>Wed</span><span /><span /><span /><span>Sun</span></div>
          <div className="dashboard-contribution-grid" aria-label="Posts by day">
            {contributionCells.map(({ key, date, count }) => <span key={key} className={`dashboard-contribution-cell level-${Math.min(count, 4)}`} title={`${count} post${count === 1 ? "" : "s"} on ${date.toLocaleDateString("en-IN")}`} />)}
          </div>
        </div>
        <div className="dashboard-contribution-footer"><span>Learn how we count contributions</span><span className="dashboard-legend-scale"><span>Less</span><i className="level-0" /><i className="level-1" /><i className="level-2" /><i className="level-3" /><i className="level-4" /><span>More</span></span></div>
      </section>

    </div>
  );
}
