import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(",");

export default function LoginModal({ open, onClose, onRegister }) {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirst = () => {
      const firstFocusable = dialogRef.current?.querySelector(focusableSelector);
      firstFocusable?.focus();
    };
    const frame = window.requestAnimationFrame(focusFirst);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll(focusableSelector)];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
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
      <section ref={dialogRef} className="login-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
        <LoginForm onSuccess={handleSuccess} onRegister={onRegister} titleId="login-modal-title" />
      </section>
    </div>
  );
}
