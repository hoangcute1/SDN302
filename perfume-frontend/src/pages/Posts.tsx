import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
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
    return member.isAdmin || member._id === post.author._id;
  };

  return (
    <div className="posts-page">
      <div className="posts-header">
        <h1>Blog Posts</h1>
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
      </div>

      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="empty">No posts yet. Be the first to share!</div>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div className="post-card" key={post._id}>
              {post.image && (
                <div className="post-image">
                  <img src={post.image} alt={post.title} />
                </div>
              )}
              <div className="post-body">
                <h2 className="post-title">{post.title}</h2>
                <div className="post-meta">
                  <span className="post-author">By {post.author?.name}</span>
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                </div>
                {post.perfume && (
                  <div className="post-perfume-tag">
                    🌸 Related: {post.perfume.perfumeName}
                  </div>
                )}
                <p className="post-content">{post.content}</p>
                {post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag, i) => (
                      <span key={i} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {canEditDelete(post) && (
                  <div className="post-actions">
                    <button className="btn-edit" onClick={() => openEdit(post)}>
                      Edit
                    </button>
                    <button
                      className="btn-delete-post"
                      onClick={() => handleDelete(post._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
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

            <label>Image URL (optional)</label>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />

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
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
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
