"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────
export interface Employee {
  id: string;
  name: string;
  department: string;
  points: number;
  xp: number;
  joinedChallenges: string[];
  badges: string[];
}

export interface EmissionFactor {
  id: string;
  name: string;
  activityType: string;
  unit: string;
  co2Factor: number;
  status: "active" | "draft";
}

export interface ProductProfile {
  id: string;
  name: string;
  sku: string;
  carbonFootprint: number;
  waterFootprint: number;
  recycledContent: number;
  complianceScore: number;
}

export interface CarbonTransaction {
  id: string;
  date: string;
  department: string;
  activityType: string;
  description: string;
  quantity: number;
  unit: string;
  co2e: number;
  source: "Auto" | "Manual";
}

export interface EnvironmentalGoal {
  id: string;
  name: string;
  department: string;
  targetCo2: number;
  currentCo2: number;
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
  joinedEmployees: string[];
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
  progress: number;
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

// ─── Context Type ─────────────────────────────────────────
interface EcoSphereContextType {
  // Navigation State
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentSubTab: string;
  setCurrentSubTab: (subTab: string) => void;

  // Loading
  loading: boolean;

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

  // Refresh helpers
  refreshAll: () => void;
}

// ─── Defaults (used before DB loads) ─────────────────────
const DEFAULT_EMPLOYEE: Employee = {
  id: "EMP-0882", name: "Alex Rivera", department: "Logistics",
  points: 0, xp: 0, joinedChallenges: [], badges: [],
};

const DEFAULT_SETTINGS: EcoSphereSettings = {
  weights: { environmental: 40, social: 30, governance: 30 },
  toggles: { autoEmissionCalc: true, evidenceReqForCsr: true, badgeAutoAward: true, complianceEmailAlert: true },
};

// ─── Context ──────────────────────────────────────────────
const EcoSphereContext = createContext<EcoSphereContextType | undefined>(undefined);

// ─── Helper: simple fetch wrapper ─────────────────────────
async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json();
}

// ─── Provider ─────────────────────────────────────────────
export const EcoSphereProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentTab, setCurrentTab] = useState("Dashboard");
  const [currentSubTab, setCurrentSubTab] = useState("");
  const [loading, setLoading] = useState(true);

  // Domain state
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(DEFAULT_EMPLOYEE);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);
  const [productProfiles, setProductProfiles] = useState<ProductProfile[]>([]);
  const [carbonTransactions, setCarbonTransactions] = useState<CarbonTransaction[]>([]);
  const [environmentalGoals, setEnvironmentalGoals] = useState<EnvironmentalGoal[]>([]);
  const [csrActivities, setCsrActivities] = useState<CSRActivity[]>([]);
  const [employeeParticipation, setEmployeeParticipation] = useState<EmployeeParticipation[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyAcknowledgements, setPolicyAcknowledgements] = useState<PolicyAcknowledgement[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<EcoSphereSettings>(DEFAULT_SETTINGS);

  // ─── Fetch all data from APIs ────────────────────────────
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        employees, efs, pps, txs, goals, csr, parts, pols, acks,
        auds, comps, chals, rews, notifs, setts
      ] = await Promise.all([
        apiFetch<Employee[]>("/api/employees"),
        apiFetch<EmissionFactor[]>("/api/emission-factors"),
        apiFetch<ProductProfile[]>("/api/product-profiles"),
        apiFetch<CarbonTransaction[]>("/api/carbon-transactions"),
        apiFetch<EnvironmentalGoal[]>("/api/environmental-goals"),
        apiFetch<CSRActivity[]>("/api/csr-activities"),
        apiFetch<EmployeeParticipation[]>("/api/employee-participation"),
        apiFetch<Policy[]>("/api/policies"),
        apiFetch<PolicyAcknowledgement[]>("/api/policy-acknowledgements"),
        apiFetch<Audit[]>("/api/audits"),
        apiFetch<ComplianceIssue[]>("/api/compliance-issues"),
        apiFetch<Challenge[]>("/api/challenges"),
        apiFetch<Reward[]>("/api/rewards"),
        apiFetch<AppNotification[]>("/api/notifications"),
        apiFetch<EcoSphereSettings>("/api/settings"),
      ]);

      setAllEmployees(employees);
      // Alex Rivera (EMP-0882) is our "logged in" user
      const me = employees.find((e) => e.id === "EMP-0882") ?? employees[0] ?? DEFAULT_EMPLOYEE;
      setCurrentEmployee(me);

      setEmissionFactors(efs);
      setProductProfiles(pps);
      setCarbonTransactions(txs);
      setEnvironmentalGoals(goals);
      setCsrActivities(csr);
      setEmployeeParticipation(parts);
      setPolicies(pols);
      setPolicyAcknowledgements(acks);
      setAudits(auds);
      setComplianceIssues(comps);
      setChallenges(chals);
      setRewards(rews);
      setNotifications(notifs);
      setSettings(setts);
    } catch (err) {
      console.error("EcoSphere data load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // ─── Setter Wrappers with Automatic DB Sync ───────────────
  const updateCarbonTransactions = useCallback((value: React.SetStateAction<CarbonTransaction[]>) => {
    setCarbonTransactions((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const added = next.filter((n) => !prev.some((p) => p.id === n.id));
      added.forEach((item) => {
        fetch("/api/carbon-transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      const deleted = prev.filter((p) => !next.some((n) => p.id === n.id));
      deleted.forEach((item) => {
        fetch(`/api/carbon-transactions/${item.id}`, {
          method: "DELETE",
        }).then(() => fetchAllData()).catch(console.error);
      });
      return next;
    });
  }, [fetchAllData]);

  const updateEmissionFactors = useCallback((value: React.SetStateAction<EmissionFactor[]>) => {
    setEmissionFactors((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const added = next.filter((n) => !prev.some((p) => p.id === n.id));
      added.forEach((item) => {
        fetch("/api/emission-factors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      const deleted = prev.filter((p) => !next.some((n) => p.id === n.id));
      deleted.forEach((item) => {
        fetch(`/api/emission-factors/${item.id}`, {
          method: "DELETE",
        }).then(() => fetchAllData()).catch(console.error);
      });
      const updated = next.filter((n) => {
        const p = prev.find((x) => x.id === n.id);
        return p && JSON.stringify(p) !== JSON.stringify(n);
      });
      updated.forEach((item) => {
        fetch(`/api/emission-factors/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      return next;
    });
  }, [fetchAllData]);

  const updateProductProfiles = useCallback((value: React.SetStateAction<ProductProfile[]>) => {
    setProductProfiles((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const added = next.filter((n) => !prev.some((p) => p.id === n.id));
      added.forEach((item) => {
        fetch("/api/product-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      const deleted = prev.filter((p) => !next.some((n) => p.id === n.id));
      deleted.forEach((item) => {
        fetch(`/api/product-profiles/${item.id}`, {
          method: "DELETE",
        }).then(() => fetchAllData()).catch(console.error);
      });
      const updated = next.filter((n) => {
        const p = prev.find((x) => x.id === n.id);
        return p && JSON.stringify(p) !== JSON.stringify(n);
      });
      updated.forEach((item) => {
        fetch(`/api/product-profiles/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      return next;
    });
  }, [fetchAllData]);

  const updateEnvironmentalGoals = useCallback((value: React.SetStateAction<EnvironmentalGoal[]>) => {
    setEnvironmentalGoals((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const added = next.filter((n) => !prev.some((p) => p.id === n.id));
      added.forEach((item) => {
        fetch("/api/environmental-goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      const deleted = prev.filter((p) => !next.some((n) => p.id === n.id));
      deleted.forEach((item) => {
        fetch(`/api/environmental-goals/${item.id}`, {
          method: "DELETE",
        }).then(() => fetchAllData()).catch(console.error);
      });
      const updated = next.filter((n) => {
        const p = prev.find((x) => x.id === n.id);
        return p && JSON.stringify(p) !== JSON.stringify(n);
      });
      updated.forEach((item) => {
        fetch(`/api/environmental-goals/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      return next;
    });
  }, [fetchAllData]);

  const updatePolicies = useCallback((value: React.SetStateAction<Policy[]>) => {
    setPolicies((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const added = next.filter((n) => !prev.some((p) => p.id === n.id));
      added.forEach((item) => {
        fetch("/api/policies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      const deleted = prev.filter((p) => !next.some((n) => p.id === n.id));
      deleted.forEach((item) => {
        fetch(`/api/policies/${item.id}`, {
          method: "DELETE",
        }).then(() => fetchAllData()).catch(console.error);
      });
      const updated = next.filter((n) => {
        const p = prev.find((x) => x.id === n.id);
        return p && JSON.stringify(p) !== JSON.stringify(n);
      });
      updated.forEach((item) => {
        fetch(`/api/policies/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      return next;
    });
  }, [fetchAllData]);

  const updateAudits = useCallback((value: React.SetStateAction<Audit[]>) => {
    setAudits((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const added = next.filter((n) => !prev.some((p) => p.id === n.id));
      added.forEach((item) => {
        fetch("/api/audits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      const deleted = prev.filter((p) => !next.some((n) => p.id === n.id));
      deleted.forEach((item) => {
        fetch(`/api/audits/${item.id}`, {
          method: "DELETE",
        }).then(() => fetchAllData()).catch(console.error);
      });
      const updated = next.filter((n) => {
        const p = prev.find((x) => x.id === n.id);
        return p && JSON.stringify(p) !== JSON.stringify(n);
      });
      updated.forEach((item) => {
        fetch(`/api/audits/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      return next;
    });
  }, [fetchAllData]);

  const updateComplianceIssues = useCallback((value: React.SetStateAction<ComplianceIssue[]>) => {
    setComplianceIssues((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const added = next.filter((n) => !prev.some((p) => p.id === n.id));
      added.forEach((item) => {
        fetch("/api/compliance-issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      const deleted = prev.filter((p) => !next.some((n) => p.id === n.id));
      deleted.forEach((item) => {
        fetch(`/api/compliance-issues/${item.id}`, {
          method: "DELETE",
        }).then(() => fetchAllData()).catch(console.error);
      });
      const updated = next.filter((n) => {
        const p = prev.find((x) => x.id === n.id);
        return p && JSON.stringify(p) !== JSON.stringify(n);
      });
      updated.forEach((item) => {
        fetch(`/api/compliance-issues/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      return next;
    });
  }, [fetchAllData]);

  const updateSettings = useCallback((value: React.SetStateAction<EcoSphereSettings>) => {
    setSettings((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      }).then(() => fetchAllData()).catch(console.error);
      return next;
    });
  }, [fetchAllData]);

  const updateCsrActivities = useCallback((value: React.SetStateAction<CSRActivity[]>) => {
    setCsrActivities((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const added = next.filter((n) => !prev.some((p) => p.id === n.id));
      added.forEach((item) => {
        fetch("/api/csr-activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      const updated = next.filter((n) => {
        const p = prev.find((x) => x.id === n.id);
        return p && JSON.stringify(p) !== JSON.stringify(n);
      });
      updated.forEach((item) => {
        fetch(`/api/csr-activities/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      return next;
    });
  }, [fetchAllData]);

  const updateEmployeeParticipation = useCallback((value: React.SetStateAction<EmployeeParticipation[]>) => {
    setEmployeeParticipation((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const added = next.filter((n) => !prev.some((p) => p.id === n.id));
      added.forEach((item) => {
        fetch("/api/employee-participation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      const updated = next.filter((n) => {
        const p = prev.find((x) => x.id === n.id);
        return p && JSON.stringify(p) !== JSON.stringify(n);
      });
      updated.forEach((item) => {
        fetch(`/api/employee-participation/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      return next;
    });
  }, [fetchAllData]);

  const updateChallenges = useCallback((value: React.SetStateAction<Challenge[]>) => {
    setChallenges((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const added = next.filter((n) => !prev.some((p) => p.id === n.id));
      added.forEach((item) => {
        fetch("/api/challenges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      const updated = next.filter((n) => {
        const p = prev.find((x) => x.id === n.id);
        return p && JSON.stringify(p) !== JSON.stringify(n);
      });
      updated.forEach((item) => {
        fetch(`/api/challenges/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      return next;
    });
  }, [fetchAllData]);

  const updateRewards = useCallback((value: React.SetStateAction<Reward[]>) => {
    setRewards((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      const added = next.filter((n) => !prev.some((p) => p.id === n.id));
      added.forEach((item) => {
        fetch("/api/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      const updated = next.filter((n) => {
        const p = prev.find((x) => x.id === n.id);
        return p && JSON.stringify(p) !== JSON.stringify(n);
      });
      updated.forEach((item) => {
        fetch(`/api/rewards/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }).then(() => fetchAllData()).catch(console.error);
      });
      return next;
    });
  }, [fetchAllData]);

  const updateCurrentEmployee = useCallback((value: React.SetStateAction<Employee>) => {
    setCurrentEmployee((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      if (prev.id && JSON.stringify(prev) !== JSON.stringify(next)) {
        fetch(`/api/employees/${next.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        }).then(() => fetchAllData()).catch(console.error);
      }
      return next;
    });
  }, [fetchAllData]);

  // ─── Computed Scores ──────────────────────────────────────
  const achievedGoalsCount = environmentalGoals.filter((g) => g.status === "achieved").length;
  const onTrackGoalsCount = environmentalGoals.filter((g) => g.status === "on-track").length;
  const eScore = Math.min(100, Math.round(62 + achievedGoalsCount * 8 + onTrackGoalsCount * 3));

  const sScore = Math.min(
    100,
    Math.round(
      74 +
        csrActivities.reduce((acc, act) => acc + act.joinedCount, 0) * 0.12 +
        employeeParticipation.filter((p) => p.status === "approved").length * 2
    )
  );

  const openCompliance = complianceIssues.filter((i) => i.status === "open");
  const criticalOverdueCount = openCompliance.filter(
    (i) => i.severity === "critical" || i.severity === "high" || new Date(i.dueDate) < new Date()
  ).length;
  const gScore = Math.max(0, Math.min(100, Math.round(88 - openCompliance.length * 3 - criticalOverdueCount * 6)));

  const overallScore = Math.round(
    (eScore * settings.weights.environmental + sScore * settings.weights.social + gScore * settings.weights.governance) / 100
  );

  const leaderboard = [...allEmployees].sort((a, b) => b.xp - a.xp);

  // ─── Action: Add Notification (API + local state) ─────────
  const addNotification = useCallback(
    async (title: string, description: string, category: AppNotification["category"]) => {
      try {
        const res = await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, category }),
        });
        const created: AppNotification = await res.json();
        setNotifications((prev) => [created, ...prev]);
      } catch (_err) {
        // Optimistic fallback
        const optimistic: AppNotification = {
          id: `NT-${Date.now()}`, title, description, category, timestamp: "Just Now", read: false,
        };
        setNotifications((prev) => [optimistic, ...prev]);
      }
    },
    []
  );

  // ─── Action: Reward Redemption ────────────────────────────
  const triggerRewardRedemption = useCallback(
    (rewardId: string): { success: boolean; message: string } => {
      const targetReward = rewards.find((r) => r.id === rewardId);
      if (!targetReward) return { success: false, message: "Reward not found" };
      if (targetReward.stock <= 0) return { success: false, message: "Item is out of stock" };
      if (currentEmployee.points < targetReward.pointsRequired)
        return { success: false, message: "Insufficient points balance" };

      // Optimistic update
      const newPoints = currentEmployee.points - targetReward.pointsRequired;
      
      // These call the wrapped setters which automatically perform the PATCH requests to the DB in background
      updateCurrentEmployee((prev) => ({ ...prev, points: newPoints }));
      updateRewards((prev) =>
        prev.map((r) =>
          r.id === rewardId
            ? { ...r, stock: r.stock - 1, status: r.stock - 1 === 0 ? "out-of-stock" : r.status } as Reward
            : r
        )
      );

      addNotification(
        "Reward Redeemed Successfully!",
        `Redeemed: ${targetReward.name}. Deducted ${targetReward.pointsRequired} points.`,
        "Gamification"
      );

      return { success: true, message: `Redeemed ${targetReward.name} successfully!` };
    },
    [rewards, currentEmployee, updateCurrentEmployee, updateRewards, addNotification]
  );

  // ─── Action: Join Challenge ────────────────────────────────
  const triggerJoinChallenge = useCallback(
    (challengeId: string) => {
      const targetChallenge = challenges.find((c) => c.id === challengeId);
      if (!targetChallenge) return;
      if (currentEmployee.joinedChallenges.includes(challengeId)) return;

      const newJoined = [...currentEmployee.joinedChallenges, challengeId];
      
      // These call the wrapped setters which automatically perform the PATCH requests to the DB in background
      updateCurrentEmployee((prev) => ({ ...prev, joinedChallenges: newJoined }));
      updateChallenges((prev) =>
        prev.map((c) => (c.id === challengeId ? { ...c, progress: Math.min(c.progress + 10, 100) } : c))
      );

      addNotification(
        "Joined New Challenge!",
        `You joined the challenge: ${targetChallenge.name}. Start working to earn ${targetChallenge.pointsReward} pts!`,
        "Gamification"
      );
    },
    [challenges, currentEmployee, updateCurrentEmployee, updateChallenges, addNotification]
  );

  // ─── Action: Join CSR Activity ─────────────────────────────
  const triggerJoinCSRActivity = useCallback(
    (activityId: string, hasProof: boolean, proofFileName?: string) => {
      const targetActivity = csrActivities.find((a) => a.id === activityId);
      if (!targetActivity) return;

      const newJoinedEmployees = [...targetActivity.joinedEmployees, currentEmployee.id];
      
      // Sync activity and participation to the DB via wrapped setters
      updateCsrActivities((prev) =>
        prev.map((a) => a.id === activityId ? { ...a, joinedCount: a.joinedCount + 1, joinedEmployees: newJoinedEmployees } : a)
      );

      const newPart: EmployeeParticipation = {
        id: `PART-${Date.now()}`, employeeName: currentEmployee.name, activityName: targetActivity.name,
        date: new Date().toISOString().split("T")[0], hasProof, proofFileName, status: "pending",
      };
      updateEmployeeParticipation((prev) => [newPart, ...prev]);

      addNotification(
        "CSR Participation Logged",
        `Participation logged for: ${targetActivity.name}. Pending review.`,
        "S"
      );
    },
    [csrActivities, currentEmployee, updateCsrActivities, updateEmployeeParticipation, addNotification]
  );

  return (
    <EcoSphereContext.Provider
      value={{
        currentTab, setCurrentTab, currentSubTab, setCurrentSubTab, loading,
        currentEmployee, setCurrentEmployee: updateCurrentEmployee,
        emissionFactors, setEmissionFactors: updateEmissionFactors,
        productProfiles, setProductProfiles: updateProductProfiles,
        carbonTransactions, setCarbonTransactions: updateCarbonTransactions,
        environmentalGoals, setEnvironmentalGoals: updateEnvironmentalGoals,
        csrActivities, setCsrActivities: updateCsrActivities,
        employeeParticipation, setEmployeeParticipation: updateEmployeeParticipation,
        policies, setPolicies: updatePolicies,
        policyAcknowledgements, setPolicyAcknowledgements,
        audits, setAudits: updateAudits,
        complianceIssues, setComplianceIssues: updateComplianceIssues,
        challenges, setChallenges: updateChallenges,
        rewards, setRewards: updateRewards,
        notifications, setNotifications,
        settings, setSettings: updateSettings,
        eScore, sScore, gScore, overallScore, leaderboard,
        addNotification, triggerRewardRedemption, triggerJoinChallenge, triggerJoinCSRActivity,
        refreshAll: fetchAllData,
      }}
    >
      {children}
    </EcoSphereContext.Provider>
  );
};

export const useEcoSphere = () => {
  const context = useContext(EcoSphereContext);
  if (context === undefined) throw new Error("useEcoSphere must be used within an EcoSphereProvider");
  return context;
};
