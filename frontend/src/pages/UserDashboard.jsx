import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import AttendanceCard from "../components/AttendanceCard";
import LocationPermissionMessage from "../components/LocationPermissionMessage";
import StatusBadge from "../components/StatusBadge";
import Timer from "../components/Timer";
import { getCurrentLocation } from "../utils/geolocation";
import { formatDateTime, formatMinutesToHHMM } from "../utils/formatTime";

const UserDashboard = () => {
  const [attendance, setAttendance] = useState(null);
  const [settings, setSettings] = useState(null);
  const [today, setToday] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(0);

  const loadToday = async () => {
    try {
      const { data } = await api.get("/attendance/today");
      setAttendance(data.attendance);
      setSettings(data.settings);
      setToday(data.today);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
  }, []);

  const liveWorkedMinutes = useMemo(() => {
    if (!attendance) return 0;
    if (attendance.isClockedOut) return attendance.workedMinutes || 0;
    return Math.floor(liveSeconds / 60);
  }, [attendance, liveSeconds]);

  const livePercentage = useMemo(() => {
    if (!settings) return 0;
    return Math.min(100, ((liveWorkedMinutes / settings.requiredWorkMinutes) * 100).toFixed(2));
  }, [liveWorkedMinutes, settings]);

  const remainingMinutes = useMemo(() => {
    if (!settings) return 0;
    return Math.max(0, settings.requiredWorkMinutes - liveWorkedMinutes);
  }, [settings, liveWorkedMinutes]);

  const performAttendanceAction = async (type) => {
    setError("");
    setMessage("");
    setLocationMessage("Getting your current location...");
    setActionLoading(true);

    try {
      const location = await getCurrentLocation();
      setLocationMessage(`Location captured. Accuracy: approximately ${Math.round(location.accuracy)} meters.`);

      const endpoint = type === "clock-in" ? "/attendance/clock-in" : "/attendance/clock-out";
      const { data } = await api.post(endpoint, {
        latitude: location.latitude,
        longitude: location.longitude,
      });

        
      setMessage(data.message);
      setAttendance(data.attendance);
      setSettings(data.settings);
      await loadToday();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Attendance action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <main className="p-6 text-center font-semibold">Loading dashboard...</main>;
  }

  const canClockIn = !attendance;
  const canClockOut = attendance?.isClockedIn && !attendance?.isClockedOut;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">User Dashboard</h1>
          <p className="mt-1 text-slate-500">Today: {today || "-"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {attendance?.status && <StatusBadge label={attendance.status} />}
          {attendance?.isClockedIn && <StatusBadge label="Clocked In" />}
          {attendance?.isClockedOut && <StatusBadge label="Clocked Out" />}
        </div>
      </div>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-700">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <div className="mt-5">
        <LocationPermissionMessage message={locationMessage} />
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AttendanceCard
          title="Live Working Timer"
          value={
            attendance ? (
              <Timer
                clockInTime={attendance.clockInTime}
                clockOutTime={attendance.clockOutTime}
                lunchStartTime={settings?.lunchStartTime}
                lunchEndTime={settings?.lunchEndTime}
                onTick={setLiveSeconds}
              />
            ) : (
              "00:00:00"
            )
          }
          helper="Lunch break is excluded."
        />
        <AttendanceCard title="Attendance %" value={`${livePercentage || 0}%`} helper="Required work: 8 hours" />
        <AttendanceCard title="Worked Time" value={formatMinutesToHHMM(liveWorkedMinutes)} helper="HH:MM excluding lunch" />
        <AttendanceCard title="Remaining Time" value={formatMinutesToHHMM(remainingMinutes)} helper="Required work remaining" />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="text-xl font-bold">Attendance Action</h2>
          <p className="mt-1 text-sm text-slate-500">
            Office location validation is done on backend using 30 meter radius.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              disabled={!canClockIn || actionLoading}
              onClick={() => performAttendanceAction("clock-in")}
              className="btn-primary"
            >
              {actionLoading ? "Please wait..." : "Clock In"}
            </button>
            <button
              disabled={!canClockOut || actionLoading}
              onClick={() => performAttendanceAction("clock-out")}
              className="btn-secondary"
            >
              {actionLoading ? "Please wait..." : "Clock Out"}
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold">Today Details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Clock In</dt>
              <dd className="font-semibold text-right">{formatDateTime(attendance?.clockInTime)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Clock Out</dt>
              <dd className="font-semibold text-right">{formatDateTime(attendance?.clockOutTime)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Late Status</dt>
              <dd className="font-semibold">{attendance?.status || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Expected Completion</dt>
              <dd className="font-semibold text-right">{formatDateTime(attendance?.expectedCompletionTime)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
};

export default UserDashboard;
