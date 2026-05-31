import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import AuthShell from "@/components/auth/AuthShell";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [form, setForm] = useState({ userId: "", name: "", email: "", password: "" });
  const [errors, setErrors] = useState({
    userId: "",
    name: "",
    email: "",
    password: "",
    form: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({ userId: "", name: "", email: "", password: "", form: "" });
    setSubmitting(true);
    try {
      const user = await register({ ...form, skillsOffered: [], skillsWanted: [] });
      navigate(user.role === "admin" ? "/admin/dashboard" : "/home");
    } catch (error) {
      const responseErrors = error.response?.data?.errors;

      if (responseErrors && typeof responseErrors === "object") {
        setErrors({
          userId:
            typeof responseErrors.userId?.msg === "string" ? responseErrors.userId.msg : "",
          name: typeof responseErrors.name?.msg === "string" ? responseErrors.name.msg : "",
          email: typeof responseErrors.email?.msg === "string" ? responseErrors.email.msg : "",
          password:
            typeof responseErrors.password?.msg === "string"
              ? responseErrors.password.msg
              : "",
          form:
            typeof responseErrors.form === "string"
              ? responseErrors.form
              : "",
        });
      } else {
        setErrors({
          userId: "",
          name: "",
          email: "",
          password: "",
          form:
            error.response?.data?.message ||
            "Unable to create your account right now. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <motion.div
        className="auth-card auth-card-authentication auth-card-wide"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
          <div className="auth-emblem" aria-hidden="true">
            <span className="auth-emblem-text">SF</span>
          </div>
          <h2 className="auth-title">Create your SkillFlow account</h2>
          <p className="auth-sub">Launch your profile, list what you know, and start learning with intention.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field-grid">
              <div className="auth-field-group">
                <label className="auth-label">User ID</label>
                <input
                  className={`input-dark ${errors.userId ? "input-error" : ""}`}
                  name="userId"
                  type="text"
                  value={form.userId}
                  onChange={handleChange}
                  placeholder="your-unique-id"
                  aria-invalid={Boolean(errors.userId)}
                  aria-describedby={errors.userId ? "register-userid-error" : undefined}
                  required
                />
                {errors.userId ? (
                  <p className="auth-error-text" id="register-userid-error">
                    {errors.userId}
                  </p>
                ) : null}
              </div>

              <div className="auth-field-group">
                <label className="auth-label">Name</label>
                <input
                  className={`input-dark ${errors.name ? "input-error" : ""}`}
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ada Lovelace"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "register-name-error" : undefined}
                  required
                />
                {errors.name ? (
                  <p className="auth-error-text" id="register-name-error">
                    {errors.name}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="auth-field-group">
              <label className="auth-label">Email</label>
              <input
                className={`input-dark ${errors.email ? "input-error" : ""}`}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="alan.turing@example.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "register-email-error" : undefined}
                required
              />
              {errors.email ? (
                <p className="auth-error-text" id="register-email-error">
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
                  placeholder="Create a strong password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "register-password-error" : undefined}
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
              {errors.password ? (
                <p className="auth-error-text" id="register-password-error">
                  {errors.password}
                </p>
              ) : null}
              {!errors.password ? (
                <p className="auth-error-text auth-muted-caption">
                  Use at least 10 characters with uppercase, lowercase, a number, and a symbol.
                </p>
              ) : null}
            </div>

            {errors.form ? <p className="auth-form-error">{errors.form}</p> : null}
            <button type="submit" className="btn-red auth-submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="auth-meta-stack">
            <p className="auth-footer-copy">
              Already registered?{" "}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
            <p className="auth-legal-copy">
              By creating an account, you agree to our Terms and Privacy Policy.
            </p>
          </div>
      </motion.div>
    </AuthShell>
  );
}

export default RegisterPage;
