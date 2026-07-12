"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface Employee {
  id: string;
  name: string;
  department: string;
  points: number;
  xp: number;
  joinedChallenges: string[]; // Challenge IDs
  badges: string[]; // Badge IDs
}

export interface EmissionFactor {
  id: string;
  name: string;
  activityType: string; // "Electricity", "Mobile Combustion", "Stationary Combustion", "Waste"
  unit: string; // "kWh", "gal", "therms", "tons"
  co2Factor: number; // kg CO2e per unit
  status: "active" | "draft";
}

export interface ProductProfile {
  id: string;
  name: string;
  sku: string;
  carbonFootprint: number; // kg CO2e
  waterFootprint: number; // liters
  recycledContent: number; // %
  complianceScore: number; // %
}

export interface CarbonTransaction {
  id: string;
  date: string;
  department: string;
  activityType: string;
  description: string;
  quantity: number;
  unit: string;
  co2e: number; // kg CO2e (derived or custom)
  source: "Auto" | "Manual";
}

export interface EnvironmentalGoal {
  id: string;
  name: string;
  department: string;
  targetCo2: number; // Target emissions kg CO2
  currentCo2: number; // Current emissions kg CO2
  deadline: string;
  status: "on-track" | "delayed" | "achieved";
}

export interface CSRActivity {
  id: string;
  name: string;
  category: string;
  icon: string;
  joinedCount: number;
  evidenceRequired: boolean;
  joinedEmployees: string[]; // Employee IDs
}

export interface EmployeeParticipation {
  id: string;
  employeeName: string;
  activityName: string;
  date: string;
  hasProof: boolean;
  proofFileName?: string;
  status: "pending" | "approved" | "rejected";
}

export interface Policy {
  id: string;
  name: string;
  category: "E" | "S" | "G";
  status: "active" | "draft" | "under-review";
  version: string;
  lastUpdated: string;
}

export interface PolicyAcknowledgement {
  id: string;
  employeeName: string;
  policyName: string;
  status: "acknowledged" | "pending";
  date?: string;
}

export interface Audit {
  id: string;
  name: string;
  date: string;
  auditor: string;
  findings: number;
  status: "completed" | "in-progress" | "scheduled";
  scope: string;
}

export interface ComplianceIssue {
  id: string;
  issue: string;
  severity: "low" | "medium" | "high" | "critical";
  department: string;
  owner: string;
  dueDate: string;
  status: "open" | "resolved" | "under-review";
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  category: "E" | "S" | "G";
  status: "Draft" | "Active" | "Under Review" | "Completed" | "Archived";
  xpReward: number;
  pointsReward: number;
  target: string;
  progress: number; // e.g., current number of participants or metric
  duration: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
  status: "active" | "out-of-stock";
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  category: "E" | "S" | "G" | "Gamification" | "System";
  timestamp: string;
  read: boolean;
}

export interface EcoSphereSettings {
  weights: {
    environmental: number;
    social: number;
    governance: number;
  };
  toggles: {
    autoEmissionCalc: boolean;
    evidenceReqForCsr: boolean;
    badgeAutoAward: boolean;
    complianceEmailAlert: boolean;
  };
}

interface EcoSphereContextType {
  // Navigation State
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentSubTab: string;
  setCurrentSubTab: (subTab: string) => void;

  // Domain States
  currentEmployee: Employee;
  setCurrentEmployee: React.Dispatch<React.SetStateAction<Employee>>;
  emissionFactors: EmissionFactor[];
  setEmissionFactors: React.Dispatch<React.SetStateAction<EmissionFactor[]>>;
  productProfiles: ProductProfile[];
  setProductProfiles: React.Dispatch<React.SetStateAction<ProductProfile[]>>;
  carbonTransactions: CarbonTransaction[];
  setCarbonTransactions: React.Dispatch<React.SetStateAction<CarbonTransaction[]>>;
  environmentalGoals: EnvironmentalGoal[];
  setEnvironmentalGoals: React.Dispatch<React.SetStateAction<EnvironmentalGoal[]>>;
  csrActivities: CSRActivity[];
  setCsrActivities: React.Dispatch<React.SetStateAction<CSRActivity[]>>;
  employeeParticipation: EmployeeParticipation[];
  setEmployeeParticipation: React.Dispatch<React.SetStateAction<EmployeeParticipation[]>>;
  policies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
  policyAcknowledgements: PolicyAcknowledgement[];
  setPolicyAcknowledgements: React.Dispatch<React.SetStateAction<PolicyAcknowledgement[]>>;
  audits: Audit[];
  setAudits: React.Dispatch<React.SetStateAction<Audit[]>>;
  complianceIssues: ComplianceIssue[];
  setComplianceIssues: React.Dispatch<React.SetStateAction<ComplianceIssue[]>>;
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  rewards: Reward[];
  setRewards: React.Dispatch<React.SetStateAction<Reward[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  settings: EcoSphereSettings;
  setSettings: React.Dispatch<React.SetStateAction<EcoSphereSettings>>;
  
  // Computed values
  eScore: number;
  sScore: number;
  gScore: number;
  overallScore: number;
  leaderboard: Employee[];

  // Helper actions
  addNotification: (title: string, desc: string, cat: AppNotification["category"]) => void;
  triggerRewardRedemption: (rewardId: string) => { success: boolean; message: string };
  triggerJoinChallenge: (challengeId: string) => void;
  triggerJoinCSRActivity: (activityId: string, hasProof: boolean, proofFile?: string) => void;
}

const EcoSphereContext = createContext<EcoSphereContextType | undefined>(undefined);

export const EcoSphereProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState("Dashboard");
  const [currentSubTab, setCurrentSubTab] = useState("");

  // Seed settings
  const [settings, setSettings] = useState<EcoSphereSettings>({
    weights: { environmental: 40, social: 30, governance: 30 },
    toggles: {
      autoEmissionCalc: true,
      evidenceReqForCsr: true,
      badgeAutoAward: true,
      complianceEmailAlert: true,
    },
  });

  // Seed Employee Profiles
  const [currentEmployee, setCurrentEmployee] = useState<Employee>({
    id: "EMP-0882",
    name: "Alex Rivera",
    department: "Logistics",
    points: 1250,
    xp: 3400,
    joinedChallenges: ["CHAL-02"],
    badges: ["BADGE-01", "BADGE-02"],
  });

  const [otherEmployees] = useState<Employee[]>([
    { id: "EMP-0101", name: "Sarah Jenkins", department: "Corporate", points: 2100, xp: 4800, joinedChallenges: ["CHAL-02", "CHAL-03"], badges: ["BADGE-01", "BADGE-02", "BADGE-03"] },
    { id: "EMP-0231", name: "David Chen", department: "Manufacturing", points: 1540, xp: 3900, joinedChallenges: ["CHAL-02"], badges: ["BADGE-01", "BADGE-02"] },
    { id: "EMP-0455", name: "Elena Rostova", department: "R&D", points: 950, xp: 2800, joinedChallenges: ["CHAL-01"], badges: ["BADGE-01"] },
    { id: "EMP-0922", name: "Marcus Brody", department: "Procurement", points: 600, xp: 1900, joinedChallenges: [], badges: ["BADGE-01"] },
  ]);

  // Seed Emission Factors
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([
    { id: "EF-01", name: "Grid Electricity (US East)", activityType: "Electricity", unit: "kWh", co2Factor: 0.385, status: "active" },
    { id: "EF-02", name: "Diesel Fuel (Mobile)", activityType: "Mobile Combustion", unit: "gal", co2Factor: 10.21, status: "active" },
    { id: "EF-03", name: "Natural Gas (Stationary)", activityType: "Stationary Combustion", unit: "therms", co2Factor: 5.31, status: "active" },
    { id: "EF-04", name: "Municipal Waste (Landfilled)", activityType: "Waste", unit: "tons", co2Factor: 420.0, status: "active" },
    { id: "EF-05", name: "Aviation Fuel", activityType: "Mobile Combustion", unit: "gal", co2Factor: 9.75, status: "draft" },
  ]);

  // Seed Product Profiles
  const [productProfiles, setProductProfiles] = useState<ProductProfile[]>([
    { id: "PROD-A", name: "Bio-Polymer Eco-Casing", sku: "BP-EC-09", carbonFootprint: 1.25, waterFootprint: 14.2, recycledContent: 85, complianceScore: 98 },
    { id: "PROD-B", name: "Industrial Steel Bracket V2", sku: "IS-B2-12", carbonFootprint: 8.40, waterFootprint: 45.0, recycledContent: 40, complianceScore: 92 },
    { id: "PROD-C", name: "Recycled Fiber Packaging", sku: "RF-PK-45", carbonFootprint: 0.35, waterFootprint: 2.8, recycledContent: 100, complianceScore: 100 },
    { id: "PROD-D", name: "Standard Power Adapter", sku: "SP-AD-88", carbonFootprint: 4.10, waterFootprint: 22.4, recycledContent: 15, complianceScore: 78 },
  ]);

  // Seed Carbon Transactions (12 months trend)
  const [carbonTransactions, setCarbonTransactions] = useState<CarbonTransaction[]>([
    { id: "TX-001", date: "2026-07-05", department: "Manufacturing", activityType: "Electricity", description: "Line A assembly power draw", quantity: 45000, unit: "kWh", co2e: 17325, source: "Auto" },
    { id: "TX-002", date: "2026-07-02", department: "Logistics", activityType: "Mobile Combustion", description: "Mid-west distribution fleet fuel", quantity: 1200, unit: "gal", co2e: 12252, source: "Manual" },
    { id: "TX-003", date: "2026-06-25", department: "Corporate", activityType: "Electricity", description: "HQ Office cooling & servers", quantity: 18000, unit: "kWh", co2e: 6930, source: "Auto" },
    { id: "TX-004", date: "2026-06-18", department: "Procurement", activityType: "Waste", description: "Disposal of recycled warehouse scrap", quantity: 5.5, unit: "tons", co2e: 2310, source: "Auto" },
    { id: "TX-005", date: "2026-05-12", department: "Manufacturing", activityType: "Stationary Combustion", description: "Casting furnace gas preheat", quantity: 800, unit: "therms", co2e: 4248, source: "Manual" },
    { id: "TX-006", date: "2026-04-10", department: "Logistics", activityType: "Mobile Combustion", description: "Inter-facility transfer fuel", quantity: 1450, unit: "gal", co2e: 14804, source: "Auto" },
    // Adding mock historical totals for trend line
    { id: "TX-H1", date: "2025-08-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 50000, unit: "kWh", co2e: 19250, source: "Auto" },
    { id: "TX-H2", date: "2025-09-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 52000, unit: "kWh", co2e: 20020, source: "Auto" },
    { id: "TX-H3", date: "2025-10-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 48000, unit: "kWh", co2e: 18480, source: "Auto" },
    { id: "TX-H4", date: "2025-11-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 44000, unit: "kWh", co2e: 16940, source: "Auto" },
    { id: "TX-H5", date: "2025-12-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 46000, unit: "kWh", co2e: 17710, source: "Auto" },
    { id: "TX-H6", date: "2026-01-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 41000, unit: "kWh", co2e: 15785, source: "Auto" },
    { id: "TX-H7", date: "2026-02-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 39000, unit: "kWh", co2e: 15015, source: "Auto" },
    { id: "TX-H8", date: "2026-03-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 42000, unit: "kWh", co2e: 16170, source: "Auto" },
    { id: "TX-H9", date: "2026-04-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 43000, unit: "kWh", co2e: 16555, source: "Auto" },
    { id: "TX-H10", date: "2026-05-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 45000, unit: "kWh", co2e: 17325, source: "Auto" },
    { id: "TX-H11", date: "2026-06-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 47000, unit: "kWh", co2e: 18095, source: "Auto" },
  ]);

  // Seed Environmental Goals
  const [environmentalGoals, setEnvironmentalGoals] = useState<EnvironmentalGoal[]>([
    { id: "GOAL-01", name: "Reduce HQ Power Consumption by 15%", department: "Corporate", targetCo2: 5000, currentCo2: 3800, deadline: "2026-09-30", status: "on-track" },
    { id: "GOAL-02", name: "Logistics Decarbonization Fleet Run", department: "Logistics", targetCo2: 25000, currentCo2: 27500, deadline: "2026-08-31", status: "delayed" },
    { id: "GOAL-03", name: "Zero Waste Assembly Initiative", department: "Manufacturing", targetCo2: 12000, currentCo2: 12000, deadline: "2026-06-30", status: "achieved" },
    { id: "GOAL-04", name: "Reduce R&D Prototype Scrap by 20%", department: "R&D", targetCo2: 3000, currentCo2: 1400, deadline: "2026-12-31", status: "on-track" },
  ]);

  // Seed CSR Activities
  const [csrActivities, setCsrActivities] = useState<CSRActivity[]>([
    { id: "CSR-01", name: "Reforestation Drive - Pune Hills", category: "Social", icon: "TreePine", joinedCount: 42, evidenceRequired: true, joinedEmployees: ["EMP-0231"] },
    { id: "CSR-02", name: "Local Blood Donation Drive", category: "Social", icon: "Heart", joinedCount: 18, evidenceRequired: false, joinedEmployees: [] },
    { id: "CSR-03", name: "Coastal Beach Cleanup Expedition", category: "Social", icon: "Waves", joinedCount: 56, evidenceRequired: true, joinedEmployees: ["EMP-0101", "EMP-0882"] },
    { id: "CSR-04", name: "Corporate ESG Compliance Seminar", category: "Social", icon: "GraduationCap", joinedCount: 85, evidenceRequired: false, joinedEmployees: ["EMP-0882"] },
  ]);

  // Seed Employee CSR Participation Queue
  const [employeeParticipation, setEmployeeParticipation] = useState<EmployeeParticipation[]>([
    { id: "PART-01", employeeName: "David Chen", activityName: "Reforestation Drive - Pune Hills", date: "2026-07-10", hasProof: true, proofFileName: "pune_hill_tree_cert.pdf", status: "pending" },
    { id: "PART-02", employeeName: "Marcus Brody", activityName: "Coastal Beach Cleanup Expedition", date: "2026-07-08", hasProof: false, status: "pending" },
    { id: "PART-03", employeeName: "Elena Rostova", activityName: "Corporate ESG Compliance Seminar", date: "2026-07-06", hasProof: false, status: "approved" },
    { id: "PART-04", employeeName: "Sarah Jenkins", activityName: "Reforestation Drive - Pune Hills", date: "2026-07-04", hasProof: true, proofFileName: "tree_receipt.png", status: "approved" },
  ]);

  // Seed Policies
  const [policies, setPolicies] = useState<Policy[]>([
    { id: "POL-01", name: "Code of Ethical Sourcing", category: "G", status: "active", version: "v2.4", lastUpdated: "2026-01-15" },
    { id: "POL-02", name: "Supplier Green Energy Mandate", category: "E", status: "active", version: "v1.2", lastUpdated: "2026-03-10" },
    { id: "POL-03", name: "Inclusive Hiring & Diversity Policy", category: "S", status: "active", version: "v3.0", lastUpdated: "2025-11-20" },
    { id: "POL-04", name: "Whistleblower Protection Standard", category: "G", status: "under-review", version: "v4.0-draft", lastUpdated: "2026-06-01" },
  ]);

  // Seed Policy Acknowledgements
  const [policyAcknowledgements, setPolicyAcknowledgements] = useState<PolicyAcknowledgement[]>([
    { id: "ACK-01", employeeName: "Alex Rivera", policyName: "Code of Ethical Sourcing", status: "acknowledged", date: "2026-01-20" },
    { id: "ACK-02", employeeName: "Sarah Jenkins", policyName: "Supplier Green Energy Mandate", status: "acknowledged", date: "2026-03-12" },
    { id: "ACK-03", employeeName: "Alex Rivera", policyName: "Supplier Green Energy Mandate", status: "pending" },
    { id: "ACK-04", employeeName: "David Chen", policyName: "Inclusive Hiring & Diversity Policy", status: "acknowledged", date: "2025-12-05" },
    { id: "ACK-05", employeeName: "Elena Rostova", policyName: "Code of Ethical Sourcing", status: "pending" },
  ]);

  // Seed Audits
  const [audits, setAudits] = useState<Audit[]>([
    { id: "AUD-01", name: "Q1 Supply Chain Carbon Audit", date: "2026-04-12", auditor: "SGS Global Services", findings: 2, status: "completed", scope: "Tier 1 Suppliers" },
    { id: "AUD-02", name: "Annual Occupational Health & Safety", date: "2026-06-20", auditor: "Bureau Veritas", findings: 0, status: "completed", scope: "Assembly Plant B" },
    { id: "AUD-03", name: "HQ Energy Grid Integration Audit", date: "2026-07-28", auditor: "DNV GL", findings: 0, status: "scheduled", scope: "Corporate Facilities" },
    { id: "AUD-04", name: "Anti-Bribery & Whistleblower Protocol Audit", date: "2026-07-02", auditor: "Ernst & Young", findings: 1, status: "in-progress", scope: "Board and Exec Staff" },
  ]);

  // Seed Compliance Issues
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([
    { id: "COMP-01", issue: "Unlabeled chemical drums in Yard B", severity: "high", department: "Manufacturing", owner: "David Chen", dueDate: "2026-07-05", status: "open" }, // Overdue
    { id: "COMP-02", issue: "Logistics supplier missing scope 3 emissions data", severity: "medium", department: "Logistics", owner: "Alex Rivera", dueDate: "2026-07-25", status: "open" },
    { id: "COMP-03", issue: "Failure to complete annual harassment training", severity: "critical", department: "Corporate", owner: "Sarah Jenkins", dueDate: "2026-06-15", status: "open" }, // Overdue
    { id: "COMP-04", issue: "Improper electronic waste disposal logging", severity: "low", department: "R&D", owner: "Elena Rostova", dueDate: "2026-07-30", status: "resolved" },
  ]);

  // Seed Challenges
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: "CHAL-01", name: "Recycle Hero Campaign", description: "Ensure 100% correct sorting of paper, plastic, and compost at desks for 4 weeks.", category: "E", status: "Active", xpReward: 350, pointsReward: 150, target: "4 Weeks Streak", progress: 85, duration: "4 Weeks" },
    { id: "CHAL-02", name: "Eco-Commute Week", description: "Carpool, cycle, walk, or use public transport for all commutes for 5 consecutive days.", category: "E", status: "Active", xpReward: 500, pointsReward: 250, target: "5 Commutes", progress: 95, duration: "1 Week" },
    { id: "CHAL-03", name: "ESG Policy Review Sprint", description: "Read and acknowledge all active corporate policies on the dashboard.", category: "G", status: "Active", xpReward: 200, pointsReward: 100, target: "All Policies", progress: 60, duration: "2 Weeks" },
    { id: "CHAL-04", name: "Community Mentorship Drive", description: "Mentor high school students in local community tech programs for 10 hours.", category: "S", status: "Completed", xpReward: 600, pointsReward: 300, target: "10 Hours Mentor", progress: 100, duration: "4 Weeks" },
    { id: "CHAL-05", name: "Green Procurement Initiative", description: "Migrate 80% of supply purchase logs to sustainable-certified merchants.", category: "E", status: "Draft", xpReward: 800, pointsReward: 400, target: "80% Migration", progress: 0, duration: "6 Weeks" },
  ]);

  // Seed Rewards Catalog
  const [rewards, setRewards] = useState<Reward[]>([
    { id: "REW-01", name: "Organic Tree Planting Dedication", description: "Plant a native species in your name in the Western Ghats sanctuary, includes certificate.", pointsRequired: 500, stock: 95, status: "active" },
    { id: "REW-02", name: "Eco-Friendly Bamboo Coffee Tumbler", description: "Double-walled sustainable bamboo and stainless steel construction with leakproof lid.", pointsRequired: 350, stock: 12, status: "active" },
    { id: "REW-03", name: "1-Month Public Transport Pass Subsidy", description: "Reimburse up to $80 on your local city commuter transit card.", pointsRequired: 800, stock: 5, status: "active" },
    { id: "REW-04", name: "One-on-One Lunch with Chief Sustainability Officer", description: "Discuss EcoSphere metrics, clean tech career tracks, and project ideas directly.", pointsRequired: 1500, stock: 0, status: "out-of-stock" },
  ]);

  // Seed Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: "NT-1", title: "Compliance Overdue Warning", description: "Issue 'Chemical drums in Yard B' has exceeded its due date of July 5.", category: "G", timestamp: "10:15 AM", read: false },
    { id: "NT-2", title: "Policy Acknowledgment Required", description: "Please review the updated 'Supplier Green Energy Mandate v1.2' policy.", category: "E", timestamp: "Yesterday", read: true },
    { id: "NT-3", title: "CSR Activity Approved", description: "Your participation in the Reforestation Drive has been approved! +150 XP.", category: "Gamification", timestamp: "2 days ago", read: true },
  ]);

  // In-App Toast triggers
  const addNotification = (title: string, description: string, category: AppNotification["category"]) => {
    const newNotif: AppNotification = {
      id: `NT-${Date.now()}`,
      title,
      description,
      category,
      timestamp: "Just Now",
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Helper action: Reward redemption
  const triggerRewardRedemption = (rewardId: string) => {
    const targetReward = rewards.find((r) => r.id === rewardId);
    if (!targetReward) return { success: false, message: "Reward not found" };
    if (targetReward.stock <= 0) return { success: false, message: "Item is out of stock" };
    if (currentEmployee.points < targetReward.pointsRequired) {
      return { success: false, message: "Insufficient points balance" };
    }

    // Deduct points, decrement stock
    setCurrentEmployee((prev) => ({
      ...prev,
      points: prev.points - targetReward.pointsRequired,
    }));

    setRewards((prev) =>
      prev.map((r) => r.id === rewardId ? ({ ...r, stock: r.stock - 1, status: r.stock - 1 === 0 ? "out-of-stock" : r.status } as Reward) : r)
    );

    addNotification(
      "Reward Redeemed Successfully!",
      `Redeemed: ${targetReward.name}. Deducted ${targetReward.pointsRequired} points.`,
      "Gamification"
    );

    return { success: true, message: `Redeemed ${targetReward.name} successfully!` };
  };

  // Helper action: Join Challenge
  const triggerJoinChallenge = (challengeId: string) => {
    const targetChallenge = challenges.find((c) => c.id === challengeId);
    if (!targetChallenge) return;
    if (currentEmployee.joinedChallenges.includes(challengeId)) return;

    setCurrentEmployee((prev) => ({
      ...prev,
      joinedChallenges: [...prev.joinedChallenges, challengeId],
    }));

    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, progress: Math.min(c.progress + 10, 100) } : c))
    );

    addNotification(
      "Joined New Challenge!",
      `You joined the challenge: ${targetChallenge.name}. Start working to earn ${targetChallenge.pointsReward} pts!`,
      "Gamification"
    );
  };

  // Helper action: Join CSR Activity
  const triggerJoinCSRActivity = (activityId: string, hasProof: boolean, proofFileName?: string) => {
    const targetActivity = csrActivities.find((a) => a.id === activityId);
    if (!targetActivity) return;

    // Increment count
    setCsrActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? {
              ...a,
              joinedCount: a.joinedCount + 1,
              joinedEmployees: [...a.joinedEmployees, currentEmployee.id],
            }
          : a
      )
    );

    // Add to approval queue
    const newParticipation: EmployeeParticipation = {
      id: `PART-${Date.now()}`,
      employeeName: currentEmployee.name,
      activityName: targetActivity.name,
      date: new Date().toISOString().split("T")[0],
      hasProof,
      proofFileName,
      status: "pending",
    };

    setEmployeeParticipation((prev) => [newParticipation, ...prev]);

    addNotification(
      "CSR Participation Logged",
      `Participation logged for: ${targetActivity.name}. Pending review.`,
      "S"
    );
  };

  // Compute live E, S, G scores
  // E score: starts at 70, increases for achieved/on-track goals, drops if high emissions
  const achievedGoalsCount = environmentalGoals.filter((g) => g.status === "achieved").length;
  const onTrackGoalsCount = environmentalGoals.filter((g) => g.status === "on-track").length;
  const eScore = Math.min(
    100,
    Math.round(62 + achievedGoalsCount * 8 + onTrackGoalsCount * 3)
  );

  // S score: starts at 72, affected by corporate seminar participation & completed CSR activities
  const sScore = Math.min(
    100,
    Math.round(
      74 +
        csrActivities.reduce((acc, act) => acc + act.joinedCount, 0) * 0.12 +
        employeeParticipation.filter((p) => p.status === "approved").length * 2
    )
  );

  // G score: starts at 80, drops if compliance issues are open, particularly critical/overdue ones
  const openCompliance = complianceIssues.filter((i) => i.status === "open");
  const criticalOverdueCount = openCompliance.filter(
    (i) =>
      i.severity === "critical" ||
      i.severity === "high" ||
      new Date(i.dueDate) < new Date()
  ).length;
  
  const gScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(88 - openCompliance.length * 3 - criticalOverdueCount * 6)
    )
  );

  // Dynamic weights from state config
  const overallScore = Math.round(
    (eScore * settings.weights.environmental +
      sScore * settings.weights.social +
      gScore * settings.weights.governance) /
      100
  );

  // Computed Leaderboard
  const allEmployees = [currentEmployee, ...otherEmployees];
  const leaderboard = [...allEmployees].sort((a, b) => b.xp - a.xp);

  return (
    <EcoSphereContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        currentSubTab,
        setCurrentSubTab,
        currentEmployee,
        setCurrentEmployee,
        emissionFactors,
        setEmissionFactors,
        productProfiles,
        setProductProfiles,
        carbonTransactions,
        setCarbonTransactions,
        environmentalGoals,
        setEnvironmentalGoals,
        csrActivities,
        setCsrActivities,
        employeeParticipation,
        setEmployeeParticipation,
        policies,
        setPolicies,
        policyAcknowledgements,
        setPolicyAcknowledgements,
        audits,
        setAudits,
        complianceIssues,
        setComplianceIssues,
        challenges,
        setChallenges,
        rewards,
        setRewards,
        notifications,
        setNotifications,
        settings,
        setSettings,
        eScore,
        sScore,
        gScore,
        overallScore,
        leaderboard,
        addNotification,
        triggerRewardRedemption,
        triggerJoinChallenge,
        triggerJoinCSRActivity,
      }}
    >
      {children}
    </EcoSphereContext.Provider>
  );
};

export const useEcoSphere = () => {
  const context = useContext(EcoSphereContext);
  if (context === undefined) {
    throw new Error("useEcoSphere must be used within an EcoSphereProvider");
  }
  return context;
};
