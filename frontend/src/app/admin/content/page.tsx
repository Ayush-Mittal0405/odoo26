"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ContentData {
  about: string;
  mission: string;
  vision: string;
  goals: string;
}

const defaultContent: ContentData = {
  about: "",
  mission: "",
  vision: "",
  goals: "",
};

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentData>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setContent(resData.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
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

  const sections = [
    {
      key: "about" as const,
      label: "About Us",
      description: "Main description of the foundation displayed on the homepage",
      rows: 5,
    },
    {
      key: "mission" as const,
      label: "Our Mission",
      description: "The mission statement of the foundation",
      rows: 4,
    },
    {
      key: "vision" as const,
      label: "Our Vision",
      description: "The long-term vision for the foundation",
      rows: 4,
    },
    {
      key: "goals" as const,
      label: "Our Goals",
      description: "Key goals and targets (one per line, numbered)",
      rows: 6,
    },
  ];

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
          <h1 className="text-2xl font-bold text-text">Content Management</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Edit website content: About, Mission, Vision, and Goals
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
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Content Editors */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-xl border border-border p-5 sm:p-6"
          >
            <div className="mb-3">
              <h3 className="text-base font-semibold text-text">
                {section.label}
              </h3>
              <p className="text-xs text-text-light mt-0.5">
                {section.description}
              </p>
            </div>
            <textarea
              rows={section.rows}
              value={content[section.key]}
              onChange={(e) =>
                setContent({ ...content, [section.key]: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
