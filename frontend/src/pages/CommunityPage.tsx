import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, ImagePlus, MessageCircle, SendHorizontal, X } from "lucide-react";
import API from "@/api/axios";
import { useApp } from "@/context/AppContext";
import { getPreferredUserLabel } from "@/lib/user-display";

type BasicUser = { _id?: string; userId?: string; name?: string; avatar?: string; profileImage?: string; };
type CommunityComment = { _id: string; user: string | BasicUser; text: string; };
type CommunityPost = {
  _id: string;
  content?: string;
  image?: string;
  createdAt: string;
  likes: string[];
  comments: CommunityComment[];
  user: string | BasicUser;
};

const MAX_COMPOSER_IMAGE_SIZE = 5 * 1024 * 1024;

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");

    reader.onerror = () => reject(new Error("Failed to read file."));

    reader.readAsDataURL(file);
  });

const formatDate = (timestamp: string) =>
  new Date(timestamp).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function CommunityPage() {
  const { currentUser, addToast, createPost, getUserById } = useApp();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const composerFileRef = useRef<HTMLInputElement | null>(null);

  const loadPosts = useCallback(async (showSkeleton = false) => {
    try {
      if (showSkeleton) {
        setLoadingPosts(true);
      }
      const { data } = await API.get("/posts/feed");
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
      addToast("Unable to load the community feed.", "error");
    } finally {
      if (showSkeleton) {
        setLoadingPosts(false);
      }
    }
  }, [addToast]);

  useEffect(() => {
    loadPosts(true);
  }, [loadPosts]);

  const resizeComposer = useCallback((element: HTMLTextAreaElement | null) => {
    if (!element) return;

    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 220)}px`;
    element.style.overflowY = element.scrollHeight > 220 ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    resizeComposer(composerRef.current);
  }, [content, resizeComposer]);

  const clearSelectedImage = useCallback(() => {
    setSelectedImage("");
    setSelectedImageName("");

    if (composerFileRef.current) {
      composerFileRef.current.value = "";
    }
  }, []);

  const handleComposerImageChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        addToast("Please choose an image file.", "warning");
        event.target.value = "";
        return;
      }

      if (file.size > MAX_COMPOSER_IMAGE_SIZE) {
        addToast("Please choose an image under 5 MB.", "warning");
        event.target.value = "";
        return;
      }

      try {
        const imageDataUrl = await readFileAsDataUrl(file);
        setSelectedImage(imageDataUrl);
        setSelectedImageName(file.name);
      } catch {
        addToast("Unable to read the selected image.", "error");
        event.target.value = "";
      }
    },
    [addToast]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = content.trim();
    if (!text && !selectedImage) return;

    setSubmitting(true);
    try {
      await createPost({
        ...(text ? { content: text } : {}),
        ...(selectedImage ? { image: selectedImage } : {}),
      });
      setContent("");
      clearSelectedImage();
      await loadPosts(false);
    } catch {
      addToast("Unable to create post.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await API.put(`/posts/like/${postId}`);
      await loadPosts(false);
    } catch {
      addToast("Unable to update likes.", "error");
    }
  };

  const handleComment = async (postId: string) => {
    const text = (commentDrafts[postId] || "").trim();
    if (!text) return;

    try {
      await API.post(`/posts/comment/${postId}`, { text });
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      await loadPosts(false);
    } catch {
      addToast("Unable to add comment.", "error");
    }
  };

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [posts]
  );

  return (
    <section
      className={`page community-page ${
        currentUser ? "has-floating-composer" : ""
      } ${selectedImage ? "has-floating-composer-media" : ""}`}
    >
      <header className="community-feed-header">
        <h1 className="section-title">Community Feed</h1>
        <p className="section-sub">Updates, ideas, and progress.</p>
      </header>
      <div className="community-feed-shell">
        <div className="community-post-list">
          {loadingPosts ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div className="glass-card card" key={index}>
                <p className="muted">Loading post...</p>
              </div>
            ))
          ) : null}
          {!loadingPosts && sortedPosts.length
            ? sortedPosts.map((post) => {
                const postUserId =
                  typeof post.user === "object" && post.user !== null ? post.user._id : post.user;
                const isCurrentUser = Boolean(currentUser && postUserId === currentUser._id);
                const resolvedAuthor =
                  typeof post.user === "object" && post.user !== null
                    ? post.user
                    : getUserById(post.user as string) || null;

                return (
                  <div
                    key={post._id}
                    className={`flex w-full ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    style={{ width: "100%" }}
                    >
                      <div
                        className="rounded-2xl shadow-lg"
                        style={{
                          width: "78%",
                          minWidth: "0",
                          maxWidth: "620px",
                          overflow: "hidden",
                          padding: "12px 14px",
                          background: isCurrentUser ? "rgba(var(--accent-rgb), 0.12)" : "var(--surface-elevated)",
                          border: isCurrentUser ? "1px solid var(--red-border)" : "1px solid var(--border-card)",
                          borderTopRightRadius: isCurrentUser ? "4px" : "16px",
                          borderTopLeftRadius: isCurrentUser ? "16px" : "4px",
                          backdropFilter: "blur(18px)",
                        WebkitBackdropFilter: "blur(18px)",
                      }}
                    >
                      <div
                        className={`flex items-center gap-3 mb-2 ${
                          isCurrentUser ? "flex-row-reverse text-right" : "flex-row"
                        }`}
                      >
                          <img
                            src={resolvedAuthor?.profileImage || resolvedAuthor?.avatar || "/assets/default-profile.png"}
                            alt={getPreferredUserLabel(resolvedAuthor)}
                            className="w-8 h-8 rounded-full"
                            style={{ width: "32px", height: "32px", objectFit: "cover", flexShrink: 0 }}
                          />
                        <div style={{ flex: 1, textAlign: isCurrentUser ? "right" : "left" }}>
                          <p className="text-sm font-semibold">{getPreferredUserLabel(resolvedAuthor)}</p>
                          <p className="text-xs opacity-60">{formatDate(post.createdAt)}</p>
                        </div>
                      </div>

                      {post.content ? (
                        <p className="mb-3" style={{ textAlign: isCurrentUser ? "right" : "left" }}>
                          {post.content}
                        </p>
                      ) : null}
                      {post.image ? <img src={post.image} alt="Post attachment" className="post-image" /> : null}

                      <div className="flex justify-between items-center" style={{ marginTop: "12px" }}>
                        <button
                          type="button"
                          onClick={() => handleLike(post._id)}
                          className={`like-btn ${currentUser && post.likes.includes(currentUser._id) ? "liked" : ""}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            border: "0.5px solid var(--border-card)",
                            borderRadius: "8px",
                            padding: "4px 10px",
                          }}
                        >
                          <Heart
                            size={16}
                            className={currentUser && post.likes.includes(currentUser._id) ? "fill-current" : ""}
                          />
                          {post.likes.length}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenComments((prev) => ({ ...prev, [post._id]: !prev[post._id] }))
                          }
                          className="badge skill-tag"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            border: "0.5px solid rgba(var(--accent-rgb), 0.35)",
                            borderRadius: "8px",
                            padding: "4px 10px",
                            background: "rgba(var(--accent-rgb), 0.08)",
                          }}
                        >
                          <MessageCircle size={14} />
                          {post.comments.length} comments
                        </button>
                      </div>

                      {openComments[post._id] ? (
                        <div
                          style={{
                            borderTop: "0.5px solid var(--border-card)",
                            margin: "10px 0 0",
                            paddingTop: "10px",
                          }}
                        >
                          {post.comments.length ? (
                            <div className="mt-3 space-y-2" style={{ display: "grid", gap: "8px", marginTop: "0", width: "100%" }}>
                              {post.comments.slice(-3).map((comment) => {
                                const commentUser =
                                  typeof comment.user === "object" && comment.user !== null
                                    ? comment.user
                                    : getUserById(comment.user as string) || null;

                                return (
                                  <div
                                    key={comment._id}
                                    className="p-2 rounded-lg"
                                    style={{
                                      width: "100%",
                                      border: "1px solid var(--comment-border)",
                                      background: "var(--comment-bg)",
                                    }}
                                  >
                                    <strong>{getPreferredUserLabel(commentUser)}:</strong> {comment.text}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}

                          <form
                            onSubmit={(event) => {
                              event.preventDefault();
                              void handleComment(post._id);
                            }}
                            className="flex gap-2 mt-3"
                            style={{ display: "flex", gap: "8px", marginTop: "10px", alignItems: "center" }}
                          >
                            <input
                              className="input-dark"
                              value={commentDrafts[post._id] || ""}
                              onChange={(event) =>
                                setCommentDrafts((prev) => ({ ...prev, [post._id]: event.target.value }))
                              }
                              placeholder={currentUser ? "Write a comment..." : "Login to comment"}
                              disabled={!currentUser}
                              style={{ flex: 1, minWidth: 0 }}
                            />
                            <button
                              type="submit"
                              className="btn-red px-4"
                              disabled={!currentUser}
                              style={{ minWidth: "134px", justifyContent: "center", flexShrink: 0 }}
                            >
                              <SendHorizontal size={14} />
                              Send
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            : null}
          {!loadingPosts && !sortedPosts.length ? (
            <div className="glass-card card community-empty-card">
              <p className="muted">No posts yet.</p>
            </div>
          ) : null}
        </div>
        {currentUser ? (
          <div className="community-composer-wrap community-composer-wrap-bottom">
            <form onSubmit={handleSubmit} className="glass-card community-composer">
              <input
                ref={composerFileRef}
                type="file"
                accept="image/*"
                onChange={handleComposerImageChange}
                className="community-composer-file-input"
                tabIndex={-1}
              />
              {selectedImage ? (
                <div className="community-composer-preview-shell">
                  <img
                    src={selectedImage}
                    alt={selectedImageName || "Selected post attachment"}
                    className="community-composer-preview-image"
                  />
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="community-composer-preview-remove"
                    aria-label="Remove selected image"
                    title="Remove selected image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : null}
              <textarea
                ref={composerRef}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Share an update..."
                rows={1}
                className="community-composer-input"
                aria-label="Share something with the community"
              />
              <div className="community-composer-footer">
                <button
                  type="button"
                  className="community-composer-attach"
                  onClick={() => composerFileRef.current?.click()}
                  aria-label={selectedImage ? "Change image" : "Add image"}
                  title={selectedImage ? "Change image" : "Add image"}
                >
                  <ImagePlus size={16} />
                  <span>{selectedImage ? "Change" : "Image"}</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!content.trim() && !selectedImage)}
                  className="community-composer-submit"
                  aria-label="Post update"
                  title="Post update"
                >
                  {submitting ? "..." : <SendHorizontal size={18} />}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </section>
  );
}
