import { useState, useEffect } from "react";
import api from "../api";
import "./Admin.css";

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
  brand: Brand;
  isApproved: boolean;
  submittedBy?: { _id: string; name: string; email: string } | null;
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

export default function AdminPerfumes() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Perfume | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"all" | "pending">("all");

  const fetchPerfumes = async () => {
    try {
      const params: any = { all: "true" };
      if (tab === "pending") params.pending = "true";
      const res = await api.get("/perfumes", { params });
      setPerfumes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await api.get("/brands");
      setBrands(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPerfumes();
    fetchBrands();
  }, [tab]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, brand: brands[0]?._id || "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (p: Perfume) => {
    setEditing(p);
    setForm({
      perfumeName: p.perfumeName,
      uri: p.uri,
      price: p.price,
      concentration: p.concentration,
      description: p.description,
      ingredients: p.ingredients,
      volume: p.volume,
      targetAudience: p.targetAudience,
      brand: p.brand?._id || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    try {
      if (editing) {
        await api.put(`/perfumes/${editing._id}`, form);
      } else {
        await api.post("/perfumes", form);
      }
      setShowModal(false);
      fetchPerfumes();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save perfume");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this perfume?")) return;
    try {
      await api.delete(`/perfumes/${id}`);
      fetchPerfumes();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/perfumes/${id}/approve`);
      fetchPerfumes();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject and delete this perfume submission?")) return;
    try {
      await api.patch(`/perfumes/${id}/reject`);
      fetchPerfumes();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to reject");
    }
  };

  return (
    <div className="admin-page">
      <h1>
        Manage Perfumes
        <button onClick={openCreate}>+ Add Perfume</button>
      </h1>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>
          All Perfumes
        </button>
        <button className={`admin-tab ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")}>
          ⏳ Pending Approval
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Concentration</th>
              <th>Status</th>
              <th>Submitted By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {perfumes.map((p, i) => (
              <tr key={p._id}>
                <td>{i + 1}</td>
                <td>{p.perfumeName}</td>
                <td>{p.brand?.brandName}</td>
                <td>${p.price}</td>
                <td>{p.concentration}</td>
                <td>
                  {p.isApproved ? (
                    <span className="badge-yes">Approved</span>
                  ) : (
                    <span className="badge-pending">Pending</span>
                  )}
                </td>
                <td>{p.submittedBy?.name || "—"}</td>
                <td>
                  <div className="admin-actions">
                    {!p.isApproved && (
                      <>
                        <button className="btn-approve" onClick={() => handleApprove(p._id)}>✓ Approve</button>
                        <button className="btn-reject" onClick={() => handleReject(p._id)}>✗ Reject</button>
                      </>
                    )}
                    <button className="btn-edit" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn-delete-admin" onClick={() => handleDelete(p._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Perfume" : "Add Perfume"}</h2>
            {error && <div className="admin-error">{error}</div>}

            <label>Perfume Name</label>
            <input value={form.perfumeName} onChange={(e) => setForm({ ...form, perfumeName: e.target.value })} />

            <label>Image URL</label>
            <input value={form.uri} onChange={(e) => setForm({ ...form, uri: e.target.value })} />

            <label>Brand</label>
            <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>{b.brandName}</option>
              ))}
            </select>

            <label>Price ($)</label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />

            <label>Concentration</label>
            <select value={form.concentration} onChange={(e) => setForm({ ...form, concentration: e.target.value })}>
              <option value="Extrait">Extrait</option>
              <option value="EDP">EDP</option>
              <option value="EDT">EDT</option>
              <option value="EDC">EDC</option>
            </select>

            <label>Volume (ml)</label>
            <input type="number" value={form.volume} onChange={(e) => setForm({ ...form, volume: +e.target.value })} />

            <label>Target Audience</label>
            <select value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>

            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <label>Ingredients</label>
            <textarea value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />

            <div className="modal-actions">
              <button className="btn-save" onClick={handleSave}>Save</button>
              <button className="btn-cancel-modal" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
