import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import API, { AUTH_SESSION_EXPIRED_EVENT } from "../api/axios";
import { getTokenExpiresAt, isTokenExpired } from "@/lib/auth-session";
import { readPaginatedItems } from "@/lib/pagination";

export interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isBanned: boolean;
  isVerified: boolean;
  bio?: string;
  location?: string;
  profilePicture?: string;
  profileBanner?: string;
  createdAt?: string;
  updatedAt?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  rating: number;
  followers?: string[];
  following?: string[];
  mfaEnabled?: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: string;
}

function mergePostsById(postGroups: any[][]) {
  const postsById = new Map<string, any>();

  postGroups.flat().forEach((post) => {
    if (post && typeof post._id === "string") {
      postsById.set(post._id, post);
    }
  });

  return Array.from(postsById.values());
}

function replaceUserReference(value: any, updatedUser: User) {
  if (typeof value === "object" && value !== null && value._id === updatedUser._id) {
    return { ...value, ...updatedUser };
  }

  return value;
}

interface AppContextType {
  users: User[];
  posts: any[];
  sortedPosts: any[];
  requests: any[];
  user: User | null;
  currentUser: User | null;
  bootstrapping: boolean;
  toasts: Toast[];

  login: (email: string, password: string, otp?: string) => Promise<User>;
  register: (data: {
    userId: string;
    name: string;
    email: string;
    password: string;
    skillsOffered: string[];
    skillsWanted: string[];
  }) => Promise<User>;
  logout: (silent?: boolean) => Promise<void>;

  updateProfile: (updates: Partial<User>) => Promise<User>;

  createPost: (data: { content?: string; image?: string }) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  sendRequest: (payload: {
    receiverId: string;
    skillOffered: string;
    skillWanted: string;
  }) => Promise<boolean>;

  addToast: (message: string, type?: string) => void;
  removeToast: (id: string) => void;

  getUserById: (id: string) => User | undefined;
  refreshCurrentUser: () => Promise<User | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem("skillflow-current-user");
  if (!storedUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedUser) as User;
    return parsed;
  } catch {
    window.localStorage.removeItem("skillflow-current-user");
    return null;
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("token");
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [bootstrapping, setBootstrapping] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const persistCurrentUser = useCallback((user: User | null) => {
    if (typeof window === "undefined") {
      return;
    }

    if (!user) {
      window.localStorage.removeItem("skillflow-current-user");
      return;
    }

    window.localStorage.setItem("skillflow-current-user", JSON.stringify(user));
  }, []);

  const persistToken = useCallback((token: string | null) => {
    if (typeof window === "undefined") {
      return;
    }

    if (!token) {
      window.localStorage.removeItem("token");
      return;
    }

    window.localStorage.setItem("token", token);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const addToast = useCallback(
    (message: string, type: string = "info") => {
      const toastId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id: toastId, message, type }]);
      window.setTimeout(() => removeToast(toastId), 3200);
    },
    [removeToast]
  );

  const refreshCurrentUser = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      setCurrentUser(null);
      persistCurrentUser(null);
      return null;
    }

    if (isTokenExpired(token)) {
      setCurrentUser(null);
      persistCurrentUser(null);
      persistToken(null);
      return null;
    }

    try {
      const { data } = await API.get("/auth/me", {
        params: { _t: Date.now() },
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      setCurrentUser(data);
      persistCurrentUser(data);
      return data;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setCurrentUser(null);
        persistCurrentUser(null);
        persistToken(null);
      }
      return null;
    }
  }, [persistCurrentUser, persistToken]);

  const clearSession = useCallback(
    (message?: string) => {
      setCurrentUser(null);
      persistCurrentUser(null);
      persistToken(null);

      if (message) {
        addToast(message, "warning");
      }
    },
    [addToast, persistCurrentUser, persistToken]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await refreshCurrentUser();
        if (!user) {
          return;
        }

        const [usersRes, ownPostsRes, communityPostsRes] = await Promise.allSettled([
          API.get("/users"),
          API.get("/posts"),
          API.get("/posts/following"),
        ]);

        if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value.data)) {
          setUsers(usersRes.value.data);
        } else if (usersRes.status === "fulfilled") {
          setUsers(readPaginatedItems<User>(usersRes.value.data));
        }

        const ownPosts =
          ownPostsRes.status === "fulfilled"
            ? readPaginatedItems<any>(ownPostsRes.value.data)
            : [];
        const communityPosts =
          communityPostsRes.status === "fulfilled"
            ? readPaginatedItems<any>(communityPostsRes.value.data)
            : [];

        setPosts(mergePostsById([ownPosts, communityPosts]));
      } finally {
        setBootstrapping(false);
      }
    };

    loadData();
  }, [refreshCurrentUser]);

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const message =
        event instanceof CustomEvent && typeof event.detail?.message === "string"
          ? event.detail.message
          : "Your session has expired. Please sign in again.";

      clearSession(message);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [clearSession]);

  useEffect(() => {
    const token = getStoredToken();
    const expiresAt = getTokenExpiresAt(token);
    if (!expiresAt) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => clearSession("Your session has expired. Please sign in again."),
      Math.max(expiresAt - Date.now(), 0)
    );

    return () => window.clearTimeout(timeoutId);
  }, [clearSession, currentUser]);

  const getUserById = useCallback(
    (id: string) => users.find((user) => user._id === id),
    [users]
  );

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [posts]
  );

  const login = useCallback(
    async (email: string, password: string, otp?: string) => {
      const { data } = await API.post("/auth/login", {
        email,
        password,
        ...(otp ? { otp } : {}),
      });

      persistToken(data.token);
      setCurrentUser(data.user);
      persistCurrentUser(data.user);
      addToast(`Welcome back, ${data.user.userId ? `@${data.user.userId}` : data.user.name}.`, "success");
      return data.user;
    },
    [addToast, persistCurrentUser, persistToken]
  );

  const register = useCallback(
    async ({
      userId,
      name,
      email,
      password,
      skillsOffered,
      skillsWanted,
    }: {
      userId: string;
      name: string;
      email: string;
      password: string;
      skillsOffered: string[];
      skillsWanted: string[];
    }) => {
      const { data } = await API.post("/auth/register", {
        userId,
        name,
        email,
        password,
        skillsOffered,
        skillsWanted,
      });

      persistToken(data.token);
      setCurrentUser(data.user);
      persistCurrentUser(data.user);
      addToast("Account created successfully.", "success");
      return data.user;
    },
    [addToast, persistCurrentUser, persistToken]
  );

  const logout = useCallback(async (silent: boolean = false) => {
    try {
      await API.post("/auth/logout");
    } catch {
      // Clear local session state even if the token is already invalid.
    }

    setCurrentUser(null);
    persistCurrentUser(null);
    persistToken(null);
    if (!silent) {
      addToast("You have been logged out.", "info");
    }
  }, [addToast, persistCurrentUser, persistToken]);

  const uploadImageIfNeeded = useCallback(async (imageValue: string) => {
    const isDataUrl = /^data:image\//i.test(imageValue);
    if (!isDataUrl) {
      return imageValue;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      return imageValue;
    }

    const formData = new FormData();
    formData.append("file", imageValue);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image.");
    }

    const result = await response.json();
    return typeof result.secure_url === "string" && result.secure_url
      ? result.secure_url
      : imageValue;
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      const [profilePicture, profileBanner] = await Promise.all([
        typeof updates.profilePicture === "string"
          ? uploadImageIfNeeded(updates.profilePicture.trim())
          : undefined,
        typeof updates.profileBanner === "string"
          ? uploadImageIfNeeded(updates.profileBanner.trim())
          : undefined,
      ]);

      const payload = {
        ...(typeof updates.userId === "string" ? { userId: updates.userId } : {}),
        ...(typeof updates.name === "string" ? { name: updates.name } : {}),
        ...(typeof updates.bio === "string" ? { bio: updates.bio } : {}),
        ...(typeof updates.location === "string" ? { location: updates.location } : {}),
        ...(typeof profilePicture === "string" ? { profilePicture } : {}),
        ...(typeof profileBanner === "string" ? { profileBanner } : {}),
        ...(Array.isArray(updates.skillsOffered)
          ? { skillsOffered: updates.skillsOffered }
          : {}),
        ...(Array.isArray(updates.skillsWanted)
          ? { skillsWanted: updates.skillsWanted }
          : {}),
      };

      const { data } = await API.put("/users/me", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const savedUser = data as User;
      setCurrentUser(savedUser);
      persistCurrentUser(savedUser);
      setUsers((prev) => prev.map((user) => (user._id === savedUser._id ? savedUser : user)));
      setPosts((prev) =>
        prev.map((post) => ({
          ...post,
          user: replaceUserReference(post.user, savedUser),
          comments: Array.isArray(post.comments)
            ? post.comments.map((comment: any) => ({
                ...comment,
                user: replaceUserReference(comment.user, savedUser),
              }))
            : post.comments,
        }))
      );
      addToast("Profile updated.", "success");
      return savedUser;
    },
    [addToast, persistCurrentUser, uploadImageIfNeeded]
  );

  const createPost = useCallback(
    async ({ content, image }: { content?: string; image?: string }) => {
      const trimmedContent = typeof content === "string" ? content.trim() : "";
      const uploadedImage =
        typeof image === "string" && image.trim()
          ? await uploadImageIfNeeded(image.trim())
          : undefined;

      const payload = {
        ...(trimmedContent ? { content: trimmedContent } : {}),
        ...(uploadedImage ? { image: uploadedImage } : {}),
      };

      const { data } = await API.post("/posts", payload);
      setPosts((prev) => [data, ...prev]);
      addToast("Post published.", "success");
    },
    [addToast, uploadImageIfNeeded]
  );

  const toggleLike = useCallback(async (postId: string) => {
    const { data } = await API.put(`/posts/like/${postId}`);
    setPosts((prev) => prev.map((post) => (post._id === postId ? { ...post, ...data } : post)));
  }, []);

  const addComment = useCallback(async (postId: string, text: string) => {
    const { data } = await API.post(`/posts/comment/${postId}`, { text });
    setPosts((prev) => prev.map((post) => (post._id === postId ? data : post)));
  }, []);

  const deletePost = useCallback(
    async (postId: string) => {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      addToast("Post deleted permanently.", "success");
    },
    [addToast]
  );

  const sendRequest = useCallback(
    async ({
      receiverId,
      skillOffered,
      skillWanted,
    }: {
      receiverId: string;
      skillOffered: string;
      skillWanted: string;
    }) => {
      try {
        if (!receiverId || !skillOffered || !skillWanted) {
          addToast("All fields are required.", "error");
          return false;
        }

        const { data } = await API.post("/swap-requests", {
          receiverId,
          skillOffered,
          skillWanted,
        });

        setRequests((prev) => [data, ...prev]);
        addToast("Swap request sent.", "success");
        return true;
      } catch (error: any) {
        addToast(error.response?.data?.message || "Failed to send swap request.", "error");
        return false;
      }
    },
    [addToast]
  );

  const value = useMemo<AppContextType>(
    () => ({
      users,
      posts,
      sortedPosts,
      requests,
      user: currentUser,
      currentUser,
      bootstrapping,
      toasts,
      login,
      register,
      logout,
      updateProfile,
      createPost,
      toggleLike,
      addComment,
      deletePost,
      sendRequest,
      addToast,
      removeToast,
      getUserById,
      refreshCurrentUser,
    }),
    [
      addComment,
      addToast,
      bootstrapping,
      createPost,
      currentUser,
      deletePost,
      getUserById,
      login,
      logout,
      posts,
      refreshCurrentUser,
      register,
      removeToast,
      requests,
      sendRequest,
      sortedPosts,
      toasts,
      toggleLike,
      updateProfile,
      users,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
