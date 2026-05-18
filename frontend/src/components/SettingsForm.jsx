import { useEffect, useState } from "react";

const fields = [
  ["clockInStartTime", "Clock-in Start Time", "time"],
  ["clockInEndTime", "Clock-in End Time", "time"],
  ["lateAfterTime", "Late After Time", "time"],
  ["lunchStartTime", "Lunch Start Time", "time"],
  ["lunchEndTime", "Lunch End Time", "time"],
  ["requiredWorkMinutes", "Required Working Minutes", "number"],
  ["officeLatitude", "Office Latitude", "number"],
  ["officeLongitude", "Office Longitude", "number"],
  ["allowedRadiusMeters", "Allowed Radius Meters", "number"],
  ["timezone", "Timezone", "text"],
];

const SettingsForm = ({ settings, onSubmit, saving }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm(settings || {});
  }, [settings]);

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="card grid gap-4 sm:grid-cols-2">
      {fields.map(([name, label, type]) => (
        <div key={name}>
          <label className="label" htmlFor={name}>
            {label}
          </label>
          <input
            id={name}
            name={name}
            type={type}
            step={type === "number" ? "any" : undefined}
            value={form[name] ?? ""}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
      ))}

      <div className="sm:col-span-2">
        <button disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;
