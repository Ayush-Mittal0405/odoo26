import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding EcoSphere database...");

  // ── Settings (singleton) ──────────────────────────────────
  await prisma.settings.upsert({
    where: { id: "settings-singleton" },
    update: {},
    create: {
      id: "settings-singleton",
      weightEnvironmental: 40,
      weightSocial: 30,
      weightGovernance: 30,
      autoEmissionCalc: true,
      evidenceReqForCsr: true,
      badgeAutoAward: true,
      complianceEmailAlert: true,
    },
  });
  console.log("✅ Settings seeded");

  // ── Employees ─────────────────────────────────────────────
  const employees = [
    { employeeId: "EMP-0882", name: "Alex Rivera", department: "Logistics", points: 1250, xp: 3400, joinedChallenges: ["CHAL-02"], badges: ["BADGE-01", "BADGE-02"] },
    { employeeId: "EMP-0101", name: "Sarah Jenkins", department: "Corporate", points: 2100, xp: 4800, joinedChallenges: ["CHAL-02", "CHAL-03"], badges: ["BADGE-01", "BADGE-02", "BADGE-03"] },
    { employeeId: "EMP-0231", name: "David Chen", department: "Manufacturing", points: 1540, xp: 3900, joinedChallenges: ["CHAL-02"], badges: ["BADGE-01", "BADGE-02"] },
    { employeeId: "EMP-0455", name: "Elena Rostova", department: "R&D", points: 950, xp: 2800, joinedChallenges: ["CHAL-01"], badges: ["BADGE-01"] },
    { employeeId: "EMP-0922", name: "Marcus Brody", department: "Procurement", points: 600, xp: 1900, joinedChallenges: [], badges: ["BADGE-01"] },
  ];
  for (const emp of employees) {
    await prisma.employee.upsert({ where: { employeeId: emp.employeeId }, update: emp, create: emp });
  }
  console.log("✅ Employees seeded");

  // ── Emission Factors ──────────────────────────────────────
  const emissionFactors = [
    { factorId: "EF-01", name: "Grid Electricity (US East)", activityType: "Electricity", unit: "kWh", co2Factor: 0.385, status: "active" },
    { factorId: "EF-02", name: "Diesel Fuel (Mobile)", activityType: "Mobile Combustion", unit: "gal", co2Factor: 10.21, status: "active" },
    { factorId: "EF-03", name: "Natural Gas (Stationary)", activityType: "Stationary Combustion", unit: "therms", co2Factor: 5.31, status: "active" },
    { factorId: "EF-04", name: "Municipal Waste (Landfilled)", activityType: "Waste", unit: "tons", co2Factor: 420.0, status: "active" },
    { factorId: "EF-05", name: "Aviation Fuel", activityType: "Mobile Combustion", unit: "gal", co2Factor: 9.75, status: "draft" },
  ];
  for (const ef of emissionFactors) {
    await prisma.emissionFactor.upsert({ where: { factorId: ef.factorId }, update: ef, create: ef });
  }
  console.log("✅ Emission Factors seeded");

  // ── Product Profiles ──────────────────────────────────────
  const productProfiles = [
    { productId: "PROD-A", name: "Bio-Polymer Eco-Casing", sku: "BP-EC-09", carbonFootprint: 1.25, waterFootprint: 14.2, recycledContent: 85, complianceScore: 98 },
    { productId: "PROD-B", name: "Industrial Steel Bracket V2", sku: "IS-B2-12", carbonFootprint: 8.40, waterFootprint: 45.0, recycledContent: 40, complianceScore: 92 },
    { productId: "PROD-C", name: "Recycled Fiber Packaging", sku: "RF-PK-45", carbonFootprint: 0.35, waterFootprint: 2.8, recycledContent: 100, complianceScore: 100 },
    { productId: "PROD-D", name: "Standard Power Adapter", sku: "SP-AD-88", carbonFootprint: 4.10, waterFootprint: 22.4, recycledContent: 15, complianceScore: 78 },
  ];
  for (const pp of productProfiles) {
    await prisma.productProfile.upsert({ where: { productId: pp.productId }, update: pp, create: pp });
  }
  console.log("✅ Product Profiles seeded");

  // ── Carbon Transactions ───────────────────────────────────
  const carbonTransactions = [
    { txId: "TX-001", date: "2026-07-05", department: "Manufacturing", activityType: "Electricity", description: "Line A assembly power draw", quantity: 45000, unit: "kWh", co2e: 17325, source: "Auto" },
    { txId: "TX-002", date: "2026-07-02", department: "Logistics", activityType: "Mobile Combustion", description: "Mid-west distribution fleet fuel", quantity: 1200, unit: "gal", co2e: 12252, source: "Manual" },
    { txId: "TX-003", date: "2026-06-25", department: "Corporate", activityType: "Electricity", description: "HQ Office cooling & servers", quantity: 18000, unit: "kWh", co2e: 6930, source: "Auto" },
    { txId: "TX-004", date: "2026-06-18", department: "Procurement", activityType: "Waste", description: "Disposal of recycled warehouse scrap", quantity: 5.5, unit: "tons", co2e: 2310, source: "Auto" },
    { txId: "TX-005", date: "2026-05-12", department: "Manufacturing", activityType: "Stationary Combustion", description: "Casting furnace gas preheat", quantity: 800, unit: "therms", co2e: 4248, source: "Manual" },
    { txId: "TX-006", date: "2026-04-10", department: "Logistics", activityType: "Mobile Combustion", description: "Inter-facility transfer fuel", quantity: 1450, unit: "gal", co2e: 14804, source: "Auto" },
    { txId: "TX-H1", date: "2025-08-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 50000, unit: "kWh", co2e: 19250, source: "Auto" },
    { txId: "TX-H2", date: "2025-09-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 52000, unit: "kWh", co2e: 20020, source: "Auto" },
    { txId: "TX-H3", date: "2025-10-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 48000, unit: "kWh", co2e: 18480, source: "Auto" },
    { txId: "TX-H4", date: "2025-11-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 44000, unit: "kWh", co2e: 16940, source: "Auto" },
    { txId: "TX-H5", date: "2025-12-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 46000, unit: "kWh", co2e: 17710, source: "Auto" },
    { txId: "TX-H6", date: "2026-01-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 41000, unit: "kWh", co2e: 15785, source: "Auto" },
    { txId: "TX-H7", date: "2026-02-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 39000, unit: "kWh", co2e: 15015, source: "Auto" },
    { txId: "TX-H8", date: "2026-03-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 42000, unit: "kWh", co2e: 16170, source: "Auto" },
    { txId: "TX-H9", date: "2026-04-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 43000, unit: "kWh", co2e: 16555, source: "Auto" },
    { txId: "TX-H10", date: "2026-05-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 45000, unit: "kWh", co2e: 17325, source: "Auto" },
    { txId: "TX-H11", date: "2026-06-15", department: "Manufacturing", activityType: "Electricity", description: "Historical Aggregated Monthly Power", quantity: 47000, unit: "kWh", co2e: 18095, source: "Auto" },
  ];
  for (const tx of carbonTransactions) {
    await prisma.carbonTransaction.upsert({ where: { txId: tx.txId }, update: tx, create: tx });
  }
  console.log("✅ Carbon Transactions seeded");

  // ── Environmental Goals ───────────────────────────────────
  const envGoals = [
    { goalId: "GOAL-01", name: "Reduce HQ Power Consumption by 15%", department: "Corporate", targetCo2: 5000, currentCo2: 3800, deadline: "2026-09-30", status: "on-track" },
    { goalId: "GOAL-02", name: "Logistics Decarbonization Fleet Run", department: "Logistics", targetCo2: 25000, currentCo2: 27500, deadline: "2026-08-31", status: "delayed" },
    { goalId: "GOAL-03", name: "Zero Waste Assembly Initiative", department: "Manufacturing", targetCo2: 12000, currentCo2: 12000, deadline: "2026-06-30", status: "achieved" },
    { goalId: "GOAL-04", name: "Reduce R&D Prototype Scrap by 20%", department: "R&D", targetCo2: 3000, currentCo2: 1400, deadline: "2026-12-31", status: "on-track" },
  ];
  for (const g of envGoals) {
    await prisma.environmentalGoal.upsert({ where: { goalId: g.goalId }, update: g, create: g });
  }
  console.log("✅ Environmental Goals seeded");

  // ── CSR Activities ────────────────────────────────────────
  const csrActivities = [
    { activityId: "CSR-01", name: "Reforestation Drive - Pune Hills", category: "Social", icon: "TreePine", joinedCount: 42, evidenceRequired: true, joinedEmployees: ["EMP-0231"] },
    { activityId: "CSR-02", name: "Local Blood Donation Drive", category: "Social", icon: "Heart", joinedCount: 18, evidenceRequired: false, joinedEmployees: [] },
    { activityId: "CSR-03", name: "Coastal Beach Cleanup Expedition", category: "Social", icon: "Waves", joinedCount: 56, evidenceRequired: true, joinedEmployees: ["EMP-0101", "EMP-0882"] },
    { activityId: "CSR-04", name: "Corporate ESG Compliance Seminar", category: "Social", icon: "GraduationCap", joinedCount: 85, evidenceRequired: false, joinedEmployees: ["EMP-0882"] },
  ];
  for (const csr of csrActivities) {
    await prisma.csrActivity.upsert({ where: { activityId: csr.activityId }, update: csr, create: csr });
  }
  console.log("✅ CSR Activities seeded");

  // ── Employee Participation ────────────────────────────────
  const participations = [
    { partId: "PART-01", employeeName: "David Chen", activityName: "Reforestation Drive - Pune Hills", date: "2026-07-10", hasProof: true, proofFileName: "pune_hill_tree_cert.pdf", status: "pending" },
    { partId: "PART-02", employeeName: "Marcus Brody", activityName: "Coastal Beach Cleanup Expedition", date: "2026-07-08", hasProof: false, status: "pending" },
    { partId: "PART-03", employeeName: "Elena Rostova", activityName: "Corporate ESG Compliance Seminar", date: "2026-07-06", hasProof: false, status: "approved" },
    { partId: "PART-04", employeeName: "Sarah Jenkins", activityName: "Reforestation Drive - Pune Hills", date: "2026-07-04", hasProof: true, proofFileName: "tree_receipt.png", status: "approved" },
  ];
  for (const p of participations) {
    await prisma.employeeParticipation.upsert({ where: { partId: p.partId }, update: p, create: p });
  }
  console.log("✅ Employee Participations seeded");

  // ── Policies ──────────────────────────────────────────────
  const policies = [
    { policyId: "POL-01", name: "Code of Ethical Sourcing", category: "G", status: "active", version: "v2.4", lastUpdated: "2026-01-15" },
    { policyId: "POL-02", name: "Supplier Green Energy Mandate", category: "E", status: "active", version: "v1.2", lastUpdated: "2026-03-10" },
    { policyId: "POL-03", name: "Inclusive Hiring & Diversity Policy", category: "S", status: "active", version: "v3.0", lastUpdated: "2025-11-20" },
    { policyId: "POL-04", name: "Whistleblower Protection Standard", category: "G", status: "under-review", version: "v4.0-draft", lastUpdated: "2026-06-01" },
  ];
  for (const pol of policies) {
    await prisma.policy.upsert({ where: { policyId: pol.policyId }, update: pol, create: pol });
  }
  console.log("✅ Policies seeded");

  // ── Policy Acknowledgements ───────────────────────────────
  const acks = [
    { ackId: "ACK-01", employeeName: "Alex Rivera", policyName: "Code of Ethical Sourcing", status: "acknowledged", date: "2026-01-20" },
    { ackId: "ACK-02", employeeName: "Sarah Jenkins", policyName: "Supplier Green Energy Mandate", status: "acknowledged", date: "2026-03-12" },
    { ackId: "ACK-03", employeeName: "Alex Rivera", policyName: "Supplier Green Energy Mandate", status: "pending", date: undefined },
    { ackId: "ACK-04", employeeName: "David Chen", policyName: "Inclusive Hiring & Diversity Policy", status: "acknowledged", date: "2025-12-05" },
    { ackId: "ACK-05", employeeName: "Elena Rostova", policyName: "Code of Ethical Sourcing", status: "pending", date: undefined },
  ];
  for (const ack of acks) {
    await prisma.policyAcknowledgement.upsert({ where: { ackId: ack.ackId }, update: ack, create: ack });
  }
  console.log("✅ Policy Acknowledgements seeded");

  // ── Audits ────────────────────────────────────────────────
  const audits = [
    { auditId: "AUD-01", name: "Q1 Supply Chain Carbon Audit", date: "2026-04-12", auditor: "SGS Global Services", findings: 2, status: "completed", scope: "Tier 1 Suppliers" },
    { auditId: "AUD-02", name: "Annual Occupational Health & Safety", date: "2026-06-20", auditor: "Bureau Veritas", findings: 0, status: "completed", scope: "Assembly Plant B" },
    { auditId: "AUD-03", name: "HQ Energy Grid Integration Audit", date: "2026-07-28", auditor: "DNV GL", findings: 0, status: "scheduled", scope: "Corporate Facilities" },
    { auditId: "AUD-04", name: "Anti-Bribery & Whistleblower Protocol Audit", date: "2026-07-02", auditor: "Ernst & Young", findings: 1, status: "in-progress", scope: "Board and Exec Staff" },
  ];
  for (const a of audits) {
    await prisma.audit.upsert({ where: { auditId: a.auditId }, update: a, create: a });
  }
  console.log("✅ Audits seeded");

  // ── Compliance Issues ─────────────────────────────────────
  const complianceIssues = [
    { issueId: "COMP-01", issue: "Unlabeled chemical drums in Yard B", severity: "high", department: "Manufacturing", owner: "David Chen", dueDate: "2026-07-05", status: "open" },
    { issueId: "COMP-02", issue: "Logistics supplier missing scope 3 emissions data", severity: "medium", department: "Logistics", owner: "Alex Rivera", dueDate: "2026-07-25", status: "open" },
    { issueId: "COMP-03", issue: "Failure to complete annual harassment training", severity: "critical", department: "Corporate", owner: "Sarah Jenkins", dueDate: "2026-06-15", status: "open" },
    { issueId: "COMP-04", issue: "Improper electronic waste disposal logging", severity: "low", department: "R&D", owner: "Elena Rostova", dueDate: "2026-07-30", status: "resolved" },
  ];
  for (const ci of complianceIssues) {
    await prisma.complianceIssue.upsert({ where: { issueId: ci.issueId }, update: ci, create: ci });
  }
  console.log("✅ Compliance Issues seeded");

  // ── Challenges ────────────────────────────────────────────
  const challenges = [
    { challengeId: "CHAL-01", name: "Recycle Hero Campaign", description: "Ensure 100% correct sorting of paper, plastic, and compost at desks for 4 weeks.", category: "E", status: "Active", xpReward: 350, pointsReward: 150, target: "4 Weeks Streak", progress: 85, duration: "4 Weeks" },
    { challengeId: "CHAL-02", name: "Eco-Commute Week", description: "Carpool, cycle, walk, or use public transport for all commutes for 5 consecutive days.", category: "E", status: "Active", xpReward: 500, pointsReward: 250, target: "5 Commutes", progress: 95, duration: "1 Week" },
    { challengeId: "CHAL-03", name: "ESG Policy Review Sprint", description: "Read and acknowledge all active corporate policies on the dashboard.", category: "G", status: "Active", xpReward: 200, pointsReward: 100, target: "All Policies", progress: 60, duration: "2 Weeks" },
    { challengeId: "CHAL-04", name: "Community Mentorship Drive", description: "Mentor high school students in local community tech programs for 10 hours.", category: "S", status: "Completed", xpReward: 600, pointsReward: 300, target: "10 Hours Mentor", progress: 100, duration: "4 Weeks" },
    { challengeId: "CHAL-05", name: "Green Procurement Initiative", description: "Migrate 80% of supply purchase logs to sustainable-certified merchants.", category: "E", status: "Draft", xpReward: 800, pointsReward: 400, target: "80% Migration", progress: 0, duration: "6 Weeks" },
  ];
  for (const ch of challenges) {
    await prisma.challenge.upsert({ where: { challengeId: ch.challengeId }, update: ch, create: ch });
  }
  console.log("✅ Challenges seeded");

  // ── Rewards ───────────────────────────────────────────────
  const rewards = [
    { rewardId: "REW-01", name: "Organic Tree Planting Dedication", description: "Plant a native species in your name in the Western Ghats sanctuary, includes certificate.", pointsRequired: 500, stock: 95, status: "active" },
    { rewardId: "REW-02", name: "Eco-Friendly Bamboo Coffee Tumbler", description: "Double-walled sustainable bamboo and stainless steel construction with leakproof lid.", pointsRequired: 350, stock: 12, status: "active" },
    { rewardId: "REW-03", name: "1-Month Public Transport Pass Subsidy", description: "Reimburse up to $80 on your local city commuter transit card.", pointsRequired: 800, stock: 5, status: "active" },
    { rewardId: "REW-04", name: "One-on-One Lunch with Chief Sustainability Officer", description: "Discuss EcoSphere metrics, clean tech career tracks, and project ideas directly.", pointsRequired: 1500, stock: 0, status: "out-of-stock" },
  ];
  for (const r of rewards) {
    await prisma.reward.upsert({ where: { rewardId: r.rewardId }, update: r, create: r });
  }
  console.log("✅ Rewards seeded");

  // ── Notifications ─────────────────────────────────────────
  const notifications = [
    { notifId: "NT-1", title: "Compliance Overdue Warning", description: "Issue 'Chemical drums in Yard B' has exceeded its due date of July 5.", category: "G", timestamp: "10:15 AM", read: false },
    { notifId: "NT-2", title: "Policy Acknowledgment Required", description: "Please review the updated 'Supplier Green Energy Mandate v1.2' policy.", category: "E", timestamp: "Yesterday", read: true },
    { notifId: "NT-3", title: "CSR Activity Approved", description: "Your participation in the Reforestation Drive has been approved! +150 XP.", category: "Gamification", timestamp: "2 days ago", read: true },
  ];
  for (const n of notifications) {
    await prisma.appNotification.upsert({ where: { notifId: n.notifId }, update: n, create: n });
  }
  console.log("✅ Notifications seeded");

  console.log("\n🎉 EcoSphere database seeded successfully!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
