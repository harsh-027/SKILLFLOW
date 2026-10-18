import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Compass, Layers3, MapPin, Sparkles, UserRoundSearch } from "lucide-react";
import { getProfileImage, getPreferredUserLabel } from "@/lib/user-display";
import DashboardPostCard from "@/components/ui/post-card";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useApp } from "@/context/AppContext";

type BasicUser = { _id: string; name: string; avatar?: string; profileImage?: string; updatedAt?: string; location?: string; bio?: string; skillsOffered: string[]; skillsWanted: string[]; };
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

  if (bootstrapping) return <div className="grid gap-4 md:grid-cols-2"><div className="glass-card card"><LoadingIndicator label="Loading dashboard..." /></div><div className="glass-card card"><LoadingIndicator label="Loading activity..." /></div></div>;
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
      <div className="dashboard-shell-grid">
        <aside className="dashboard-left-rail">
          <article className="glass-card dashboard-profile-card">
            <div className="dashboard-profile-cover" />
            <Link to={`/profile/${currentUser._id}`} className="dashboard-profile-avatar"><img src={getProfileImage(currentUser)} alt={getPreferredUserLabel(currentUser)} /></Link>
            <h2>{getPreferredUserLabel(currentUser)}</h2>
            {currentUser.bio ? <p>{currentUser.bio}</p> : <p>Keep learning and sharing your momentum.</p>}
            {currentUser.location ? <span className="dashboard-location"><MapPin size={14} />{currentUser.location}</span> : null}
          </article>
          <nav className="glass-card dashboard-side-nav" aria-label="Dashboard shortcuts">
            {quickLinks.map(({ title, copy, to, icon: Icon }) => <Link key={title} to={to}><span className="dashboard-side-nav-icon"><Icon size={16} /></span><span><strong>{title}</strong><small>{copy}</small></span><ArrowRight size={14} /></Link>)}
          </nav>
        </aside>

        <main className="dashboard-primary-column">
          <article className="glass-card dashboard-composer-card">
            <div className="dashboard-composer-row"><img src={getProfileImage(currentUser)} alt="" /><Link to="/create-post">Share a learning update, skill, or win...</Link></div>
            <div className="dashboard-composer-actions"><Link to="/create-post"><ArrowUpRight size={16} />Create post</Link><Link to="/requests"><BriefcaseBusiness size={16} />Review requests</Link><Link to="/users"><UserRoundSearch size={16} />Find people</Link></div>
          </article>

          <section className="dashboard-overview-grid">
            {overviewCards.map(({ label, value, note, icon: Icon }) => <article key={label} className="glass-card dashboard-overview-card"><div className="dashboard-overview-head"><span className="dashboard-overview-label">{label}</span><div className="dashboard-overview-icon"><Icon size={16} /></div></div><p className="dashboard-overview-value">{value}</p><p className="dashboard-overview-note">{note}</p></article>)}
          </section>

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
        </main>

        <aside className="dashboard-right-rail">
          <article className="glass-card dashboard-rail-card"><div className="dashboard-rail-title-wrap"><div><div className="dashboard-kicker">Your workspace</div><h3 className="section-title">SkillFlow snapshot</h3></div><Sparkles size={18} /></div><div className="dashboard-rail-stats">{overviewCards.map(({ label, value, note }) => <div className="dashboard-rail-stat" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div></article>
          <article className="glass-card dashboard-rail-card"><div className="dashboard-rail-title-wrap"><div><div className="dashboard-kicker">Keep moving</div><h3 className="section-title">Useful shortcuts</h3></div><Compass size={18} /></div><div className="dashboard-rail-actions">{quickLinks.map(({ title, to, icon: Icon }) => <Link key={title} to={to}><Icon size={15} />{title}<ArrowRight size={14} /></Link>)}</div></article>
        </aside>
      </div>
    </div>
  );
}
