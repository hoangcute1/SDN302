import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import "./Profile.css";

export default function Profile() {
  const { member, updateMember } = useAuth();
  const [form, setForm] = useState({
    name: member?.name || "",
    YOB: member?.YOB || 2000,
    gender: member?.gender ?? true,
  });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [error, setError] = useState("");
  const [pwError, setPwError] = useState("");

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const res = await api.put("/auth/profile", form);
      updateMember(res.data.member);
      setMsg("Profile updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    setPwError("");
    try {
      await api.put("/auth/change-password", pwForm);
      setPwMsg("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err: any) {
      setPwError(err.response?.data?.message || "Password change failed");
    }
  };

  if (!member) return null;

  return (
    <div className="profile-container fade-in">
      <div className="profile-hero">
        <div className="profile-avatar">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <h1>{member.name}</h1>
        <p>{member.email}</p>
        {member.isAdmin && <span className="badge-admin">Administrator</span>}
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="card-title">
            <span className="icon">👤</span>
            <h2>Personal Information</h2>
          </div>
          {msg && <div className="profile-success">{msg}</div>}
          {error && <div className="profile-error">{error}</div>}

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Year of Birth</label>
                <input type="number" value={form.YOB} onChange={(e) => setForm({ ...form, YOB: +e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select value={form.gender ? "male" : "female"} onChange={(e) => setForm({ ...form, gender: e.target.value === "male" })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        </div>

        <div className="profile-card">
          <div className="card-title">
            <span className="icon">🔒</span>
            <h2>Security</h2>
          </div>
          {pwMsg && <div className="profile-success">{pwMsg}</div>}
          {pwError && <div className="profile-error">{pwError}</div>}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-outline">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
