import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Compass, Layers3, Sparkles, UserRoundSearch } from "lucide-react";
import DashboardPostCard from "@/components/ui/post-card";
import { useApp } from "@/context/AppContext";

type BasicUser = { _id: string; name: string; avatar?: string; profileImage?: string; location?: string; bio?: string; skillsOffered: string[]; skillsWanted: string[]; };
type PostItem = { _id: string; user: string | BasicUser; content?: string; image?: string; createdAt: string; likes: string[]; comments: Array<{ _id: string; user: string | BasicUser; text: string }>; };

export default function DashboardPage() {
  const {
    currentUser,
    sortedPosts,
    requests,
    getUserById,
    toggleLike,
    addComment,
    deletePost,
    bootstrapping,
  } = useApp();

  const userPosts = useMemo(() => {
    if (!currentUser) return [];
    return (sortedPosts as PostItem[]).filter((post) => {
      const postUserId = typeof post.user === "object" && post.user !== null ? post.user._id : post.user;
      return postUserId === currentUser._id;
    });
  }, [sortedPosts, currentUser]);

  if (bootstrapping) return <div className="grid gap-4 md:grid-cols-2"><div className="glass-card card">Loading dashboard...</div><div className="glass-card card">Loading activity...</div></div>;
  if (!currentUser) return null;

  const totalSkillsCount = new Set([...(currentUser.skillsOffered || []), ...(currentUser.skillsWanted || [])]).size;
  const offeredCount = (currentUser.skillsOffered || []).length;
  const wantedCount = (currentUser.skillsWanted || []).length;
  const latestPost = userPosts[0];
  const overviewCards = [
    {
      label: "Your posts",
      value: userPosts.length,
      note: latestPost ? new Date(latestPost.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "No posts yet",
      icon: Layers3,
    },
    {
      label: "Swap requests",
      value: requests.length,
      note: requests.length ? "Needs review" : "None active",
      icon: BriefcaseBusiness,
    },
    {
      label: "Skills listed",
      value: totalSkillsCount,
      note: `${offeredCount} offered, ${wantedCount} wanted`,
      icon: Sparkles,
    },
  ];

  const quickLinks = [
    { title: "Post update", copy: "Share progress.", to: "/create-post", icon: ArrowUpRight },
    { title: "Requests", copy: "Review swaps.", to: "/requests", icon: Compass },
    { title: "People", copy: "Find matches.", to: "/users", icon: UserRoundSearch },
  ];

  return (
    <div className="page min-w-0 dashboard-page">
      <section className="dashboard-overview-grid">
        {overviewCards.map(({ label, value, note, icon: Icon }) => (
          <article key={label} className="glass-card dashboard-overview-card">
            <div className="dashboard-overview-head">
              <span className="dashboard-overview-label">{label}</span>
              <div className="dashboard-overview-icon"><Icon size={16} /></div>
            </div>
            <p className="dashboard-overview-value">{value}</p>
            <p className="dashboard-overview-note">{note}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-quick-links">
        {quickLinks.map(({ title, copy, to, icon: Icon }) => (
          <Link key={title} to={to} className="glass-card dashboard-quick-link">
            <div className="dashboard-quick-link-head">
              <div className="dashboard-quick-link-icon"><Icon size={17} /></div>
              <ArrowRight size={16} />
            </div>
            <p className="dashboard-quick-link-title">{title}</p>
            <p className="dashboard-quick-link-copy">{copy}</p>
          </Link>
        ))}
      </section>

      <div className="dashboard-main-grid dashboard-main-grid-single">
        <div className="dashboard-primary-column">
          <article className="glass-card card dashboard-feed-card min-w-0">
            <div className="dashboard-section-head">
              <div>
                <div className="dashboard-kicker">Activity log</div>
                <h3 className="section-title">Recent Posts</h3>
                <p className="section-sub">Latest workspace activity.</p>
              </div>
              <Link className="btn-red" to="/create-post">Write Update <ArrowUpRight size={14} /></Link>
            </div>
            <div className="dashboard-post-list">
              {userPosts.slice(0, 6).map((post) => (
                <DashboardPostCard key={post._id} post={post} author={typeof post.user === "object" && post.user ? post.user : getUserById(post.user as string)} currentUser={currentUser} getUserById={getUserById} onLike={toggleLike} onComment={addComment} onDelete={deletePost} showCommentComposer={false} />
              ))}
              {!userPosts.length ? (
                <div className="dashboard-empty-state">
                  <Sparkles size={18} />
                  <p>No posts yet.</p>
                </div>
              ) : null}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
