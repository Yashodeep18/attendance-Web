import Attendance from "../models/Attendance.js";
import { getOrCreateSettings } from "./settingsController.js";
import { validateOfficeLocation } from "../utils/locationUtils.js";
import { getLocalDateString, minutesToHHMM } from "../utils/timeUtils.js";
import {
  buildAttendanceSummary,
  calculateAttendancePercentage,
  calculateLateStatus,
  calculateRemainingMinutes,
  calculateWorkedMinutesExcludingLunch,
} from "../utils/attendanceCalculator.js";

export const clockIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const settings = await getOrCreateSettings();

    const locationValidation = validateOfficeLocation({ latitude, longitude, settings });

    if (!locationValidation.isValid) {
      return res.status(400).json({
        message: locationValidation.message,
        distanceFromOfficeMeters: locationValidation.distanceFromOfficeMeters,
      });
    }

    const now = new Date();
    const today = getLocalDateString(now, settings.timezone);

    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    if (existingAttendance) {
      return res.status(409).json({ message: "You have already clocked in today." });
    }

    const status = calculateLateStatus(now, settings);

    const attendance = await Attendance.create({
      userId: req.user._id,
      date: today,
      clockInTime: now,
      clockInLocation: {
        latitude: locationValidation.latitude,
        longitude: locationValidation.longitude,
        distanceFromOfficeMeters: locationValidation.distanceFromOfficeMeters,
      },
      status,
      isClockedIn: true,
      isClockedOut: false,
    });

    return res.status(201).json({
      message: status === "Late" ? "Clock-in successful. You are marked Late." : "Clock-in successful. You are On Time.",
      attendance: buildAttendanceSummary({ attendance, settings, now }),
      settings,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate clock-in is not allowed for the same date." });
    }

    return res.status(500).json({ message: error.message || "Clock-in failed." });
  }
};

export const clockOut = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const settings = await getOrCreateSettings();

    const locationValidation = validateOfficeLocation({ latitude, longitude, settings });

    if (!locationValidation.isValid) {
      return res.status(400).json({
        message: locationValidation.message,
        distanceFromOfficeMeters: locationValidation.distanceFromOfficeMeters,
      });
    }

    const now = new Date();
    const today = getLocalDateString(now, settings.timezone);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({ message: "You must clock in before clocking out." });
    }

    if (attendance.isClockedOut) {
      return res.status(409).json({ message: "You have already clocked out today." });
    }

    const { workedMinutes, lunchBreakDeductedMinutes } =
      calculateWorkedMinutesExcludingLunch({
        clockInTime: attendance.clockInTime,
        clockOutTime: now,
        date: attendance.date,
        settings,
      });

    attendance.clockOutTime = now;
    attendance.clockOutLocation = {
      latitude: locationValidation.latitude,
      longitude: locationValidation.longitude,
      distanceFromOfficeMeters: locationValidation.distanceFromOfficeMeters,
    };
    attendance.workedMinutes = workedMinutes;
    attendance.lunchBreakDeductedMinutes = lunchBreakDeductedMinutes;
    attendance.attendancePercentage = calculateAttendancePercentage(
      workedMinutes,
      settings.requiredWorkMinutes
    );
    attendance.isClockedOut = true;
    attendance.isClockedIn = false;

    await attendance.save();

    return res.json({
      message: "Clock-out successful.",
      attendance: buildAttendanceSummary({ attendance, settings, now }),
      workedTimeHHMM: minutesToHHMM(workedMinutes),
      remainingTimeHHMM: minutesToHHMM(
        calculateRemainingMinutes(workedMinutes, settings.requiredWorkMinutes)
      ),
      settings,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Clock-out failed." });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const today = getLocalDateString(new Date(), settings.timezone);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    }).populate("userId", "name email role");

    if (!attendance) {
      return res.json({
        attendance: null,
        settings,
        today,
        message: "No attendance record found for today.",
      });
    }

    return res.json({
      attendance: buildAttendanceSummary({ attendance, settings }),
      settings,
      today,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load today's attendance." });
  }
};

export const getMyAttendanceRecords = async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(100);

    return res.json({ records });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to load attendance records." });
  }
};
