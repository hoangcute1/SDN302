import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./PerfumeDetail.css";

interface Comment {
  _id: string;
  rating: number;
  content: string;
  author: { _id: string; name: string; email: string };
  createdAt: string;
}

interface Brand {
  _id: string;
  brandName: string;
}

interface Perfume {
  _id: string;
  perfumeName: string;
  uri: string;
  price: number;
  concentration: string;
  description: string;
  ingredients: string;
  volume: number;
  targetAudience: string;
  comments: Comment[];
  brand: Brand;
  createdAt: string;
}

export default function PerfumeDetail() {
  const { id } = useParams<{ id: string }>();
  const { member } = useAuth();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ rating: 3, content: "" });
  const [commentError, setCommentError] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ rating: 3, content: "" });

  const fetchPerfume = async () => {
    try {
      const res = await api.get(`/perfumes/${id}`);
      setPerfume(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfume();
  }, [id]);

  const hasCommented = perfume?.comments.some(
    (c) => c.author?._id === member?._id
  );

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");
    try {
      const res = await api.post(`/perfumes/${id}/comments`, commentForm);
      setPerfume(res.data);
      setCommentForm({ rating: 3, content: "" });
    } catch (err: any) {
      setCommentError(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleEditComment = async (commentId: string) => {
    try {
      const res = await api.put(`/perfumes/${id}/comments/${commentId}`, editForm);
      setPerfume(res.data);
      setEditingComment(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to edit comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/perfumes/${id}/comments/${commentId}`);
      fetchPerfume();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const avgRating = perfume?.comments && perfume.comments.length > 0
    ? (perfume.comments.reduce((acc, c) => acc + c.rating, 0) / perfume.comments.length).toFixed(1)
    : null;

  const countStars = (rating: number) => {
    return Math.round(rating);
  };

  const getConcentrationClass = (c: string) => {
    const lower = c.toLowerCase();
    if (lower === "extrait") return "detail-extrait";
    if (lower === "edp") return "detail-edp";
    if (lower === "edt") return "detail-edt";
    return "";
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!perfume) return <div className="loading">Perfume not found.</div>;

  return (
    <div className="perfume-detail">
      <Link to="/" className="back-link">← Back to Home</Link>

      <div className="detail-main">
        <div className="detail-image">
          <img src={perfume.uri} alt={perfume.perfumeName} />
        </div>

        <div className="detail-info fade-in">
          <div className="detail-brand">{perfume.brand?.brandName}</div>
          <h1>{perfume.perfumeName}</h1>

          {avgRating && (
            <div className="detail-avg-rating">
              <span className="stars">
                {"★".repeat(countStars(+avgRating))}
                {"☆".repeat(3 - countStars(+avgRating))}
              </span>
              <span className="rating-num">{avgRating} / 3.0</span>
              <span className="rating-sep">•</span>
              <span className="rating-count">{perfume.comments.length} reviews</span>
            </div>
          )}

          <div className="detail-tags">
            <div className={`tag-concentration ${getConcentrationClass(perfume.concentration)}`}>
              {perfume.concentration.toLowerCase() === "extrait" && <span className="crown-icon">👑</span>}
              {perfume.concentration}
            </div>
            <span className="tag-audience">{perfume.targetAudience}</span>
            <span className="tag-volume">{perfume.volume}ml</span>
          </div>

          <div className="detail-price">${perfume.price}</div>

          <div className="detail-divider"></div>

          <div className="detail-section">
            <h3>Description</h3>
            <p>{perfume.description}</p>
          </div>

          <div className="detail-section">
            <h3>Key Ingredients</h3>
            <p className="ingredients-text">{perfume.ingredients}</p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2>Reviews ({perfume.comments.length})</h2>

        {member && !hasCommented && (
          <form className="comment-form" onSubmit={handleAddComment}>
            <h3>Add Your Review</h3>
            {commentError && <div className="comment-error">{commentError}</div>}
            <div className="rating-input">
              <label>Rating:</label>
              <div className="star-rating">
                {[1, 2, 3].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${commentForm.rating >= star ? "active" : ""}`}
                    onClick={() => setCommentForm({ ...commentForm, rating: star })}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Write your review..."
              value={commentForm.content}
              onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
              required
            />
            <button type="submit">Submit Review</button>
          </form>
        )}

        {!member && (
          <p className="login-prompt">
            <Link to="/login">Login</Link> to leave a review.
          </p>
        )}

        {hasCommented && (
          <p className="already-reviewed">You have already reviewed this perfume.</p>
        )}

        <div className="comments-list">
          {perfume.comments.map((c) => (
            <div key={c._id} className="comment-card">
              {editingComment === c._id ? (
                <div className="comment-edit-form">
                  <div className="star-rating">
                    {[1, 2, 3].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${editForm.rating >= star ? "active" : ""}`}
                        onClick={() => setEditForm({ ...editForm, rating: star })}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  />
                  <div className="comment-edit-actions">
                    <button onClick={() => handleEditComment(c._id)}>Save</button>
                    <button className="btn-cancel" onClick={() => setEditingComment(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="comment-header">
                    <strong>{c.author?.name}</strong>
                    <span className="comment-stars">
                      {"★".repeat(c.rating)}{"☆".repeat(3 - c.rating)}
                    </span>
                  </div>
                  <p className="comment-content">{c.content}</p>
                  <div className="comment-meta">
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    {member && c.author?._id === member._id && (
                      <div className="comment-actions">
                        <button
                          onClick={() => {
                            setEditingComment(c._id);
                            setEditForm({ rating: c.rating, content: c.content });
                          }}
                        >
                          Edit
                        </button>
                        <button className="btn-delete" onClick={() => handleDeleteComment(c._id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
