import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navClass = ({ isActive }) =>
  `rounded-xl px-3 py-2 text-sm font-semibold ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="text-lg font-black text-slate-900">
          Office Attendance
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {user?.role === "user" && (
            <NavLink to="/dashboard" className={navClass}>
              User Dashboard
            </NavLink>
          )}

          {user?.role === "admin" && (
            <>
              <NavLink to="/admin" className={navClass} end>
                Admin
              </NavLink>
              <NavLink to="/admin/users" className={navClass}>
                Users
              </NavLink>
              <NavLink to="/admin/attendance" className={navClass}>
                Attendance
              </NavLink>
              <NavLink to="/admin/settings" className={navClass}>
                Settings
              </NavLink>
            </>
          )}

          {user ? (
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navClass}>
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
