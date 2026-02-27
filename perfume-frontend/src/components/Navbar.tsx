import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { member, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🌸 Perfume Store</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/posts">Posts</Link>
        {member ? (
          <>
            <Link to="/profile">Profile</Link>
            {member.isAdmin && (
              <>
                <Link to="/admin/brands">Brands</Link>
                <Link to="/admin/perfumes">Perfumes</Link>
                <Link to="/admin/members">Members</Link>
              </>
            )}
            <span className="navbar-user">
              Hi, {member.name} {member.isAdmin && <span className="badge-admin">Admin</span>}
            </span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
