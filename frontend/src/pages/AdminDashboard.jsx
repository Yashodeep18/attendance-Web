import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import AttendanceCard from "../components/AttendanceCard";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, recordsRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/attendance"),
        ]);
        setUsers(usersRes.data.users);
        setRecords(recordsRes.data.records);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin dashboard.");
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const lateCount = records.filter((record) => record.status === "Late").length;
    const clockedOutCount = records.filter((record) => record.isClockedOut).length;
    return { lateCount, clockedOutCount };
  }, [records]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-black">Admin Dashboard</h1>
      <p className="mt-1 text-slate-500">Manage users, attendance records, and office attendance settings.</p>

      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AttendanceCard title="Total Users" value={users.length} />
        <AttendanceCard title="Attendance Records" value={records.length} />
        <AttendanceCard title="Late Records" value={stats.lateCount} />
        <AttendanceCard title="Clocked Out" value={stats.clockedOutCount} />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Link className="card hover:border-slate-400" to="/admin/users">
          <h2 className="text-xl font-bold">Users</h2>
          <p className="mt-2 text-sm text-slate-500">View all users and delete user accounts.</p>
        </Link>
        <Link className="card hover:border-slate-400" to="/admin/attendance">
          <h2 className="text-xl font-bold">Attendance Records</h2>
          <p className="mt-2 text-sm text-slate-500">Filter records by date, user, late status, and percentage.</p>
        </Link>
        <Link className="card hover:border-slate-400" to="/admin/settings">
          <h2 className="text-xl font-bold">Settings</h2>
          <p className="mt-2 text-sm text-slate-500">Manage timing, lunch break, office location, and radius.</p>
        </Link>
      </section>
    </main>
  );
};

export default AdminDashboard;
