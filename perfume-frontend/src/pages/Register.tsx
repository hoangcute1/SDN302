import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import "./Auth.css";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", name: "", YOB: 2000, gender: true });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      login(res.data.token, res.data.member);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-in">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="auth-logo">🌸</span>
          <h2>Create Account</h2>
          <p>Join our exclusive community</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <label>Full Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <label>Year of Birth</label>
        <input type="number" value={form.YOB} onChange={(e) => setForm({ ...form, YOB: +e.target.value })} required />
        <label>Gender</label>
        <select value={form.gender ? "male" : "female"} onChange={(e) => setForm({ ...form, gender: e.target.value === "male" })}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
