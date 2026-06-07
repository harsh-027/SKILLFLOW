import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Code2,
  MessageSquareText,
  Route,
  Sparkles,
  Star,
  WandSparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import API from "@/api/axios";
import { useApp } from "@/context/AppContext";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Workspace", href: "#workspace" },
  { label: "AI", href: "#ai" },
  { label: "Community", to: "/community" },
];

const featureItems = [
  {
    title: "Guided paths",
    description: "Follow focused learning tracks with practical checkpoints and curated resources.",
    icon: BookOpen,
  },
  {
    title: "Peer swaps",
    description: "Trade reviews, share progress, and learn with people building at the same pace.",
    icon: Users,
  },
  {
    title: "Progress signals",
    description: "See streaks, completions, and confidence metrics without leaving your workspace.",
    icon: BarChart3,
  },
];

const easeOut = [0.22, 1, 0.36, 1];
const defaultStats = [
  { label: "Builders", value: "0" },
  { label: "Skills", value: "0" },
  { label: "Swaps", value: "0" },
];

const aiDetails = [
  {
    title: "Path planning",
    description: "Turn a skill goal into focused milestones, checkpoints, and next actions.",
    icon: Route,
  },
  {
    title: "Skill matching",
    description: "Surface peers whose offers and learning goals line up with your current work.",
    icon: Sparkles,
  },
  {
    title: "Progress prompts",
    description: "Get concise suggestions that keep practice moving without adding noise.",
    icon: WandSparkles,
  },
];

const emptyReviewForm = {
  name: "",
  rating: 5,
  comment: "",
};

function renderNavItem(item) {
  if ("to" in item) {
    return (
      <Link key={item.label} to={item.to} className="resend-nav-link">
        {item.label}
      </Link>
    );
  }

  return (
    <a key={item.label} href={item.href} className="resend-nav-link">
      {item.label}
    </a>
  );
}

function LandingPage() {
  const { user, logout, currentUser } = useApp();
  const [landingStats, setLandingStats] = useState(defaultStats);
  const [rawStats, setRawStats] = useState({ builders: 0, skills: 0, swaps: 0, paths: 0, posts: 0 });
  const [siteReviews, setSiteReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const primaryPath = user ? "/home" : "/register";
  const primaryLabel = user ? "Open workspace" : "Get started";
  const userSkillCount = useMemo(() => {
    if (!currentUser) return rawStats.skills;
    return new Set([...(currentUser.skillsOffered || []), ...(currentUser.skillsWanted || [])]).size;
  }, [currentUser, rawStats.skills]);

  useEffect(() => {
    let active = true;

    API.get("/public/landing")
      .then(({ data }) => {
        if (!active) return;
        setLandingStats(Array.isArray(data.displayStats) ? data.displayStats : defaultStats);
        setRawStats(data.stats || { builders: 0, skills: 0, swaps: 0, paths: 0, posts: 0 });
      })
      .catch(() => {
        if (active) {
          setLandingStats(defaultStats);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    API.get("/public/site-reviews")
      .then(({ data }) => {
        if (active) {
          setSiteReviews(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (active) {
          setSiteReviews([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isReviewModalOpen && currentUser?.name && !reviewForm.name) {
      setReviewForm((current) => ({ ...current, name: currentUser.name }));
    }
  }, [currentUser, isReviewModalOpen, reviewForm.name]);

  const handleReviewChange = (event) => {
    const { name, value } = event.target;
    setReviewForm((current) => ({
      ...current,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewSubmitting(true);
    setReviewMessage("");

    try {
      const { data } = await API.post("/public/site-reviews", reviewForm);
      setSiteReviews((current) => [data, ...current.filter((item) => item._id !== data._id)]);
      setReviewForm(currentUser?.name ? { ...emptyReviewForm, name: currentUser.name } : emptyReviewForm);
      setReviewMessage("Thanks for reviewing SkillFlow.");
      setIsReviewModalOpen(false);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Unable to submit your review right now.";
      setReviewMessage(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div id="top" className="landing-shell resend-shell">
      <div className="landing-review-float" aria-label="Website review">
        <span>Website review</span>
        <button type="button" onClick={() => setIsReviewModalOpen(true)}>
          Review
        </button>
      </div>

      <header className="resend-header">
        <div className="resend-nav">
          <Link to="/" className="resend-brand" aria-label="SkillFlow home">
            <span>SkillFlow</span>
          </Link>

          <nav className="resend-nav-center" aria-label="Primary navigation">
            {navItems.map(renderNavItem)}
          </nav>

          <div className="resend-nav-actions">
            {user ? (
              <button type="button" onClick={() => void logout()} className="resend-login resend-login-button">
                Log out
              </button>
            ) : (
              <Link to="/login" className="resend-login">
                Log in
              </Link>
            )}
            <Link to={primaryPath} className="resend-button resend-button-primary resend-nav-cta">
              {user ? primaryLabel : "Get started"}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      <main className="resend-main">
        <section className="resend-hero resend-hero-layout">
          <h1 className="sr-only">
            SkillFlow helps builders learn real-world skills with guided paths and peer swaps.
          </h1>
          <motion.div
            className="resend-hero-grid"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: easeOut }}
          >
            <div className="resend-hero-side resend-hero-side-left">
              <span className="resend-hero-side-label">Skill Exchange</span>
              <div className="resend-hero-actions resend-hero-actions-left">
                <Link to={primaryPath} className="resend-button resend-button-primary">
                  {primaryLabel}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="resend-hero-center">
              <div className="resend-hero-word" aria-hidden="true">SKILLFLOW</div>
            </div>

            <div className="resend-hero-side resend-hero-side-right">
              <span className="resend-hero-side-label">Peer Momentum</span>
              <div className="resend-hero-stat-list">
                {landingStats.map((item) => (
                  <div key={item.label} className="resend-hero-stat-card">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section id="features" className="resend-section">
          <div className="resend-section-head">
            <span className="resend-eyebrow">Integrate learning into your week</span>
            <h2>A cleaner way to learn, practice, and grow.</h2>
          </div>

          <div className="resend-feature-grid">
            {featureItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="resend-feature-card">
                  <Icon size={20} />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <CheckCircle2 size={16} />
                </article>
              );
            })}
          </div>
        </section>

        <section id="workspace" className="resend-section resend-workspace-section">
          <div className="resend-workspace-copy">
            <span className="resend-eyebrow">Developer-grade focus</span>
            <h2>Everything in your control.</h2>
          </div>

          <div className="resend-dashboard-card">
            <div className="resend-dashboard-top">
              <Code2 size={18} />
              <span>SkillFlow Workspace</span>
            </div>
            <div className="resend-dashboard-grid">
              <div>
                <span>Active path</span>
                <strong>{rawStats.paths}</strong>
              </div>
              <div>
                <span>Peer swaps</span>
                <strong>{rawStats.swaps}</strong>
              </div>
              <div>
                <span>Community posts</span>
                <strong>{rawStats.posts}</strong>
              </div>
              <div>
                <span>{currentUser ? "Your skills" : "Skills"}</span>
                <strong>{userSkillCount}</strong>
              </div>
            </div>
          </div>
        </section>

        <section id="ai" className="resend-section resend-ai-section">
          <div className="resend-ai-panel">
            <div className="resend-ai-panel-top">
              <Sparkles size={18} />
              <span>SkillFlow AI</span>
            </div>
            <div className="resend-ai-detail-list">
              {aiDetails.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="resend-ai-detail-card">
                    <Icon size={19} />
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="resend-ai-copy">
            <span className="resend-eyebrow">AI Lab</span>
            <h2>Guidance that keeps your learning path moving.</h2>
            <Link to={user ? "/ai" : "/register"} className="resend-button resend-button-primary">
              {user ? "Open AI Lab" : "Start with AI"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section id="reviews" className="resend-section resend-reviews-section">
          <div className="resend-section-head">
            <span className="resend-eyebrow">Website reviews</span>
            <h2>What people say after using SkillFlow.</h2>
          </div>

          {siteReviews.length ? (
            <div className="resend-review-grid">
              {siteReviews.map((review) => (
                <article key={review._id} className="resend-review-card">
                  <div className="resend-review-stars" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={`${review._id}-${index}`}
                        size={15}
                        fill={index < review.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <p>{review.comment}</p>
                  <div>
                    <span>{review.name.slice(0, 1).toUpperCase()}</span>
                    <strong>{review.name}</strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="resend-review-empty">
              <MessageSquareText size={20} />
              <p>No website reviews yet.</p>
            </div>
          )}
        </section>
      </main>

      {isReviewModalOpen ? (
        <div className="landing-review-modal" role="dialog" aria-modal="true" aria-labelledby="landing-review-title">
          <form className="landing-review-form" onSubmit={handleReviewSubmit}>
            <div className="landing-review-form-head">
              <div>
                <span className="resend-eyebrow">Review SkillFlow</span>
                <h2 id="landing-review-title">Share your experience.</h2>
              </div>
              <button type="button" onClick={() => setIsReviewModalOpen(false)} aria-label="Close review form">
                Close
              </button>
            </div>

            <label>
              Name
              <input
                name="name"
                type="text"
                value={reviewForm.name}
                onChange={handleReviewChange}
                minLength={2}
                maxLength={80}
                required
              />
            </label>

            <label>
              Rating
              <select name="rating" value={reviewForm.rating} onChange={handleReviewChange} required>
                <option value={5}>5 stars</option>
                <option value={4}>4 stars</option>
                <option value={3}>3 stars</option>
                <option value={2}>2 stars</option>
                <option value={1}>1 star</option>
              </select>
            </label>

            <label>
              Review
              <textarea
                name="comment"
                value={reviewForm.comment}
                onChange={handleReviewChange}
                minLength={10}
                maxLength={600}
                rows={5}
                required
              />
            </label>

            {reviewMessage ? <p className="landing-review-message">{reviewMessage}</p> : null}

            <button type="submit" className="resend-button resend-button-primary" disabled={reviewSubmitting}>
              {reviewSubmitting ? "Submitting..." : "Submit review"}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export default LandingPage;
