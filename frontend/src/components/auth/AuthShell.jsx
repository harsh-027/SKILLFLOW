import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AuthShell({ children }) {
  return (
    <section className="auth-page resend-shell">
      <motion.div
        className="auth-spotlight auth-spotlight-top"
        animate={{ x: [0, 18, 0], y: [0, -14, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="auth-spotlight auth-spotlight-bottom"
        animate={{ x: [0, -16, 0], y: [0, 12, 0], scale: [1, 0.98, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="auth-orb auth-orb-left"
        animate={{ x: [0, 12, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="auth-orb auth-orb-right"
        animate={{ x: [0, -10, 0], y: [0, -18, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="auth-vignette" />
      <div className="auth-grain" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <Link to="/" className="auth-home-link">
          <ArrowLeft size={16} />
          Home
        </Link>
      </motion.div>

      <motion.div
        className="auth-stage"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}
