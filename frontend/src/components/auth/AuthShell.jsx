import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DecorIcon } from "@/components/decor-icon";

export default function AuthShell({ children }) {
  return (
    <section className="auth-page auth-efferd-page">
      <div className="auth-vignette" />
      <div className="auth-grain" />

      <motion.div
        className="auth-home-wrap"
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
        className="auth-stage auth-efferd-stage"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-efferd-panel">
          <div className="auth-efferd-line auth-efferd-line-left" />
          <div className="auth-efferd-line auth-efferd-line-right" />
          <div className="auth-efferd-line auth-efferd-line-top" />
          <div className="auth-efferd-line auth-efferd-line-bottom" />
          <DecorIcon position="top-left" />
          <DecorIcon position="bottom-right" />
          {children}
        </div>
      </motion.div>
    </section>
  );
}
