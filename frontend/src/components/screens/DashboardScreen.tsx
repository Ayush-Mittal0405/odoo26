"use client";

import React, { useState, useEffect } from "react";
import { useEcoSphere, CarbonTransaction, EmissionFactor } from "@/context/EcoSphereContext";
import {
  AsymmetricCard,
  GrowthRingGauge,
  InteractiveModal
} from "../UIComponents";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from "recharts";
import { Plus, Play, FileText, Activity, AlertCircle, ArrowUpRight, Leaf } from "lucide-react";

export const DashboardScreen: React.FC = () => {
  const {
    eScore,
    sScore,
    gScore,
    overallScore,
    carbonTransactions,
    setCarbonTransactions,
    emissionFactors,
    settings,
    setCurrentTab,
    setCurrentSubTab,
    addNotification,
    currentEmployee,
    leaderboard
  } = useEcoSphere();

  const [mounted, setMounted] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form State for Quick Carbon Log
  const [txDate, setTxDate] = useState("");
  const [txDept, setTxDept] = useState("Corporate");
  const [txActivityType, setTxActivityType] = useState("Electricity");
  const [txDesc, setTxDesc] = useState("");
  const [txQty, setTxQty] = useState(0);
  const [txManualCo2, setTxManualCo2] = useState(0);

  useEffect(() => {
    setMounted(true);
    setTxDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Filter relevant factor
  const selectedFactor = emissionFactors.find(
    (ef) => ef.activityType === txActivityType && ef.status === "active"
  );

  const calculatedCo2 = selectedFactor
    ? Math.round(txQty * selectedFactor.co2Factor)
    : 0;

  const handleLogCarbonSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCo2 = settings.toggles.autoEmissionCalc ? calculatedCo2 : txManualCo2;
    const finalSource = settings.toggles.autoEmissionCalc ? "Auto" : "Manual";

    const newTx: CarbonTransaction = {
      id: `TX-${Date.now()}`,
      date: txDate,
      department: txDept,
      activityType: txActivityType,
      description: txDesc || `${txActivityType} consumption log`,
      quantity: txQty,
      unit: selectedFactor?.unit || "units",
      co2e: finalCo2,
      source: finalSource as "Auto" | "Manual",
    };

    setCarbonTransactions((prev) => [newTx, ...prev]);
    addNotification(
      "Carbon Log Recorded",
      `Logged ${finalCo2} kg CO2e for ${txDept} (${finalSource} Calc)`,
      "E"
    );

    // Reset Form
    setTxQty(0);
    setTxManualCo2(0);
    setTxDesc("");
    setShowLogModal(false);
  };

  // Compile 12 Months aggregated data for LineChart
  const getEmissionsTrendData = () => {
    const monthlyMap: Record<string, number> = {};

    // Base mock historical values
    const months = [
      "Aug 2025", "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025",
      "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026",
      "Jun 2026", "Jul 2026"
    ];

    months.forEach((m) => {
      monthlyMap[m] = 0;
    });

    // Populate from transactions
    carbonTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      if (isNaN(date.getTime())) return;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key] += tx.co2e;
      }
    });

    return months.map((m) => ({
      name: m,
      emissions: Math.round(monthlyMap[m] / 1000), // convert to metric tons (t CO2e)
    }));
  };

  // Compute department ESG score for bar chart
  const getDeptRankingData = () => {
    // Generate department averages dynamically based on transaction sizes and settings
    const depts = ["Manufacturing", "Logistics", "Corporate", "Procurement", "R&D"];
    const baseScores: Record<string, number> = {
      Manufacturing: 72,
      Logistics: 68,
      Corporate: 88,
      Procurement: 80,
      "R&D": 84
    };

    // Tweak scores based on carbon reduction in recent logs
    depts.forEach((dept) => {
      const deptTx = carbonTransactions.filter((tx) => tx.department === dept);
      const totalCo2 = deptTx.reduce((sum, tx) => sum + tx.co2e, 0);
      if (totalCo2 > 20000) {
        baseScores[dept] = Math.max(50, baseScores[dept] - 2);
      } else {
        baseScores[dept] = Math.min(98, baseScores[dept] + 1);
      }
    });

    return depts.map((d) => ({
      name: d,
      score: baseScores[d],
    })).sort((a, b) => b.score - a.score);
  };

  // Compile dashboard activities
  const getRecentActivities = () => {
    return carbonTransactions.slice(0, 4).map((tx) => ({
      id: tx.id,
      title: `Logged carbon consumption`,
      detail: `${tx.description} — ${tx.co2e.toLocaleString()} kg CO2e (${tx.source})`,
      time: tx.date,
      module: "E" as const,
    }));
  };

  const trendData = getEmissionsTrendData();
  const deptData = getDeptRankingData();
  const recentActivities = getRecentActivities();

  return (
    <div className="space-y-6">
      {/* 4 Growth Ring KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AsymmetricCard module="E" className="flex flex-col items-center">
          <h3 className="font-serif text-sm text-text-muted mb-2">Environmental Score</h3>
          <GrowthRingGauge value={eScore} label="E-PILLAR" module="E" subLabel={`${eScore}%`} />
          <p className="text-[10px] font-mono text-text-muted mt-3 text-center">
            Baseline: 70% | Target: 90%
          </p>
        </AsymmetricCard>

        <AsymmetricCard module="S" className="flex flex-col items-center">
          <h3 className="font-serif text-sm text-text-muted mb-2">Social Score</h3>
          <GrowthRingGauge value={sScore} label="S-PILLAR" module="S" subLabel={`${sScore}%`} />
          <p className="text-[10px] font-mono text-text-muted mt-3 text-center">
            Participation Rate: 68%
          </p>
        </AsymmetricCard>

        <AsymmetricCard module="G" className="flex flex-col items-center">
          <h3 className="font-serif text-sm text-text-muted mb-2">Governance Score</h3>
          <GrowthRingGauge value={gScore} label="G-PILLAR" module="G" subLabel={`${gScore}%`} />
          <p className="text-[10px] font-mono text-text-muted mt-3 text-center">
            Open Audits: 2 | Overdue: 2
          </p>
        </AsymmetricCard>

        {/* Dynamic overall dashboard gauge */}
        <AsymmetricCard module="None" className="flex flex-col items-center border-l-2 border-accent-game">
          <h3 className="font-serif text-sm text-text-muted mb-2">Overall ESG Score</h3>
          <GrowthRingGauge
            value={overallScore}
            label="ESG SCORE"
            module="None"
            multiValues={{ E: eScore, S: sScore, G: gScore, Overall: overallScore }}
          />
          <div className="flex gap-2 text-[8px] font-mono text-text-muted mt-3">
            <span>E:{settings.weights.environmental}%</span>
            <span>S:{settings.weights.social}%</span>
            <span>G:{settings.weights.governance}%</span>
          </div>
        </AsymmetricCard>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emissions Trend Line Chart */}
        <AsymmetricCard className="lg:col-span-2 flex flex-col h-96">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-md font-semibold text-text-primary">Corporate CO₂e Emissions Trend</h3>
              <p className="text-xs text-text-muted font-sans mt-0.5">Aggregate Scope 1 & 2 values across 12 months</p>
            </div>
            <span className="font-mono text-xs text-accent-e px-2 py-0.5 bg-accent-e/10 border border-accent-e/20 rounded">
              Metric Tons CO₂e
            </span>
          </div>
          <div className="flex-1 min-h-0">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#2A3A31" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#8B9A8D"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#8B9A8D"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E2B24",
                      borderColor: "#2A3A31",
                      borderRadius: "6px",
                      color: "#EDEDE4",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="emissions"
                    stroke="#5FA777"
                    strokeWidth={2.5}
                    activeDot={{ r: 5 }}
                    dot={{ r: 3, strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted italic">Loading Trend...</div>
            )}
          </div>
        </AsymmetricCard>

        {/* Department Ranking Bar Chart */}
        <AsymmetricCard className="flex flex-col h-96">
          <h3 className="font-serif text-md font-semibold text-text-primary mb-1">Department ESG Leaderboard</h3>
          <p className="text-xs text-text-muted mb-4 font-sans">Current performance distribution</p>
          <div className="flex-1 min-h-0">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid stroke="#2A3A31" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="#8B9A8D" fontSize={9} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="#8B9A8D" fontSize={9} axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E2B24",
                      borderColor: "#2A3A31",
                      borderRadius: "6px",
                      color: "#EDEDE4",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="score" fill="#4C86A8" radius={[0, 4, 4, 0]} barSize={12}>
                    {deptData.map((entry, index) => {
                      const colors = ["#5FA777", "#4C86A8", "#7C6FA0", "#D98B4A", "#8B9A8D"];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted italic">Loading Rankings...</div>
            )}
          </div>
        </AsymmetricCard>
      </div>

      {/* Third Row: Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <AsymmetricCard className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4.5 w-4.5 text-accent-e animate-pulse" />
            <h3 className="font-serif text-md font-semibold text-text-primary">Recent Transactions & Event Feed</h3>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div key={act.id} className="flex gap-4 items-start p-3 border border-border-hairline/60 bg-bg-surface/50 rounded-md">
                  <div className="h-7 w-7 rounded-full bg-accent-e/10 flex items-center justify-center shrink-0 border border-accent-e/20 mt-0.5">
                    <Leaf className="h-3.5 w-3.5 text-accent-e" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-xs text-text-primary font-medium">{act.title}</span>
                      <span className="font-mono text-[9px] text-text-muted">{act.time}</span>
                    </div>
                    <p className="font-mono text-xs text-text-muted mt-1">{act.detail}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted italic text-xs text-center py-6">No recent events logged.</p>
            )}
          </div>
        </AsymmetricCard>

        {/* Quick Actions Panel */}
        <AsymmetricCard className="flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-md font-semibold text-text-primary mb-4">Quick Operations</h3>
            <div className="space-y-3">
              {/* Log Carbon */}
              <button
                onClick={() => setShowLogModal(true)}
                className="w-full flex items-center justify-between p-3.5 bg-bg-raised hover:bg-bg-raised/70 border border-border-hairline rounded-md text-xs font-semibold uppercase tracking-wider text-text-primary transition-all duration-150 border-l-[3px] border-accent-e"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="h-4.5 w-4.5 text-accent-e" />
                  <span>Log Carbon Data</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-text-muted" />
              </button>

              {/* Start Challenge */}
              <button
                onClick={() => {
                  setCurrentTab("Gamification");
                  setCurrentSubTab("Challenges");
                }}
                className="w-full flex items-center justify-between p-3.5 bg-bg-raised hover:bg-bg-raised/70 border border-border-hairline rounded-md text-xs font-semibold uppercase tracking-wider text-text-primary transition-all duration-150 border-l-[3px] border-accent-game"
              >
                <div className="flex items-center gap-2.5">
                  <Play className="h-4.5 w-4.5 text-accent-game" />
                  <span>Start Challenge</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-text-muted" />
              </button>

              {/* View Reports */}
              <button
                onClick={() => {
                  setCurrentTab("Reports");
                  setCurrentSubTab("Default Reports");
                }}
                className="w-full flex items-center justify-between p-3.5 bg-bg-raised hover:bg-bg-raised/70 border border-border-hairline rounded-md text-xs font-semibold uppercase tracking-wider text-text-primary transition-all duration-150 border-l-[3px] border-accent-s"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4.5 w-4.5 text-accent-s" />
                  <span>Generate Report</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-text-muted" />
              </button>
            </div>
          </div>

          <div className="border-t border-border-hairline/80 pt-4 mt-6">
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono bg-bg-base/40 p-2.5 rounded border border-border-hairline/40">
              <AlertCircle className="h-4 w-4 text-accent-game shrink-0" />
              <span>
                Settings: Auto emission calculations is currently{" "}
                <strong className={settings.toggles.autoEmissionCalc ? "text-accent-e" : "text-status-critical"}>
                  {settings.toggles.autoEmissionCalc ? "ACTIVE" : "INACTIVE"}
                </strong>.
              </span>
            </div>
          </div>
        </AsymmetricCard>
      </div>

      {/* Carbon Logging Modal */}
      <InteractiveModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Log Scope Carbon Emissions"
        module="E"
      >
        <form onSubmit={handleLogCarbonSubmit} className="space-y-4 font-sans text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Date</label>
              <input
                type="date"
                required
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Department</label>
              <select
                value={txDept}
                onChange={(e) => setTxDept(e.target.value)}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
              >
                {leaderboard.map((emp) => emp.department).filter((v, i, a) => a.indexOf(v) === i).map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Activity Type</label>
              <select
                value={txActivityType}
                onChange={(e) => setTxActivityType(e.target.value)}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
              >
                {emissionFactors.map((ef) => ef.activityType).filter((v, i, a) => a.indexOf(v) === i).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">
                Quantity ({selectedFactor?.unit})
              </label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                value={txQty || ""}
                onChange={(e) => setTxQty(parseFloat(e.target.value) || 0)}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Warehouse gas heater, fleet shipment #88"
              value={txDesc}
              onChange={(e) => setTxDesc(e.target.value)}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
            />
          </div>

          {/* Settings-driven layout */}
          {settings.toggles.autoEmissionCalc ? (
            <div className="bg-bg-base/60 p-3 border border-border-hairline rounded font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Emission Factor:</span>
                <span className="text-text-primary">{selectedFactor?.co2Factor} kg CO2e / {selectedFactor?.unit}</span>
              </div>
              <div className="flex justify-between border-t border-border-hairline/40 pt-1 mt-1 font-bold">
                <span className="text-accent-e">Computed CO₂e Output:</span>
                <span className="text-accent-e">{calculatedCo2.toLocaleString()} kg CO₂e</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">
                Manual CO₂e (kg CO₂e)
              </label>
              <input
                type="number"
                required
                min="0"
                value={txManualCo2 || ""}
                onChange={(e) => setTxManualCo2(parseInt(e.target.value) || 0)}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button
              type="button"
              onClick={() => setShowLogModal(false)}
              className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-e hover:bg-accent-e/80 text-bg-base font-semibold rounded"
            >
              Submit Carbon Log
            </button>
          </div>
        </form>
      </InteractiveModal>
    </div>
  );
};
export default DashboardScreen;
