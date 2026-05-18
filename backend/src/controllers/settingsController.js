import Settings from "../models/Settings.js";

const defaultSettings = {
  settingsKey: "global",
  clockInStartTime: "08:00",
  clockInEndTime: "09:00",
  lateAfterTime: "09:00",
  lunchStartTime: "12:00",
  lunchEndTime: "13:00",
  requiredWorkMinutes: 480,
  officeLatitude: 18.586486,
  officeLongitude: 73.738709,
  allowedRadiusMeters: 30,
  timezone: "Asia/Kolkata",
};

export const getOrCreateSettings = async () => {
  let settings = await Settings.findOne({ settingsKey: "global" });

  if (!settings) {
    settings = await Settings.create(defaultSettings);
  }

  return settings;
};

export const getSettings = async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
};

export const updateSettings = async (req, res) => {
  const allowedFields = [
    "clockInStartTime",
    "clockInEndTime",
    "lateAfterTime",
    "lunchStartTime",
    "lunchEndTime",
    "requiredWorkMinutes",
    "officeLatitude",
    "officeLongitude",
    "allowedRadiusMeters",
    "timezone",
  ];

  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  updateData.updatedBy = req.user._id;

  const settings = await Settings.findOneAndUpdate(
    { settingsKey: "global" },
    updateData,
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ message: "Settings updated successfully.", settings });
};
