import { useApp } from "../context/AppContext";

function ToastContainer() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type === "success" ? "success" : toast.type === "error" ? "error" : ""}`}>
          <p>{toast.message}</p>
          <button className="btn-ghost" onClick={() => removeToast(toast.id)} aria-label="Close notification" style={{ padding: "4px 10px" }}>x</button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
