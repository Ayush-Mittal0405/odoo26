"use client";

import React, { useState, useEffect } from "react";
import { useEcoSphere, CSRActivity, EmployeeParticipation } from "@/context/EcoSphereContext";
import {
  DataTable,
  AsymmetricCard,
  InteractiveModal
} from "../UIComponents";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Plus, Users, ShieldAlert, Award, FileText, Check, X as XIcon, HelpCircle } from "lucide-react";

export const SocialScreen: React.FC = () => {
  const {
    currentSubTab,
    csrActivities,
    setCsrActivities,
    employeeParticipation,
    setEmployeeParticipation,
    settings,
    currentEmployee,
    addNotification
  } = useEcoSphere();

  const [mounted, setMounted] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState<string | null>(null);

  // Form States
  const [actName, setActName] = useState("");
  const [actCat, setActCat] = useState("Community");
  const [actEvidence, setActEvidence] = useState(true);

  // Join activity form details
  const [uploadProofName, setUploadProofName] = useState("");
  const [uploadProofAttached, setUploadProofAttached] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const newAct: CSRActivity = {
      id: `CSR-${Date.now().toString().slice(-3)}`,
      name: actName,
      category: actCat,
      icon: "Award",
      joinedCount: 0,
      evidenceRequired: actEvidence,
      joinedEmployees: [],
    };

    setCsrActivities((prev) => [...prev, newAct]);
    addNotification("CSR Activity Created", `Created: ${actName}`, "S");
    setActName("");
    setShowActivityModal(false);
  };

  const handleJoinClick = (actId: string) => {
    const act = csrActivities.find((a) => a.id === actId);
    if (!act) return;

    if (act.evidenceRequired && settings.toggles.evidenceReqForCsr) {
      setShowJoinModal(actId);
    } else {
      // Direct join
      joinActivity(actId, false);
    }
  };

  const joinActivity = (actId: string, hasProof: boolean, proofName?: string) => {
    const targetActivity = csrActivities.find((a) => a.id === actId);
    if (!targetActivity) return;

    // Check if already joined
    if (targetActivity.joinedEmployees.includes(currentEmployee.id)) {
      addNotification("Already Joined", "You are already registered for this activity", "S");
      return;
    }

    setCsrActivities((prev) =>
      prev.map((a) =>
        a.id === actId
          ? {
              ...a,
              joinedCount: a.joinedCount + 1,
              joinedEmployees: [...a.joinedEmployees, currentEmployee.id],
            }
          : a
      )
    );

    const newParticipation: EmployeeParticipation = {
      id: `PART-${Date.now()}`,
      employeeName: currentEmployee.name,
      activityName: targetActivity.name,
      date: new Date().toISOString().split("T")[0],
      hasProof,
      proofFileName: proofName || undefined,
      status: "pending",
    };

    setEmployeeParticipation((prev) => [newParticipation, ...prev]);
    addNotification("CSR Registered", `Joined: ${targetActivity.name}`, "S");
    
    // Close modal
    setShowJoinModal(null);
    setUploadProofAttached(false);
    setUploadProofName("");
  };

  // CSR Approve/Reject Actions
  const handleApproveParticipation = (partId: string) => {
    const part = employeeParticipation.find((p) => p.id === partId);
    if (!part) return;

    // Double-check verification rules from settings
    const requiresProof = settings.toggles.evidenceReqForCsr;
    if (requiresProof && !part.hasProof) {
      addNotification("Approval Blocked", "Evidence is missing for this activity", "System");
      return;
    }

    setEmployeeParticipation((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, status: "approved" as const } : p))
    );
    addNotification("Participation Approved", `Approved log for ${part.employeeName}`, "S");
  };

  const handleRejectParticipation = (partId: string) => {
    setEmployeeParticipation((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, status: "rejected" as const } : p))
    );
    addNotification("Participation Rejected", "Registration rejected and flagged", "S");
  };

  // Mock Diversity Charts Data
  const genderData = [
    { name: "Female", value: 43 },
    { name: "Male", value: 52 },
    { name: "Non-binary / Other", value: 5 },
  ];

  const trainingCompletionData = [
    { name: "Manufacturing", rate: 58 },
    { name: "Logistics", rate: 65 },
    { name: "Corporate", rate: 95 },
    { name: "Procurement", rate: 74 },
    { name: "R&D", rate: 89 },
  ];

  const COLORS = ["#4C86A8", "#5FA777", "#7C6FA0", "#D98B4A"];

  return (
    <div className="space-y-6">
      {currentSubTab === "CSR Activities" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-md font-semibold text-text-primary">Corporate Social Responsibility Activities</h3>
            <button
              onClick={() => setShowActivityModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-s hover:bg-accent-s/85 text-text-primary font-semibold text-xs rounded transition-colors uppercase font-mono tracking-wider"
            >
              <Plus className="h-4 w-4" /> New Activity
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {csrActivities.map((act) => {
              const hasJoined = act.joinedEmployees.includes(currentEmployee.id);
              return (
                <AsymmetricCard key={act.id} module="S" className="flex flex-col justify-between h-48">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[9px] uppercase bg-accent-s/10 border border-accent-s/25 text-accent-s px-2 py-0.5 rounded">
                        {act.category}
                      </span>
                      {act.evidenceRequired && (
                        <span className="font-mono text-[9px] uppercase bg-status-critical/10 border border-status-critical/20 text-status-critical px-2 py-0.5 rounded flex items-center gap-1">
                          <FileText className="h-3 w-3" /> Evidence Required
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-sm font-semibold text-text-primary mt-3 leading-snug">
                      {act.name}
                    </h4>
                  </div>

                  <div className="flex justify-between items-center border-t border-border-hairline/65 pt-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
                      <Users className="h-4 w-4" />
                      <span>{act.joinedCount} Joined</span>
                    </div>

                    <button
                      onClick={() => handleJoinClick(act.id)}
                      disabled={hasJoined}
                      className={`px-3 py-1.5 rounded font-mono font-semibold text-xs transition-all
                        ${hasJoined
                          ? "bg-bg-raised border border-border-hairline text-text-muted cursor-not-allowed"
                          : "bg-accent-s hover:bg-accent-s/85 text-text-primary uppercase tracking-wider"
                        }
                      `}
                    >
                      {hasJoined ? "Registered" : "Join Activity"}
                    </button>
                  </div>
                </AsymmetricCard>
              );
            })}
          </div>
        </div>
      )}

      {currentSubTab === "Employee Participation" && (
        <AsymmetricCard module="S">
          <DataTable<EmployeeParticipation>
            columns={[
              { key: "id", header: "Record ID" },
              { key: "employeeName", header: "Employee Name", render: (row) => <span className="font-sans font-medium">{row.employeeName}</span> },
              { key: "activityName", header: "CSR Activity", render: (row) => <span className="font-sans text-xs">{row.activityName}</span> },
              { key: "date", header: "Log Date" },
              {
                key: "proof",
                header: "Evidence Attachment",
                render: (row) =>
                  row.hasProof ? (
                    <span className="font-mono text-xs text-accent-s underline cursor-pointer flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-accent-s" /> {row.proofFileName || "proof_attached.pdf"}
                    </span>
                  ) : (
                    <span className="font-sans text-xs italic text-text-muted">None attached</span>
                  ),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => {
                  let badge = "bg-bg-raised border-border-hairline text-text-muted";
                  if (row.status === "approved") badge = "bg-accent-e/10 border-accent-e/25 text-accent-e";
                  else if (row.status === "rejected") badge = "bg-status-critical/10 border-status-critical/20 text-status-critical";

                  return (
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono border ${badge}`}>
                      {row.status}
                    </span>
                  );
                },
              },
              {
                key: "actions",
                header: "Approve Queue",
                render: (row) => {
                  const requiresProof = settings.toggles.evidenceReqForCsr;
                  const isApproveDisabled = requiresProof && !row.hasProof && row.status === "pending";

                  return (
                    <div className="flex gap-2">
                      <div className="relative group">
                        <button
                          onClick={() => handleApproveParticipation(row.id)}
                          disabled={row.status !== "pending" || isApproveDisabled}
                          className={`p-1.5 rounded transition-all border
                            ${row.status !== "pending"
                              ? "opacity-30 cursor-not-allowed border-transparent text-text-muted"
                              : isApproveDisabled
                                ? "bg-bg-raised border-border-hairline text-text-muted cursor-not-allowed"
                                : "bg-accent-e/10 border-accent-e/30 text-accent-e hover:bg-accent-e/20"
                            }
                          `}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        {isApproveDisabled && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-bg-base border border-border-hairline p-2 text-[10px] rounded text-status-warning w-44 z-10 text-center font-sans shadow-lg leading-normal">
                            Disabled: ESG rules require evidence file upload. Check Settings toggle.
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRejectParticipation(row.id)}
                        disabled={row.status !== "pending"}
                        className={`p-1.5 rounded border transition-all
                          ${row.status !== "pending"
                            ? "opacity-30 cursor-not-allowed border-transparent text-text-muted"
                            : "bg-status-critical/10 border-status-critical/20 text-status-critical hover:bg-status-critical/20"
                          }
                        `}
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                },
              },
            ]}
            data={employeeParticipation}
            searchKey="employeeName"
            searchPlaceholder="Search log employee..."
            module="S"
          />
        </AsymmetricCard>
      )}

      {currentSubTab === "Diversity Dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gender Distribution Pie Chart */}
          <AsymmetricCard module="S" className="flex flex-col h-96">
            <h3 className="font-serif text-md font-semibold text-text-primary mb-1">Gender Demographics</h3>
            <p className="text-xs text-text-muted mb-4 font-sans">Global workforce representation ratios</p>
            <div className="flex-1 min-h-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
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
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-sans)" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted italic">Loading Demographics...</div>
              )}
            </div>
          </AsymmetricCard>

          {/* Diversity Training Completion */}
          <AsymmetricCard module="S" className="flex flex-col h-96">
            <h3 className="font-serif text-md font-semibold text-text-primary mb-1">Diversity & Ethics Training Completion</h3>
            <p className="text-xs text-text-muted mb-4 font-sans">Completion percentage by departments</p>
            <div className="flex-1 min-h-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trainingCompletionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid stroke="#2A3A31" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#8B9A8D" fontSize={9} axisLine={false} tickLine={false} />
                    <YAxis stroke="#8B9A8D" fontSize={9} axisLine={false} tickLine={false} domain={[0, 100]} />
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
                    <Bar dataKey="rate" fill="#4C86A8" radius={[4, 4, 0, 0]} barSize={15}>
                      {trainingCompletionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted italic">Loading Rates...</div>
              )}
            </div>
          </AsymmetricCard>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Create CSR Activity Modal */}
      <InteractiveModal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} title="New CSR Activity" module="S">
        <form onSubmit={handleCreateActivity} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Activity Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Clean Energy Solar Panel Drive"
              value={actName}
              onChange={(e) => setActName(e.target.value)}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-s"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Category</label>
              <select
                value={actCat}
                onChange={(e) => setActCat(e.target.value)}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-s"
              >
                <option value="Community Support">Community Support</option>
                <option value="Environmental Cleanup">Environmental Cleanup</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Educational Empowerment">Educational Empowerment</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-text-primary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={actEvidence}
                  onChange={(e) => setActEvidence(e.target.checked)}
                  className="rounded bg-bg-base border border-border-hairline text-accent-s focus:ring-0 focus:ring-offset-0"
                />
                <span className="font-mono text-[10px] uppercase text-text-muted">Evidence Required</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button
              type="button"
              onClick={() => setShowActivityModal(false)}
              className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-accent-s hover:bg-accent-s/80 text-text-primary font-semibold rounded">
              Create Activity
            </button>
          </div>
        </form>
      </InteractiveModal>

      {/* Join CSR Action & Upload Proof Modal */}
      {showJoinModal && (
        <InteractiveModal
          isOpen={!!showJoinModal}
          onClose={() => setShowJoinModal(null)}
          title="Attach CSR Proof Evidence"
          module="S"
        >
          <div className="space-y-4 font-sans text-xs">
            <p className="text-text-muted leading-relaxed">
              This CSR activity requires an evidence file attachment to earn corporate credit. Upload your validation proof (PDF/Receipt/Photo).
            </p>

            <div className="space-y-2">
              <label className="block text-text-muted font-mono uppercase tracking-wider text-[9px]">Proof Filename</label>
              <input
                type="text"
                placeholder="e.g. cleanup_photo.png, attendance_cert.pdf"
                value={uploadProofName}
                onChange={(e) => {
                  setUploadProofName(e.target.value);
                  setUploadProofAttached(!!e.target.value);
                }}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-s font-mono"
              />
            </div>

            <div className="flex items-center gap-2 p-2 bg-bg-base border border-border-hairline/60 rounded font-mono text-[10px] text-status-warning">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Log will enter Manager approval queue. Without proof file, Approve is locked.</span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
              <button
                type="button"
                onClick={() => {
                  // Allow joining without proof, but manager can't approve if evidenceReq is true
                  joinActivity(showJoinModal, false);
                }}
                className="px-3 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary"
              >
                Skip & Register
              </button>
              <button
                type="button"
                disabled={!uploadProofAttached}
                onClick={() => {
                  joinActivity(showJoinModal, true, uploadProofName);
                }}
                className="px-4 py-2 bg-accent-s hover:bg-accent-s/80 text-text-primary font-semibold rounded disabled:opacity-50"
              >
                Upload & Join
              </button>
            </div>
          </div>
        </InteractiveModal>
      )}
    </div>
  );
};
export default SocialScreen;
