import { formatDateTime, formatMinutesToHHMM } from "../utils/formatTime";
import StatusBadge from "./StatusBadge";

const AttendanceTable = ({ records }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Clock In</th>
            <th className="px-4 py-3">Clock Out</th>
            <th className="px-4 py-3">Worked</th>
            <th className="px-4 py-3">Lunch Deducted</th>
            <th className="px-4 py-3">%</th>
            <th className="px-4 py-3">Distance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((record) => (
            <tr key={record._id} className="align-top">
              <td className="px-4 py-3 font-semibold">{record.date}</td>
              <td className="px-4 py-3">
                <p className="font-semibold">{record.userId?.name || "Deleted User"}</p>
                <p className="text-xs text-slate-500">{record.userId?.email || "-"}</p>
              </td>
              <td className="px-4 py-3">
                <StatusBadge label={record.status} />
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDateTime(record.clockInTime)}</td>
              <td className="px-4 py-3 text-slate-600">{formatDateTime(record.clockOutTime)}</td>
              <td className="px-4 py-3 font-semibold">{formatMinutesToHHMM(record.workedMinutes)}</td>
              <td className="px-4 py-3">{record.lunchBreakDeductedMinutes || 0} min</td>
              <td className="px-4 py-3 font-semibold">{record.attendancePercentage || 0}%</td>
              <td className="px-4 py-3 text-xs text-slate-600">
                In: {record.clockInLocation?.distanceFromOfficeMeters ?? "-"} m
                <br />
                Out: {record.clockOutLocation?.distanceFromOfficeMeters ?? "-"} m
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {records.length === 0 && <p className="p-6 text-center text-slate-500">No records found.</p>}
    </div>
  );
};

export default AttendanceTable;
