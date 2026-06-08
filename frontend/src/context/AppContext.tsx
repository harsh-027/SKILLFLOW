import API from "../api/axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

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
  avatar?: string;
  banner?: string;
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

  updateProfile: (updates: Partial<User>) => Promise<void>;

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
    return JSON.parse(storedUser) as User;
  } catch (error) {
    window.localStorage.removeItem("skillflow-current-user");
    return null;
  }
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

  const refreshCurrentUser = useCallback(async () => {
    try {
      const { data } = await API.get("/auth/me");
      setCurrentUser(data);
      persistCurrentUser(data);
      return data;
    } catch (error) {
      setCurrentUser(null);
      persistCurrentUser(null);
      return null;
    }
  }, [persistCurrentUser]);

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
        }

        const ownPosts =
          ownPostsRes.status === "fulfilled" && Array.isArray(ownPostsRes.value.data)
            ? ownPostsRes.value.data
            : [];
        const communityPosts =
          communityPostsRes.status === "fulfilled" && Array.isArray(communityPostsRes.value.data)
            ? communityPostsRes.value.data
            : [];

        setPosts(mergePostsById([ownPosts, communityPosts]));
      } finally {
        setBootstrapping(false);
      }
    };

    loadData();
  }, [refreshCurrentUser]);

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

  const login = useCallback(
    async (email: string, password: string, otp?: string) => {
      const { data } = await API.post("/auth/login", {
        email,
        password,
        ...(otp ? { otp } : {}),
      }, {
        withCredentials: true,
      });

      setCurrentUser(data.user);
      persistCurrentUser(data.user);
      addToast(`Welcome back, ${data.user.userId ? `@${data.user.userId}` : data.user.name}.`, "success");
      return data.user;
    },
    [addToast, persistCurrentUser]
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
      }, {
        withCredentials: true,
      });

      setCurrentUser(data.user);
      persistCurrentUser(data.user);
      addToast("Account created successfully.", "success");
      return data.user;
    },
    [addToast, persistCurrentUser]
  );

  const logout = useCallback(async (silent: boolean = false) => {
    try {
      await API.post("/auth/logout", undefined, { withCredentials: true });
    } catch (error) {
      // Clear local session state even if the server cookie is already gone.
    }

    setCurrentUser(null);
    persistCurrentUser(null);
    if (!silent) {
      addToast("You have been logged out.", "info");
    }
  }, [addToast, persistCurrentUser]);

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
      let avatar = typeof updates.avatar === "string" ? updates.avatar : undefined;
      if (avatar) {
        avatar = await uploadImageIfNeeded(avatar);
      }

      let banner = typeof updates.banner === "string" ? updates.banner : undefined;
      if (banner) {
        banner = await uploadImageIfNeeded(banner);
      }

      const payload = {
        ...(typeof updates.userId === "string" ? { userId: updates.userId } : {}),
        ...(typeof updates.name === "string" ? { name: updates.name } : {}),
        ...(typeof updates.bio === "string" ? { bio: updates.bio } : {}),
        ...(typeof updates.location === "string" ? { location: updates.location } : {}),
        ...(typeof avatar === "string" ? { avatar } : {}),
        ...(typeof banner === "string" ? { banner } : {}),
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
      setCurrentUser(data);
      persistCurrentUser(data);
      setUsers((prev) => prev.map((user) => (user._id === data._id ? data : user)));
      addToast("Profile updated.", "success");
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

  const value: AppContextType = {
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
