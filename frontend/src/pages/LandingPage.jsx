import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Code2,
  Github,
  Linkedin,
  Quote,
  Send,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useApp } from "@/context/AppContext";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Company", href: "#testimonials" },
  { label: "Resources", href: "#workspace" },
  { label: "Help", href: "#features" },
  { label: "Docs", href: "#workspace" },
  { label: "AI", href: "#features" },
  { label: "Pricing", href: "#landing-footer" },
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

const testimonialItems = [
  {
    quote:
      "SkillFlow helped me go from scattered tutorials to shipping real projects with useful feedback.",
    name: "Ananya Sharma",
    role: "UI Designer",
    initials: "AS",
  },
  {
    quote:
      "The peer swap flow makes practice feel accountable. I learn faster because feedback is built in.",
    name: "Rohan Verma",
    role: "Full Stack Developer",
    initials: "RV",
  },
  {
    quote:
      "Clean paths, focused goals, and a community that actually helps you keep momentum.",
    name: "Sara Khan",
    role: "Product Manager",
    initials: "SK",
  },
];

const easeOut = [0.22, 1, 0.36, 1];
const heroVideoUrl =
  "https://res.cloudinary.com/dauw2sdmc/video/upload/q_auto:best/f_auto/v1780154788/Animated_sphere_with_swirling_light_202605302055_al4i0f.mp4";
const heroStats = [
  { label: "Builders", value: "5K+" },
  { label: "Skills", value: "100+" },
  { label: "Paths", value: "4 weeks" },
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
  const { user, logout } = useApp();
  const primaryPath = user ? "/home" : "/register";
  const primaryLabel = user ? "Open workspace" : "Get started";

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
          <video
            className="resend-hero-video"
            src={heroVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
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
                {heroStats.map((item) => (
                  <div key={item.label} className="resend-hero-stat-card">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="resend-hero-socials">
                <a href="https://github.com" aria-label="SkillFlow on GitHub">
                  <Github size={16} />
                </a>
                <a href="https://linkedin.com" aria-label="SkillFlow on LinkedIn">
                  <Linkedin size={16} />
                </a>
                <a href="https://t.me" aria-label="SkillFlow on Telegram">
                  <Send size={16} />
                </a>
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
                <strong>Frontend Systems</strong>
              </div>
              <div>
                <span>Peer swaps</span>
                <strong>12</strong>
              </div>
              <div>
                <span>Milestones</span>
                <strong>7/9</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>High</strong>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="resend-section resend-testimonials">
          <div className="resend-section-head">
            <span className="resend-eyebrow">Beyond tutorials</span>
            <h2>Learners build momentum here.</h2>
          </div>

          <div className="resend-testimonial-grid">
            {testimonialItems.map((item) => (
              <article key={item.name} className="resend-testimonial-card">
                <Quote size={18} />
                <p>{item.quote}</p>
                <div>
                  <span>{item.initials}</span>
                  <strong>{item.name}</strong>
                  <small>{item.role}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
