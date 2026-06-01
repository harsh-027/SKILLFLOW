import { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SplineBackground from "@/components/SplineBackground";
import ToastContainer from "@/components/ToastContainer";
import LandingPage from "@/pages/LandingPage";
import RegisterPage from "@/pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import AiPage from "@/pages/AiPage";
import CommunityPage from "@/pages/CommunityPage";
import UsersPage from "@/pages/UsersPage";
import RequestsPage from "@/pages/RequestsPage";
import CreatePostPage from "@/pages/CreatePostPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";
import Messages from "@/pages/Messages";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";
import AdminSkillsPage from "@/pages/admin/AdminSkillsPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";

import { useApp } from "@/context/AppContext";
import { isDashboardShellPath } from "@/lib/navigation";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, bootstrapping } = useApp();

  if (bootstrapping) {
    return <div className="page"><div className="card">Loading...</div></div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { currentUser, bootstrapping } = useApp();

  if (bootstrapping) {
    return <div className="page"><div className="card">Loading...</div></div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="route-enter">
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <AiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navigate to="/home" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <RequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-post"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:userId"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="skills" element={<AdminSkillsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

function App() {
  const { currentUser } = useApp();
  const location = useLocation();

  const isLandingRoute = location.pathname === "/";
  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password/");
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isDashboardShell = Boolean(currentUser) && isDashboardShellPath(location.pathname);

  if (isAdminRoute) {
    return (
      <div className="resend-shell min-h-screen">
        <SplineBackground />
        <AnimatedRoutes />
        <ToastContainer />
      </div>
    );
  }

  if (isDashboardShell) {
    return (
      <div className="resend-shell relative min-h-screen overflow-x-hidden">
        <SplineBackground />
        <div className="relative z-10 app-layout">
          <Navbar />
          <div className="app-body">
            <main className="app-main">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
          <ToastContainer />
        </div>
      </div>
    );
  }

  return (
    <div className="resend-shell relative min-h-screen overflow-x-hidden">
      {!isAuthRoute ? <SplineBackground /> : null}
      <div className="relative z-10 app-surface-layer">
        {!isLandingRoute && !isAuthRoute ? <Navbar /> : null}
        <main
          className={
            isLandingRoute || isAuthRoute
              ? "w-full p-0"
              : "mx-auto w-full max-w-7xl px-4 pb-8 pt-24 sm:px-6"
          }
        >
          <AnimatedRoutes />
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </div>
  );
}

export default App;
