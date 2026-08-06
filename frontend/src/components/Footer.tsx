import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import API from "@/api/axios";
import { useApp } from "@/context/AppContext";

const footerLinks = [
  { label: "Dashboard", to: "/home" },
  { label: "Study Planner", to: "/study-planner" },
  { label: "Community", to: "/community" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
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
    if (isSubmittingIssue) return;
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
      await API.post("/reports", { targetType: "platform", reason });
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
      <div className="landing-review-float" aria-label="Report an issue">
        <span>Report issue</span>
        <button type="button" onClick={openIssueModal}>
          Report
        </button>
      </div>

      <div className="resend-footer-shell">
        <div className="resend-footer-top">
          <Link to="/" className="resend-footer-logo">SkillFlow</Link>
        </div>

        <div className="resend-footer-links">
          {footerLinks.map((link) => (
            <Link key={link.label} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="resend-footer-meta">
          <span>© 2026 SkillFlow</span>
          <a href="https://portfolio-sage-nine-3nthvpharo.vercel.app/" target="_blank" rel="noreferrer" className="resend-footer-built">
            Built by Harshit
          </a>
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
  return location.pathname === "/" ? <LandingFooter /> : null;
}

export default Footer;
