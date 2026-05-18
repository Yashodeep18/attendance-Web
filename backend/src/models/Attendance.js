import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    distanceFromOfficeMeters: { type: Number, required: true },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
      // Format: YYYY-MM-DD according to Asia/Kolkata by default.
    },
    clockInTime: { type: Date, required: true },
    clockOutTime: { type: Date },
    clockInLocation: { type: locationSchema, required: true },
    clockOutLocation: { type: locationSchema },
    status: {
      type: String,
      enum: ["On Time", "Late"],
      required: true,
    },
    workedMinutes: { type: Number, default: 0 },
    lunchBreakDeductedMinutes: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 0 },
    isClockedIn: { type: Boolean, default: true },
    isClockedOut: { type: Boolean, default: false },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
