import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ users });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (String(req.user._id) === String(id)) {
    return res.status(400).json({
      message: "Self delete is blocked for safety. Ask another admin to delete this admin account if required.",
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  await User.findByIdAndDelete(id);

  res.json({ message: "User deleted successfully. Existing attendance records are kept for audit history." });
};

export const getAllAttendance = async (req, res) => {
  const { date, userId, late, minPercentage, maxPercentage } = req.query;

  const filter = {};

  if (date) filter.date = date;
  if (userId) filter.userId = userId;
  if (late === "true") filter.status = "Late";

  if (minPercentage || maxPercentage) {
    filter.attendancePercentage = {};
    if (minPercentage) filter.attendancePercentage.$gte = Number(minPercentage);
    if (maxPercentage) filter.attendancePercentage.$lte = Number(maxPercentage);
  }

  const records = await Attendance.find(filter)
    .populate("userId", "name email role")
    .sort({ date: -1, createdAt: -1 });

  res.json({ records });
};
