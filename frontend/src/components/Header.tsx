"use client";

import React, { useState } from "react";
import { useEcoSphere } from "@/context/EcoSphereContext";
import { Bell, Trophy, Zap, Check, CheckSquare } from "lucide-react";
import { MODULE_ACCENTS } from "./UIComponents";

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

  // Determine current category accent
  let moduleKey: keyof typeof MODULE_ACCENTS = "None";
  if (currentTab === "Environmental") moduleKey = "E";
  else if (currentTab === "Social") moduleKey = "S";
  else if (currentTab === "Governance") moduleKey = "G";
  else if (currentTab === "Gamification") moduleKey = "Gamification";
  else if (currentTab === "Settings" || currentTab === "Reports") moduleKey = "System";

  const accent = MODULE_ACCENTS[moduleKey];

  return (
    <header className="bg-bg-surface border-b border-border-hairline h-16 px-6 flex items-center justify-between sticky top-0 z-30 w-full">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        <span className="font-serif text-sm text-text-muted capitalize">EcoSphere</span>
        <span className="text-border-hairline text-xs font-mono">/</span>
        <span className={`font-serif text-sm font-semibold ${accent.text}`}>
          {currentTab}
        </span>
        {currentSubTab && (
          <>
            <span className="text-border-hairline text-xs font-mono">/</span>
            <span className="font-sans text-xs text-text-primary font-medium">
              {currentSubTab}
            </span>
          </>
        )}
      </div>

      {/* Right widgets */}
      <div className="flex items-center gap-4 lg:gap-6 relative">
        {/* Overall ESG Score Compact Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-bg-base rounded-md border border-border-hairline">
          <span className="font-serif text-[10px] text-text-muted uppercase tracking-wider">Overall ESG</span>
          <span className="font-mono text-sm font-bold text-accent-e">{overallScore}</span>
        </div>

        {/* Employee XP Meter */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-accent-game/10 rounded border border-accent-game/20">
            <Zap className="h-4 w-4 text-accent-game" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold leading-none text-text-primary">
              {currentEmployee.xp.toLocaleString()} <span className="text-[10px] text-text-muted font-normal">XP</span>
            </span>
            <span className="font-serif text-[9px] text-text-muted mt-0.5 leading-none">Level {Math.floor(currentEmployee.xp / 1000) + 1}</span>
          </div>
        </div>

        {/* Employee Points Balance */}
        <div className="flex items-center gap-2 pr-2 border-r border-border-hairline/60">
          <div className="p-1 bg-accent-e/10 rounded border border-accent-e/20">
            <Trophy className="h-4 w-4 text-accent-e" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold leading-none text-text-primary">
              {currentEmployee.points.toLocaleString()} <span className="text-[10px] text-text-muted font-normal">pts</span>
            </span>
            <span className="font-serif text-[9px] text-text-muted mt-0.5 leading-none">Alex Rivera</span>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-1.5 border border-border-hairline rounded bg-bg-base text-text-muted hover:text-text-primary transition-all relative"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-status-critical text-text-primary font-mono text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifDropdown(false)}
              />
              <div className="absolute right-0 mt-2.5 w-80 bg-bg-raised border border-border-hairline leaf-card shadow-2xl z-50 overflow-hidden py-1">
                <div className="px-4 py-2 border-b border-border-hairline flex items-center justify-between">
                  <h4 className="font-serif text-sm font-semibold text-text-primary">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-mono text-accent-e flex items-center gap-1 hover:underline"
                    >
                      <CheckSquare className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-border-hairline/60">
                  {notifications.length > 0 ? (
                    notifications.map((n) => {
                      let color = "text-text-muted";
                      if (n.category === "E") color = "text-accent-e";
                      else if (n.category === "S") color = "text-accent-s";
                      else if (n.category === "G") color = "text-accent-g";
                      else if (n.category === "Gamification") color = "text-accent-game";

                      return (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-3 text-left hover:bg-bg-surface transition-colors cursor-pointer flex gap-2.5 items-start ${
                            !n.read ? "bg-bg-surface/60 font-semibold" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-mono uppercase tracking-wider ${color}`}>
                                {n.category}
                              </span>
                              <span className="text-[9px] font-mono text-text-muted">{n.timestamp}</span>
                            </div>
                            <h5 className="font-sans text-xs text-text-primary mt-0.5">{n.title}</h5>
                            <p className="font-sans text-[11px] text-text-muted mt-0.5 leading-normal">
                              {n.description}
                            </p>
                          </div>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-status-warning mt-1 shrink-0" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center text-text-muted text-xs italic">
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
