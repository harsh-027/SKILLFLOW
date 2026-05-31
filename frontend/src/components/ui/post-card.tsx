import { useMemo, useState } from "react";
import { Heart, MessageCircle, SendHorizontal } from "lucide-react";
import TrashSolidIcon from "@/components/ui/trash-solid-icon";
import { getPreferredUserLabel, getUserInitials } from "@/lib/user-display";

type BasicUser = { _id?: string; userId?: string; name?: string; avatar?: string; };
type PostComment = { _id: string; user: string | BasicUser; text: string; };
type FeedPost = { _id: string; content?: string; image?: string; createdAt: string; user: string | BasicUser; likes: string[]; comments: PostComment[]; };
type PostCardProps = { post: FeedPost; currentUser: { _id: string } | null; author?: BasicUser | null; getUserById: (id: string) => BasicUser | undefined; onLike: (postId: string) => void; onComment?: (postId: string, text: string) => void; onDelete?: (postId: string) => void; showCommentComposer?: boolean; };
const formatDate = (timestamp: string) => new Date(timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export default function DashboardPostCard({ post, author, currentUser, getUserById, onLike, onComment, onDelete, showCommentComposer = true }: PostCardProps) {
  const [commentText, setCommentText] = useState("");
  const liked = useMemo(() => currentUser ? post.likes.includes(currentUser._id) : false, [post.likes, currentUser]);
  const resolvedAuthor = useMemo(() => author || (typeof post.user === "object" && post.user !== null ? post.user : typeof post.user === "string" ? getUserById(post.user) : null), [author, post.user, getUserById]);
  const postOwnerId = typeof post.user === "object" && post.user !== null ? post.user._id : post.user;
  const canDelete = Boolean(currentUser && postOwnerId && currentUser._id === postOwnerId && onDelete);
  const handleCommentSubmit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const cleanComment = commentText.trim(); if (!cleanComment || !currentUser || !onComment) return; onComment(post._id, cleanComment); setCommentText(""); };
  const handleDelete = () => {
    if (!onDelete) return;
    const shouldDelete = window.confirm("Delete this post forever?");
    if (!shouldDelete) return;
    onDelete(post._id);
  };

  return (
    <article className="post-card">
      <div className="flex-between gap-12" style={{ alignItems: "flex-start" }}>
        <div className="flex-center gap-12">
          {resolvedAuthor?.avatar ? <img src={resolvedAuthor.avatar} alt={getPreferredUserLabel(resolvedAuthor)} className="profile-avatar-ring" style={{ width: "42px", height: "42px", fontSize: "16px", margin: 0 }} /> : <div className="profile-avatar-ring" style={{ width: "42px", height: "42px", fontSize: "16px", margin: 0 }}>{getUserInitials(resolvedAuthor)}</div>}
          <div>
            <h4 className="post-card-author">{getPreferredUserLabel(resolvedAuthor)}</h4>
            <p className="post-card-date">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        {canDelete ? (
          <button
            type="button"
            onClick={handleDelete}
            className="btn-delete-icon"
            aria-label="Delete post"
            title="Delete post"
          >
            <TrashSolidIcon size={16} />
          </button>
        ) : null}
      </div>
      {post.content ? <p className="post-card-body">{post.content}</p> : null}
      {post.image ? <img src={post.image} alt="Post attachment" className="post-image" /> : null}
      <div className="flex-between" style={{ marginTop: "12px" }}>
        <button type="button" onClick={() => onLike(post._id)} className={`like-btn ${liked ? "liked" : ""}`}><Heart size={16} className={liked ? "fill-current" : ""} />{post.likes.length}</button>
        <span className="badge skill-tag"><MessageCircle size={14} />{post.comments.length} comments</span>
      </div>
      <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
        {post.comments.slice(-3).map((comment) => {
          const commenterId = typeof comment.user === "object" && comment.user !== null ? comment.user._id || "" : comment.user;
          const commenter =
            typeof comment.user === "object" && comment.user !== null
              ? comment.user
              : commenterId
                ? getUserById(commenterId)
                : null;
          const commenterName = getPreferredUserLabel(commenter);
          return <div key={comment._id} className="comment-item"><span style={{ fontWeight: 600 }}>{commenterName}:</span> {comment.text}</div>;
        })}
      </div>
      {showCommentComposer ? (
        <form onSubmit={handleCommentSubmit} className="comment-form" style={{ marginTop: "12px" }}>
          <input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder={currentUser ? "Write a comment..." : "Login to comment"} disabled={!currentUser} className="input-dark" />
          <button type="submit" disabled={!currentUser || !onComment} className="btn-red"><SendHorizontal size={14} />Send</button>
        </form>
      ) : null}
    </article>
  );
}
