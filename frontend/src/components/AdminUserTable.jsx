import StatusBadge from "./StatusBadge";

const AdminUserTable = ({ users, currentUserId, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((item) => (
            <tr key={item._id} className="align-top">
              <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
              <td className="px-4 py-3 text-slate-600">{item.email}</td>
              <td className="px-4 py-3">
                <StatusBadge label={item.role === "admin" ? "Admin" : "User"} />
              </td>
              <td className="px-4 py-3 text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <button
                  disabled={item._id === currentUserId}
                  onClick={() => onDelete(item)}
                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserTable;
