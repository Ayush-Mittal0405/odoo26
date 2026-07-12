"use client";

import React, { useState } from "react";
import { useEcoSphere, Challenge, Reward, Employee } from "@/context/EcoSphereContext";
import {
  DataTable,
  AsymmetricCard,
  InteractiveModal,
  GrowthProgressBar
} from "../UIComponents";
import {
  Trophy,
  Award,
  Plus,
  Play,
  CheckCircle,
  Archive,
  ArrowRight,
  User,
  Building2,
  Lock,
  Unlock,
  ShieldCheck,
  ShoppingBag,
  Sparkles
} from "lucide-react";

export const GamificationScreen: React.FC = () => {
  const {
    currentSubTab,
    challenges,
    setChallenges,
    rewards,
    currentEmployee,
    setCurrentEmployee,
    leaderboard,
    addNotification,
    triggerRewardRedemption,
    triggerJoinChallenge
  } = useEcoSphere();

  const [challengeFilter, setChallengeFilter] = useState<Challenge["status"] | "All">("All");
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [leaderboardToggle, setLeaderboardToggle] = useState<"individual" | "department">("individual");

  // Form State
  const [newChal, setNewChal] = useState({
    name: "",
    description: "",
    category: "E" as "E" | "S" | "G",
    xpReward: 100,
    pointsReward: 50,
    target: "",
  });

  // Mock badge definitions
  const badgeDefinitions = [
    { id: "BADGE-01", name: "Green Beginner", desc: "Start your first eco-challenge", threshold: 100, icon: "Award" },
    { id: "BADGE-02", name: "Carbon Saver", desc: "Successfully log carbon reduction transactions", threshold: 1500, icon: "Trophy" },
    { id: "BADGE-03", name: "Sustainability Champion", desc: "Reach level 4 in corporate sustainability", threshold: 3000, icon: "ShieldCheck" },
    { id: "BADGE-04", name: "Team Player", desc: "Join 3 or more CSR community activities", threshold: 4500, icon: "Sparkles" },
  ];

  // Challenge CRUD Actions
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const chal: Challenge = {
      id: `CHAL-${Date.now().toString().slice(-2)}`,
      name: newChal.name,
      description: newChal.description,
      category: newChal.category,
      status: "Draft",
      xpReward: newChal.xpReward,
      pointsReward: newChal.pointsReward,
      target: newChal.target,
      progress: 0,
      duration: "4 Weeks",
    };

    setChallenges((prev) => [...prev, chal]);
    addNotification("Challenge Drafted", `Challenge: ${newChal.name} is in Draft state`, "Gamification");
    setNewChal({ name: "", description: "", category: "E", xpReward: 100, pointsReward: 50, target: "" });
    setShowChallengeModal(false);
  };

  // Enforced Lifecycle Transitions
  const handleTransitionChallenge = (chalId: string, nextStatus: Challenge["status"]) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id !== chalId) return c;

        // Validation flows: Draft -> Active, Active -> Under Review, Under Review -> Completed, Completed -> Archived
        const current = c.status;
        let allowed = false;

        if (current === "Draft" && nextStatus === "Active") allowed = true;
        else if (current === "Active" && nextStatus === "Under Review") allowed = true;
        else if (current === "Under Review" && nextStatus === "Completed") allowed = true;
        else if (current === "Completed" && nextStatus === "Archived") allowed = true;

        if (allowed) {
          addNotification(
            "Challenge Stage Changed",
            `${c.name} transitioned to ${nextStatus}`,
            "Gamification"
          );
          return { ...c, status: nextStatus };
        } else {
          addNotification(
            "Lifecycle Blocked",
            `Cannot jump stage directly from ${current} to ${nextStatus}`,
            "System"
          );
          return c;
        }
      })
    );
  };

  // CSR Approve rewards inside local state
  const handleApproveXP = (chalId: string, employeeId: string) => {
    const chal = challenges.find((c) => c.id === chalId);
    if (!chal) return;

    // Award XP/Points in real-time
    setCurrentEmployee((prev) => {
      const isAlreadyJoined = prev.joinedChallenges.includes(chalId);
      const nextXP = prev.xp + chal.xpReward;
      const nextPoints = prev.points + chal.pointsReward;

      addNotification(
        "Challenge Completion Awarded",
        `Awarded +${chal.xpReward} XP and +${chal.pointsReward} Points to Alex Rivera`,
        "Gamification"
      );

      return {
        ...prev,
        xp: nextXP,
        points: nextPoints,
        // Auto unlock badges if thresholds are passed
        badges: [
          ...prev.badges,
          ...badgeDefinitions
            .filter((badge) => nextXP >= badge.threshold && !prev.badges.includes(badge.id))
            .map((b) => b.id),
        ],
      };
    });

    // Complete the challenge
    setChallenges((prev) =>
      prev.map((c) => (c.id === chalId ? { ...c, status: "Completed" as const, progress: 100 } : c))
    );
  };

  // Compile Department Leaderboard Data
  const getDeptLeaderboardData = () => {
    const depts = ["Manufacturing", "Logistics", "Corporate", "Procurement", "R&D"];
    const sumMap: Record<string, { xp: number; count: number }> = {};

    depts.forEach((d) => {
      sumMap[d] = { xp: 0, count: 0 };
    });

    // Individual employee points contribution
    leaderboard.forEach((emp) => {
      if (sumMap[emp.department]) {
        sumMap[emp.department].xp += emp.xp;
        sumMap[emp.department].count += 1;
      }
    });

    return depts.map((d, index) => {
      const totalXP = sumMap[d].xp || 1500; // fallback seeds
      return {
        id: `DEPT-${index}`,
        rank: 0, // calculated next
        department: d,
        xp: totalXP,
        points: Math.round(totalXP * 0.35),
      };
    }).sort((a, b) => b.xp - a.xp).map((d, idx) => ({ ...d, rank: idx + 1 }));
  };

  const filteredChallenges = challenges.filter(
    (c) => challengeFilter === "All" || c.status === challengeFilter
  );

  const deptLeaderboard = getDeptLeaderboardData();

  return (
    <div className="space-y-6">
      {currentSubTab === "Challenges" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status filters pills */}
            <div className="flex flex-wrap gap-1.5 bg-bg-surface border border-border-hairline p-1 rounded-md max-w-max">
              {(["All", "Draft", "Active", "Under Review", "Completed", "Archived"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setChallengeFilter(status)}
                  className={`px-3 py-1 text-[10px] uppercase font-mono rounded font-semibold transition-all
                    ${challengeFilter === status
                      ? "bg-accent-game text-bg-base"
                      : "text-text-muted hover:text-text-primary"
                    }
                  `}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowChallengeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-game hover:bg-accent-game/85 text-bg-base font-semibold text-xs rounded transition-colors uppercase font-mono tracking-wider"
            >
              <Plus className="h-4 w-4" /> New Challenge
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.length > 0 ? (
              filteredChallenges.map((chal) => {
                const isJoined = currentEmployee.joinedChallenges.includes(chal.id);

                return (
                  <AsymmetricCard key={chal.id} module="Gamification" className="flex flex-col justify-between h-56">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[9px] uppercase bg-accent-game/10 border border-accent-game/25 text-accent-game px-2 py-0.5 rounded">
                          {chal.category}-Pillar
                        </span>
                        <span className="font-mono text-[9px] uppercase bg-bg-raised border border-border-hairline text-text-muted px-2 py-0.5 rounded">
                          {chal.status}
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-text-primary mt-3 leading-snug">
                        {chal.name}
                      </h4>
                      <p className="font-sans text-xs text-text-muted mt-1.5 leading-snug line-clamp-2">
                        {chal.description}
                      </p>
                    </div>

                    <div className="border-t border-border-hairline/65 pt-3 mt-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
                        <span>XP: +{chal.xpReward} | Pts: +{chal.pointsReward}</span>
                        <span>Target: {chal.target}</span>
                      </div>

                      {/* Transition button triggers */}
                      <div className="flex justify-between items-center gap-2 mt-1">
                        {chal.status === "Draft" && (
                          <button
                            onClick={() => handleTransitionChallenge(chal.id, "Active")}
                            className="flex items-center gap-1 text-[10px] font-mono font-bold text-accent-game hover:underline"
                          >
                            <Play className="h-3 w-3" /> Start Campaign
                          </button>
                        )}
                        {chal.status === "Active" && !isJoined && (
                          <button
                            onClick={() => triggerJoinChallenge(chal.id)}
                            className="w-full text-center py-1.5 bg-accent-game hover:bg-accent-game/85 text-bg-base font-bold text-[10px] rounded uppercase font-mono"
                          >
                            Join Challenge
                          </button>
                        )}
                        {chal.status === "Active" && isJoined && (
                          <button
                            onClick={() => handleTransitionChallenge(chal.id, "Under Review")}
                            className="flex items-center gap-1 text-[10px] font-mono font-bold text-accent-s hover:underline"
                          >
                            Submit Review <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                        {chal.status === "Under Review" && (
                          <button
                            onClick={() => handleApproveXP(chal.id, currentEmployee.id)}
                            className="flex items-center gap-1 text-[10px] font-mono font-bold text-accent-e hover:underline"
                          >
                            <CheckCircle className="h-3 w-3" /> Complete (Award XP)
                          </button>
                        )}
                        {chal.status === "Completed" && (
                          <button
                            onClick={() => handleTransitionChallenge(chal.id, "Archived")}
                            className="flex items-center gap-1 text-[10px] font-mono font-bold text-text-muted hover:underline"
                          >
                            <Archive className="h-3 w-3" /> Archive Campaign
                          </button>
                        )}
                        {chal.status === "Archived" && (
                          <span className="text-[10px] italic font-mono text-text-muted">Campaign Closed</span>
                        )}
                      </div>
                    </div>
                  </AsymmetricCard>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center text-text-muted italic text-xs bg-bg-surface border border-border-hairline rounded leaf-card">
                No challenges match this status filter.
              </div>
            )}
          </div>
        </div>
      )}

      {currentSubTab === "Challenge Participation" && (
        <AsymmetricCard module="Gamification">
          <DataTable<Challenge>
            columns={[
              { key: "id", header: "Campaign ID" },
              { key: "name", header: "Challenge Name", render: (row) => <span className="font-sans font-medium">{row.name}</span> },
              {
                key: "progress",
                header: "Campaign Metrics Progress",
                render: (row) => (
                  <div className="w-56 py-1">
                    <GrowthProgressBar value={row.progress} max={100} module="Gamification" />
                  </div>
                ),
              },
              { key: "duration", header: "Duration" },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono border
                      ${row.status === "Active" ? "bg-accent-game/10 border-accent-game/25 text-accent-game" : "bg-bg-raised border-border-hairline text-text-muted"}
                    `}
                  >
                    {row.status}
                  </span>
                ),
              },
              {
                key: "award",
                header: "Force Award",
                render: (row) => (
                  <button
                    disabled={row.status === "Completed" || row.status === "Archived"}
                    onClick={() => handleApproveXP(row.id, currentEmployee.id)}
                    className="p-1 border border-border-hairline rounded hover:bg-bg-raised text-[10px] font-mono text-accent-game disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    Force Complete
                  </button>
                ),
              },
            ]}
            data={challenges.filter((c) => c.status !== "Draft")}
            searchKey="name"
            searchPlaceholder="Search active participations..."
            module="Gamification"
          />
        </AsymmetricCard>
      )}

      {currentSubTab === "Badges" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-md font-semibold text-text-primary">Corporate ESG Achievement Badges</h3>
            <p className="text-xs text-text-muted mt-0.5">Unlocks automatically as your XP increases</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {badgeDefinitions.map((badge) => {
              const isUnlocked = currentEmployee.xp >= badge.threshold;

              return (
                <AsymmetricCard
                  key={badge.id}
                  module="Gamification"
                  className={`flex flex-col items-center p-6 text-center transition-all duration-300
                    ${isUnlocked ? "border-accent-game bg-bg-surface" : "opacity-50 border-border-hairline bg-bg-base/30"}
                  `}
                >
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center border shadow-inner mb-4
                      ${isUnlocked
                        ? "bg-accent-game/10 border-accent-game/30 text-accent-game"
                        : "bg-bg-raised border-border-hairline text-text-muted"
                      }
                    `}
                  >
                    {isUnlocked ? <Unlock className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
                  </div>

                  <h4 className="font-serif text-sm font-semibold text-text-primary leading-snug">
                    {badge.name}
                  </h4>
                  <p className="font-sans text-[11px] text-text-muted mt-1 leading-snug">
                    {badge.desc}
                  </p>

                  <div className="border-t border-border-hairline/60 pt-3 mt-4 w-full text-center">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted block">
                      Unlock Threshold
                    </span>
                    <span className="font-mono text-xs font-bold text-accent-game">
                      {badge.threshold.toLocaleString()} XP
                    </span>
                  </div>
                </AsymmetricCard>
              );
            })}
          </div>
        </div>
      )}

      {currentSubTab === "Rewards" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-bg-surface border border-border-hairline p-4 leaf-card border-l-[3px] border-accent-game">
            <div>
              <span className="font-serif text-sm text-text-muted">Available Redeemable Balance</span>
              <h4 className="font-mono text-xl font-bold text-accent-game mt-0.5">
                {currentEmployee.points.toLocaleString()} <span className="text-xs text-text-muted">Points</span>
              </h4>
            </div>
            <div className="p-2 bg-accent-game/10 rounded-full border border-accent-game/20">
              <ShoppingBag className="h-6 w-6 text-accent-game" />
            </div>
          </div>

          {/* Catalog Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewards.map((rew) => {
              const hasInsufficientBalance = currentEmployee.points < rew.pointsRequired;
              const isOutOfStock = rew.stock <= 0;
              const isRedeemDisabled = hasInsufficientBalance || isOutOfStock;

              return (
                <AsymmetricCard key={rew.id} module="Gamification" className="flex flex-col justify-between p-5 h-44">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-sm font-semibold text-text-primary leading-snug">
                        {rew.name}
                      </h4>
                      <span className="font-mono text-xs font-bold text-accent-game whitespace-nowrap bg-accent-game/10 px-2 py-0.5 border border-accent-game/20 rounded">
                        {rew.pointsRequired} pts
                      </span>
                    </div>
                    <p className="font-sans text-[11px] text-text-muted mt-1.5 leading-snug line-clamp-2">
                      {rew.description}
                    </p>
                  </div>

                  <div className="border-t border-border-hairline/65 pt-3 mt-4 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-text-muted">
                      Stock:{" "}
                      <strong className={isOutOfStock ? "text-status-critical" : "text-text-primary"}>
                        {rew.stock} left
                      </strong>
                    </span>

                    <button
                      onClick={() => triggerRewardRedemption(rew.id)}
                      disabled={isRedeemDisabled}
                      className={`px-3 py-1.5 rounded font-mono font-semibold text-xs transition-all uppercase tracking-wider
                        ${isRedeemDisabled
                          ? "bg-bg-raised border border-border-hairline text-text-muted cursor-not-allowed"
                          : "bg-accent-game hover:bg-accent-game/85 text-bg-base"
                        }
                      `}
                    >
                      {isOutOfStock ? "Out of Stock" : hasInsufficientBalance ? "Insufficient pts" : "Redeem Item"}
                    </button>
                  </div>
                </AsymmetricCard>
              );
            })}
          </div>
        </div>
      )}

      {currentSubTab === "Leaderboard" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-md font-semibold text-text-primary">Corporate ESG Standings</h3>
              <p className="text-xs text-text-muted mt-0.5">Points aggregated from logs and acknowledgements</p>
            </div>

            {/* Individual vs. Department toggler */}
            <div className="flex border border-border-hairline p-0.5 rounded bg-bg-surface">
              <button
                onClick={() => setLeaderboardToggle("individual")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded font-semibold transition-all
                  ${leaderboardToggle === "individual" ? "bg-bg-raised text-text-primary border border-border-hairline/60" : "text-text-muted hover:text-text-primary"}
                `}
              >
                <User className="h-3.5 w-3.5" /> Individual
              </button>
              <button
                onClick={() => setLeaderboardToggle("department")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded font-semibold transition-all
                  ${leaderboardToggle === "department" ? "bg-bg-raised text-text-primary border border-border-hairline/60" : "text-text-muted hover:text-text-primary"}
                `}
              >
                <Building2 className="h-3.5 w-3.5" /> Department
              </button>
            </div>
          </div>

          <AsymmetricCard module="Gamification">
            {leaderboardToggle === "individual" ? (
              <DataTable<Employee>
                columns={[
                  {
                    key: "rank",
                    header: "Rank",
                    render: (row) => {
                      const idx = leaderboard.findIndex((e) => e.id === row.id) + 1;
                      return <span className={`font-mono font-bold ${idx <= 3 ? "text-accent-game" : ""}`}>#{idx}</span>;
                    },
                  },
                  { key: "name", header: "Employee Name", render: (row) => <span className="font-sans font-medium">{row.name}</span> },
                  { key: "department", header: "Department" },
                  {
                    key: "xp",
                    header: "Earned XP",
                    render: (row) => <span className="font-mono text-accent-game font-semibold">{row.xp.toLocaleString()} XP</span>,
                  },
                  {
                    key: "points",
                    header: "Points Balance",
                    render: (row) => <span className="font-mono">{row.points.toLocaleString()} pts</span>,
                  },
                ]}
                data={leaderboard}
                searchKey="name"
                searchPlaceholder="Search rank..."
                module="Gamification"
              />
            ) : (
              <DataTable<any>
                columns={[
                  { key: "rank", header: "Rank", render: (row) => <span className="font-mono font-bold text-accent-game">#{row.rank}</span> },
                  { key: "department", header: "Department", render: (row) => <span className="font-sans font-medium">{row.department}</span> },
                  {
                    key: "xp",
                    header: "Aggregated XP",
                    render: (row) => <span className="font-mono text-accent-game font-semibold">{row.xp.toLocaleString()} XP</span>,
                  },
                  {
                    key: "points",
                    header: "Aggregated Points",
                    render: (row) => <span className="font-mono">{row.points.toLocaleString()} pts</span>,
                  },
                ]}
                data={deptLeaderboard}
                module="Gamification"
              />
            )}
          </AsymmetricCard>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* New Challenge Modal */}
      <InteractiveModal isOpen={showChallengeModal} onClose={() => setShowChallengeModal(false)} title="Create New Campaign" module="Gamification">
        <form onSubmit={handleCreateChallenge} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Campaign Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Zero-Waste Cafeteria Sprint"
              value={newChal.name}
              onChange={(e) => setNewChal((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-game"
            />
          </div>

          <div>
            <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Description</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Reduce disposable cups, separate compostables correctly..."
              value={newChal.description}
              onChange={(e) => setNewChal((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-game font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">ESG Pillar Category</label>
              <select
                value={newChal.category}
                onChange={(e) => setNewChal((prev) => ({ ...prev, category: e.target.value as any }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-game"
              >
                <option value="E">Environmental (E)</option>
                <option value="S">Social (S)</option>
                <option value="G">Governance (G)</option>
              </select>
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Completion Goal Target</label>
              <input
                type="text"
                required
                placeholder="e.g. 4 Weeks Active, 10 Audits acknowledge"
                value={newChal.target}
                onChange={(e) => setNewChal((prev) => ({ ...prev, target: e.target.value }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-game font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">XP Reward</label>
              <input
                type="number"
                min="10"
                required
                value={newChal.xpReward || ""}
                onChange={(e) => setNewChal((prev) => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-game font-mono"
              />
            </div>
            <div>
              <label className="block text-text-muted mb-1 font-mono uppercase tracking-wider text-[10px]">Points Reward</label>
              <input
                type="number"
                min="5"
                required
                value={newChal.pointsReward || ""}
                onChange={(e) => setNewChal((prev) => ({ ...prev, pointsReward: parseInt(e.target.value) || 0 }))}
                className="w-full bg-bg-base border border-border-hairline rounded p-2 text-text-primary focus:outline-none focus:border-accent-game font-mono"
              />
            </div>
          </div>

          <div className="flex gap-2 p-2.5 bg-bg-base border border-border-hairline/80 rounded font-mono text-[10px] text-text-muted">
            <Trophy className="h-4.5 w-4.5 text-accent-game shrink-0" />
            <span>Campaign initializes in Draft. Move stage to Active to publish for all staff.</span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-hairline">
            <button type="button" onClick={() => setShowChallengeModal(false)} className="px-4 py-2 border border-border-hairline rounded text-text-muted hover:text-text-primary">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-accent-game hover:bg-accent-game/85 text-bg-base font-semibold rounded">
              Draft Campaign
            </button>
          </div>
        </form>
      </InteractiveModal>
    </div>
  );
};
export default GamificationScreen;
