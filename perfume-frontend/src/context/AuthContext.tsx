import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../api";

interface Member {
  _id: string;
  email: string;
  name: string;
  YOB: number;
  gender: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  member: Member | null;
  token: string | null;
  login: (token: string, member: Member) => void;
  logout: () => void;
  updateMember: (member: Member) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(() => {
    const stored = localStorage.getItem("member");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  // Fetch latest profile from server when app loads
  useEffect(() => {
    if (!token) return;
    api.get("/auth/profile")
      .then((res) => {
        const fresh = res.data;
        localStorage.setItem("member", JSON.stringify(fresh));
        setMember(fresh);
      })
      .catch(() => {
        // Token expired or invalid — log out
        localStorage.removeItem("token");
        localStorage.removeItem("member");
        setToken(null);
        setMember(null);
      });
  }, [token]);

  const login = (token: string, member: Member) => {
    localStorage.setItem("token", token);
    localStorage.setItem("member", JSON.stringify(member));
    setToken(token);
    setMember(member);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("member");
    setToken(null);
    setMember(null);
  };

  const updateMember = (m: Member) => {
    localStorage.setItem("member", JSON.stringify(m));
    setMember(m);
  };

  return (
    <AuthContext.Provider value={{ member, token, login, logout, updateMember }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
