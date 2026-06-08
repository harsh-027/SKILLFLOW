import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import AuthShell from "@/components/auth/AuthShell";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [errors, setErrors] = useState({ email: "", password: "", otp: "", form: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({ email: "", password: "", otp: "", form: "" });
    setSubmitting(true);

    try {
      const user = await login(form.email, form.password, form.otp);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/home");
    } catch (error) {
      const responseErrors = error.response?.data?.errors;

      if (responseErrors && typeof responseErrors === "object") {
        setErrors({
          email: typeof responseErrors.email?.msg === "string" ? responseErrors.email.msg : "",
          password:
            typeof responseErrors.password?.msg === "string" ? responseErrors.password.msg : "",
          otp: typeof responseErrors.otp?.msg === "string" ? responseErrors.otp.msg : "",
          form: typeof responseErrors.form === "string" ? responseErrors.form : "",
        });
      } else {
        const message =
          error.response?.data?.message || "Unable to sign in right now. Please try again.";
        setErrors({
          email: "",
          password: "",
          otp: message.toLowerCase().includes("otp") ? message : "",
          form: message.toLowerCase().includes("otp") ? "" : message,
        });
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
          <div className="auth-emblem" aria-hidden="true">
            <img src="/favicon.svg" alt="" className="auth-emblem-logo" />
          </div>
          <h2 className="auth-title">Log in to SkillFlow</h2>
          <p className="auth-sub">Step into your workspace and keep your growth in motion.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field-group">
              <label className="auth-label">Email</label>
              <input
                className={`input-dark ${errors.email ? "input-error" : ""}`}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                required
              />
              {errors.email ? (
                <p className="auth-error-text" id="login-email-error">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="auth-field-group">
              <label className="auth-label">Password</label>
              <div className="password-field">
                <input
                  className={`input-dark password-input ${errors.password ? "input-error" : ""}`}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "login-password-error" : undefined}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="auth-inline-row">
                <span className="auth-helper-text">Use your SkillFlow account password.</span>
                <Link to="/forgot-password" className="auth-link">
                  Forgot Password?
                </Link>
              </div>
              {errors.password ? (
                <p className="auth-error-text" id="login-password-error">
                  {errors.password}
                </p>
              ) : null}
            </div>

            <div className="auth-field-group">
              <label className="auth-label">
                Admin OTP <span style={{ color: "var(--text-muted)" }}>(only if MFA is enabled)</span>
              </label>
              <div className="relative">
                <input
                  className={`input-dark ${errors.otp ? "input-error" : ""}`}
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.otp}
                  onChange={handleChange}
                  placeholder="123456"
                  aria-invalid={Boolean(errors.otp)}
                  aria-describedby={errors.otp ? "login-otp-error" : undefined}
                />
                <ShieldCheck
                  size={16}
                  style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.55 }}
                />
              </div>
              {errors.otp ? (
                <p className="auth-error-text" id="login-otp-error">
                  {errors.otp}
                </p>
              ) : null}
            </div>

            {errors.form ? <p className="auth-form-error">{errors.form}</p> : null}
            <button type="submit" className="btn-red auth-submit" disabled={submitting}>
              {submitting ? "Signing In..." : "Log In"}
            </button>
          </form>

          <div className="auth-meta-stack">
            <p className="auth-footer-copy">
              New here?{" "}
              <Link to="/register" className="auth-link">
                Create your workspace
              </Link>
            </p>
            <p className="auth-legal-copy">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="auth-link">
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="auth-link">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
      </motion.div>
    </AuthShell>
  );
}

export default LoginPage;
