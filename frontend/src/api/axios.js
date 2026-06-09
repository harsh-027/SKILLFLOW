import axios from "axios";
import { isTokenExpired } from "@/lib/auth-session";

export const AUTH_SESSION_EXPIRED_EVENT = "skillflow:auth-session-expired";

const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];

const isAuthRoute = (url = "") => authRoutes.some((route) => url.includes(route));

const notifySessionExpired = (message = "Your session has expired. Please sign in again.") => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_EXPIRED_EVENT, {
      detail: { message },
    })
  );
};

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://skillflow-6wqe.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  if (token) {
    if (isTokenExpired(token) && !isAuthRoute(config.url)) {
      notifySessionExpired();
      return Promise.reject(new axios.Cancel("Session expired"));
    }

    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if ((status === 401 || status === 403) && !isAuthRoute(url)) {
      notifySessionExpired(
        status === 403
          ? "Your account cannot access this resource. Please sign in again."
          : "Your session has expired. Please sign in again."
      );
    }

    return Promise.reject(error);
  }
);

export default API;
