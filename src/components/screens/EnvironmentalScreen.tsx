"use client";

import React, { useState } from "react";
import { useEcoSphere, EmissionFactor, ProductProfile, CarbonTransaction, EnvironmentalGoal } from "@/context/EcoSphereContext";
import {
  DataTable,
  TableColumn,
  AsymmetricCard,
  InteractiveModal,
  GrowthProgressBar
} from "../UIComponents";
import { Plus, Edit2, Trash2, Download, AlertCircle, FileSpreadsheet } from "lucide-react";

export const EnvironmentalScreen: React.FC = () => {
  const {
    currentSubTab,
    emissionFactors,
    setEmissionFactors,
    productProfiles,
    setProductProfiles,
    carbonTransactions,
    setCarbonTransactions,
    environmentalGoals,
    setEnvironmentalGoals,
    leaderboard,
    addNotification,
    settings
  } = useEcoSphere();

  // Dialog management
  const [modalType, setModalType] = useState<"EF" | "PP" | "TX" | "GOAL" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Form States
  const [efForm, setEfForm] = useState({ name: "", activityType: "Electricity", unit: "kWh", co2Factor: 0, status: "active" as "active" | "draft" });
  const [ppForm, setPpForm] = useState({ name: "", sku: "", carbonFootprint: 0, waterFootprint: 0, recycledContent: 0, complianceScore: 90 });
  const [txForm, setTxForm] = useState({ date: "", department: "Corporate", activityType: "Electricity", description: "", quantity: 0, manualCo2: 0 });
  const [goalForm, setGoalForm] = useState({ name: "", department: "Corporate", targetCo2: 0, currentCo2: 0, deadline: "", status: "on-track" as "on-track" | "delayed" | "achieved" });

  const resetForms = () => {
    setEditId(null);
    setModalType(null);
    setEfForm({ name: "", activityType: "Electricity", unit: "kWh", co2Factor: 0, status: "active" });
    setPpForm({ name: "", sku: "", carbonFootprint: 0, waterFootprint: 0, recycledContent: 0, complianceScore: 90 });
    setTxForm({ date: new Date().toISOString().split("T")[0], department: "Corporate", activityType: "Electricity", description: "", quantity: 0, manualCo2: 0 });
    setGoalForm({ name: "", department: "Corporate", targetCo2: 0, currentCo2: 0, deadline: "", status: "on-track" });
  };

  // --- CSV Export for Environmental Goals ---
  const handleExportGoals = () => {
    const headers = ["Goal ID", "Goal Name", "Department", "Target CO2 (kg)", "Current CO2 (kg)", "Deadline", "Status"];
    const csvRows = environmentalGoals.map((g) => [
      g.id,
      `"${g.name.replace(/"/g, '""')}"`,
      g.department,
      g.targetCo2,
      g.currentCo2,
      g.deadline,
      g.status,
    ]);

    const csvContent = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ecosphere_environmental_goals_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification("Export Successful", "CSV export of Environmental Goals triggered", "System");
  };

  // --- Emission Factors CRUD ---
  const handleEfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setEmissionFactors((prev) =>
        prev.map((ef) => (ef.id === editId ? { ...ef, ...efForm } : ef))
      );
      addNotification("Emission Factor Updated", `Updated factor: ${efForm.name}`, "E");
    } else {
      const newEf: EmissionFactor = { id: `EF-${Date.now().toString().slice(-4)}`, ...efForm };
      setEmissionFactors((prev) => [...prev, newEf]);
      addNotification("Emission Factor Created", `Created factor: ${efForm.name}`, "E");
    }
    resetForms();
  };

  const handleEfEdit = (ef: EmissionFactor) => {
    setEditId(ef.id);
    setEfForm({ name: ef.name, activityType: ef.activityType, unit: ef.unit, co2Factor: ef.co2Factor, status: ef.status });
    setModalType("EF");
  };

  const handleEfDelete = (id: string) => {
    setEmissionFactors((prev) => prev.filter((ef) => ef.id !== id));
    addNotification("Emission Factor Deleted", "Emission Factor removed from directory", "E");
  };

  // --- Product ESG Profiles CRUD ---
  const handlePpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setProductProfiles((prev) =>
        prev.map((pp) => (pp.id === editId ? { ...pp, ...ppForm } : pp))
      );
      addNotification("Product Profile Updated", `Updated: ${ppForm.name}`, "E");
    } else {
      const newPp: ProductProfile = { id: `PROD-${Date.now().toString().slice(-3)}`, ...ppForm };
      setProductProfiles((prev) => [...prev, newPp]);
      addNotification("Product Profile Created", `Created: ${ppForm.name}`, "E");
    }
    resetForms();
  };

  const handlePpEdit = (pp: ProductProfile) => {
    setEditId(pp.id);
    setPpForm({ name: pp.name, sku: pp.sku, carbonFootprint: pp.carbonFootprint, waterFootprint: pp.waterFootprint, recycledContent: pp.recycledContent, complianceScore: pp.complianceScore });
    setModalType("PP");
  };

  const handlePpDelete = (id: string) => {
    setProductProfiles((prev) => prev.filter((pp) => pp.id !== id));
    addNotification("Product Profile Deleted", "Product ESG profile deleted", "E");
  };

  // --- Carbon Transactions CRUD ---
  const selectedEf = emissionFactors.find((ef) => ef.activityType === txForm.activityType && ef.status === "active");

  const calculatedCo2 = selectedEf
    ? Math.round(txForm.quantity * selectedEf.co2Factor)
    : 0;

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCo2 = settings.toggles.autoEmissionCalc ? calculatedCo2 : txForm.manualCo2;
    const finalSource = settings.toggles.autoEmissionCalc ? "Auto" : "Manual";

    const payload = {
      date: txForm.date,
      department: txForm.department,
      activityType: txForm.activityType,
      description: txForm.description || `${txForm.activityType} activity log`,
      quantity: txForm.quantity,
      unit: selectedEf?.unit || "units",
      co2e: finalCo2,
      source: finalSource as "Auto" | "Manual"
    };

    if (editId) {
      setCarbonTransactions((prev) =>
        prev.map((tx) => (tx.id === editId ? { ...tx, ...payload } : tx))
      );
      addNotification("Carbon Log Updated", `Transaction ${editId} updated`, "E");
    } else {
      const newTx: CarbonTransaction = { id: `TX-${Date.now().toString().slice(-4)}`, ...payload };
      setCarbonTransactions((prev) => [newTx, ...prev]);
      addNotification("Carbon Log Created", `Logged ${finalCo2} kg CO2e for ${txForm.department}`, "E");
    }
    resetForms();
  };

  const handleTxEdit = (tx: CarbonTransaction) => {
    setEditId(tx.id);
    setTxForm({
      date: tx.date,
      department: tx.department,
      activityType: tx.activityType,
      description: tx.description,
      quantity: tx.quantity,
      manualCo2: tx.co2e
    });
    setModalType("TX");
  };

  const handleTxDelete = (id: string) => {
    setCarbonTransactions((prev) => prev.filter((tx) => tx.id !== id));
    addNotification("Carbon Log Deleted", "Transaction removed", "E");
  };

  // --- Environmental Goals CRUD ---
  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setEnvironmentalGoals((prev) =>
        prev.map((g) => (g.id === editId ? { ...g, ...goalForm } : g))
      );
      addNotification("Environmental Goal Updated", `Goal: ${goalForm.name}`, "E");
    } else {
      const newGoal: EnvironmentalGoal = { id: `GOAL-${Date.now().toString().slice(-3)}`, ...goalForm };
      setEnvironmentalGoals((prev) => [...prev, newGoal]);
      addNotification("Environmental Goal Created", `Created: ${goalForm.name}`, "E");
    }
    resetForms();
  };

  const handleGoalEdit = (g: EnvironmentalGoal) => {
    setEditId(g.id);
    setGoalForm({ name: g.name, department: g.department, targetCo2: g.targetCo2, currentCo2: g.currentCo2, deadline: g.deadline, status: g.status });
    setModalType("GOAL");
  };

  const handleGoalDelete = (id: string) => {
    setEnvironmentalGoals((prev) => prev.filter((g) => g.id !== id));
    addNotification("Environmental Goal Deleted", "Goal removed", "E");
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab view selection */}
      {currentSubTab === "Emission Factors" && (
        <AsymmetricCard module="E">
          <DataTable<EmissionFactor>
            columns={[
              { key: "id", header: "Factor ID" },
              { key: "name", header: "Factor Name" },
              { key: "activityType", header: "Activity Type" },
              { key: "unit", header: "Unit" },
              {
                key: "co2Factor",
                header: "CO₂e Factor",
                render: (row) => <span className="font-mono text-accent-e font-semibold">{row.co2Factor}</span>,
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono border
                      ${row.status === "active" ? "bg-accent-e/10 border-accent-e/25 text-accent-e" : "bg-bg-raised border-border-hairline text-text-muted"}
                    `}
                  >
                    {row.status}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <div className="flex gap-2">
                    <button onClick={() => handleEfEdit(row)} className="text-text-muted hover:text-text-primary">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleEfDelete(row.id)} className="text-status-critical hover:opacity-85">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={emissionFactors}
            searchKey="name"
            searchPlaceholder="Search emission factors..."
            module="E"
            actionBar={
              <button
                onClick={() => setModalType("EF")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-e hover:bg-accent-e/85 text-bg-base font-semibold text-xs rounded transition-colors uppercase font-mono tracking-wider"
              >
                <Plus className="h-4 w-4" /> Add Factor
              </button>
            }
          />
        </AsymmetricCard>
      )}

      {currentSubTab === "Product ESG Profiles" && (
        <AsymmetricCard module="E">
          <DataTable<ProductProfile>
            columns={[
              { key: "id", header: "ID" },
              { key: "name", header: "Product Name" },
              { key: "sku", header: "SKU" },
              {
                key: "carbonFootprint",
                header: "Carbon Footprint",
                render: (row) => <span className="font-mono">{row.carbonFootprint} kg CO₂e</span>,
              },
              {
                key: "waterFootprint",
                header: "Water Footprint",
                render: (row) => <span className="font-mono">{row.waterFootprint} L</span>,
              },
              {
                key: "recycledContent",
                header: "Recycled %",
                render: (row) => <span className="font-mono">{row.recycledContent}%</span>,
              },
              {
                key: "complianceScore",
                header: "Compliance",
                render: (row) => (
                  <span className={`font-mono font-semibold ${row.complianceScore >= 90 ? "text-accent-e" : "text-status-warning"}`}>
                    {row.complianceScore}%
                  </span>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <div className="flex gap-2">
                    <button onClick={() => handlePpEdit(row)} className="text-text-muted hover:text-text-primary">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handlePpDelete(row.id)} className="text-status-critical hover:opacity-85">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={productProfiles}
            searchKey="name"
            searchPlaceholder="Search product profiles..."
            module="E"
            actionBar={
              <button
                onClick={() => setModalType("PP")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-e hover:bg-accent-e/85 text-bg-base font-semibold text-xs rounded transition-colors uppercase font-mono tracking-wider"
              >
                <Plus className="h-4 w-4" /> Add Profile
              </button>
            }
          />
        </AsymmetricCard>
      )}

      {currentSubTab === "Carbon Transactions" && (
        <div className="space-y-4">
          <div className="bg-bg-surface border border-border-hairline p-3 text-xs font-mono text-text-muted flex gap-2 items-center rounded leaf-card border-l-[3px] border-accent-e">
            <AlertCircle className="h-4 w-4 text-accent-e shrink-0" />
            <span>
              <strong>Note:</strong> Auto-emission calculator is {settings.toggles.autoEmissionCalc ? "active" : "inactive"}.
              Any transaction added will automatically tag the entry depending on if manual entries were allowed or computed.
            </span>
          </div>

          <AsymmetricCard module="E">
            <DataTable<CarbonTransaction>
              columns={[
                { key: "id", header: "Transaction ID" },
                { key: "date", header: "Date" },
                { key: "department", header: "Department" },
                { key: "activityType", header: "Activity" },
                { key: "description", header: "Description", render: (row) => <span className="font-sans text-xs">{row.description}</span> },
                {
                  key: "quantity",
                  header: "Quantity",
                  render: (row) => (
                    <span className="font-mono text-xs">
                      {row.quantity.toLocaleString()} {row.unit}
                    </span>
                  ),
                },
                {
                  key: "co2e",
                  header: "CO₂e Output",
                  render: (row) => <span className="font-mono text-accent-e font-bold">{row.co2e.toLocaleString()} kg</span>,
                },
                {
                  key: "source",
                  header: "Tag",
                  render: (row) => (
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-semibold border
                        ${row.source === "Auto" ? "bg-accent-e/10 border-accent-e/25 text-accent-e" : "bg-accent-game/10 border-accent-game/25 text-accent-game"}
                      `}
                    >
                      {row.source}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (row) => (
                    <div className="flex gap-2">
                      <button onClick={() => handleTxEdit(row)} className="text-text-muted hover:text-text-primary">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleTxDelete(row.id)} className="text-status-critical hover:opacity-85">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ),
                },
              ]}
              data={carbonTransactions}
              searchKey="description"
              searchPlaceholder="Search descriptions..."
              module="E"
              actionBar={
                <button
                  onClick={() => setModalType("TX")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-e hover:bg-accent-e/85 text-bg-base font-semibold text-xs rounded transition-colors uppercase font-mono tracking-wider"
                >
                  <Plus className="h-4 w-4" /> Log Carbon
                </button>
              }
            />
          </AsymmetricCard>
        </div>
      )}

      {currentSubTab === "Environmental Goals" && (
        <AsymmetricCard module="E">
          <DataTable<EnvironmentalGoal>
            columns={[
              { key: "id", header: "Goal ID" },
              { key: "name", header: "Goal Description", render: (row) => <span className="font-sans font-semibold">{row.name}</span> },
              { key: "department", header: "Department" },
              {
                key: "progress",
                header: "Emissions Deficit (Current vs. Target)",
                render: (row) => (
                  <div className="w-40 sm:w-56 py-1">
                    <GrowthProgressBar value={row.currentCo2} max={row.targetCo2} module="E" />
                  </div>
                ),
              },
              { key: "deadline", header: "Target Deadline" },
              {
                key: "status",
                header: "Status",
                render: (row) => {
                  let badge = "bg-accent-e/10 border-accent-e/25 text-accent-e";
                  if (row.status === "delayed") badge = "bg-status-critical/10 border-status-critical/20 text-status-critical";
                  else if (row.status === "on-track") badge = "bg-accent-s/10 border-accent-s/20 text-accent-s";

                  return (
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono border ${badge}`}>
                      {row.status}
                    </span>
                  );
                },
              },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <div className="flex gap-2">
                    <button onClick={() => handleGoalEdit(row)} className="text-text-muted hover:text-text-primary">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleGoalDelete(row.id)} className="text-status-critical hover:opacity-85">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={environmentalGoals}
            searchKey="name"
            searchPlaceholder="Search goals..."
            module="E"
            actionBar={
              <div className="flex gap-2">
                <button
                  onClick={handleExportGoals}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border-hairline text-text-muted hover:text-text-primary text-xs rounded transition-colors uppercase font-mono tracking-wider bg-bg-base"
                >
                  <Download className="h-4 w-4" /> Export CSV
                </button>
                <button
                  onClick={() => setModalType("GOAL")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-e hover:bg-accent-e/85 text-bg-base font-semibold text-xs rounded transition-colors uppercase font-mono tracking-wider"
                >
                  <Plus className="h-4 w-4" /> Add Goal
                </button>
              </div>
            }
          />
        </AsymmetricCard>
      )}

      {/* --- MODALS --- */}

      {/* Emission Factor Modal */}
      <InteractiveModal isOpen={modalType === "EF"} onClose={resetForms} title={editId ? "Edit Emission Factor" : "New Emission Factor"} module="E">
        <form onSubmit={handleEfSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Factor Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Natural Gas Fuel (Industrial)"
              value={efForm.name}
              onChange={(e) => setEfForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Activity Type</label>
              <select
                value={efForm.activityType}
                onChange={(e) => setEfForm((prev) => ({ ...prev, activityType: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
              >
                <option value="Electricity">Electricity</option>
                <option value="Mobile Combustion">Mobile Combustion</option>
                <option value="Stationary Combustion">Stationary Combustion</option>
                <option value="Waste">Waste</option>
              </select>
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Unit</label>
              <input
                type="text"
                required
                placeholder="e.g. kWh, gal, tons"
                value={efForm.unit}
                onChange={(e) => setEfForm((prev) => ({ ...prev, unit: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">CO₂e Factor (kg/unit)</label>
              <input
                type="number"
                step="any"
                required
                min="0"
                value={efForm.co2Factor || ""}
                onChange={(e) => setEfForm((prev) => ({ ...prev, co2Factor: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Status</label>
              <select
                value={efForm.status}
                onChange={(e) => setEfForm((prev) => ({ ...prev, status: e.target.value as any }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button type="button" onClick={resetForms} className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-accent-e hover:bg-accent-e/80 text-bg-base font-semibold rounded">
              {editId ? "Update Factor" : "Create Factor"}
            </button>
          </div>
        </form>
      </InteractiveModal>

      {/* Product Profile Modal */}
      <InteractiveModal isOpen={modalType === "PP"} onClose={resetForms} title={editId ? "Edit Product Profile" : "New Product Profile"} module="E">
        <form onSubmit={handlePpSubmit} className="space-y-4 font-sans text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Product Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Biodegradable Casting Case"
                value={ppForm.name}
                onChange={(e) => setPpForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">SKU Reference</label>
              <input
                type="text"
                required
                placeholder="e.g. BC-CA-01"
                value={ppForm.sku}
                onChange={(e) => setPpForm((prev) => ({ ...prev, sku: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Carbon Footprint (kg CO₂e)</label>
              <input
                type="number"
                step="any"
                required
                value={ppForm.carbonFootprint || ""}
                onChange={(e) => setPpForm((prev) => ({ ...prev, carbonFootprint: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Water (Liters)</label>
              <input
                type="number"
                step="any"
                required
                value={ppForm.waterFootprint || ""}
                onChange={(e) => setPpForm((prev) => ({ ...prev, waterFootprint: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Recycled %</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={ppForm.recycledContent || ""}
                onChange={(e) => setPpForm((prev) => ({ ...prev, recycledContent: parseInt(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Compliance Score %</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={ppForm.complianceScore || ""}
                onChange={(e) => setPpForm((prev) => ({ ...prev, complianceScore: parseInt(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button type="button" onClick={resetForms} className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-accent-e hover:bg-accent-e/80 text-bg-base font-semibold rounded">
              {editId ? "Update Profile" : "Create Profile"}
            </button>
          </div>
        </form>
      </InteractiveModal>

      {/* Carbon Transaction Modal */}
      <InteractiveModal isOpen={modalType === "TX"} onClose={resetForms} title={editId ? "Edit Carbon Log" : "Log Carbon Emissions"} module="E">
        <form onSubmit={handleTxSubmit} className="space-y-4 font-sans text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Date</label>
              <input
                type="date"
                required
                value={txForm.date}
                onChange={(e) => setTxForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Department</label>
              <select
                value={txForm.department}
                onChange={(e) => setTxForm((prev) => ({ ...prev, department: e.target.value }))}
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
                value={txForm.activityType}
                onChange={(e) => setTxForm((prev) => ({ ...prev, activityType: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
              >
                {emissionFactors.map((ef) => ef.activityType).filter((v, i, a) => a.indexOf(v) === i).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Quantity ({selectedEf?.unit})</label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                value={txForm.quantity || ""}
                onChange={(e) => setTxForm((prev) => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Office server cooling, freight route fuel"
              value={txForm.description}
              onChange={(e) => setTxForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
            />
          </div>

          {settings.toggles.autoEmissionCalc ? (
            <div className="bg-bg-base/60 p-3 border border-border-hairline rounded font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Emission Factor:</span>
                <span className="text-text-primary">{selectedEf?.co2Factor} kg CO2e / {selectedEf?.unit}</span>
              </div>
              <div className="flex justify-between border-t border-border-hairline/40 pt-1 mt-1 font-bold">
                <span className="text-accent-e">Calculated CO₂e Output:</span>
                <span className="text-accent-e">{calculatedCo2.toLocaleString()} kg CO₂e</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Manual CO₂e Target (kg)</label>
              <input
                type="number"
                required
                min="0"
                value={txForm.manualCo2 || ""}
                onChange={(e) => setTxForm((prev) => ({ ...prev, manualCo2: parseInt(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button type="button" onClick={resetForms} className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-accent-e hover:bg-accent-e/80 text-bg-base font-semibold rounded">
              {editId ? "Update Log" : "Log Emissions"}
            </button>
          </div>
        </form>
      </InteractiveModal>

      {/* Environmental Goal Modal */}
      <InteractiveModal isOpen={modalType === "GOAL"} onClose={resetForms} title={editId ? "Edit Goal" : "New Environmental Goal"} module="E">
        <form onSubmit={handleGoalSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Goal Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Decrease logistics fuel draw by 10%"
              value={goalForm.name}
              onChange={(e) => setGoalForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Department</label>
              <select
                value={goalForm.department}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
              >
                {leaderboard.map((emp) => emp.department).filter((v, i, a) => a.indexOf(v) === i).map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Deadline Date</label>
              <input
                type="date"
                required
                value={goalForm.deadline}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, deadline: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Current Reduction (kg CO₂)</label>
              <input
                type="number"
                required
                min="0"
                value={goalForm.currentCo2 || ""}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, currentCo2: parseInt(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Target Reduction (kg CO₂)</label>
              <input
                type="number"
                required
                min="1"
                value={goalForm.targetCo2 || ""}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, targetCo2: parseInt(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Goal Status</label>
            <select
              value={goalForm.status}
              onChange={(e) => setGoalForm((prev) => ({ ...prev, status: e.target.value as any }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e"
            >
              <option value="on-track">On-Track</option>
              <option value="delayed">Delayed</option>
              <option value="achieved">Achieved</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button type="button" onClick={resetForms} className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-accent-e hover:bg-accent-e/80 text-bg-base font-semibold rounded">
              {editId ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </form>
      </InteractiveModal>
    </div>
  );
};
export default EnvironmentalScreen;
