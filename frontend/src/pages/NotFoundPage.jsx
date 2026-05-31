import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="not-found-page">
      <div className="not-found-404">404</div>
      <h2 className="section-title">Page Not Found</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'16px' }}>The route you requested does not exist.</p>
      <Link className="btn-red" to="/">Go Home</Link>
    </section>
  );
}

export default NotFoundPage;
