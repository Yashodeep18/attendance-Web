export const formatMinutesToHHMM = (minutes = 0) => {
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const formatSecondsToHHMMSS = (seconds = 0) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const formatDateTime = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const timeStringToMinutes = (timeString = "00:00") => {
  const [h, m] = timeString.split(":").map(Number);
  return h * 60 + m;
};

const localDateString = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const map = {};
  parts.forEach((part) => {
    if (part.type !== "literal") map[part.type] = part.value;
  });

  return `${map.year}-${map.month}-${map.day}`;
};

const getLunchDate = (dateString, timeString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = timeString.split(":").map(Number);
  // Asia/Kolkata is UTC+05:30. This app default timezone is Asia/Kolkata.
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30, 0));
};

export const calculateWorkedSecondsExcludingLunch = ({
  clockInTime,
  endTime = new Date(),
  lunchStartTime = "12:00",
  lunchEndTime = "13:00",
}) => {
  if (!clockInTime) return 0;

  const start = new Date(clockInTime);
  const end = new Date(endTime);

  if (end <= start) return 0;

  const totalSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  const dateString = localDateString(start);
  const lunchStart = getLunchDate(dateString, lunchStartTime);
  const lunchEnd = getLunchDate(dateString, lunchEndTime);

  const overlapStart = Math.max(start.getTime(), lunchStart.getTime());
  const overlapEnd = Math.min(end.getTime(), lunchEnd.getTime());
  const lunchDeductedSeconds =
    overlapEnd > overlapStart ? Math.floor((overlapEnd - overlapStart) / 1000) : 0;

  return Math.max(0, totalSeconds - lunchDeductedSeconds);
};
