import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminUserTable from "../components/AdminUserTable";
import { useAuth } from "../context/AuthContext";

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (selectedUser) => {
    if (selectedUser._id === user._id) {
      alert("You cannot delete yourself from this page.");
      return;
    }

    const confirmed = window.confirm(`Delete user ${selectedUser.name}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const { data } = await api.delete(`/admin/users/${selectedUser._id}`);
      setMessage(data.message);
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">Users Management</h1>
      <p className="mt-1 text-slate-500">All normal users and admins are stored in the same User collection.</p>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-700">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <section className="mt-6">
        <AdminUserTable users={users} currentUserId={user._id} onDelete={handleDelete} />
      </section>
    </main>
  );
};

export default AdminUsers;
