const AttendanceCard = ({ title, value, helper }) => {
  return (
    <div className="card">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {helper && <p className="mt-1 text-sm text-slate-500">{helper}</p>}
    </div>
  );
};

export default AttendanceCard;
