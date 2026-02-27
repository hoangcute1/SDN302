import { useState, useEffect } from "react";
import api from "../api";
import "./Admin.css";

interface Member {
  _id: string;
  email: string;
  name: string;
  YOB: number;
  gender: boolean;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get("/members");
        setMembers(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch members");
      }
    };
    fetchMembers();
  }, []);

  return (
    <div className="admin-page">
      <h1>Registered Members</h1>
      {error && <div className="admin-error">{error}</div>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>YOB</th>
            <th>Gender</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr key={m._id}>
              <td>{i + 1}</td>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.YOB}</td>
              <td>{m.gender ? "Male" : "Female"}</td>
              <td>{m.isAdmin ? <span className="badge-yes">Admin</span> : <span className="badge-no">Member</span>}</td>
              <td>{new Date(m.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
