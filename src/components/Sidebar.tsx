"use client";

import React, { useState } from "react";
import { useEcoSphere } from "@/context/EcoSphereContext";
import {
  LayoutDashboard,
  Leaf,
  Users,
  ShieldCheck,
  Trophy,
  FileBarChart,
  Settings as SettingsIcon,
  Menu,
  X,
  ChevronRight
} from "lucide-react";

// Structure of navigation groups
export const NAVIGATION_SCHEMA = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    module: "None",
    subItems: [],
  },
  {
    name: "Environmental",
    icon: Leaf,
    module: "E",
    subItems: ["Emission Factors", "Product ESG Profiles", "Carbon Transactions", "Environmental Goals"],
  },
  {
    name: "Social",
    icon: Users,
    module: "S",
    subItems: ["CSR Activities", "Employee Participation", "Diversity Dashboard"],
  },
  {
    name: "Governance",
    icon: ShieldCheck,
    module: "G",
    subItems: ["Policies", "Policy Acknowledgements", "Audits", "Compliance Issues"],
  },
  {
    name: "Gamification",
    icon: Trophy,
    module: "Gamification",
    subItems: ["Challenges", "Challenge Participation", "Badges", "Rewards", "Leaderboard"],
  },
  {
    name: "Reports",
    icon: FileBarChart,
    module: "System",
    subItems: ["Default Reports", "Custom Report Builder"],
  },
  {
    name: "Settings",
    icon: SettingsIcon,
    module: "System",
    subItems: ["Departments", "Categories", "ESG Configuration", "Notification Settings"],
  },
];

// Active border + icon color per module — deep-green spine as primary
const MODULE_BORDER_COLORS: Record<string, string> = {
  E: "#FFFFFF",
  S: "#FFFFFF",
  G: "#FFFFFF",
  Gamification: "#FFFFFF",
  System: "#FFFFFF",
  None: "#FFFFFF",
};

// Helper for premium styled icon tile containers on green background
const getIconBoxStyle = (module: string, isActive: boolean) => {
  return isActive ? {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderColor: "rgba(255, 255, 255, 0.28)",
    color: "#FFFFFF"
  } : {
    backgroundColor: "transparent",
    borderColor: "transparent",
    color: "rgba(255, 255, 255, 0.65)"
  };
};

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, currentSubTab, setCurrentSubTab } = useEcoSphere();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (tab: string, subTab: string) => {
    setCurrentTab(tab);
    setCurrentSubTab(subTab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40 w-full"
        style={{
          backgroundColor: "rgba(32, 96, 32, 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.15)"
        }}>
        <div className="flex items-center gap-2">
          <div className="p-1 rounded border" style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.18)" }}>
            <Leaf size={16} strokeWidth={1.75} style={{ color: "#FFFFFF" }} />
          </div>
          <span className="font-display font-semibold tracking-tight text-white text-base">EcoSphere</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white/80 hover:text-white p-1.5 border border-white/20 rounded transition-transform active:scale-95"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          {isOpen ? <X size={16} strokeWidth={1.75} /> : <Menu size={16} strokeWidth={1.75} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          backgroundColor: "rgba(32, 96, 32, 0.88)",           /* glassmorphic leaf green */
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        {/* Brand Header */}
        <div className="hidden lg:flex items-center gap-2.5 px-6 py-6"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.15)" }}>
          <div className="p-1.5 rounded-md border transition-transform hover:rotate-12 duration-300"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderColor: "rgba(255, 255, 255, 0.18)"
            }}>
            <Leaf size={18} strokeWidth={1.75} style={{ color: "#FFFFFF" }} />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-white">EcoSphere</span>
            <span className="font-mono text-[9px] text-white/70 uppercase tracking-widest">Enterprise ESG Console</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1.5 scrollbar-thin">
          {NAVIGATION_SCHEMA.map((group) => {
            const IconComponent = group.icon;
            const isTabActive = currentTab === group.name;

            return (
              <div key={group.name} className="space-y-0.5">
                {/* Main Category Button */}
                <button
                  onClick={() => handleNavigate(group.name, group.subItems[0] || "")}
                  className={`
                    group w-full flex items-center justify-between px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-200
                    ${isTabActive
                      ? "text-white font-bold"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                    }
                  `}
                  style={isTabActive ? {
                    borderLeft: "3px solid #FFFFFF",
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    paddingLeft: "9px",
                  } : {
                    borderLeft: "3px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded border flex items-center justify-center transition-all group-hover:scale-105 duration-200"
                      style={getIconBoxStyle(group.module, isTabActive)}>
                      <IconComponent size={14} strokeWidth={1.75} className="shrink-0" />
                    </div>
                    <span>{group.name}</span>
                  </div>
                  {group.subItems.length > 0 && (
                    <ChevronRight
                      size={12}
                      strokeWidth={2}
                      className={`transition-transform duration-200 ${isTabActive ? "rotate-90" : "group-hover:translate-x-0.5"}`}
                      style={{ color: "#FFFFFF", opacity: 0.8 }}
                    />
                  )}
                </button>

                {/* Sub-items Dropdown */}
                {isTabActive && group.subItems.length > 0 && (
                  <div className="pl-7 pr-1 py-1 space-y-0.5 ml-3"
                    style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.15)" }}>
                    {group.subItems.map((sub) => {
                      const isSubActive = currentSubTab === sub;
                      return (
                        <button
                          key={sub}
                          onClick={() => handleNavigate(group.name, sub)}
                          className={`
                            w-full text-left py-1.5 px-2.5 rounded text-xs transition-all duration-200 block truncate font-sans
                            ${isSubActive
                              ? "text-white font-semibold bg-white/10"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                            }
                          `}
                          style={isSubActive ? {
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                            color: "#FFFFFF",
                          } : {
                            backgroundColor: "transparent",
                          }}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Brand Info */}
        <div className="p-4 text-center" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.15)", backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
          <p className="font-mono text-[9px] text-white/70">SYSTEM STATUS: NOMINAL</p>
          <p className="font-mono text-[8px] mt-0.5" style={{ color: "rgba(255, 255, 255, 0.8)", opacity: 0.8 }}>EST. CARBON BASELINE: 4.8t CO₂e/yr</p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 lg:hidden backdrop-blur-sm"
          style={{ backgroundColor: "rgba(27,42,31,0.3)" }}
        />
      )}
    </>
  );
};
export default Sidebar;
