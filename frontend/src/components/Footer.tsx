import { ArrowRight, Github, Linkedin, Twitter } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { useApp } from "@/context/AppContext";

const footerColumns = [
  {
    title: "Product",
    links: ["Courses", "Learning Paths", "Skill Tracks", "Pricing"],
  },
  {
    title: "Community",
    links: ["Discussions", "Peer Swaps", "Events", "Leaderboard"],
  },
  {
    title: "Resources",
    links: ["Blog", "Guides", "Help Center", "Roadmap"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Contact", "Privacy Policy"],
  },
];

function LandingFooter() {
  const { currentUser } = useApp();
  const primaryPath = currentUser ? "/home" : "/register";

  return (
    <footer id="landing-footer" className="resend-footer">
      <div className="resend-footer-shell">
        <div className="resend-footer-cta">
          <span className="resend-eyebrow">Start building momentum</span>
          <h2>Practice real skills with people who are building too.</h2>
          <p>Join a focused workspace for learning paths, peer reviews, and progress.</p>
          <Link to={primaryPath} className="resend-button resend-button-primary">
            {currentUser ? "Open workspace" : "Get started"}
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="resend-footer-links">
          {footerColumns.map((column) => (
            <div key={column.title} className="resend-footer-column">
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                <a key={link} href="#top">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="resend-footer-meta">
          <div className="resend-footer-brand">
            <span>Copyright 2026 SkillFlow. All rights reserved.</span>
          </div>

          <div className="resend-footer-socials">
            <a href="https://x.com" aria-label="SkillFlow on X">
              <Twitter size={18} />
            </a>
            <a href="https://linkedin.com" aria-label="SkillFlow on LinkedIn">
              <Linkedin size={18} />
            </a>
            <a href="https://github.com" aria-label="SkillFlow on GitHub">
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Footer() {
  const location = useLocation();

  if (location.pathname === "/") {
    return <LandingFooter />;
  }

  return null;
}

export default Footer;
