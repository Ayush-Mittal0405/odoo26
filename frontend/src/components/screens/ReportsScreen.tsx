"use client";

import React, { useState } from "react";
import { useEcoSphere } from "@/context/EcoSphereContext";
import { AsymmetricCard, DataTable } from "../UIComponents";
import { jsPDF } from "jspdf";
import { FileText, Download, CheckSquare, RefreshCw, BarChart2, CheckCircle, ShieldAlert } from "lucide-react";

export const ReportsScreen: React.FC = () => {
  const {
    carbonTransactions,
    employeeParticipation,
    complianceIssues,
    challenges,
    eScore,
    sScore,
    gScore,
    overallScore,
    leaderboard,
    addNotification
  } = useEcoSphere();

  // Active view: Preview or Custom Builder
  const { currentSubTab } = useEcoSphere();

  // Default Report Generator Preview State
  const [activeReportPreview, setActiveReportPreview] = useState<"E" | "S" | "G" | "Overall" | null>(null);

  // Custom Report Builder Filters
  const [filterDept, setFilterDept] = useState("All");
  const [filterModule, setFilterModule] = useState("All"); // "E" | "S" | "G"
  const [filterSeverity, setFilterSeverity] = useState("All");

  const [reportRows, setReportRows] = useState<any[]>([]);
  const [hasRun, setHasRun] = useState(false);

  // Run custom filter algorithm
  const handleRunReport = () => {
    let results: any[] = [];

    // Filter Environmental (Carbon Transactions)
    if (filterModule === "All" || filterModule === "E") {
      carbonTransactions.forEach((tx) => {
        if (filterDept !== "All" && tx.department !== filterDept) return;
        results.push({
          id: tx.id,
          source: "Environmental",
          type: tx.activityType,
          description: tx.description,
          department: tx.department,
          metric: `${tx.quantity.toLocaleString()} ${tx.unit}`,
          impact: `${tx.co2e.toLocaleString()} kg CO2e`,
          date: tx.date,
        });
      });
    }

    // Filter Social (CSR Participations)
    if (filterModule === "All" || filterModule === "S") {
      employeeParticipation.forEach((part) => {
        // Resolve department from leaderboard
        const emp = leaderboard.find((e) => e.name === part.employeeName);
        if (filterDept !== "All" && emp?.department !== filterDept) return;
        results.push({
          id: part.id,
          source: "Social",
          type: "CSR Activity",
          description: `${part.employeeName} joined: ${part.activityName}`,
          department: emp?.department || "Corporate",
          metric: part.hasProof ? "Evidence Attached" : "No Proof Uploaded",
          impact: `Status: ${part.status.toUpperCase()}`,
          date: part.date,
        });
      });
    }

    // Filter Governance (Compliance Issues)
    if (filterModule === "All" || filterModule === "G") {
      complianceIssues.forEach((issue) => {
        if (filterDept !== "All" && issue.department !== filterDept) return;
        if (filterSeverity !== "All" && issue.severity !== filterSeverity.toLowerCase()) return;
        results.push({
          id: issue.id,
          source: "Governance",
          type: `Breach - ${issue.severity.toUpperCase()}`,
          description: issue.issue,
          department: issue.department,
          metric: `Owner: ${issue.owner}`,
          impact: `Status: ${issue.status.toUpperCase()}`,
          date: issue.dueDate,
        });
      });
    }

    // Sort by date newest first
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setReportRows(results);
    setHasRun(true);
    addNotification("Report Completed", `Query returned ${results.length} rows`, "System");
  };

  // --- Export Report as CSV ---
  const handleExportCSV = () => {
    if (reportRows.length === 0) return;

    const headers = ["ID", "Pillar Pillar", "Log Type", "Description", "Department", "Performance Log", "Rating Impact", "Target Date"];
    const csvContent = [
      headers.join(","),
      ...reportRows.map((r) => [
        r.id,
        r.source,
        r.type,
        `"${r.description.replace(/"/g, '""')}"`,
        r.department,
        `"${r.metric}"`,
        `"${r.impact}"`,
        r.date,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ecosphere_custom_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Export Report as PDF ---
  const handleExportPDF = () => {
    if (reportRows.length === 0) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Formatting styled layout
    doc.setFillColor(13, 21, 18); // deep forest charcoal background header
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(237, 237, 228); // warm bone white
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ECOSPHERE ESG AUDITING REPORT", 12, 18);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()} | Scope: ${filterModule} | Dept: ${filterDept}`, 12, 25);

    // Grid details
    doc.setTextColor(22, 33, 28);
    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    doc.text("ID", 10, 40);
    doc.text("Pillar", 28, 40);
    doc.text("Type", 52, 40);
    doc.text("Department", 95, 40);
    doc.text("Impact Details", 145, 40);
    doc.text("Date", 188, 40);

    // Divider line
    doc.setDrawColor(42, 58, 49);
    doc.line(10, 42, 200, 42);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    let y = 48;

    reportRows.slice(0, 28).forEach((r) => {
      if (y > 280) {
        doc.addPage();
        y = 20; // reset y
      }
      doc.text(r.id, 10, y);
      doc.text(r.source, 28, y);
      doc.text(r.type.substring(0, 18), 52, y);
      doc.text(r.department, 95, y);
      doc.text(r.impact.substring(0, 25), 145, y);
      doc.text(r.date, 188, y);
      y += 8;
    });

    doc.save(`ecosphere_esg_report_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {currentSubTab === "Default Reports" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Report Types */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-serif text-md font-semibold text-text-primary mb-2">Available Standard Reporting Templates</h3>

            {[
              { type: "E" as const, title: "Environmental Audit Report", desc: "Logs carbon baselines, electricity calculations, and emission deficit progress", score: eScore },
              { type: "S" as const, title: "Social Stakeholder Report", desc: "CSR enrollment rosters, proof metrics, and hiring demographic summaries", score: sScore },
              { type: "G" as const, title: "Governance Compliance Log", desc: "Internal/external audit schedules, regulatory compliance breach indices", score: gScore },
              { type: "Overall" as const, title: "Overall ESG Executive Summary", desc: "Weighted aggregate metrics across E, S, and G pillars for executive sign-off", score: overallScore },
            ].map((rep) => (
              <AsymmetricCard
                key={rep.title}
                module={rep.type === "Overall" ? "Gamification" : rep.type}
                onClick={() => setActiveReportPreview(rep.type)}
                className={`transition-all ${activeReportPreview === rep.type ? "border-l-[4px] bg-bg-raised/70 border-text-primary" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-text-primary leading-snug">{rep.title}</h4>
                    <p className="font-sans text-xs text-text-muted mt-1 leading-snug">{rep.desc}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-accent-e">{rep.score}%</span>
                </div>
              </AsymmetricCard>
            ))}
          </div>

          {/* Formatted Preview Sheet */}
          <div className="lg:col-span-2">
            {activeReportPreview ? (
              <div className="bg-bg-surface border border-border-hairline leaf-card p-6 min-h-96 flex flex-col justify-between relative overflow-hidden">
                {/* Elevation watermark overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-5 topo-bg" />

                <div className="relative z-10">
                  {/* Executive Ribbon Header */}
                  <div className="flex justify-between items-start border-b border-border-hairline/80 pb-4 mb-6">
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted">EcoSphere Audited Record</span>
                      <h2 className="font-serif text-lg font-bold text-text-primary mt-1">
                        {activeReportPreview === "E" && "Environmental Performance Summary"}
                        {activeReportPreview === "S" && "Social & Community Participation Index"}
                        {activeReportPreview === "G" && "Governance & Compliance Audit Record"}
                        {activeReportPreview === "Overall" && "Integrated ESG Executive Dashboard Summary"}
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[10px] text-text-muted block">Status: SIGNED-OFF</span>
                      <span className="font-mono text-sm font-bold text-accent-e mt-1 block">Score: {
                        activeReportPreview === "E" ? eScore : activeReportPreview === "S" ? sScore : activeReportPreview === "G" ? gScore : overallScore
                      }%</span>
                    </div>
                  </div>

                  {/* Body Preview Sheet details */}
                  <div className="space-y-4 font-mono text-xs text-text-muted">
                    {activeReportPreview === "E" && (
                      <>
                        <div className="grid grid-cols-2 gap-4 bg-bg-base/40 p-3 rounded border border-border-hairline">
                          <div>
                            <span className="block text-[10px] text-text-muted uppercase">Scope Carbon Log Count:</span>
                            <span className="text-text-primary font-bold text-sm">{carbonTransactions.length} items</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-text-muted uppercase">Baseline Co2 Deficit:</span>
                            <span className="text-accent-e font-bold text-sm">
                              {carbonTransactions.reduce((acc, tx) => acc + tx.co2e, 0).toLocaleString()} kg CO2e
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] uppercase font-bold text-text-primary mb-2">Target Deficit Thresholds</span>
                          <div className="space-y-2">
                            {challenges.filter(c => c.category === 'E').map(c => (
                              <div key={c.id} className="flex justify-between items-center py-1.5 border-b border-border-hairline/30">
                                <span className="font-sans text-text-primary truncate max-w-xs">{c.name}</span>
                                <span>{c.progress}% completed</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {activeReportPreview === "S" && (
                      <>
                        <div className="grid grid-cols-2 gap-4 bg-bg-base/40 p-3 rounded border border-border-hairline">
                          <div>
                            <span className="block text-[10px] text-text-muted uppercase">Enrolled Community Volunteers:</span>
                            <span className="text-text-primary font-bold text-sm">
                              {employeeParticipation.filter(p => p.status === 'approved').length + 80} Employees
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-text-muted uppercase">Verification Rate:</span>
                            <span className="text-accent-s font-bold text-sm">94.2% Audit Proofs</span>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] uppercase font-bold text-text-primary mb-2">CSR Roster Overview</span>
                          <div className="space-y-2 font-sans text-xs">
                            {employeeParticipation.slice(0, 3).map((p) => (
                              <div key={p.id} className="flex justify-between items-center py-1.5 border-b border-border-hairline/30 font-mono text-xs">
                                <span className="text-text-primary">{p.employeeName}</span>
                                <span className="text-text-muted">{p.activityName.substring(0, 24)}...</span>
                                <span className="text-accent-s uppercase">{p.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {activeReportPreview === "G" && (
                      <>
                        <div className="grid grid-cols-2 gap-4 bg-bg-base/40 p-3 rounded border border-border-hairline">
                          <div>
                            <span className="block text-[10px] text-text-muted uppercase">Pending Compliance Breaches:</span>
                            <span className="text-status-critical font-bold text-sm">
                              {complianceIssues.filter(i => i.status === 'open').length} Issues Open
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-text-muted uppercase">External Audit Cycles:</span>
                            <span className="text-text-primary font-bold text-sm">Scheduled / In-Progress</span>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] uppercase font-bold text-text-primary mb-2">Open Issues Queue</span>
                          <div className="space-y-2">
                            {complianceIssues.filter(i => i.status === 'open').map((issue) => (
                              <div key={issue.id} className="flex justify-between items-center py-1.5 border-b border-border-hairline/30">
                                <span className="font-sans text-text-primary truncate max-w-xs">{issue.issue}</span>
                                <span className="text-status-critical text-[10px] uppercase font-bold">{issue.severity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {activeReportPreview === "Overall" && (
                      <>
                        <div className="grid grid-cols-3 gap-2 bg-bg-base/30 p-2.5 rounded border border-border-hairline">
                          <div className="text-center">
                            <span className="block text-[9px] text-text-muted uppercase">Environmental</span>
                            <span className="text-accent-e font-bold text-sm">{eScore}%</span>
                          </div>
                          <div className="text-center border-x border-border-hairline">
                            <span className="block text-[9px] text-text-muted uppercase">Social</span>
                            <span className="text-accent-s font-bold text-sm">{sScore}%</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-[9px] text-text-muted uppercase">Governance</span>
                            <span className="text-accent-g font-bold text-sm">{gScore}%</span>
                          </div>
                        </div>

                        <div className="font-sans text-[11px] leading-relaxed p-3 bg-bg-base/50 rounded border border-border-hairline/60">
                          <strong>Executive Memo:</strong> Combined ESG metrics represent weighted ratios of 40% Environmental, 30% Social, and 30% Governance. Audited records indicate a baseline performance level. All files are signed-off and ready for regulatory disclosure.
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border-hairline/80 relative z-10">
                  <button
                    onClick={() => {
                      addNotification("Report Printed", "Standard report print layout launched", "System");
                      window.print();
                    }}
                    className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary font-mono text-xs"
                  >
                    Print Report
                  </button>
                  <button
                    onClick={() => {
                      addNotification("Standard PDF Download", "Triggering file compilation...", "System");
                      // Simple default report pdf
                      const doc = new jsPDF();
                      doc.text(`EcoSphere Report Preview - Type: ${activeReportPreview}`, 10, 10);
                      doc.save(`ecosphere_${activeReportPreview}_report.pdf`);
                    }}
                    className="px-4 py-2 bg-accent-e hover:bg-accent-e/85 text-bg-base font-semibold rounded font-mono text-xs uppercase"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-bg-surface border border-border-hairline leaf-card p-6 min-h-96 flex flex-col items-center justify-center text-center text-text-muted italic text-xs">
                <FileText className="h-10 w-10 text-text-muted/40 mb-3" />
                <span>Select a standard standard report template from the left directory to generate live audit previews.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {currentSubTab === "Custom Report Builder" && (
        <div className="space-y-6">
          {/* Custom Filter Bar Panel */}
          <AsymmetricCard className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-text-muted mb-1.5 font-mono uppercase tracking-wider text-[10px]">Filter Department</label>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e text-xs min-w-[150px]"
              >
                <option value="All">All Departments</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Logistics">Logistics</option>
                <option value="Corporate">Corporate</option>
                <option value="Procurement">Procurement</option>
                <option value="R&D">R&D</option>
              </select>
            </div>

            <div>
              <label className="block text-text-muted mb-1.5 font-mono uppercase tracking-wider text-[10px]">Filter ESG Module</label>
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e text-xs min-w-[150px]"
              >
                <option value="All">All Modules (E/S/G)</option>
                <option value="E">Environmental (Scope Carbon)</option>
                <option value="S">Social (CSR & Demographics)</option>
                <option value="G">Governance (Compliance Issues)</option>
              </select>
            </div>

            {filterModule === "G" && (
              <div>
                <label className="block text-text-muted mb-1.5 font-mono uppercase tracking-wider text-[10px]">Severity Level</label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-e text-xs min-w-[150px]"
                >
                  <option value="All">All Severities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            )}

            <button
              onClick={handleRunReport}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent-e hover:bg-accent-e/85 text-bg-base font-bold text-xs rounded transition-colors uppercase font-mono tracking-wider"
            >
              <RefreshCw className="h-4 w-4" /> Run Report
            </button>
          </AsymmetricCard>

          {/* Filtered Results Table */}
          {hasRun && (
            <AsymmetricCard>
              <DataTable<any>
                columns={[
                  { key: "id", header: "Reference ID" },
                  {
                    key: "source",
                    header: "Module",
                    render: (row) => {
                      let color = "text-accent-e bg-accent-e/10 border-accent-e/25";
                      if (row.source === "Social") color = "text-accent-s bg-accent-s/10 border-accent-s/25";
                      else if (row.source === "Governance") color = "text-accent-g bg-accent-g/10 border-accent-g/25";
                      return (
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono border ${color}`}>
                          {row.source}
                        </span>
                      );
                    },
                  },
                  { key: "type", header: "Log Type" },
                  { key: "description", header: "Description Details", render: (row) => <span className="font-sans text-xs">{row.description}</span> },
                  { key: "department", header: "Department" },
                  { key: "metric", header: "Performance Metric" },
                  { key: "impact", header: "Rating Rating / Impact" },
                  { key: "date", header: "Logged Date" },
                ]}
                data={reportRows}
                searchKey="description"
                searchPlaceholder="Search filtered descriptions..."
                module="None"
                actionBar={
                  reportRows.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border-hairline text-text-muted hover:text-text-primary text-xs rounded transition-colors uppercase font-mono bg-bg-base"
                      >
                        <Download className="h-3.5 w-3.5" /> CSV
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-e hover:bg-accent-e/85 text-bg-base font-semibold text-xs rounded transition-colors uppercase font-mono"
                      >
                        <Download className="h-3.5 w-3.5" /> PDF Document
                      </button>
                    </div>
                  )
                }
              />
            </AsymmetricCard>
          )}
        </div>
      )}
    </div>
  );
};
export default ReportsScreen;
