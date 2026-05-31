import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SendHorizontal } from "lucide-react";
import { useApp } from "../context/AppContext";

function CreatePostPage() {
  const navigate = useNavigate();
  const { addToast, createPost } = useApp();
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvent) => { setPreview(loadEvent.target?.result?.toString() || ""); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim() && !preview) return;
    setSubmitting(true);
    try {
      await createPost({ content, image: preview || undefined });
      navigate("/home");
    } catch {
      addToast("Unable to create post.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - var(--header-height))", padding: "40px 20px" }}>
      <div className="card" style={{ maxWidth: "640px", width: "100%" }}>
        <h2 className="section-title">Create Post</h2>
        <p className="section-sub">Share progress and ask for collaborations.</p>
        <form onSubmit={handleSubmit}>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="What are you working on?" className="input-dark" style={{ minHeight: "140px" }} />
          <label style={{ display: "block", marginTop: "16px" }}>
            <div className="file-upload-zone">Choose file or drag here</div>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </label>
          {preview && <img src={preview} alt="Preview" className="post-image preview" style={{ marginTop: "16px" }} />}
          <button
            className="btn-red"
            type="submit"
            disabled={submitting || (!content.trim() && !preview)}
            aria-label="Post update"
            title="Post update"
            style={{ width: '100%', marginTop: '12px', padding: '14px', justifyContent: 'center' }}
          >
            {submitting ? "Posting..." : <SendHorizontal size={18} />}
          </button>
        </form>
      </div>
    </section>
  );
}

export default CreatePostPage;
