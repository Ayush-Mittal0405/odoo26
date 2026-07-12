"use client";

import React, { useState } from "react";
import { useEcoSphere, Policy, PolicyAcknowledgement, Audit, ComplianceIssue } from "@/context/EcoSphereContext";
import {
  DataTable,
  AsymmetricCard,
  InteractiveModal
} from "../UIComponents";
import { Plus, Check, Edit2, Trash2, Download, AlertTriangle, AlertCircle, Sparkles, UserCheck } from "lucide-react";

export const GovernanceScreen: React.FC = () => {
  const {
    currentSubTab,
    policies,
    setPolicies,
    policyAcknowledgements,
    setPolicyAcknowledgements,
    audits,
    setAudits,
    complianceIssues,
    setComplianceIssues,
    leaderboard,
    addNotification
  } = useEcoSphere();

  // Modal controller
  const [modalType, setModalType] = useState<"POL" | "AUD" | "COMP" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Row Selection for Bulk Compliance Actions
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([]);

  // Forms states
  const [polForm, setPolForm] = useState({ name: "", category: "G" as "E" | "S" | "G", status: "active" as any, version: "v1.0" });
  const [audForm, setAudForm] = useState({ name: "", date: "", auditor: "", findings: 0, status: "scheduled" as any, scope: "" });
  const [compForm, setCompForm] = useState({ issue: "", severity: "medium" as any, department: "Corporate", owner: "", dueDate: "", status: "open" as any });

  const resetForms = () => {
    setModalType(null);
    setEditId(null);
    setPolForm({ name: "", category: "G", status: "active", version: "v1.0" });
    setAudForm({ name: "", date: new Date().toISOString().split("T")[0], auditor: "", findings: 0, status: "scheduled", scope: "" });
    setCompForm({ issue: "", severity: "medium", department: "Corporate", owner: "", dueDate: "", status: "open" });
  };

  // --- CSV Export for Audits ---
  const handleExportAudits = () => {
    const headers = ["Audit ID", "Audit Scope", "Auditor", "Audit Date", "Findings Count", "Status"];
    const csvRows = audits.map((a) => [
      a.id,
      `"${a.name.replace(/"/g, '""')}"`,
      a.auditor,
      a.date,
      a.findings,
      a.status,
    ]);

    const csvContent = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ecosphere_governance_audits_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification("Export Successful", "CSV export of Audits triggered", "System");
  };

  // --- Policies CRUD ---
  const handlePolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setPolicies((prev) =>
        prev.map((p) => (p.id === editId ? { ...p, ...polForm } : p))
      );
      addNotification("Policy Document Updated", `Updated: ${polForm.name}`, "G");
    } else {
      const newPol: Policy = {
        id: `POL-${Date.now().toString().slice(-3)}`,
        ...polForm,
        lastUpdated: new Date().toISOString().split("T")[0],
      };
      setPolicies((prev) => [...prev, newPol]);
      addNotification("Policy Document Created", `Drafted: ${polForm.name}`, "G");
    }
    resetForms();
  };

  const handlePolEdit = (p: Policy) => {
    setEditId(p.id);
    setPolForm({ name: p.name, category: p.category, status: p.status, version: p.version });
    setModalType("POL");
  };

  const handlePolDelete = (id: string) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    addNotification("Policy Removed", "Policy archived from database", "G");
  };

  // --- Audits CRUD ---
  const handleAudSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setAudits((prev) =>
        prev.map((a) => (a.id === editId ? { ...a, ...audForm } : a))
      );
      addNotification("Audit Record Updated", `Updated: ${audForm.name}`, "G");
    } else {
      const newAud: Audit = {
        id: `AUD-${Date.now().toString().slice(-3)}`,
        ...audForm,
      };
      setAudits((prev) => [...prev, newAud]);
      addNotification("Audit Scheduled", `Scheduled: ${audForm.name}`, "G");
    }
    resetForms();
  };

  const handleAudEdit = (a: Audit) => {
    setEditId(a.id);
    setAudForm({ name: a.name, date: a.date, auditor: a.auditor, findings: a.findings, status: a.status, scope: a.scope });
    setModalType("AUD");
  };

  const handleAudDelete = (id: string) => {
    setAudits((prev) => prev.filter((a) => a.id !== id));
    addNotification("Audit Removed", "Audit cancelled", "G");
  };

  // --- Compliance Issues CRUD ---
  const handleCompSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Owner and DueDate mandatory check
    if (!compForm.owner || !compForm.dueDate) {
      return; // Handled by standard HTML inputs but blocking programmatic submit
    }

    if (editId) {
      setComplianceIssues((prev) =>
        prev.map((c) => (c.id === editId ? { ...c, ...compForm } : c))
      );
      addNotification("Compliance Log Updated", `Updated issue: ${compForm.issue}`, "G");
    } else {
      const newComp: ComplianceIssue = {
        id: `COMP-${Date.now().toString().slice(-3)}`,
        ...compForm,
      };
      setComplianceIssues((prev) => [newComp, ...prev]);
      addNotification("Compliance Issue Logged", `Logged issue: ${compForm.issue}`, "G");
    }
    resetForms();
  };

  const handleCompEdit = (c: ComplianceIssue) => {
    setEditId(c.id);
    setCompForm({ issue: c.issue, severity: c.severity, department: c.department, owner: c.owner, dueDate: c.dueDate, status: c.status });
    setModalType("COMP");
  };

  const handleCompDelete = (id: string) => {
    setComplianceIssues((prev) => prev.filter((c) => c.id !== id));
    addNotification("Compliance Record Archived", "Issue archived", "G");
  };

  // Checkbox row toggler
  const handleSelectRow = (id: string) => {
    setSelectedIssueIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Governance Action Triggers
  const handleBulkResolve = () => {
    if (selectedIssueIds.length === 0) return;

    setComplianceIssues((prev) =>
      prev.map((c) =>
        selectedIssueIds.includes(c.id) ? { ...c, status: "resolved" as const } : c
      )
    );
    addNotification(
      "Bulk Action Resolved",
      `Marked ${selectedIssueIds.length} compliance logs as resolved`,
      "G"
    );
    setSelectedIssueIds([]);
  };

  const handleBulkMarkUnderReview = () => {
    if (selectedIssueIds.length === 0) return;

    setComplianceIssues((prev) =>
      prev.map((c) =>
        selectedIssueIds.includes(c.id) ? { ...c, status: "under-review" as const } : c
      )
    );
    addNotification(
      "Bulk Review Triggered",
      `Marked ${selectedIssueIds.length} compliance logs for audit review`,
      "G"
    );
    setSelectedIssueIds([]);
  };

  return (
    <div className="space-y-6">
      {currentSubTab === "Policies" && (
        <AsymmetricCard module="G">
          <DataTable<Policy>
            columns={[
              { key: "id", header: "Doc ID" },
              { key: "name", header: "Policy Description", render: (row) => <span className="font-sans font-medium">{row.name}</span> },
              {
                key: "category",
                header: "Pillar Target",
                render: (row) => {
                  const colors = { E: "text-accent-e bg-accent-e/10 border-accent-e/25", S: "text-accent-s bg-accent-s/10 border-accent-s/25", G: "text-accent-g bg-accent-g/10 border-accent-g/25" };
                  return (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase font-bold ${colors[row.category]}`}>
                      {row.category}-Pillar
                    </span>
                  );
                },
              },
              { key: "version", header: "Version" },
              { key: "lastUpdated", header: "Last Reviewed" },
              {
                key: "status",
                header: "Review Status",
                render: (row) => (
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono border
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
                    <button onClick={() => handlePolEdit(row)} className="text-text-muted hover:text-text-primary">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handlePolDelete(row.id)} className="text-status-critical hover:opacity-85">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={policies}
            searchKey="name"
            searchPlaceholder="Search policies..."
            module="G"
            actionBar={
              <button
                onClick={() => setModalType("POL")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-g hover:bg-accent-g/85 text-text-primary font-semibold text-xs rounded transition-colors uppercase font-mono tracking-wider"
              >
                <Plus className="h-4 w-4" /> Draft Policy
              </button>
            }
          />
        </AsymmetricCard>
      )}

      {currentSubTab === "Policy Acknowledgements" && (
        <AsymmetricCard module="G">
          <DataTable<PolicyAcknowledgement>
            columns={[
              { key: "id", header: "Ack ID" },
              { key: "employeeName", header: "Employee Name", render: (row) => <span className="font-sans font-medium">{row.employeeName}</span> },
              { key: "policyName", header: "Policy Reference", render: (row) => <span className="font-sans text-xs">{row.policyName}</span> },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono border flex items-center gap-1 w-max
                      ${row.status === "acknowledged" ? "bg-accent-e/10 border-accent-e/25 text-accent-e" : "bg-status-critical/10 border-status-critical/20 text-status-critical"}
                    `}
                  >
                    {row.status === "acknowledged" ? <UserCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {row.status}
                  </span>
                ),
              },
              { key: "date", header: "Acknowledge Date", render: (row) => row.date || <span className="text-text-muted italic text-[11px] font-sans">Pending Signoff</span> },
            ]}
            data={policyAcknowledgements}
            searchKey="employeeName"
            searchPlaceholder="Search acknowledgements..."
            module="G"
          />
        </AsymmetricCard>
      )}

      {currentSubTab === "Audits" && (
        <AsymmetricCard module="G">
          <DataTable<Audit>
            columns={[
              { key: "id", header: "Audit ID" },
              { key: "name", header: "Scope / Title", render: (row) => <span className="font-sans font-medium">{row.name}</span> },
              { key: "auditor", header: "External Auditor" },
              { key: "date", header: "Audit Date" },
              {
                key: "findings",
                header: "Critical Findings",
                render: (row) => (
                  <span className={`font-mono font-bold ${row.findings > 0 ? "text-status-critical" : "text-accent-e"}`}>
                    {row.findings}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Audit Progress",
                render: (row) => {
                  let badge = "bg-bg-raised border-border-hairline text-text-muted";
                  if (row.status === "completed") badge = "bg-accent-e/10 border-accent-e/25 text-accent-e";
                  else if (row.status === "in-progress") badge = "bg-accent-game/10 border-accent-game/20 text-accent-game animate-pulse";

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
                    <button onClick={() => handleAudEdit(row)} className="text-text-muted hover:text-text-primary">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleAudDelete(row.id)} className="text-status-critical hover:opacity-85">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={audits}
            searchKey="name"
            searchPlaceholder="Search audits..."
            module="G"
            actionBar={
              <div className="flex gap-2">
                <button
                  onClick={handleExportAudits}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border-hairline text-text-muted hover:text-text-primary text-xs rounded transition-colors uppercase font-mono tracking-wider bg-bg-base"
                >
                  <Download className="h-4 w-4" /> Export CSV
                </button>
                <button
                  onClick={() => setModalType("AUD")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-g hover:bg-accent-g/85 text-text-primary font-semibold text-xs rounded transition-colors uppercase font-mono tracking-wider"
                >
                  <Plus className="h-4 w-4" /> Schedule Audit
                </button>
              </div>
            }
          />
        </AsymmetricCard>
      )}

      {currentSubTab === "Compliance Issues" && (
        <div className="space-y-4">
          {/* Action Bar for Selected Rows */}
          {selectedIssueIds.length > 0 && (
            <div className="bg-bg-surface border border-border-hairline p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded leaf-card border-l-[3px] border-accent-game animate-slide-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-accent-game animate-bounce shrink-0" />
                <span className="font-mono text-xs text-text-primary font-semibold">
                  {selectedIssueIds.length} Governance compliance issue(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkResolve}
                  className="flex items-center gap-1 px-3 py-1 bg-accent-e hover:bg-accent-e/85 text-bg-base font-bold text-xs rounded transition-colors uppercase font-mono tracking-wider"
                >
                  <Check className="h-3.5 w-3.5" /> Resolve Selected
                </button>
                <button
                  onClick={handleBulkMarkUnderReview}
                  className="flex items-center gap-1 px-3 py-1 border border-border-hairline text-text-primary hover:bg-bg-raised font-bold text-xs rounded transition-colors uppercase font-mono tracking-wider"
                >
                  Audit Under Review
                </button>
              </div>
            </div>
          )}

          <AsymmetricCard module="G">
            <DataTable<ComplianceIssue>
              columns={[
                {
                  key: "select",
                  header: "",
                  render: (row) => (
                    <input
                      type="checkbox"
                      checked={selectedIssueIds.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="rounded bg-bg-base border border-border-hairline text-accent-g focus:ring-0 cursor-pointer h-4 w-4"
                    />
                  ),
                },
                { key: "id", header: "Issue ID" },
                { key: "issue", header: "Critical Breach / Issue", render: (row) => <span className="font-sans font-medium">{row.issue}</span> },
                {
                  key: "severity",
                  header: "Severity",
                  render: (row) => {
                    const colors = {
                      low: "bg-accent-s/10 border-accent-s/25 text-accent-s",
                      medium: "bg-accent-game/10 border-accent-game/25 text-accent-game",
                      high: "bg-status-critical/10 border-status-critical/20 text-status-critical",
                      critical: "bg-status-critical border border-transparent text-bg-base font-bold animate-pulse",
                    };
                    return (
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono border ${colors[row.severity]}`}>
                        {row.severity}
                      </span>
                    );
                  },
                },
                { key: "department", header: "Department" },
                { key: "owner", header: "Owner", render: (row) => <span className="font-sans text-xs">{row.owner}</span> },
                {
                  key: "dueDate",
                  header: "Resolution Target",
                  render: (row) => {
                    const isOverdue = new Date(row.dueDate) < new Date() && row.status === "open";
                    return (
                      <div className="flex flex-col">
                        <span className="font-mono text-xs">{row.dueDate}</span>
                        {isOverdue && (
                          <span className="font-mono text-[9px] text-status-critical uppercase font-bold tracking-wider mt-0.5 flex items-center gap-0.5">
                            <AlertCircle className="h-3 w-3 shrink-0" /> Overdue
                          </span>
                        )}
                      </div>
                    );
                  },
                },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => {
                    let badge = "bg-bg-raised border-border-hairline text-text-muted";
                    if (row.status === "resolved") badge = "bg-accent-e/10 border-accent-e/25 text-accent-e";
                    else if (row.status === "under-review") badge = "bg-accent-game/10 border-accent-game/20 text-accent-game";

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
                      <button onClick={() => handleCompEdit(row)} className="text-text-muted hover:text-text-primary">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleCompDelete(row.id)} className="text-status-critical hover:opacity-85">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ),
                },
              ]}
              data={complianceIssues}
              searchKey="issue"
              searchPlaceholder="Search compliance issues..."
              module="G"
              actionBar={
                <button
                  onClick={() => setModalType("COMP")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-g hover:bg-accent-g/85 text-text-primary font-semibold text-xs rounded transition-colors uppercase font-mono tracking-wider"
                >
                  <Plus className="h-4 w-4" /> Log Issue
                </button>
              }
            />
          </AsymmetricCard>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Policy Modal */}
      <InteractiveModal isOpen={modalType === "POL"} onClose={resetForms} title={editId ? "Edit Policy" : "New Corporate Policy"} module="G">
        <form onSubmit={handlePolSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Policy Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Scope 3 Supply Chain Mandate"
              value={polForm.name}
              onChange={(e) => setPolForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Pillar Target</label>
              <select
                value={polForm.category}
                onChange={(e) => setPolForm((prev) => ({ ...prev, category: e.target.value as any }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g"
              >
                <option value="E">Environmental (E)</option>
                <option value="S">Social (S)</option>
                <option value="G">Governance (G)</option>
              </select>
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Version</label>
              <input
                type="text"
                required
                placeholder="v1.0"
                value={polForm.version}
                onChange={(e) => setPolForm((prev) => ({ ...prev, version: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Status</label>
              <select
                value={polForm.status}
                onChange={(e) => setPolForm((prev) => ({ ...prev, status: e.target.value as any }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g"
              >
                <option value="active">Active</option>
                <option value="under-review">Under Review</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button type="button" onClick={resetForms} className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-accent-g hover:bg-accent-g/80 text-text-primary font-semibold rounded">
              {editId ? "Update Policy" : "Publish Policy"}
            </button>
          </div>
        </form>
      </InteractiveModal>

      {/* Audit Modal */}
      <InteractiveModal isOpen={modalType === "AUD"} onClose={resetForms} title={editId ? "Edit Audit Schedule" : "Schedule Auditing Run"} module="G">
        <form onSubmit={handleAudSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Audit Scope / Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 Plant B Health & Safety Audit"
              value={audForm.name}
              onChange={(e) => setAudForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">External Auditor</label>
              <input
                type="text"
                required
                placeholder="e.g. Bureau Veritas, Ernst & Young"
                value={audForm.auditor}
                onChange={(e) => setAudForm((prev) => ({ ...prev, auditor: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Target Date</label>
              <input
                type="date"
                required
                value={audForm.date}
                onChange={(e) => setAudForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Scope Range</label>
              <input
                type="text"
                required
                placeholder="e.g. HQ Office, Tier 1 Suppliers"
                value={audForm.scope}
                onChange={(e) => setAudForm((prev) => ({ ...prev, scope: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Audit Status</label>
              <select
                value={audForm.status}
                onChange={(e) => setAudForm((prev) => ({ ...prev, status: e.target.value as any }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In-Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {audForm.status === "completed" && (
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Critical Findings Count</label>
              <input
                type="number"
                min="0"
                value={audForm.findings}
                onChange={(e) => setAudForm((prev) => ({ ...prev, findings: parseInt(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g font-mono"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button type="button" onClick={resetForms} className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-accent-g hover:bg-accent-g/80 text-text-primary font-semibold rounded">
              {editId ? "Update Schedule" : "Schedule Audit"}
            </button>
          </div>
        </form>
      </InteractiveModal>

      {/* Compliance Issue Modal */}
      <InteractiveModal isOpen={modalType === "COMP"} onClose={resetForms} title={editId ? "Edit Compliance Log" : "Log Compliance Breach"} module="G">
        <form onSubmit={handleCompSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Issue / Breach Details</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Unsafe stacking of chemicals in Zone D warehouse, missing energy audits..."
              value={compForm.issue}
              onChange={(e) => setCompForm((prev) => ({ ...prev, issue: e.target.value }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Department</label>
              <select
                value={compForm.department}
                onChange={(e) => setCompForm((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g"
              >
                {leaderboard.map((emp) => emp.department).filter((v, i, a) => a.indexOf(v) === i).map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Severity Level</label>
              <select
                value={compForm.severity}
                onChange={(e) => setCompForm((prev) => ({ ...prev, severity: e.target.value as any }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g"
              >
                <option value="low">Low Severity</option>
                <option value="medium">Medium Severity</option>
                <option value="high">High Severity</option>
                <option value="critical">CRITICAL Breach</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">
                Assigned Owner <span className="text-status-critical font-bold">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Rivera, David Chen"
                value={compForm.owner}
                onChange={(e) => setCompForm((prev) => ({ ...prev, owner: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">
                Due Date Target <span className="text-status-critical font-bold">*</span>
              </label>
              <input
                type="date"
                required
                value={compForm.dueDate}
                onChange={(e) => setCompForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Status</label>
            <select
              value={compForm.status}
              onChange={(e) => setCompForm((prev) => ({ ...prev, status: e.target.value as any }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-g"
            >
              <option value="open">Open (Active)</option>
              <option value="under-review">Under Audit Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button type="button" onClick={resetForms} className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-g hover:bg-accent-g/80 text-text-primary font-semibold rounded"
            >
              {editId ? "Update Log" : "Log Issue"}
            </button>
          </div>
        </form>
      </InteractiveModal>
    </div>
  );
};
export default GovernanceScreen;
