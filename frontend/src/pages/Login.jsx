import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(form.email, form.password);
      navigate(loggedInUser.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-md items-center px-4 py-8">
      <form onSubmit={handleSubmit} className="card w-full">
        <h1 className="text-2xl font-black">Login</h1>
        <p className="mt-1 text-sm text-slate-500">Login using your registered email and password.</p>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="mt-5">
          <label className="label">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="input" required />
        </div>

        <div className="mt-4">
          <label className="label">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="input" required />
        </div>

        <button disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          New employee? <Link className="font-semibold text-slate-900 underline" to="/register">Create account</Link>
        </p>
      </form>
    </main>
  );
};

export default Login;
