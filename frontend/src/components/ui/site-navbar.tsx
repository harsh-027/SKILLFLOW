import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Compass,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquareText,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusSquare,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { isDashboardShellPath } from "@/lib/navigation";
import { getPreferredUserLabel, getUserInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const sharedLinks: NavItem[] = [
  { to: "/community", label: "Community", icon: MessageSquareText },
  { to: "/users", label: "Browse Users", icon: Users },
];

const privateLinks: NavItem[] = [
  { to: "/home", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ai", label: "AI Lab", icon: Sparkles },
  { to: "/requests", label: "Requests", icon: Compass },
  { to: "/create-post", label: "Create Post", icon: PlusSquare },
];

export default function SiteNavbar() {
  const { user, logout } = useApp();
  const currentUser = user;
  const [open, setOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("skillflow-sidebar-collapsed") === "true";
  });
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isDashboardShell = Boolean(currentUser) && isDashboardShellPath(location.pathname);
  const currentUserLabel = getPreferredUserLabel(currentUser);

  const links = useMemo(() => (currentUser ? [...sharedLinks, ...privateLinks] : []), [currentUser]);
  const dashboardLinks = useMemo(
    () =>
      currentUser
        ? [
            privateLinks[0],
            privateLinks[1],
            sharedLinks[0],
            sharedLinks[1],
            privateLinks[2],
            privateLinks[3],
          ]
        : [],
    [currentUser]
  );

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [currentUser?.avatar, currentUser?._id]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("skillflow-sidebar-collapsed", String(isCollapsed));
    document.documentElement.classList.toggle("sidebar-collapsed", isCollapsed);

    return () => {
      document.documentElement.classList.remove("sidebar-collapsed");
    };
  }, [isCollapsed]);

  if (isDashboardShell) {
    return (
      <>
        <aside className={cn("app-sidebar", isCollapsed && "collapsed")}>
          <div className="sidebar-logo">
            <div className={cn("sidebar-logo-row", isCollapsed && "collapsed")}>
              <button
                type="button"
                className="sidebar-toggle"
                onClick={() => setIsCollapsed((prev) => !prev)}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>

              {!isCollapsed ? (
                <div>
                  <Link to="/" className="sidebar-logo-text">
                    SkillFlow
                  </Link>
                  <p className="sidebar-subtitle">Built for steady growth</p>
                </div>
              ) : null}
            </div>
          </div>

          <nav className="sidebar-nav">
            {dashboardLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  title={link.label}
                  className={({ isActive }) => cn("sidebar-nav-item", isCollapsed && "collapsed", isActive && "active")}
                >
                  <Icon size={18} />
                  {!isCollapsed ? <span>{link.label}</span> : null}
                </NavLink>
              );
            })}
          </nav>

          <div className="sidebar-bottom">
            <Link
              to={`/profile/${currentUser?._id}`}
              className={cn("sidebar-user-chip", isCollapsed && "collapsed")}
              title={currentUserLabel || "View profile"}
            >
              {currentUser?.avatar && !avatarFailed ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUserLabel}
                  className="sidebar-user-avatar"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <div className="sidebar-user-avatar">{getUserInitials(currentUser)}</div>
              )}
              {!isCollapsed ? (
                <div>
                  <div className="sidebar-user-name">{currentUserLabel}</div>
                  <div className="sidebar-user-sub">View profile</div>
                </div>
              ) : null}
            </Link>
          </div>
        </aside>

        <header className="app-header">
          <div className="header-search">
            <Search size={16} color="var(--text-muted)" />
            <input type="search" placeholder="Search people, skills, and momentum" />
          </div>

          <div className="header-right">
            <button
              type="button"
              onClick={() => void logout()}
              className="btn-outline-red btn-icon-only"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
      </>
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
              {currentUser?.avatar && !avatarFailed ? (
                <img src={currentUser.avatar} alt={currentUserLabel} onError={() => setAvatarFailed(true)} />
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
            <Link to="/register" className="btn-outline-red">Get Started</Link>
            <Link to="/login" className="btn-red" style={{ padding: "8px 16px" }}>
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
