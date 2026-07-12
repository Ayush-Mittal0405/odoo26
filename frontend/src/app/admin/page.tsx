"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface DashboardData {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalAlbums: number;
  totalMessages: number;
  unreadMessages: number;
  recentEvents: { id: number; title: string; date: string; status: string; createdAt: string }[];
  recentMessages: { id: number; name: string; email: string; subject: string; createdAt: string }[];
  statistics: { treesPlanted: number; cleanlinessDrives: number; volunteers: number; studentsEducated: number; eventsConducted: number };
}

interface ActivityItem {
  id: string;
  type: "event" | "message";
  text: string;
  date: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Failed to load dashboard data.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Events",
      value: data.totalEvents,
      subtitle: `${data.upcomingEvents} upcoming`,
      color: "bg-primary/10 text-primary",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      label: "Gallery Albums",
      value: data.totalAlbums,
      subtitle: "",
      color: "bg-secondary/10 text-secondary",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      ),
    },
    {
      label: "Volunteers",
      value: data.statistics?.volunteers ?? 0,
      subtitle: "",
      color: "bg-accent/10 text-accent-dark",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: "Messages",
      value: data.totalMessages,
      subtitle: `${data.unreadMessages} unread`,
      color: "bg-error/10 text-error",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
    },
  ];

  // Combine recent events and messages into activity feed
  const activity: ActivityItem[] = [
    ...(data.recentEvents || []).map((e) => ({
      id: `event-${e.id}`,
      type: "event" as const,
      text: `Event: ${e.title}`,
      date: new Date(e.createdAt || e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      createdAt: e.createdAt || e.date,
    })),
    ...(data.recentMessages || []).map((m) => ({
      id: `msg-${m.id}`,
      type: "message" as const,
      text: `Message from ${m.name}: ${m.subject}`,
      date: new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      createdAt: m.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Welcome back! Here&apos;s what&apos;s happening with your foundation.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-xl border border-border p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-text">{stat.value}</p>
                {stat.subtitle && (
                  <p className="mt-1 text-xs text-text-light">{stat.subtitle}</p>
                )}
              </div>
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-white rounded-xl border border-border"
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {activity.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-text-secondary">
              No recent activity
            </div>
          ) : (
            activity.slice(0, 10).map((item) => (
              <div key={item.id} className="px-5 py-4 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${item.type === "event" ? "bg-primary" : "bg-accent"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{item.text}</p>
                </div>
                <span className="text-xs text-text-light whitespace-nowrap">
                  {item.date}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
