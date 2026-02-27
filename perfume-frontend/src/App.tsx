import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PerfumeDetail from "./pages/PerfumeDetail";
import AdminBrands from "./pages/AdminBrands";
import AdminPerfumes from "./pages/AdminPerfumes";
import AdminMembers from "./pages/AdminMembers";
import Posts from "./pages/Posts";
import "./App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { member } = useAuth();
  if (!member) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { member } = useAuth();
  if (!member) return <Navigate to="/login" />;
  if (!member.isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
}

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/perfumes/:id" element={<PerfumeDetail />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin/brands" element={<AdminRoute><AdminBrands /></AdminRoute>} />
        <Route path="/admin/perfumes" element={<AdminRoute><AdminPerfumes /></AdminRoute>} />
        <Route path="/admin/members" element={<AdminRoute><AdminMembers /></AdminRoute>} />
      </Routes>
    </div>
  );
}

export default App;
