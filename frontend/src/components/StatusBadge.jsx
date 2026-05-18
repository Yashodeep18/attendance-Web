const styles = {
  "On Time": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Late: "bg-amber-100 text-amber-800 border-amber-200",
  "Clocked In": "bg-blue-100 text-blue-700 border-blue-200",
  "Clocked Out": "bg-slate-100 text-slate-700 border-slate-200",
  "Outside Location": "bg-red-100 text-red-700 border-red-200",
  Admin: "bg-purple-100 text-purple-700 border-purple-200",
  User: "bg-slate-100 text-slate-700 border-slate-200",
};

const StatusBadge = ({ label }) => {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[label] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
