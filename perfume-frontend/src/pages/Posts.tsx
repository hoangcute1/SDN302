import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import API_BASE from "../config";
import "./Posts.css";

interface Author {
  _id: string;
  name: string;
  email: string;
}

interface PerfumeRef {
  _id: string;
  perfumeName: string;
  uri: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  image: string;
  author: Author;
  perfume?: PerfumeRef | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Perfume {
  _id: string;
  perfumeName: string;
}

const emptyForm = {
  title: "",
  content: "",
  image: "",
  perfume: "",
  tags: "",
};

export default function Posts() {
  const { member } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      const res = await api.get("/posts", { params });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerfumes = async () => {
    try {
      const res = await api.get("/perfumes");
      setPerfumes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchPerfumes();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setError("");
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (post: Post) => {
    setEditing(post);
    setForm({
      title: post.title,
      content: post.content,
      image: post.image || "",
      perfume: post.perfume?._id || "",
      tags: post.tags.join(", "),
    });
    setError("");
    setImagePreview(post.image || "");
    setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    try {
      const payload = {
        title: form.title,
        content: form.content,
        image: form.image,
        perfume: form.perfume || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editing) {
        await api.put(`/posts/${editing._id}`, payload);
      } else {
        await api.post("/posts", payload);
      }
      setShowModal(false);
      fetchPosts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save post");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${id}`);
      fetchPosts();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = `${API_BASE}${res.data.url}`;
      setForm((prev) => ({ ...prev, image: imageUrl }));
      setImagePreview(imageUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setForm((prev) => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  const getImageSrc = (image: string) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    return `${API_BASE}${image}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEditDelete = (post: Post) => {
    if (!member) return false;
    return member.isAdmin || member._id === post.author?._id;
  };

  return (
    <div className="posts-page fade-in">
      <h1>Perfume Community</h1>

      <div className="posts-header-actions">
        <form onSubmit={handleSearch} className="posts-search">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        {member && (
          <button className="btn-create-post" onClick={openCreate}>
            + New Post
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading community posts...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty">No posts yet. Be the first to share!</div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div className="post-card fade-in" key={post._id}>
              <div className="post-header">
                <h3>{post.title}</h3>
                {canEditDelete(post) && (
                  <div className="post-actions">
                    <button className="btn-edit" onClick={() => openEdit(post)}>Edit</button>
                    <button className="btn-delete-post" onClick={() => handleDelete(post._id)}>Delete</button>
                  </div>
                )}
              </div>
              <div className="post-meta">
                By <strong>{post.author?.name || "Unknown"}</strong> • {new Date(post.createdAt).toLocaleDateString()}
                {post.perfume && <span className="post-perfume-tag">🌸 {post.perfume.perfumeName}</span>}
              </div>
              {post.image && (
                <div className="post-image">
                  <img src={getImageSrc(post.image)} alt={post.title} />
                </div>
              )}
              <p className="post-content">{post.content}</p>
              {post.tags?.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="post-tag-item">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Post" : "Create New Post"}</h2>
            {error && <div className="admin-error">{error}</div>}

            <label>Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Post title..."
            />

            <label>Content</label>
            <textarea
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your post content..."
            />

            <label>Image (optional)</label>
            <div className="image-upload-section">
              <div className="image-url-row">
                <input
                  value={form.image}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="Paste image URL here..."
                />
                <span className="image-or">or</span>
                <button
                  type="button"
                  className="btn-upload-file"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "📁 Upload"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </div>
              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={getImageSrc(imagePreview)}
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = "block";
                    }}
                  />
                  <button
                    type="button"
                    className="btn-remove-image"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, image: "" }));
                      setImagePreview("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            <label>Related Perfume (optional)</label>
            <select
              value={form.perfume}
              onChange={(e) => setForm({ ...form, perfume: e.target.value })}
            >
              <option value="">-- None --</option>
              {perfumes.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.perfumeName}
                </option>
              ))}
            </select>

            <label>Tags (comma-separated)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="review, edp, summer"
            />

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>
                {editing ? "Update" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
