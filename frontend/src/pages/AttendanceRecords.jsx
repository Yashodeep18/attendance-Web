import { useEffect, useState } from "react";
import api from "../api/axios";
import AttendanceTable from "../components/AttendanceTable";

const AttendanceRecords = () => {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ date: "", userId: "", late: "", minPercentage: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    const { data } = await api.get("/admin/users");
    setUsers(data.users);
  };

  const loadRecords = async (selectedFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (selectedFilters.date) params.date = selectedFilters.date;
      if (selectedFilters.userId) params.userId = selectedFilters.userId;
      if (selectedFilters.late) params.late = selectedFilters.late;
      if (selectedFilters.minPercentage) params.minPercentage = selectedFilters.minPercentage;

      const { data } = await api.get("/admin/attendance", { params });
      setRecords(data.records);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadRecords();
  }, []);

  const handleChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    loadRecords();
  };

  const clearFilters = () => {
    const emptyFilters = { date: "", userId: "", late: "", minPercentage: "" };
    setFilters(emptyFilters);
    loadRecords(emptyFilters);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">Attendance Records</h1>
      <p className="mt-1 text-slate-500">Filter attendance by date, user, late status, and percentage.</p>

      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="card mt-6 grid gap-4 md:grid-cols-5">
        <div>
          <label className="label">Date</label>
          <input type="date" name="date" value={filters.date} onChange={handleChange} className="input" />
        </div>
        <div>
          <label className="label">User</label>
          <select name="userId" value={filters.userId} onChange={handleChange} className="input">
            <option value="">All users</option>
            {users.map((item) => (
              <option key={item._id} value={item._id}>{item.name} - {item.email}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Late Users</label>
          <select name="late" value={filters.late} onChange={handleChange} className="input">
            <option value="">All</option>
            <option value="true">Late only</option>
          </select>
        </div>
        <div>
          <label className="label">Min %</label>
          <input type="number" name="minPercentage" value={filters.minPercentage} onChange={handleChange} className="input" placeholder="e.g. 80" />
        </div>
        <div className="flex items-end gap-2">
          <button className="btn-primary" disabled={loading}>{loading ? "Loading..." : "Filter"}</button>
          <button type="button" className="btn-secondary" onClick={clearFilters}>Clear</button>
        </div>
      </form>

      <section className="mt-6">
        <AttendanceTable records={records} />
      </section>
    </main>
  );
};

export default AttendanceRecords;
