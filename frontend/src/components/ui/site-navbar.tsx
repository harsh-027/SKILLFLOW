import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Compass,
  CalendarCheck2,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PlusSquare,
  Search,
  Users,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { isDashboardShellPath } from "@/lib/navigation";
import { getPreferredUserLabel, getProfileImage, getUserInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const sharedLinks: NavItem[] = [
  { to: "/users", label: "Browse Users", icon: Users },
];

const privateLinks: NavItem[] = [
  { to: "/home", label: "Dashboard", icon: LayoutDashboard },
  { to: "/study-planner", label: "Study Planner", icon: CalendarCheck2 },
  { to: "/requests", label: "Requests", icon: Compass },
  { to: "/create-post", label: "Create Post", icon: PlusSquare },
];

export default function SiteNavbar() {
  const { user, logout } = useApp();
  const currentUser = user;
  const [open, setOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isDashboardShell = Boolean(currentUser) && isDashboardShellPath(location.pathname);
  const currentUserLabel = getPreferredUserLabel(currentUser);

  const links = useMemo(() => (currentUser ? [...sharedLinks, ...privateLinks] : []), [currentUser]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [currentUser?.profileImage, currentUser?.avatar, currentUser?.updatedAt, currentUser?._id]);

  if (isDashboardShell) {
    return (
      <header className="app-header skillflow-topbar">
        <div className="skillflow-topbar-inner">
          <Link to="/home" className="topbar-brand"><img src="/favicon.svg" alt="" />SkillFlow</Link>
          <div className="header-search">
            <Search size={16} color="var(--text-muted)" />
            <input type="search" placeholder="Search people, skills, and momentum" />
          </div>
          <nav className="topbar-nav" aria-label="Primary navigation">
            <span className="topbar-nav-label">Main</span>
            {[privateLinks[0], privateLinks[1]].map((link) => {
              const Icon = link.icon;
              return <NavLink key={link.to} to={link.to} className={({ isActive }) => cn("topbar-nav-link", isActive && "active")}><Icon size={17} /><span>{link.label}</span></NavLink>;
            })}
            {sharedLinks.map((link) => {
              const Icon = link.icon;
              return <NavLink key={link.to} to={link.to} className={({ isActive }) => cn("topbar-nav-link", isActive && "active")}><Icon size={17} /><span>{link.label}</span></NavLink>;
            })}
          </nav>
          <div className="topbar-profile-actions">
            <Link to={`/profile/${currentUser?._id}`} className="topbar-profile" title="View profile">
              {currentUser && !avatarFailed ? <img src={getProfileImage(currentUser)} alt={currentUserLabel} onError={() => setAvatarFailed(true)} /> : <span>{getUserInitials(currentUser)}</span>}
              <span className="topbar-profile-name">{currentUserLabel}</span>
            </Link>
            <button type="button" onClick={() => void logout()} className="btn-ghost topbar-logout" aria-label="Logout" title="Logout"><LogOut size={16} /></button>
            <button type="button" onClick={() => setOpen((prev) => !prev)} className="btn-ghost topbar-menu" aria-label="Toggle navigation"><Menu size={18} /></button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="landing-navbar">
      <Link to="/" className="landing-brand">
        <span className="landing-brand-copy">
          <span className="landing-brand-name">SkillFlow</span>
          <span className="landing-brand-sub">Focused learning, steady growth</span>
        </span>
      </Link>

      <div className="landing-navbar-actions">
        {!isAuthPage && links.length > 0 ? (
          <div className="landing-nav-links hidden md:flex">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn("landing-nav-link", isActive && "active")
                  }
                >
                  <Icon size={16} />
                  {link.label}
                </NavLink>
              );
            })}
          </div>
        ) : null}

        {currentUser ? (
          <div className="landing-auth-actions">
            <Link to="/home" className="btn-red">
              Open workspace
            </Link>
            <Link
              to={`/profile/${currentUser._id}`}
              className="landing-user-state"
              title={currentUserLabel || "View profile"}
            >
              {currentUser && !avatarFailed ? (
                <img src={getProfileImage(currentUser)} alt={currentUserLabel} onError={() => setAvatarFailed(true)} />
              ) : (
                <span>{getUserInitials(currentUser)}</span>
              )}
              <span>{currentUserLabel}</span>
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="btn-red btn-icon-only"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="landing-auth-actions">
            <Link to="/" state={{ authModal: "register" }} className="btn-outline-red">Get Started</Link>
            <Link to="/" state={{ authModal: "login" }} className="btn-red" style={{ padding: "8px 16px" }}>
              <LogIn size={16} />
              Sign In
            </Link>
          </div>
        )}

        <button onClick={() => setOpen((prev) => !prev)} className="btn-ghost landing-menu-toggle md:hidden">
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
    </header>
  );
}
