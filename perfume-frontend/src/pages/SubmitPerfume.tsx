import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import API_BASE from "../config";
import "./SubmitPerfume.css";

interface Brand {
  _id: string;
  brandName: string;
}

const emptyForm = {
  perfumeName: "",
  uri: "",
  price: 0,
  concentration: "EDP",
  description: "",
  ingredients: "",
  volume: 100,
  targetAudience: "unisex",
  brand: "",
};

export default function SubmitPerfume() {
  const { member } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get("/brands");
        setBrands(res.data);
        if (res.data.length > 0) {
          setForm((prev) => ({ ...prev, brand: res.data[0]._id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBrands();
  }, []);

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
      setForm((prev) => ({ ...prev, uri: imageUrl }));
      setImagePreview(imageUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!form.perfumeName || !form.uri || !form.description || !form.brand) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      await api.post("/perfumes", form);
      setSuccess("Your perfume has been submitted! It will appear on the home page once approved by an admin.");
      setForm({ ...emptyForm, brand: brands[0]?._id || "" });
      setImagePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit perfume");
    } finally {
      setLoading(false);
    }
  };

  if (!member) {
    return (
      <div className="submit-perfume-page">
        <div className="submit-login-prompt">
          <h2>Please log in to submit a perfume.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-perfume-page fade-in">
      <h1>Submit a New Perfume</h1>
      <p className="submit-subtitle">
        Share your favorite fragrance with the community. Your submission will be reviewed by an admin before appearing on the home page.
      </p>

      {success && <div className="submit-success">{success}</div>}
      {error && <div className="submit-error">{error}</div>}

      <form className="submit-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Perfume Name *</label>
            <input
              value={form.perfumeName}
              onChange={(e) => setForm({ ...form, perfumeName: e.target.value })}
              placeholder="e.g. Dior Sauvage"
              required
            />
          </div>

          <div className="form-group">
            <label>Brand *</label>
            <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>{b.brandName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Price ($) *</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: +e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Concentration *</label>
            <select value={form.concentration} onChange={(e) => setForm({ ...form, concentration: e.target.value })}>
              <option value="Extrait">Extrait</option>
              <option value="EDP">EDP</option>
              <option value="EDT">EDT</option>
              <option value="EDC">EDC</option>
            </select>
          </div>

          <div className="form-group">
            <label>Volume (ml) *</label>
            <input
              type="number"
              min="1"
              value={form.volume}
              onChange={(e) => setForm({ ...form, volume: +e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Target Audience *</label>
            <select value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Image *</label>
          <div className="image-upload-row">
            <input
              value={form.uri}
              onChange={(e) => {
                setForm({ ...form, uri: e.target.value });
                setImagePreview(e.target.value);
              }}
              placeholder="Paste image URL..."
            />
            <span className="upload-or">or</span>
            <button
              type="button"
              className="btn-upload"
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
            <div className="submit-image-preview">
              <img src={imagePreview} alt="Preview" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe this fragrance..."
            required
          />
        </div>

        <div className="form-group">
          <label>Key Ingredients *</label>
          <textarea
            rows={2}
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            placeholder="e.g. Bergamot, Lavender, Ambroxan, Cedar"
            required
          />
        </div>

        <button type="submit" className="btn-submit-perfume" disabled={loading}>
          {loading ? "Submitting..." : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
