"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface StatsData {
  treesPlanted: number;
  cleanlinessDrives: number;
  volunteers: number;
  studentsEducated: number;
  eventsConducted: number;
}

interface StatSetting {
  id: keyof StatsData;
  label: string;
  icon: string;
}

const statSettings: StatSetting[] = [
  { id: "treesPlanted", label: "Trees Planted", icon: "🌳" },
  { id: "cleanlinessDrives", label: "Cleanliness Drives", icon: "🧹" },
  { id: "volunteers", label: "Active Volunteers", icon: "🤝" },
  { id: "studentsEducated", label: "Students Educated", icon: "📚" },
  { id: "eventsConducted", label: "Events Conducted", icon: "📅" },
];

const defaultStats: StatsData = {
  treesPlanted: 5000,
  cleanlinessDrives: 120,
  volunteers: 500,
  studentsEducated: 1200,
  eventsConducted: 200,
};

export default function AdminSettingsPage() {
  const [stats, setStats] = useState<StatsData>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/statistics")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setStats(resData.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStat = (id: keyof StatsData, value: number) => {
    setStats((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/statistics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });
      const resData = await res.json();
      if (resData.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // Show error
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Settings</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage homepage statistics counters and site configuration
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : saved ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Saved!
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Statistics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl border border-border"
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            Homepage Statistics
          </h2>
          <p className="text-xs text-text-light mt-0.5">
            These numbers are displayed in the impact counter section on the homepage
          </p>
        </div>

        <div className="p-5 space-y-4">
          {statSettings.map((setting, index) => (
            <motion.div
              key={setting.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/20 transition-colors"
            >
              <span className="text-2xl">{setting.icon}</span>
              <div className="flex-1">
                <label className="text-sm font-medium text-text">
                  {setting.label}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateStat(setting.id, Math.max(0, stats[setting.id] - 10))}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:bg-gray-50 transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={stats[setting.id]}
                  onChange={(e) => updateStat(setting.id, parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-2 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  onClick={() => updateStat(setting.id, stats[setting.id] + 10)}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Additional Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-xl border border-border mt-6"
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            General Settings
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Organization Name
            </label>
            <input
              type="text"
              defaultValue="Pavitrarpan Foundation"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              defaultValue="Nurturing Nature, Empowering Communities"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                defaultValue="info@pavitrarpan.org"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                defaultValue="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Address
            </label>
            <input
              type="text"
              defaultValue="Pune, Maharashtra, India"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
