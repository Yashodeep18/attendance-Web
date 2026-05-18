export const timeStringToMinutes = (timeString = "00:00") => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToHHMM = (totalMinutes) => {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const getPartsInTimeZone = (date, timezone) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map = {};

  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour === "24" ? "00" : map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
};

export const getLocalDateString = (date = new Date(), timezone = "Asia/Kolkata") => {
  const parts = getPartsInTimeZone(date, timezone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
};

export const getLocalMinutesOfDay = (date = new Date(), timezone = "Asia/Kolkata") => {
  const parts = getPartsInTimeZone(date, timezone);
  return parts.hour * 60 + parts.minute;
};

const getTimeZoneOffsetMs = (date, timezone) => {
  const parts = getPartsInTimeZone(date, timezone);
  const localAsUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return localAsUTC - date.getTime();
};

export const zonedDateTimeToUtcDate = (
  dateString,
  timeString,
  timezone = "Asia/Kolkata"
) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = timeString.split(":").map(Number);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMs = getTimeZoneOffsetMs(utcGuess, timezone);

  return new Date(utcGuess.getTime() - offsetMs);
};

export const formatDateTimeForUser = (date, timezone = "Asia/Kolkata") => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};
