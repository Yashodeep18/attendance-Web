import { useEffect, useState } from "react";
import api from "../api/axios";
import SettingsForm from "../components/SettingsForm";

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load settings.");
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.put("/settings", formData);
      setSettings(data.settings);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-black">Attendance Settings</h1>
      <p className="mt-1 text-slate-500">
        Default office coordinates are 18.586486, 73.738709 with 30 meter allowed radius.
      </p>

      {message && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-700">{message}</p>}
      {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}

      <section className="mt-6">
        {settings ? <SettingsForm settings={settings} onSubmit={handleSubmit} saving={saving} /> : <p>Loading settings...</p>}
      </section>
    </main>
  );
};

export default Settings;
