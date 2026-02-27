import { useState, useEffect } from "react";
import api from "../api";
import "./Admin.css";

interface Brand {
  _id: string;
  brandName: string;
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [error, setError] = useState("");

  const fetchBrands = async () => {
    try {
      const res = await api.get("/brands");
      setBrands(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const openCreate = () => {
    setEditing(null);
    setBrandName("");
    setError("");
    setShowModal(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setBrandName(brand.brandName);
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    try {
      if (editing) {
        await api.put(`/brands/${editing._id}`, { brandName });
      } else {
        await api.post("/brands", { brandName });
      }
      setShowModal(false);
      fetchBrands();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save brand");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    try {
      await api.delete(`/brands/${id}`);
      fetchBrands();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="admin-page">
      <h1>
        Manage Brands
        <button onClick={openCreate}>+ Add Brand</button>
      </h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Brand Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((b, i) => (
            <tr key={b._id}>
              <td>{i + 1}</td>
              <td>{b.brandName}</td>
              <td>
                <div className="admin-actions">
                  <button className="btn-edit" onClick={() => openEdit(b)}>Edit</button>
                  <button className="btn-delete-admin" onClick={() => handleDelete(b._id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Brand" : "Add Brand"}</h2>
            {error && <div className="admin-error">{error}</div>}
            <label>Brand Name</label>
            <input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
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
