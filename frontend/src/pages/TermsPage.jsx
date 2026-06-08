import { Link } from "react-router-dom";
import { ArrowLeft, Ban, FileText, RefreshCw, UserCheck } from "lucide-react";

const ruleItems = [
  {
    icon: UserCheck,
    title: "Use Your Own Account",
    text: "Keep your login details private and use correct information when creating your account.",
  },
  {
    icon: FileText,
    title: "You Own Your Content",
    text: "You are responsible for the posts, messages, images, and AI prompts you add to SkillFlow.",
  },
  {
    icon: Ban,
    title: "Respect Others",
    text: "Do not upload abusive, harmful, illegal, private, or unauthorized content.",
  },
  {
    icon: RefreshCw,
    title: "Project Changes",
    text: "SkillFlow may be updated, changed, or modified during development.",
  },
];

function TermsPage() {
  return (
    <section className="legal-page">
      <Link to="/" className="legal-home-link">
        <ArrowLeft size={16} />
        Home
      </Link>
      <div className="legal-shell">
        <div className="legal-hero">
          <span className="legal-eyebrow">SkillFlow college project</span>
          <h1>Terms & Conditions</h1>
          <p>
            These simple terms explain how SkillFlow should be used. SkillFlow is a BCA
            final-year student project made for learning and demonstration.
          </p>
          <span className="legal-updated">Last updated: June 8, 2026</span>
        </div>

        <div className="legal-layout">
          <article className="legal-content-card">
            <section className="legal-section">
              <h2>Using SkillFlow</h2>
              <p>
                You can use SkillFlow to create an account, upload a profile image, make
                posts and messages, upload images, and use AI features for skill
                recommendations and learning paths.
              </p>
            </section>

            <section className="legal-section">
              <h2>Your Account</h2>
              <p>
                You are responsible for your account information and for keeping your
                password private. Do not share your account with others.
              </p>
            </section>

            <section className="legal-section">
              <h2>Your Content</h2>
              <p>
                You are responsible for the posts, messages, images, and prompts you add
                to SkillFlow.
              </p>
              <p>
                Do not upload or share abusive, harmful, illegal, private, or
                unauthorized content. Only upload content you have permission to use.
              </p>
            </section>

            <section className="legal-section">
              <h2>AI Features</h2>
              <p>
                AI recommendations and learning paths are informational only. They may
                not always be correct, complete, or suitable for your exact needs, so use
                your own judgment before following them.
              </p>
            </section>

            <section className="legal-section">
              <h2>Misuse</h2>
              <p>
                Accounts may be restricted or removed if a user misuses SkillFlow,
                uploads harmful content, or disrupts the project.
              </p>
            </section>

            <section className="legal-section">
              <h2>Project Updates</h2>
              <p>
                SkillFlow may be updated, changed, or modified during development. Some
                features may change, break, or be removed as the project improves.
              </p>
            </section>

            <section className="legal-section">
              <h2>Contact</h2>
              <p>
                If you have questions about these Terms & Conditions, contact the
                SkillFlow project owner or developer.
              </p>
            </section>
          </article>

          <aside className="legal-side-card">
            <h2>Quick Rules</h2>
            <div className="legal-service-list">
              {ruleItems.map(({ icon: Icon, title, text }) => (
                <div className="legal-service-item" key={title}>
                  <Icon size={20} aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/privacy" className="legal-card-link">
              Read Privacy Policy
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default TermsPage;
