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

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, currentSubTab, setCurrentSubTab } = useEcoSphere();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (tab: string, subTab: string) => {
    setCurrentTab(tab);
    setCurrentSubTab(subTab);
    setIsOpen(false);
  };

  const activeColorMap = {
    E: "text-accent-e border-accent-e bg-accent-e/5",
    S: "text-accent-s border-accent-s bg-accent-s/5",
    G: "text-accent-g border-accent-g bg-accent-g/5",
    Gamification: "text-accent-game border-accent-game bg-accent-game/5",
    System: "text-text-primary border-text-muted bg-bg-raised",
    None: "text-accent-e border-accent-e bg-accent-e/5",
  };

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="lg:hidden flex items-center justify-between bg-bg-surface border-b border-border-hairline px-4 py-3 sticky top-0 z-40 w-full">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-accent-e" />
          <span className="font-serif font-semibold tracking-wider text-text-primary text-md">EcoSphere</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-text-muted hover:text-text-primary p-1 border border-border-hairline rounded bg-bg-base"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-bg-surface border-r border-border-hairline flex flex-col transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="hidden lg:flex items-center gap-2.5 px-6 py-6 border-b border-border-hairline">
          <div className="p-1.5 bg-accent-e/10 rounded-tl-md rounded-br-md border border-accent-e/20">
            <Leaf className="h-5 w-5 text-accent-e animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-wider text-text-primary">EcoSphere</span>
            <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">Enterprise ESG Console</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 scrollbar-thin">
          {NAVIGATION_SCHEMA.map((group) => {
            const IconComponent = group.icon;
            const isTabActive = currentTab === group.name;
            const borderActiveColor = activeColorMap[group.module as keyof typeof activeColorMap] || "border-transparent";

            return (
              <div key={group.name} className="space-y-0.5">
                {/* Main Category */}
                <button
                  onClick={() => handleNavigate(group.name, group.subItems[0] || "")}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 border-l-[3px] border-transparent
                    ${isTabActive 
                      ? `${borderActiveColor} text-text-primary` 
                      : "text-text-muted hover:text-text-primary hover:bg-bg-raised/50"
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent className="h-4.5 w-4.5 shrink-0" />
                    <span>{group.name}</span>
                  </div>
                  {group.subItems.length > 0 && (
                    <ChevronRight className={`h-3 w-3 text-text-muted/60 transition-transform duration-200 ${isTabActive ? "rotate-90" : ""}`} />
                  )}
                </button>

                {/* Sub items dropdown */}
                {isTabActive && group.subItems.length > 0 && (
                  <div className="pl-7 pr-1 py-1 space-y-1 border-l border-border-hairline/50 ml-5">
                    {group.subItems.map((sub) => {
                      const isSubActive = currentSubTab === sub;
                      return (
                        <button
                          key={sub}
                          onClick={() => handleNavigate(group.name, sub)}
                          className={`
                            w-full text-left py-1.5 px-2.5 rounded text-xs transition-colors block truncate font-sans
                            ${isSubActive 
                              ? "text-text-primary bg-bg-raised/80 font-medium" 
                              : "text-text-muted hover:text-text-primary hover:bg-bg-raised/20"
                            }
                          `}
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
        <div className="p-4 border-t border-border-hairline bg-bg-base/40 text-center">
          <p className="font-mono text-[9px] text-text-muted">SYSTEM STATUS: NOMINAL</p>
          <p className="font-mono text-[8px] text-text-muted/60 mt-0.5">EST. CARBON BASELINE: 4.8t CO₂e/yr</p>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-bg-base/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}
    </>
  );
};
export default Sidebar;
