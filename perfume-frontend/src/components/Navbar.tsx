import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { member, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={closeMenu}>🌸 Perfume Store</Link>
      </div>

      <button
        className={`navbar-toggle ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/posts" onClick={closeMenu}>Community</Link>
        {member ? (
          <>
            <Link to="/profile" onClick={closeMenu}>Profile</Link>
            {member.isAdmin && (
              <>
                <div className="navbar-divider"></div>
                <Link to="/admin/brands" onClick={closeMenu} className="admin-link">Brands</Link>
                <Link to="/admin/perfumes" onClick={closeMenu} className="admin-link">Perfumes</Link>
                <Link to="/admin/members" onClick={closeMenu} className="admin-link">Members</Link>
              </>
            )}
            <div className="navbar-divider"></div>
            <span className="navbar-user">
              Hi, <strong>{member.name}</strong>
              {member.isAdmin && <span className="badge-admin">Admin</span>}
            </span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <div className="navbar-divider"></div>
            <Link to="/login" onClick={closeMenu} className="btn-nav-login">Login</Link>
            <Link to="/register" onClick={closeMenu} className="btn-nav-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
