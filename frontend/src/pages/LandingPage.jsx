import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, MoveUpRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import API from "@/api/axios";
import { useApp } from "@/context/AppContext";
import Footer from "@/components/Footer";
import { FeatureSection } from "@/components/feature-section";
import { FaqsSection } from "../../components/faqs-page";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

const defaultStats = [
  { label: "Builders", value: "0" },
  { label: "Skills", value: "0" },
  { label: "Swaps", value: "0" },
];

const statCopy = {
  Builders: { tag: "Active builders", text: "People growing through shared learning." },
  Skills: { tag: "Skills listed", text: "Real abilities offered and requested." },
  Swaps: { tag: "Peer swaps", text: "Learning exchanges started on SkillFlow." },
};

function LandingPage() {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [landingStats, setLandingStats] = useState(defaultStats);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);
  const closeRegister = useCallback(() => setIsRegisterOpen(false), []);
  const openRegisterFromLogin = useCallback(() => { setIsLoginOpen(false); setIsRegisterOpen(true); }, []);
  const openLoginFromRegister = useCallback(() => { setIsRegisterOpen(false); setIsLoginOpen(true); }, []);
  useEffect(() => {
    const requestedModal = location.state?.authModal;
    if (requestedModal === "login") setIsLoginOpen(true);
    if (requestedModal === "register") setIsRegisterOpen(true);
    if (requestedModal) navigate("/", { replace: true, state: {} });
  }, [location.state, navigate]);
  const primaryPath = user ? "/home" : "/register";
  const primaryLabel = user ? "Open workspace" : "Get started";

  useEffect(() => {
    let active = true;
    API.get("/public/landing")
      .then(({ data }) => {
        if (active) setLandingStats(Array.isArray(data.displayStats) ? data.displayStats : defaultStats);
      })
      .catch(() => { if (active) setLandingStats(defaultStats); });
    return () => { active = false; };
  }, []);

  return (
    <div id="top" className="landing-shell">
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link to="/" className="landing-brand" aria-label="SkillFlow home">
            <img src="/logo.svg" alt="" className="landing-brand-mark" aria-hidden="true" /><span className="landing-brand-name">SkillFlow</span>
          </Link>
          <nav className="landing-main-nav" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#faqs">FAQs</a>
          </nav>
          <div className="landing-header-actions">
            {user ? <><Link to="/home" className="landing-text-link">Workspace</Link><button type="button" className="landing-text-link landing-logout" onClick={() => void logout()}>Log out</button></> : <><button type="button" className="landing-text-link" onClick={() => setIsLoginOpen(true)}>Sign in</button><button type="button" className="landing-button landing-button-dark" onClick={() => setIsRegisterOpen(true)}>Get started</button></>}
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <h1 id="landing-title">Build skills.<br /><span>Share momentum.</span></h1>
              <p className="landing-hero-lede">SkillFlow connects people who want to learn with people ready to share what they know. Keep every exchange practical, focused, and moving forward.</p>
              <div className="landing-hero-actions">{user ? <Link to={primaryPath} className="landing-button landing-button-accent">{primaryLabel}<ArrowRight size={16} aria-hidden="true" /></Link> : <button type="button" className="landing-button landing-button-accent" onClick={() => setIsRegisterOpen(true)}>{primaryLabel}<ArrowRight size={16} aria-hidden="true" /></button>}<a href="#how-it-works" className="landing-button landing-button-light">See how it works</a></div>
              
            </div>
            <div className="landing-hero-panel" aria-label="SkillFlow community snapshot">
              <div className="landing-hero-panel-top"><span>SkillFlow community</span><span className="landing-live-dot">Live</span></div>
              <div className="landing-hero-panel-word">FLOW</div>
              <div className="landing-hero-panel-footer"><span>Learn from people around you.</span><MoveUpRight size={18} aria-hidden="true" /></div>
            </div>
          </div>
        </section>

        <section className="landing-stat-strip" aria-label="SkillFlow community numbers">
          <div className="landing-container landing-stat-strip-inner">
            {landingStats.map((item) => <div key={item.label} className="landing-stat"><strong>{item.value}</strong><span>{item.label}</span></div>)}
            <p>Growing through shared knowledge, one exchange at a time.</p>
          </div>
        </section>

        <section id="how-it-works" className="landing-section landing-how-section">
          <div className="landing-container landing-section-heading"><div><h2>Progress works better<br />when it is shared.</h2></div><p>Find the right people, make a useful exchange, and stay close to the next step.</p></div>
          <div className="landing-container landing-process-grid">
            <article><span>01</span><h3>Set your direction</h3><p>Add skills you can offer and the ones you want to learn.</p></article>
            <article><span>02</span><h3>Find your people</h3><p>Discover profiles, posts, and goals that line up with yours.</p></article>
            <article><span>03</span><h3>Keep moving</h3><p>Turn a good match into practice, feedback, and steady progress.</p></article>
          </div>
        </section>

        <section id="features" className="landing-section landing-features-section">
          <div className="landing-container landing-section-heading landing-section-heading-centered"><h2>Tools for learning<br />that feel human.</h2></div>
          <FeatureSection />
        </section>

        <section className="landing-section landing-stats-section"><div className="landing-container landing-stats-layout"><div className="landing-stats-copy"><h2>Small actions<br />become real progress.</h2><p>SkillFlow keeps your goals, conversations, and learning exchanges close at hand so momentum does not get lost.</p><Link to={primaryPath} className="landing-inline-link">Start your flow <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="landing-stats-grid">{landingStats.map((item) => { const copy = statCopy[item.label] || { tag: item.label, text: "SkillFlow activity from the community." }; return <article key={item.label} className="landing-stat-card"><strong>{item.value}</strong><span>{copy.tag}</span><p>{copy.text}</p></article>; })}</div></div></section>

        <section id="faqs" className="landing-section landing-faq-section"><FaqsSection /></section>
      </main>
      <LoginModal open={isLoginOpen} onClose={closeLogin} onRegister={openRegisterFromLogin} />
      <RegisterModal open={isRegisterOpen} onClose={closeRegister} onLogin={openLoginFromRegister} />
      <Footer onOpenLogin={() => setIsLoginOpen(true)} />
    </div>
  );
}

export default LandingPage;
