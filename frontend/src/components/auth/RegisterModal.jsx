import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "./RegisterForm";

const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";

export default function RegisterModal({ open, onClose, onLogin }) {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => dialogRef.current?.querySelector(focusableSelector)?.focus());
    const handleKeyDown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll(focusableSelector)];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocusRef.current instanceof HTMLElement) previousFocusRef.current.focus();
    };
  }, [open, onClose]);

  const handleSuccess = (user) => {
    onClose();
    navigate(user.role === "admin" ? "/admin/dashboard" : "/home");
  };

  return (
    <div className={`login-modal ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="login-modal-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }} />
      <section ref={dialogRef} className="login-modal-dialog register-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="register-modal-title">
        <RegisterForm onSuccess={handleSuccess} onLogin={onLogin} titleId="register-modal-title" />
      </section>
    </div>
  );
}
