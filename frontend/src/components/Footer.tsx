import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { useApp } from "@/context/AppContext";

const footerColumns = [
  {
    title: "Workspace",
    links: [
      { label: "Dashboard", to: "/home" },
      { label: "AI Lab", to: "/ai" },
      { label: "Community", to: "/community" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "People", to: "/users" },
      { label: "Swap Requests", to: "/requests" },
      { label: "Create Post", to: "/create-post" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log In", to: "/login" },
      { label: "Register", to: "/register" },
    ],
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
                <Link key={link.label} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="resend-footer-meta">
          <div className="resend-footer-brand">
            <span>Copyright 2026 SkillFlow. All rights reserved.</span>
          </div>

          <Link to={primaryPath} className="resend-footer-brand">
            {currentUser ? "Open workspace" : "Create account"}
          </Link>
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
