import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";

import API from "../api/axios";
import { useApp } from "../context/AppContext";
import AuthShell from "@/components/auth/AuthShell";

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,72}$/;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token = "" } = useParams();
  const { addToast, logout } = useApp();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ password: "", confirmPassword: "", form: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const passwordChecks = useMemo(
    () => [
      { label: "10+ characters", valid: form.password.length >= 10 },
      {
        label: "Uppercase + lowercase",
        valid: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password),
      },
      { label: "Number", valid: /\d/.test(form.password) },
      { label: "Symbol", valid: /[^A-Za-z\d]/.test(form.password) },
    ],
    [form.password]
  );

  const validateForm = () => {
    const nextErrors = { password: "", confirmPassword: "", form: "" };

    if (!passwordRule.test(form.password)) {
      nextErrors.password =
        "Password must be 10+ characters and include uppercase, lowercase, number, and symbol.";
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return !nextErrors.password && !nextErrors.confirmPassword;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrors({ password: "", confirmPassword: "", form: "" });

    try {
      const { data } = await API.post(`/auth/reset-password/${token}`, form);
      await logout(true);
      setCompleted(true);
      addToast(data.message || "Password reset complete. Please log in again.", "success");
      window.setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (requestError) {
      const responseErrors = requestError.response?.data?.errors;
      if (responseErrors) {
        setErrors({
          password: responseErrors.password?.msg || "",
          confirmPassword: responseErrors.confirmPassword?.msg || "",
          form: "",
        });
      } else {
        const message =
          requestError.response?.data?.message ||
          "This reset link is invalid or expired. Please request a new one.";
        setErrors({ password: "", confirmPassword: "", form: message });
        addToast(message, "error");
      }
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
        <div className="auth-badge-row">
          <span className="auth-icon-badge">
            <KeyRound size={18} />
          </span>
          <span className="auth-kicker">New password</span>
        </div>
        <h2 className="auth-title">Reset your password</h2>
        <p className="auth-sub">
          Choose a strong new password. This link is single-use and expires after 15 minutes.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field-group">
            <label className="auth-label">New password</label>
            <div className="password-field">
              <input
                className={`input-dark password-input ${errors.password ? "input-error" : ""}`}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Create a new password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password ? <p className="auth-error-text">{errors.password}</p> : null}
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Confirm new password</label>
            <div className="password-field">
              <input
                className={`input-dark password-input ${errors.confirmPassword ? "input-error" : ""}`}
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="auth-error-text">{errors.confirmPassword}</p>
            ) : null}
          </div>

          <div className="auth-strength-grid">
            {passwordChecks.map((check) => (
              <div
                key={check.label}
                className={`auth-strength-chip ${check.valid ? "valid" : ""}`}
              >
                {check.label}
              </div>
            ))}
          </div>

          {errors.form ? <p className="auth-form-error">{errors.form}</p> : null}
          {completed ? (
            <div className="auth-info-panel success">
              Password updated. All existing sessions have been cleared, and you&apos;ll be sent to
              login now.
            </div>
          ) : null}

          <button
            type="submit"
            className="btn-red auth-submit"
            disabled={submitting || !token}
          >
            {submitting ? (
              <>
                <LoaderCircle size={16} className="spin-icon" />
                Resetting password...
              </>
            ) : (
              "Reset password"
            )}
          </button>
        </form>

        <div className="auth-inline-row auth-footer-row">
          <Link to="/forgot-password" className="auth-link auth-link-inline">
            <ArrowLeft size={16} />
            Request a new link
          </Link>
          <span className="auth-helper-text">You&apos;ll need to log in again after this reset.</span>
        </div>
      </motion.div>
    </AuthShell>
  );
}

export default ResetPasswordPage;
