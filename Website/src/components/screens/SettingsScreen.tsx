"use client";

import React, { useState } from "react";
import { useEcoSphere } from "@/context/EcoSphereContext";
import { AsymmetricCard, DataTable, InteractiveModal } from "../UIComponents";
import { Plus, Check, RefreshCw, HelpCircle, Save, AlertTriangle, AlertCircle, Trash2 } from "lucide-react";

export const SettingsScreen: React.FC = () => {
  const {
    currentSubTab,
    settings,
    setSettings,
    leaderboard,
    addNotification
  } = useEcoSphere();

  // CRUD States for Departments & Categories
  const [modalType, setModalType] = useState<"DEPT" | "CAT" | null>(null);
  const [deptList, setDeptList] = useState([
    { id: "DEP-1", name: "Manufacturing", head: "David Chen", budget: "$150,000" },
    { id: "DEP-2", name: "Logistics", head: "Alex Rivera", budget: "$200,000" },
    { id: "DEP-3", name: "Corporate", head: "Sarah Jenkins", budget: "$80,000" },
    { id: "DEP-4", name: "Procurement", head: "Marcus Brody", budget: "$95,000" },
    { id: "DEP-5", name: "R&D", head: "Elena Rostova", budget: "$120,000" },
  ]);
  const [catList, setCatList] = useState([
    { id: "CAT-1", name: "Scope 1 Emissions", pillar: "E", priority: "Critical" },
    { id: "CAT-2", name: "Diversity & Inclusion", pillar: "S", priority: "High" },
    { id: "CAT-3", name: "Anti-Bribery Protocol", pillar: "G", priority: "Critical" },
    { id: "CAT-4", name: "Stakeholder Relations", pillar: "S", priority: "Medium" },
  ]);

  const [deptForm, setDeptForm] = useState({ name: "", head: "", budget: "" });
  const [catForm, setCatForm] = useState({ name: "", pillar: "E", priority: "Medium" });

  // Weights Config Form State
  const [weightE, setWeightE] = useState(settings.weights.environmental);
  const [weightS, setWeightS] = useState(settings.weights.social);
  const [weightG, setWeightG] = useState(settings.weights.governance);
  const [weightError, setWeightError] = useState("");

  // Notification checkbox configurations
  const [notifBanners, setNotifBanners] = useState({
    compliance: true,
    approvals: true,
    reminders: false,
    unlocks: true,
  });

  const resetForms = () => {
    setModalType(null);
    setDeptForm({ name: "", head: "", budget: "" });
    setCatForm({ name: "", pillar: "E", priority: "Medium" });
  };

  const handleWeightSave = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = weightE + weightS + weightG;
    if (sum !== 100) {
      setWeightError(`Weights sum to ${sum}%. They must equal exactly 100%.`);
      addNotification("Configuration Error", `Weights sum to ${sum}%, but 100% is required.`, "System");
      return;
    }

    setWeightError("");
    setSettings((prev) => ({
      ...prev,
      weights: {
        environmental: weightE,
        social: weightS,
        governance: weightG,
      },
    }));
    addNotification("ESG Configuration Updated", `Weights set to E:${weightE}%, S:${weightS}%, G:${weightG}%`, "System");
  };

  const handleToggleChange = (key: keyof typeof settings.toggles) => {
    setSettings((prev) => {
      const nextToggles = { ...prev.toggles, [key]: !prev.toggles[key] };
      addNotification(
        "Behavior Rule Toggled",
        `${key} is now ${nextToggles[key] ? "ENABLED" : "DISABLED"}`,
        "System"
      );
      return { ...prev, toggles: nextToggles };
    });
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    setDeptList((prev) => [
      ...prev,
      { id: `DEP-${Date.now().toString().slice(-3)}`, ...deptForm },
    ]);
    addNotification("Department Logged", `Registered: ${deptForm.name}`, "System");
    setDeptForm({ name: "", head: "", budget: "" });
    setModalType(null);
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    setCatList((prev) => [
      ...prev,
      { id: `CAT-${Date.now().toString().slice(-3)}`, ...catForm },
    ]);
    addNotification("ESG Category Logged", `Registered: ${catForm.name}`, "System");
    setCatForm({ name: "", pillar: "E", priority: "Medium" });
    setModalType(null);
  };

  return (
    <div className="space-y-6">
      {currentSubTab === "Departments" && (
        <AsymmetricCard module="System">
          <DataTable<any>
            columns={[
              { key: "id", header: "Department ID" },
              { key: "name", header: "Department Name", render: (row) => <span className="font-sans font-medium">{row.name}</span> },
              { key: "head", header: "Department Head", render: (row) => <span className="font-sans text-xs">{row.head}</span> },
              { key: "budget", header: "Green Budget" },
              {
                key: "actions",
                header: "Archive",
                render: (row) => (
                  <button
                    onClick={() => {
                      setDeptList((prev) => prev.filter((d) => d.id !== row.id));
                      addNotification("Department Archival", "Archived from active logs", "System");
                    }}
                    className="text-status-critical hover:opacity-85"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ),
              },
            ]}
            data={deptList}
            searchKey="name"
            searchPlaceholder="Search departments..."
            module="System"
            actionBar={
              <button
                onClick={() => setModalType("DEPT")}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border-hairline text-text-primary hover:bg-bg-raised text-xs rounded transition-colors uppercase font-mono tracking-wider bg-bg-base"
              >
                <Plus className="h-4 w-4" /> Add Department
              </button>
            }
          />
        </AsymmetricCard>
      )}

      {currentSubTab === "Categories" && (
        <AsymmetricCard module="System">
          <DataTable<any>
            columns={[
              { key: "id", header: "Category ID" },
              { key: "name", header: "ESG Scope Topic", render: (row) => <span className="font-sans font-medium">{row.name}</span> },
              {
                key: "pillar",
                header: "Pillar Target",
                render: (row) => {
                  const colors = { E: "text-accent-e", S: "text-accent-s", G: "text-accent-g" };
                  return (
                    <span className={`font-mono font-bold ${colors[row.pillar as "E" | "S" | "G"]}`}>
                      {row.pillar}-Pillar
                    </span>
                  );
                },
              },
              { key: "priority", header: "Priority Ranking" },
              {
                key: "actions",
                header: "Archive",
                render: (row) => (
                  <button
                    onClick={() => {
                      setCatList((prev) => prev.filter((c) => c.id !== row.id));
                      addNotification("Archival Completed", "Category removed", "System");
                    }}
                    className="text-status-critical hover:opacity-85"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ),
              },
            ]}
            data={catList}
            searchKey="name"
            searchPlaceholder="Search category topics..."
            module="System"
            actionBar={
              <button
                onClick={() => setModalType("CAT")}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border-hairline text-text-primary hover:bg-bg-raised text-xs rounded transition-colors uppercase font-mono tracking-wider bg-bg-base"
              >
                <Plus className="h-4 w-4" /> Add Category
              </button>
            }
          />
        </AsymmetricCard>
      )}

      {currentSubTab === "ESG Configuration" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Slider Weights Form */}
          <AsymmetricCard module="System" className="flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-md font-semibold text-text-primary mb-1">Executive Dashboard Weights</h3>
              <p className="text-xs text-text-muted mb-6 font-sans">
                Tweak weights to control calculations of Overall ESG Score. Total weight contribution must sum to 100%.
              </p>

              <form onSubmit={handleWeightSave} className="space-y-5 text-xs font-sans">
                {/* Weight E */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px] uppercase text-text-muted">
                    <span>Environmental Weight</span>
                    <span className="text-accent-e font-bold">{weightE}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightE}
                    onChange={(e) => setWeightE(parseInt(e.target.value) || 0)}
                    className="w-full h-1 bg-bg-base rounded-lg appearance-none cursor-pointer accent-accent-e"
                  />
                </div>

                {/* Weight S */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px] uppercase text-text-muted">
                    <span>Social Weight</span>
                    <span className="text-accent-s font-bold">{weightS}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightS}
                    onChange={(e) => setWeightS(parseInt(e.target.value) || 0)}
                    className="w-full h-1 bg-bg-base rounded-lg appearance-none cursor-pointer accent-accent-s"
                  />
                </div>

                {/* Weight G */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[10px] uppercase text-text-muted">
                    <span>Governance Weight</span>
                    <span className="text-accent-g font-bold">{weightG}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightG}
                    onChange={(e) => setWeightG(parseInt(e.target.value) || 0)}
                    className="w-full h-1 bg-bg-base rounded-lg appearance-none cursor-pointer accent-accent-g"
                  />
                </div>

                <div className="flex justify-between border-t border-border-hairline/80 pt-4 mt-4 font-mono text-xs">
                  <span className="text-text-muted">Total Sum:</span>
                  <span className={`font-bold ${weightE + weightS + weightG === 100 ? "text-accent-e" : "text-status-critical animate-pulse"}`}>
                    {weightE + weightS + weightG}%
                  </span>
                </div>

                {weightError && (
                  <div className="bg-status-critical/10 border border-status-critical/30 p-2.5 rounded font-mono text-[10px] text-status-critical flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{weightError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-text-primary hover:opacity-85 text-bg-base font-bold text-xs rounded transition-colors uppercase font-mono tracking-wider"
                >
                  <Save className="h-4 w-4" /> Save Weights Config
                </button>
              </form>
            </div>
          </AsymmetricCard>

          {/* Toggle Configuration settings */}
          <AsymmetricCard module="System">
            <h3 className="font-serif text-md font-semibold text-text-primary mb-1">Global ESG System Operations</h3>
            <p className="text-xs text-text-muted mb-6 font-sans">
              Enable/Disable logic rules gating platform actions in real-time.
            </p>

            <div className="space-y-4">
              {[
                {
                  key: "autoEmissionCalc" as const,
                  title: "Auto Emission calculations",
                  desc: "Calculate Scope CO₂e values automatically using active factors in transactions.",
                },
                {
                  key: "evidenceReqForCsr" as const,
                  title: "Evidence Mandate on CSR Approvals",
                  desc: "Lock CSR approvals if logs do not carry a validation proof attachment file.",
                },
                {
                  key: "badgeAutoAward" as const,
                  title: "Badge Auto-Award System",
                  desc: "Trigger instant user badge unlocks when XP thresholds are passed.",
                },
                {
                  key: "complianceEmailAlert" as const,
                  title: "Compliance Severity Email Alerts",
                  desc: "Fire background system notifications when critical or high breaches are logged.",
                },
              ].map((tog) => (
                <div key={tog.key} className="flex items-start justify-between gap-4 p-3 bg-bg-base/30 rounded border border-border-hairline">
                  <div className="flex-1">
                    <h5 className="font-sans text-xs font-semibold text-text-primary">{tog.title}</h5>
                    <p className="font-sans text-[10px] text-text-muted mt-0.5 leading-snug">{tog.desc}</p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggleChange(tog.key)}
                    className={`h-5 w-9 rounded-full relative transition-all outline-none shrink-0 border border-border-hairline
                      ${settings.toggles[tog.key] ? "bg-accent-e" : "bg-bg-raised"}
                    `}
                  >
                    <span
                      className={`h-3.5 w-3.5 rounded-full bg-text-primary absolute top-[2px] transition-all
                        ${settings.toggles[tog.key] ? "left-4.5 bg-bg-base" : "left-[3px]"}
                      `}
                    />
                  </button>
                </div>
              ))}
            </div>
          </AsymmetricCard>
        </div>
      )}

      {currentSubTab === "Notification Settings" && (
        <AsymmetricCard module="System">
          <h3 className="font-serif text-md font-semibold text-text-primary mb-1">Corporate System Notifications Settings</h3>
          <p className="text-xs text-text-muted mb-6 font-sans">
            Choose what alerts trigger toast popups and register in the header bell.
          </p>

          <div className="space-y-4 max-w-md">
            {[
              { key: "compliance" as const, label: "Log alerts for overdue compliance due-dates" },
              { key: "approvals" as const, label: "Notify when manager accepts/rejects CSR logs" },
              { key: "reminders" as const, label: "Daily sign-off reminder banners for pending policies" },
              { key: "unlocks" as const, label: "Shiny banner toasts on achievement badges unlock" },
            ].map((chk) => (
              <label key={chk.key} className="flex items-start gap-3 p-3 bg-bg-base/30 hover:bg-bg-base/50 rounded border border-border-hairline cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifBanners[chk.key]}
                  onChange={() => {
                    const next = { ...notifBanners, [chk.key]: !notifBanners[chk.key] };
                    setNotifBanners(next);
                    addNotification("Alert Setup Changed", "Saved checkbox notifications updates", "System");
                  }}
                  className="rounded bg-bg-base border border-border-hairline text-accent-e focus:ring-0 focus:ring-offset-0 mt-0.5"
                />
                <span className="font-sans text-xs text-text-primary font-medium">{chk.label}</span>
              </label>
            ))}
          </div>
        </AsymmetricCard>
      )}

      {/* --- MODALS --- */}

      {/* Add Dept Modal */}
      <InteractiveModal isOpen={modalType === "DEPT"} onClose={resetForms} title="Register Corporate Department" module="System">
        <form onSubmit={handleAddDept} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Department Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Procurement & Inventory"
              value={deptForm.name}
              onChange={(e) => setDeptForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-text-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Division Head</label>
              <input
                type="text"
                required
                placeholder="e.g. Marcus Brody"
                value={deptForm.head}
                onChange={(e) => setDeptForm((prev) => ({ ...prev, head: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Baseline Allocation Budget</label>
              <input
                type="text"
                required
                placeholder="e.g. $100,000"
                value={deptForm.budget}
                onChange={(e) => setDeptForm((prev) => ({ ...prev, budget: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button type="button" onClick={resetForms} className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-text-primary text-bg-base font-bold rounded">
              Register Department
            </button>
          </div>
        </form>
      </InteractiveModal>

      {/* Add Category Modal */}
      <InteractiveModal isOpen={modalType === "CAT"} onClose={resetForms} title="Create ESG Scope Category" module="System">
        <form onSubmit={handleAddCat} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">ESG Scope Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Sustainable Packaging"
              value={catForm.name}
              onChange={(e) => setCatForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Pillar Target</label>
              <select
                value={catForm.pillar}
                onChange={(e) => setCatForm((prev) => ({ ...prev, pillar: e.target.value as any }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none"
              >
                <option value="E">Environmental (E)</option>
                <option value="S">Social (S)</option>
                <option value="G">Governance (G)</option>
              </select>
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Priority Target</label>
              <select
                value={catForm.priority}
                onChange={(e) => setCatForm((prev) => ({ ...prev, priority: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button type="button" onClick={resetForms} className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-text-primary text-bg-base font-bold rounded">
              Create Category
            </button>
          </div>
        </form>
      </InteractiveModal>
    </div>
  );
};
export default SettingsScreen;
