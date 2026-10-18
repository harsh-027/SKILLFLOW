import { motion } from "framer-motion";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

function LoginPage() {
  return (
    <AuthShell>
      <motion.div className="auth-card auth-card-authentication" whileHover={{ y: -2 }} transition={{ duration: 0.3, ease: "easeOut" }}>
        <LoginForm />
      </motion.div>
    </AuthShell>
  );
}

export default LoginPage;
