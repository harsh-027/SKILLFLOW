import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Code2,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import API from "@/api/axios";
import { useApp } from "@/context/AppContext";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Workspace", href: "#workspace" },
  { label: "AI", href: "#features" },
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

  return (
    <div id="top" className="landing-shell resend-shell">
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
              <p>
                Guided paths, peer swaps, and visible progress for people building real work.
              </p>
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
            <p>
              A simple interface for structured progress, with the right amount of
              accountability from peers.
            </p>
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
            <p>
              Manage goals, swaps, progress, and feedback in one quiet workspace designed
              for repeated use.
            </p>
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
      </main>
    </div>
  );
}

export default LandingPage;
