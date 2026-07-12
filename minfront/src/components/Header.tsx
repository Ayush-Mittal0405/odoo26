"use client";

import React, { useState } from "react";
import { useEcoSphere } from "@/context/EcoSphereContext";
import { Bell, Trophy, Zap, CheckSquare } from "lucide-react";
import { MODULE_ACCENTS } from "./UIComponents";
import { motion, AnimatePresence } from "framer-motion";

export const Header: React.FC = () => {
  const {
    currentTab,
    currentSubTab,
    currentEmployee,
    notifications,
    setNotifications,
    overallScore
  } = useEcoSphere();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Module accent for current tab
  let moduleKey: keyof typeof MODULE_ACCENTS = "None";
  if (currentTab === "Environmental") moduleKey = "E";
  else if (currentTab === "Social") moduleKey = "S";
  else if (currentTab === "Governance") moduleKey = "G";
  else if (currentTab === "Gamification") moduleKey = "Gamification";
  else if (currentTab === "Settings" || currentTab === "Reports") moduleKey = "System";

  const accent = MODULE_ACCENTS[moduleKey];

  return (
    <header
      className="h-16 px-6 flex items-center justify-between sticky top-0 z-30 w-full"
      style={{
        backgroundColor: "rgba(32, 96, 32, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        <span className="font-display text-sm text-white/70">EcoSphere</span>
        <span className="text-white/30 text-xs font-mono">/</span>
        <span className="font-display text-sm font-semibold text-white">
          {currentTab}
        </span>
        {currentSubTab && (
          <>
            <span className="text-white/30 text-xs font-mono">/</span>
            <span className="font-sans text-xs text-white/90 font-medium">
              {currentSubTab}
            </span>
          </>
        )}
      </div>

      {/* Right widgets — Glassmorphic Icon Bar from 21st.dev */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border shadow-lg relative"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderColor: "rgba(255, 255, 255, 0.18)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Overall ESG Score Compact Badge */}
        <motion.div
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.12)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-colors"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <span className="font-mono text-[9px] text-white/70 uppercase tracking-wider">Overall ESG</span>
          <span className="font-mono text-xs font-bold text-white">{overallScore}</span>
        </motion.div>

        {/* Employee XP Meter */}
        <motion.div
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.12)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-colors"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <Zap size={11} strokeWidth={2} style={{ color: "#FFFFFF" }} />
          <div className="flex flex-col text-left">
            <span className="font-mono text-[10px] font-bold leading-none text-white">
              {currentEmployee.xp.toLocaleString()} <span className="text-[8px] text-white/70 font-normal">XP</span>
            </span>
            <span className="font-sans text-[7px] text-white/60 leading-none mt-0.5">
              Level {Math.floor(currentEmployee.xp / 1000) + 1}
            </span>
          </div>
        </motion.div>

        {/* Employee Points Balance */}
        <motion.div
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.12)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-colors"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <Trophy size={11} strokeWidth={2} style={{ color: "#FFFFFF" }} />
          <div className="flex flex-col text-left">
            <span className="font-mono text-[10px] font-bold leading-none text-white">
              {currentEmployee.points.toLocaleString()} <span className="text-[8px] text-white/70 font-normal">pts</span>
            </span>
            <span className="font-sans text-[7px] text-white/60 leading-none mt-0.5">Alex Rivera</span>
          </div>
        </motion.div>

        {/* Notification Bell */}
        <div className="relative flex items-center">
          <motion.button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.12)" }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="p-1.5 rounded-full text-white/80 hover:text-white transition-all relative border flex items-center justify-center"
            style={{
              borderColor: "rgba(255, 255, 255, 0.15)",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <Bell size={13} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 font-mono text-[8px] font-bold text-white ring-2 ring-[#206020]">
                {unreadCount}
              </span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifDropdown(false)}
              />
              <div
                className="absolute right-0 mt-2.5 w-80 leaf-card shadow-xl z-50 overflow-hidden py-1"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E3E8DE",
                  boxShadow: "0 8px 24px rgba(46,125,50,0.1), 0 2px 8px rgba(27,42,31,0.06)",
                }}
              >
                <div className="px-4 py-2.5 flex items-center justify-between"
                  style={{ borderBottom: "1px solid #E3E8DE" }}>
                  <h4 className="font-display text-sm font-semibold text-text-primary">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-mono flex items-center gap-1 hover:underline"
                      style={{ color: "#2E7D32" }}
                    >
                      <CheckSquare className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y"
                  style={{ borderColor: "#E3E8DE" }}>
                  {notifications.length > 0 ? (
                    notifications.map((n) => {
                      const categoryColors: Record<string, string> = {
                        E: "#2E7D32",
                        S: "#3E8E7E",
                        G: "#6A1B9A",
                        Gamification: "#C98A2C",
                      };
                      const catColor = categoryColors[n.category] || "#6B7A6E";

                      return (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-3 text-left transition-colors cursor-pointer flex gap-2.5 items-start ${
                            !n.read ? "bg-bg-tint/60" : ""
                          } hover:bg-bg-tint`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className="text-[10px] font-mono uppercase tracking-wider font-semibold"
                                style={{ color: catColor }}
                              >
                                {n.category}
                              </span>
                              <span className="text-[9px] font-mono text-text-muted">{n.timestamp}</span>
                            </div>
                            <h5 className="font-sans text-xs text-text-primary mt-0.5 font-medium">{n.title}</h5>
                            <p className="font-sans text-[11px] text-text-muted mt-0.5 leading-normal">
                              {n.description}
                            </p>
                          </div>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: "#C98A2C" }} />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center text-text-muted text-xs italic font-sans">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
