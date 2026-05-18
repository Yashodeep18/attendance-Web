import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    settingsKey: {
      type: String,
      default: "global",
      unique: true,
      immutable: true,
    },
    clockInStartTime: { type: String, default: "08:00" },
    clockInEndTime: { type: String, default: "09:00" },
    lateAfterTime: { type: String, default: "09:00" },
    lunchStartTime: { type: String, default: "12:00" },
    lunchEndTime: { type: String, default: "13:00" },
    requiredWorkMinutes: { type: Number, default: 480 },
    officeLatitude: { type: Number, default: 18.586486 },
    officeLongitude: { type: Number, default: 73.738709 },
    allowedRadiusMeters: { type: Number, default: 30 },
    timezone: { type: String, default: "Asia/Kolkata" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
