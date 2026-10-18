import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthShell({ children }) {
  return (
    <section className="auth-page auth-efferd-page">
      <div className="auth-home-wrap">
        <Link to="/" className="auth-home-link">
          <ArrowLeft size={16} />
          Home
        </Link>
      </div>

      <div className="auth-stage auth-efferd-stage">
        <div className="auth-efferd-panel">
          {children}
        </div>
      </div>
    </section>
  );
}
