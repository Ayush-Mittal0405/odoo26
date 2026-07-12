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
} from "recharts";
import { Plus, Play, FileText, Activity, AlertCircle, ArrowUpRight, Leaf } from "lucide-react";

// Light-theme chart config
const CHART = {
  grid: "#E3E8DE",
  axis: "#6B7A6E",
  tooltip: {
    contentStyle: {
      backgroundColor: "#FFFFFF",
      borderColor: "#E3E8DE",
      borderRadius: "8px",
      color: "#1B2A1F",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "11px",
      boxShadow: "0 4px 12px rgba(46,125,50,0.10)",
    },
    labelStyle: { color: "#1B2A1F", fontWeight: "600" },
  },
  // Module accent colors (light palette)
  colors: ["#2E7D32", "#3E8E7E", "#6A1B9A", "#C98A2C", "#8BC34A"],
};

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

    setTxQty(0);
    setTxManualCo2(0);
    setTxDesc("");
    setShowLogModal(false);
  };

  // Compile 12 Months aggregated data for LineChart
  const getEmissionsTrendData = () => {
    const monthlyMap: Record<string, number> = {};
    const months = [
      "Aug 2025", "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025",
      "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026",
      "Jun 2026", "Jul 2026"
    ];

    months.forEach((m) => { monthlyMap[m] = 0; });

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
      emissions: Math.round(monthlyMap[m] / 1000),
    }));
  };

  const getDeptRankingData = () => {
    const depts = ["Manufacturing", "Logistics", "Corporate", "Procurement", "R&D"];
    const baseScores: Record<string, number> = {
      Manufacturing: 72,
      Logistics: 68,
      Corporate: 88,
      Procurement: 80,
      "R&D": 84
    };

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

  // Input / select shared styling
  const inputClass = "w-full bg-bg-surface border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono text-xs";
  const selectClass = "w-full bg-bg-surface border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e text-xs";

  return (
    <div className="space-y-8">
      {/* ── KPI Growth Ring Row ────────────────────────────────────────────── */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text-primary mb-6 tracking-tight">
          ESG Performance Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <AsymmetricCard module="E" className="flex flex-col items-center">
            <h3 className="font-display text-sm font-semibold text-text-muted mb-3">Environmental Score</h3>
            <GrowthRingGauge value={eScore} label="E-PILLAR" module="E" subLabel={`${eScore}%`} />
            <p className="text-[10px] font-mono text-text-muted mt-3 text-center">
              Baseline: 70% | Target: 90%
            </p>
          </AsymmetricCard>

          <AsymmetricCard module="S" className="flex flex-col items-center">
            <h3 className="font-display text-sm font-semibold text-text-muted mb-3">Social Score</h3>
            <GrowthRingGauge value={sScore} label="S-PILLAR" module="S" subLabel={`${sScore}%`} />
            <p className="text-[10px] font-mono text-text-muted mt-3 text-center">
              Participation Rate: 68%
            </p>
          </AsymmetricCard>

          <AsymmetricCard module="G" className="flex flex-col items-center">
            <h3 className="font-display text-sm font-semibold text-text-muted mb-3">Governance Score</h3>
            <GrowthRingGauge value={gScore} label="G-PILLAR" module="G" subLabel={`${gScore}%`} />
            <p className="text-[10px] font-mono text-text-muted mt-3 text-center">
              Open Audits: 2 | Overdue: 2
            </p>
          </AsymmetricCard>

          <AsymmetricCard module="None" className="flex flex-col items-center border-l-[3px] border-accent-game">
            <h3 className="font-display text-sm font-semibold text-text-muted mb-3">Overall ESG Score</h3>
            <GrowthRingGauge
              value={overallScore}
              label="ESG SCORE"
              module="None"
              multiValues={{ E: eScore, S: sScore, G: gScore, Overall: overallScore }}
            />
            <div className="flex gap-3 text-[9px] font-mono text-text-muted mt-3">
              <span className="text-accent-e font-semibold">E:{settings.weights.environmental}%</span>
              <span className="text-accent-s font-semibold">S:{settings.weights.social}%</span>
              <span className="text-accent-g font-semibold">G:{settings.weights.governance}%</span>
            </div>
          </AsymmetricCard>
        </div>
      </section>

      {/* ── Charts Row ────────────────────────────────────────────────────── */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text-primary mb-6 tracking-tight">
          Emissions & Department Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Emissions Trend Line Chart */}
          <AsymmetricCard className="lg:col-span-2 flex flex-col" style={{ minHeight: "380px" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-base font-semibold text-text-primary">
                  Corporate CO₂e Emissions Trend
                </h3>
                <p className="text-xs text-text-muted font-sans mt-0.5">
                  Aggregate Scope 1 & 2 values across 12 months
                </p>
              </div>
              <span
                className="font-mono text-xs px-2 py-1 rounded"
                style={{
                  color: "#2E7D32",
                  backgroundColor: "rgba(46,125,50,0.08)",
                  border: "1px solid rgba(46,125,50,0.2)",
                }}
              >
                Metric Tons CO₂e
              </span>
            </div>
            {/* Bounded chart container — prevents chart overlapping adjacent elements */}
            <div className="flex-1 w-full" style={{ minHeight: "280px" }}>
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 16, left: -10, bottom: 8 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke={CHART.axis}
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    <YAxis
                      stroke={CHART.axis}
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    <Tooltip {...CHART.tooltip} />
                    <Line
                      type="monotone"
                      dataKey="emissions"
                      stroke="#2E7D32"
                      strokeWidth={2.5}
                      activeDot={{ r: 5, fill: "#2E7D32", stroke: "#FFFFFF", strokeWidth: 2 }}
                      dot={{ r: 3, fill: "#FFFFFF", stroke: "#2E7D32", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-full skeleton-shimmer rounded" />
                </div>
              )}
            </div>
          </AsymmetricCard>

          {/* Department Ranking Bar Chart */}
          <AsymmetricCard className="flex flex-col" style={{ minHeight: "380px" }}>
            <div className="mb-4">
              <h3 className="font-display text-base font-semibold text-text-primary">
                Department ESG Leaderboard
              </h3>
              <p className="text-xs text-text-muted font-sans mt-0.5">Current performance distribution</p>
            </div>
            <div className="flex-1 w-full" style={{ minHeight: "280px" }}>
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 12, left: -10, bottom: 5 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke={CHART.axis}
                      fontSize={9}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                      tick={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke={CHART.axis}
                      fontSize={9}
                      axisLine={false}
                      tickLine={false}
                      width={85}
                      tick={{ fontFamily: "'Switzer', sans-serif" }}
                    />
                    <Tooltip {...CHART.tooltip} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART.colors[index % CHART.colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-full skeleton-shimmer rounded" />
                </div>
              )}
            </div>
          </AsymmetricCard>
        </div>
      </section>

      {/* ── Activity Feed & Quick Actions ─────────────────────────────────── */}
      <section>
        <h2 className="font-display text-lg font-semibold text-text-primary mb-6 tracking-tight">
          Activity & Quick Operations
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Activity */}
          <AsymmetricCard className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1 rounded border" style={{ backgroundColor: "rgba(46,125,50,0.08)", borderColor: "rgba(46,125,50,0.18)" }}>
                <Activity size={14} strokeWidth={1.75} style={{ color: "#2E7D32" }} />
              </div>
              <h3 className="font-display text-base font-semibold text-text-primary">
                Recent Transactions & Event Feed
              </h3>
            </div>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex gap-4 items-start p-3 rounded-md transition-colors hover:bg-bg-tint"
                    style={{ border: "1px solid #E3E8DE" }}
                  >
                    <div
                      className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 border"
                      style={{
                        backgroundColor: "rgba(46,125,50,0.08)",
                        borderColor: "rgba(46,125,50,0.18)",
                      }}
                    >
                      <Leaf size={14} strokeWidth={1.75} style={{ color: "#2E7D32" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-sans text-xs text-text-primary font-semibold truncate">{act.title}</span>
                        <span className="font-mono text-[9px] text-text-muted shrink-0">{act.time}</span>
                      </div>
                      <p className="font-mono text-xs text-text-muted mt-1 truncate">{act.detail}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text-muted italic text-sm text-center py-8 font-sans">
                  No recent events logged.
                </p>
              )}
            </div>
          </AsymmetricCard>

          {/* Quick Actions Panel */}
          <AsymmetricCard className="flex flex-col justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-text-primary mb-5">Quick Operations</h3>
              <div className="space-y-3">
                {/* Log Carbon */}
                <button
                  onClick={() => setShowLogModal(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-md text-xs font-semibold uppercase tracking-wider text-text-primary transition-all duration-150 hover:bg-bg-tint group"
                  style={{
                    backgroundColor: "#F4FFF4",
                    border: "1px solid #E3E8DE",
                    borderLeft: "3px solid #2E7D32",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded border flex items-center justify-center transition-all duration-300 group-hover:bg-accent-e/20" style={{ backgroundColor: "rgba(46,125,50,0.08)", borderColor: "rgba(46,125,50,0.18)" }}>
                      <Plus size={14} strokeWidth={1.75} className="transition-transform duration-300 group-hover:rotate-90" style={{ color: "#2E7D32" }} />
                    </div>
                    <span>Log Carbon Data</span>
                  </div>
                  <ArrowUpRight size={14} strokeWidth={1.75} className="text-text-muted group-hover:text-text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>

                {/* Start Challenge */}
                <button
                  onClick={() => {
                    setCurrentTab("Gamification");
                    setCurrentSubTab("Challenges");
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-md text-xs font-semibold uppercase tracking-wider text-text-primary transition-all duration-150 hover:bg-bg-tint group"
                  style={{
                    backgroundColor: "#FDFBF6",
                    border: "1px solid #E3E8DE",
                    borderLeft: "3px solid #C98A2C",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded border flex items-center justify-center transition-all duration-300 group-hover:bg-accent-game/20" style={{ backgroundColor: "rgba(201,138,44,0.08)", borderColor: "rgba(201,138,44,0.18)" }}>
                      <Play size={14} strokeWidth={1.75} className="transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5" style={{ color: "#C98A2C" }} />
                    </div>
                    <span>Start Challenge</span>
                  </div>
                  <ArrowUpRight size={14} strokeWidth={1.75} className="text-text-muted group-hover:text-text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>

                {/* View Reports */}
                <button
                  onClick={() => {
                    setCurrentTab("Reports");
                    setCurrentSubTab("Default Reports");
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-md text-xs font-semibold uppercase tracking-wider text-text-primary transition-all duration-150 hover:bg-bg-tint group"
                  style={{
                    backgroundColor: "#FDFBF6",
                    border: "1px solid #E3E8DE",
                    borderLeft: "3px solid #3E8E7E",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded border flex items-center justify-center transition-all duration-300 group-hover:bg-accent-s/20" style={{ backgroundColor: "rgba(62,142,126,0.08)", borderColor: "rgba(62,142,126,0.18)" }}>
                      <FileText size={14} strokeWidth={1.75} className="transition-transform duration-300 group-hover:-translate-y-0.5" style={{ color: "#3E8E7E" }} />
                    </div>
                    <span>Generate Report</span>
                  </div>
                  <ArrowUpRight size={14} strokeWidth={1.75} className="text-text-muted group-hover:text-text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4" style={{ borderTop: "1px solid #E3E8DE" }}>
              <div
                className="flex items-center gap-2 text-[10px] text-text-muted font-mono p-2.5 rounded"
                style={{
                  backgroundColor: "#F4FFF4",
                  border: "1px solid #E3E8DE",
                }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "#C98A2C" }} />
                <span>
                  Auto emission calculations:{" "}
                  <strong style={{ color: settings.toggles.autoEmissionCalc ? "#2E7D32" : "#A0392B" }}>
                    {settings.toggles.autoEmissionCalc ? "ACTIVE" : "INACTIVE"}
                  </strong>
                </span>
              </div>
            </div>
          </AsymmetricCard>
        </div>
      </section>

      {/* ── Carbon Logging Modal ──────────────────────────────────────────── */}
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
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Department</label>
              <select
                value={txDept}
                onChange={(e) => setTxDept(e.target.value)}
                className={selectClass}
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
                className={selectClass}
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
                className={inputClass}
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
              className={inputClass}
            />
          </div>

          {settings.toggles.autoEmissionCalc ? (
            <div
              className="p-3 rounded font-mono text-[11px] space-y-1"
              style={{ backgroundColor: "#F4FFF4", border: "1px solid #E3E8DE" }}
            >
              <div className="flex justify-between">
                <span className="text-text-muted">Emission Factor:</span>
                <span className="text-text-primary">{selectedFactor?.co2Factor} kg CO2e / {selectedFactor?.unit}</span>
              </div>
              <div className="flex justify-between pt-1 mt-1 font-bold" style={{ borderTop: "1px solid #E3E8DE" }}>
                <span style={{ color: "#2E7D32" }}>Computed CO₂e Output:</span>
                <span style={{ color: "#2E7D32" }}>{calculatedCo2.toLocaleString()} kg CO₂e</span>
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
                className={inputClass}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3" style={{ borderTop: "1px solid #E3E8DE" }}>
            <button
              type="button"
              onClick={() => setShowLogModal(false)}
              className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary hover:bg-bg-tint transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold rounded text-white text-xs transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2E7D32" }}
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
