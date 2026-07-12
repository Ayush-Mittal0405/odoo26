"use client";

import React, { useState, useEffect } from "react";
import { useEcoSphere } from "@/context/EcoSphereContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardScreen from "@/components/screens/DashboardScreen";
import EnvironmentalScreen from "@/components/screens/EnvironmentalScreen";
import SocialScreen from "@/components/screens/SocialScreen";
import GovernanceScreen from "@/components/screens/GovernanceScreen";
import GamificationScreen from "@/components/screens/GamificationScreen";
import ReportsScreen from "@/components/screens/ReportsScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import { ToastAlert, Toast, MODULE_ACCENTS } from "@/components/UIComponents";
import { FloatingBubbles } from "@/components/ui/floating-bubbles-background";

export default function EcoSphereWorkspace() {
  const { currentTab, currentSubTab, setCurrentSubTab, notifications } = useEcoSphere();
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Bridge in-app notifications state to slide-out Toasts
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read && n.timestamp === "Just Now");
    if (unread.length === 0) return;

    setToasts((prev) => {
      const existingIds = prev.map((t) => t.id);
      const incoming = unread
        .filter((n) => !existingIds.includes(n.id))
        .map((n) => {
          let type: Toast["type"] = "success";
          if (n.category === "G" && n.title.toLowerCase().includes("warning")) {
            type = "error";
          } else if (n.category === "System") {
            type = "info";
          } else if (n.category === "Gamification") {
            type = "warning";
          }
          return {
            id: n.id,
            title: n.title,
            description: n.description,
            type,
          };
        });

      return [...prev, ...incoming];
    });
  }, [notifications]);

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sub-tab row headers list
  const getSubTabsList = () => {
    switch (currentTab) {
      case "Environmental":
        return ["Emission Factors", "Product ESG Profiles", "Carbon Transactions", "Environmental Goals"];
      case "Social":
        return ["CSR Activities", "Employee Participation", "Diversity Dashboard"];
      case "Governance":
        return ["Policies", "Policy Acknowledgements", "Audits", "Compliance Issues"];
      case "Gamification":
        return ["Challenges", "Challenge Participation", "Badges", "Rewards", "Leaderboard"];
      case "Reports":
        return ["Default Reports", "Custom Report Builder"];
      case "Settings":
        return ["Departments", "Categories", "ESG Configuration", "Notification Settings"];
      default:
        return [];
    }
  };

  const subTabs = getSubTabsList();

  // Determine current active color for underline tab borders
  let moduleKey: keyof typeof MODULE_ACCENTS = "None";
  if (currentTab === "Environmental") moduleKey = "E";
  else if (currentTab === "Social") moduleKey = "S";
  else if (currentTab === "Governance") moduleKey = "G";
  else if (currentTab === "Gamification") moduleKey = "Gamification";
  else if (currentTab === "Settings" || currentTab === "Reports") moduleKey = "System";

  const accent = MODULE_ACCENTS[moduleKey];

  return (
    <div className="flex min-h-screen bg-bg-base relative font-sans antialiased text-text-primary">
      {/* Atmosphere blush — drifting gradient at 3–5% opacity, "light through leaves" */}
      <div className="atmosphere-blush" aria-hidden="true" />

      {/* Floating Spotlight Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full glow-orb-green opacity-70" />
        <div className="absolute bottom-[15%] right-[10%] w-[600px] h-[600px] rounded-full glow-orb-purple opacity-70" />
      </div>

      {/* Modern Developer Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] grid-bg opacity-[0.45]" aria-hidden="true"
        style={{
          maskImage: "radial-gradient(circle at 50% 50%, black, transparent 95%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black, transparent 95%)"
        }}
      />

      {/* Floating Bubbles Background Effect from 21st.dev */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <FloatingBubbles />
      </div>

      {/* Paper grain texture overlay — 1-2% opacity, printed-material quality */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] paper-grain"
        aria-hidden="true"
        style={{ opacity: 0.018 }}
      />

      {/* Topographic contour overlay — barely-there elevation lines */}
      <div className="fixed inset-0 pointer-events-none z-[1] topo-bg opacity-[0.035]" aria-hidden="true" />

      {/* Sidebar - fixed left, z-index above bg layers */}
      <div className="relative z-10">
        <Sidebar />
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative min-h-screen">
        <Header />

        {/* Top Accent Sub-tab Bar */}
        {subTabs.length > 0 && (
          <div className="bg-bg-surface border-b border-border-hairline px-6 py-2 sticky top-16 z-20 flex gap-4 overflow-x-auto whitespace-nowrap scrollbar-none shadow-sm">
            {subTabs.map((sub) => {
              const isActive = currentSubTab === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setCurrentSubTab(sub)}
                  className={`
                    py-1.5 text-xs font-mono tracking-wider transition-all duration-150 relative cursor-pointer select-none uppercase
                    ${isActive ? "text-text-primary font-bold" : "text-text-muted hover:text-text-primary"}
                  `}
                >
                  {sub}
                  {isActive && (
                    <span
                      style={{ backgroundColor: accent.rawColor }}
                      className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] rounded-t-sm"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Inner Screen Panel */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
          {currentTab === "Dashboard" && <DashboardScreen />}
          {currentTab === "Environmental" && <EnvironmentalScreen />}
          {currentTab === "Social" && <SocialScreen />}
          {currentTab === "Governance" && <GovernanceScreen />}
          {currentTab === "Gamification" && <GamificationScreen />}
          {currentTab === "Reports" && <ReportsScreen />}
          {currentTab === "Settings" && <SettingsScreen />}
        </main>
      </div>

      {/* Floating sliding Toasts alert system */}
      <ToastAlert toasts={toasts} onRemove={handleRemoveToast} />
    </div>
  );
}
