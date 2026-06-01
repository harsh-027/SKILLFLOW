import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";

import API from "../api/axios";
import { useApp } from "../context/AppContext";
import AuthShell from "@/components/auth/AuthShell";

function ForgotPasswordPage() {
  const { addToast } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { data } = await API.post("/auth/forgot-password", { email });
      setSubmitted(true);
      addToast(data.message || "If the account exists, a reset email is on the way.", "success");
    } catch (requestError) {
      const message =
        requestError.response?.data?.errors?.email?.msg ||
        requestError.response?.data?.message ||
        "Unable to process that request right now.";
      setError(message);
      addToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <motion.div
        className="auth-card auth-card-authentication"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="auth-emblem" aria-hidden="true">
          <img src="/favicon.svg" alt="" className="auth-emblem-logo" />
        </div>
        <h2 className="auth-title">Forgot your password?</h2>
        <p className="auth-sub">
          Enter your account email and we&apos;ll send a one-time reset link that expires in 15
          minutes.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field-group">
            <label className="auth-label">Email</label>
            <input
              className={`input-dark ${error ? "input-error" : ""}`}
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="Email address"
              required
            />
            {error ? <p className="auth-error-text">{error}</p> : null}
          </div>

          <button type="submit" className="btn-red auth-submit" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle size={16} className="spin-icon" />
                Sending link...
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        {submitted ? (
          <div className="auth-info-panel success">
            If the email matches an account, the reset link has been sent. Check your inbox and spam
            folder.
          </div>
        ) : null}

        <div className="auth-inline-row auth-footer-row">
          <Link to="/login" className="auth-link auth-link-inline">
            <ArrowLeft size={16} />
            Back to login
          </Link>
          <span className="auth-helper-text">We never reveal whether an email exists.</span>
        </div>
      </motion.div>
    </AuthShell>
  );
}

export default ForgotPasswordPage;
