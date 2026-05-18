import {
  getLocalMinutesOfDay,
  timeStringToMinutes,
  zonedDateTimeToUtcDate,
} from "./timeUtils.js";

export const calculateLateStatus = (clockInDate, settings) => {
  const clockInMinutes = getLocalMinutesOfDay(clockInDate, settings.timezone);
  const lateAfterMinutes = timeStringToMinutes(settings.lateAfterTime);

  return clockInMinutes > lateAfterMinutes ? "Late" : "On Time";
};

export const calculateWorkedMinutesExcludingLunch = ({
  clockInTime,
  clockOutTime,
  date,
  settings,
}) => {
  const start = new Date(clockInTime);
  const end = new Date(clockOutTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return {
      workedMinutes: 0,
      lunchBreakDeductedMinutes: 0,
    };
  }

  const totalMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);

  const lunchStart = zonedDateTimeToUtcDate(
    date,
    settings.lunchStartTime,
    settings.timezone
  );
  const lunchEnd = zonedDateTimeToUtcDate(
    date,
    settings.lunchEndTime,
    settings.timezone
  );

  const overlapStart = Math.max(start.getTime(), lunchStart.getTime());
  const overlapEnd = Math.min(end.getTime(), lunchEnd.getTime());
  const lunchBreakDeductedMinutes =
    overlapEnd > overlapStart ? Math.floor((overlapEnd - overlapStart) / 60000) : 0;

  return {
    workedMinutes: Math.max(0, totalMinutes - lunchBreakDeductedMinutes),
    lunchBreakDeductedMinutes,
  };
};

export const calculateAttendancePercentage = (workedMinutes, requiredWorkMinutes = 480) => {
  if (!requiredWorkMinutes || requiredWorkMinutes <= 0) return 0;

  const percentage = (workedMinutes / requiredWorkMinutes) * 100;
  return Number(Math.min(100, percentage).toFixed(2));
};

export const calculateRemainingMinutes = (workedMinutes, requiredWorkMinutes = 480) => {
  return Math.max(0, requiredWorkMinutes - workedMinutes);
};

export const calculateExpectedCompletionTime = ({ clockInTime, date, settings }) => {
  let pointer = new Date(clockInTime);
  let minutesLeft = settings.requiredWorkMinutes;

  const lunchStart = zonedDateTimeToUtcDate(
    date,
    settings.lunchStartTime,
    settings.timezone
  );
  const lunchEnd = zonedDateTimeToUtcDate(
    date,
    settings.lunchEndTime,
    settings.timezone
  );

  while (minutesLeft > 0) {
    if (pointer >= lunchStart && pointer < lunchEnd) {
      pointer = new Date(lunchEnd);
      continue;
    }

    const nextBreak = pointer < lunchStart ? lunchStart : null;
    const availableMinutesBeforeBreak = nextBreak
      ? Math.max(0, Math.floor((nextBreak.getTime() - pointer.getTime()) / 60000))
      : minutesLeft;

    const workChunk = Math.min(minutesLeft, availableMinutesBeforeBreak || minutesLeft);
    pointer = new Date(pointer.getTime() + workChunk * 60000);
    minutesLeft -= workChunk;

    if (nextBreak && pointer.getTime() === nextBreak.getTime()) {
      pointer = new Date(lunchEnd);
    }
  }

  return pointer;
};

export const buildAttendanceSummary = ({ attendance, settings, now = new Date() }) => {
  if (!attendance) return null;

  const endTime = attendance.isClockedOut ? attendance.clockOutTime : now;
  const { workedMinutes, lunchBreakDeductedMinutes } =
    calculateWorkedMinutesExcludingLunch({
      clockInTime: attendance.clockInTime,
      clockOutTime: endTime,
      date: attendance.date,
      settings,
    });

  const attendancePercentage = calculateAttendancePercentage(
    workedMinutes,
    settings.requiredWorkMinutes
  );

  const remainingRequiredMinutes = calculateRemainingMinutes(
    workedMinutes,
    settings.requiredWorkMinutes
  );

  const expectedCompletionTime = calculateExpectedCompletionTime({
    clockInTime: attendance.clockInTime,
    date: attendance.date,
    settings,
  });

  return {
    ...attendance.toObject(),
    liveWorkedMinutes: workedMinutes,
    liveLunchBreakDeductedMinutes: lunchBreakDeductedMinutes,
    liveAttendancePercentage: attendancePercentage,
    remainingRequiredMinutes,
    expectedCompletionTime,
  };
};
