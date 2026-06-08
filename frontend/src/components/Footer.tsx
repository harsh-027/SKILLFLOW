import { FormEvent, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import API from "@/api/axios";
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
  const { currentUser, addToast } = useApp();
  const navigate = useNavigate();
  const [issueText, setIssueText] = useState("");
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  const openIssueModal = () => {
    if (!currentUser) {
      addToast("Please log in to send an issue to admin.", "info");
      navigate("/login");
      return;
    }

    setIsIssueModalOpen(true);
  };

  const closeIssueModal = () => {
    if (isSubmittingIssue) {
      return;
    }

    setIsIssueModalOpen(false);
    setIssueText("");
  };

  const submitIssue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const reason = issueText.trim();

    if (reason.length < 10) {
      addToast("Please describe the issue in at least 10 characters.", "error");
      return;
    }

    try {
      setIsSubmittingIssue(true);
      await API.post("/reports", {
        targetType: "platform",
        reason,
      });
      addToast("Issue sent to admin.", "success");
      setIsIssueModalOpen(false);
      setIssueText("");
    } catch (error: any) {
      addToast(error.response?.data?.message || "Failed to send issue.", "error");
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  return (
    <footer id="landing-footer" className="resend-footer">
      <div className="resend-footer-shell">
        <div className="resend-footer-cta">
          <h2>“Spotted something off? Let us know.</h2>
          <button type="button" className="resend-button resend-button-primary" onClick={openIssueModal}>
            Report an issue
            <MessageSquare size={16} />
          </button>
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
            <span>© 2026 SkillFlow. All rights reserved.</span>
          </div>

          <Link to={currentUser ? "/home" : "/register"} className="resend-footer-brand">
            {currentUser ? "Open workspace" : "Create account"}
          </Link>
        </div>
      </div>

      {isIssueModalOpen ? (
        <div className="footer-issue-modal" role="dialog" aria-modal="true" aria-labelledby="footer-issue-title">
          <form className="footer-issue-form" onSubmit={submitIssue}>
            <div className="footer-issue-form-head">
              <div>
                <span className="resend-eyebrow">Admin support</span>
                <h2 id="footer-issue-title">Send your issue</h2>
              </div>
              <button type="button" onClick={closeIssueModal} disabled={isSubmittingIssue}>
                Close
              </button>
            </div>

            <label>
              Issue details
              <textarea
                value={issueText}
                onChange={(event) => setIssueText(event.target.value)}
                placeholder="Describe what happened so admin can review it."
                rows={5}
                maxLength={800}
              />
            </label>

            <div className="footer-issue-actions">
              <span>{issueText.trim().length}/800</span>
              <button
                type="submit"
                className="resend-button resend-button-primary"
                disabled={isSubmittingIssue || issueText.trim().length < 10}
              >
                {isSubmittingIssue ? "Sending..." : "Send issue"}
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      ) : null}
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
