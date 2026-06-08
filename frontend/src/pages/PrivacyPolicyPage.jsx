import { Link } from "react-router-dom";
import { ArrowLeft, Database, Mail, ShieldCheck, Sparkles } from "lucide-react";

const collectedItems = [
  "Name",
  "Email address",
  "Phone number",
  "Profile image",
  "Posts and messages you create",
  "Images you upload in posts or messages",
  "AI prompts used for recommendations and learning paths",
];

const serviceItems = [
  {
    icon: Database,
    title: "MongoDB and GridFS",
    text: "SkillFlow stores account data, posts, messages, and uploaded images in MongoDB. Images are stored using GridFS.",
  },
  {
    icon: Sparkles,
    title: "Groq API",
    text: "AI prompts may be sent to Groq so SkillFlow can generate skill recommendations and learning paths.",
  },
  {
    icon: Mail,
    title: "Resend",
    text: "SkillFlow uses Resend to send password reset emails and basic notifications.",
  },
  {
    icon: ShieldCheck,
    title: "JWT Authentication",
    text: "SkillFlow uses JWT access and refresh tokens to keep users logged in securely.",
  },
];

function PrivacyPolicyPage() {
  return (
    <section className="legal-page">
      <Link to="/" className="legal-home-link">
        <ArrowLeft size={16} />
        Home
      </Link>
      <div className="legal-shell">
        <div className="legal-hero">
          <span className="legal-eyebrow">SkillFlow college project</span>
          <h1>Privacy Policy</h1>
          <p>
            This page explains what information SkillFlow uses and why. SkillFlow is a
            student project made for learning and demonstration, not a real legal company.
          </p>
          <span className="legal-updated">Last updated: June 8, 2026</span>
        </div>

        <div className="legal-layout">
          <article className="legal-content-card">
            <section className="legal-section">
              <h2>Information We Use</h2>
              <p>
                SkillFlow uses only the information needed to run the project features.
              </p>
              <ul className="legal-list">
                {collectedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="legal-section">
              <h2>How We Use This Information</h2>
              <p>
                We use this information to create accounts, show profiles, publish posts
                and messages, send reset emails, and provide AI features such as skill
                recommendations and learning paths.
              </p>
            </section>

            <section className="legal-section">
              <h2>Passwords and Login</h2>
              <p>
                Passwords are securely stored in hashed form and are used only for
                authentication. SkillFlow also uses JWT access and refresh tokens to help
                keep login sessions secure.
              </p>
            </section>

            <section className="legal-section">
              <h2>Images and Uploaded Content</h2>
              <p>
                Profile images, post images, and message images are stored in MongoDB
                using GridFS. Posts and messages may be visible to other users depending
                on how the website feature is used.
              </p>
            </section>

            <section className="legal-section">
              <h2>AI Features</h2>
              <p>
                SkillFlow uses the Groq API for AI features. When you enter prompts for
                skill recommendations or learning path generation, that text may be
                processed through Groq to create a response.
              </p>
              <p>
                Please avoid entering private or sensitive information into AI prompts.
              </p>
            </section>

            <section className="legal-section">
              <h2>Emails</h2>
              <p>
                SkillFlow uses Resend to send password reset emails and notifications.
                Your email address is used for these service-related emails.
              </p>
            </section>

            <section className="legal-section">
              <h2>Contact</h2>
              <p>
                If you have questions about this Privacy Policy, contact the SkillFlow
                project owner or developer.
              </p>
            </section>
          </article>

          <aside className="legal-side-card">
            <h2>Services Used</h2>
            <div className="legal-service-list">
              {serviceItems.map(({ icon: Icon, title, text }) => (
                <div className="legal-service-item" key={title}>
                  <Icon size={20} aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/terms" className="legal-card-link">
              Read Terms & Conditions
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default PrivacyPolicyPage;
