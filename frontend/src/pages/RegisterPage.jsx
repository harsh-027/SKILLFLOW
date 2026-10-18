import { motion } from "framer-motion";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

function RegisterPage() {
  return (
    <AuthShell>
      <motion.div className="auth-card auth-card-authentication auth-card-wide" whileHover={{ y: -2 }} transition={{ duration: 0.3, ease: "easeOut" }}>
        <RegisterForm />
      </motion.div>
    </AuthShell>
  );
}

export default RegisterPage;
