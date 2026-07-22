import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import API from "@/api/axios";
import { useApp } from "@/context/AppContext";
import Footer from "@/components/Footer";
import { FeatureSection } from "@/components/feature-section";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { FaqsSection } from "../../components/faqs-page";

const easeOut = [0.22, 1, 0.36, 1];
const defaultStats = [
  { label: "Builders", value: "0" },
  { label: "Skills", value: "0" },
  { label: "Swaps", value: "0" },
];

const statCopy = {
  Builders: {
    tag: "Active builders",
    text: "People growing through shared learning.",
  },
  Skills: {
    tag: "Skills listed",
    text: "Real abilities offered and requested.",
  },
  Swaps: {
    tag: "Peer swaps",
    text: "Learning exchanges started on SkillFlow.",
  },
};

function LandingPage() {
  const { user, logout } = useApp();
  const [landingStats, setLandingStats] = useState(defaultStats);
  const primaryPath = user ? "/home" : "/register";
  const primaryLabel = user ? "Open workspace" : "Get started";

  useEffect(() => {
    let active = true;

    API.get("/public/landing")
      .then(({ data }) => {
        if (!active) return;
        setLandingStats(Array.isArray(data.displayStats) ? data.displayStats : defaultStats);
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

      <TracingBeam className="landing-tracing-beam">
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

              <div className="resend-hero-features">
                <FeatureSection />
              </div>
            </motion.div>
          </section>
          <section className="landing-stats-section" aria-label="SkillFlow numbers">
            <div className="landing-stats-copy">
              <h2>SkillFlow turns everyday skills into shared progress</h2>
              <p>
                Learn from people around you, offer what you know, and keep every exchange moving
                with a focused community built for practice.
              </p>
              <Link to={primaryPath} className="resend-button resend-button-primary">
                {primaryLabel}
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="landing-stats-grid">
              {landingStats.map((item) => {
                const copy = statCopy[item.label] || {
                  tag: item.label,
                  text: "SkillFlow activity from the community.",
                };

                return (
                  <article key={item.label} className="landing-stat-item">
                    <strong>{item.value}</strong>
                    <span>{copy.tag}</span>
                    <p>{copy.text}</p>
                  </article>
                );
              })}
            </div>
          </section>
          <section className="landing-faqs-section">
            <FaqsSection />
          </section>
        </main>
        <Footer />
      </TracingBeam>
    </div>
  );
}

export default LandingPage;
