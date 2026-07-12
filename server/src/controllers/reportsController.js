const prisma = require("../config/db");

// ============================================================
// GET /api/reports/environmental
// ============================================================
exports.getEnvironmentalReport = async (req, res) => {
  try {
    // Carbon by department
    const carbonByDept = await prisma.carbonTransaction.groupBy({
      by: ["departmentId"],
      _sum: { co2Emitted: true },
      _count: true,
    });

    // Enrich with department names
    const departments = await prisma.department.findMany({
      select: { id: true, name: true, code: true },
    });
    const deptMap = Object.fromEntries(departments.map((d) => [d.id, d]));

    const carbonBreakdown = carbonByDept.map((item) => ({
      department: deptMap[item.departmentId] || { name: "Unknown" },
      totalCo2: Number(item._sum.co2Emitted || 0),
      transactionCount: item._count,
    }));

    // Carbon by source type
    const carbonBySource = await prisma.carbonTransaction.groupBy({
      by: ["sourceType"],
      _sum: { co2Emitted: true },
      _count: true,
    });

    // Goals progress
    const goals = await prisma.environmentalGoal.findMany({
      include: { department: { select: { name: true } } },
    });

    // Total carbon
    const totalCarbon = await prisma.carbonTransaction.aggregate({
      _sum: { co2Emitted: true },
    });

    // Product profiles summary
    const productCount = await prisma.productEsgProfile.count();
    const recyclableCount = await prisma.productEsgProfile.count({ where: { recyclable: true } });

    res.json({
      success: true,
      data: {
        totalCarbon: Number(totalCarbon._sum.co2Emitted || 0),
        carbonBreakdown,
        carbonBySource,
        goals,
        products: { total: productCount, recyclable: recyclableCount },
      },
    });
  } catch (error) {
    console.error("getEnvironmentalReport error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/reports/social
// ============================================================
exports.getSocialReport = async (req, res) => {
  try {
    // Activity counts by status
    const activityStats = await prisma.csrActivity.groupBy({
      by: ["status"],
      _count: true,
    });

    // Participation stats
    const participationStats = await prisma.employeeParticipation.groupBy({
      by: ["approvalStatus"],
      _count: true,
      _sum: { pointsEarned: true },
    });

    // Top participants
    const topParticipants = await prisma.employee.findMany({
      take: 10,
      orderBy: { pointsBalance: "desc" },
      select: {
        id: true,
        name: true,
        pointsBalance: true,
        department: { select: { name: true } },
        _count: { select: { employeeParticipations: true } },
      },
    });

    // Activities by department
    const activitiesByDept = await prisma.csrActivity.groupBy({
      by: ["departmentId"],
      _count: true,
    });

    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
    });
    const deptMap = Object.fromEntries(departments.map((d) => [d.id, d]));

    const deptBreakdown = activitiesByDept.map((item) => ({
      department: deptMap[item.departmentId] || { name: "Unknown" },
      activityCount: item._count,
    }));

    res.json({
      success: true,
      data: {
        activityStats,
        participationStats,
        topParticipants,
        activitiesByDepartment: deptBreakdown,
      },
    });
  } catch (error) {
    console.error("getSocialReport error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/reports/governance
// ============================================================
exports.getGovernanceReport = async (req, res) => {
  try {
    // Policy compliance
    const totalPolicies = await prisma.esgPolicy.count({ where: { status: "PUBLISHED" } });
    const totalAcks = await prisma.policyAcknowledgement.count({ where: { status: "ACKNOWLEDGED" } });
    const totalPendingAcks = await prisma.policyAcknowledgement.count({ where: { status: "PENDING" } });

    // Audit stats
    const auditStats = await prisma.audit.groupBy({
      by: ["status"],
      _count: true,
    });

    // Compliance issues by severity
    const issuesBySeverity = await prisma.complianceIssue.groupBy({
      by: ["severity"],
      _count: true,
    });

    // Issues by status
    const issuesByStatus = await prisma.complianceIssue.groupBy({
      by: ["status"],
      _count: true,
    });

    // Open critical issues
    const criticalIssues = await prisma.complianceIssue.findMany({
      where: { severity: "CRITICAL", status: { in: ["OPEN", "IN_PROGRESS"] } },
      include: {
        audit: { select: { auditType: true, department: { select: { name: true } } } },
        ownerEmployee: { select: { name: true } },
      },
    });

    res.json({
      success: true,
      data: {
        policyCompliance: {
          totalPolicies,
          acknowledged: totalAcks,
          pending: totalPendingAcks,
          complianceRate: totalAcks + totalPendingAcks > 0
            ? ((totalAcks / (totalAcks + totalPendingAcks)) * 100).toFixed(1)
            : 100,
        },
        auditStats,
        issuesBySeverity,
        issuesByStatus,
        criticalIssues,
      },
    });
  } catch (error) {
    console.error("getGovernanceReport error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/reports/esg-summary
// ============================================================
exports.getEsgSummary = async (req, res) => {
  try {
    // Department scores
    const departmentScores = await prisma.departmentScore.findMany({
      include: { department: { select: { name: true, code: true } } },
      orderBy: { totalScore: "desc" },
    });

    // Averages
    const avgScores = await prisma.departmentScore.aggregate({
      _avg: {
        environmentalScore: true,
        socialScore: true,
        governanceScore: true,
        totalScore: true,
      },
    });

    // Key metrics
    const [totalEmployees, totalDepartments, totalCarbon, totalActivities, totalChallenges] =
      await Promise.all([
        prisma.employee.count(),
        prisma.department.count(),
        prisma.carbonTransaction.aggregate({ _sum: { co2Emitted: true } }),
        prisma.csrActivity.count(),
        prisma.challenge.count(),
      ]);

    res.json({
      success: true,
      data: {
        overallScores: {
          environmental: Number(avgScores._avg.environmentalScore) || 0,
          social: Number(avgScores._avg.socialScore) || 0,
          governance: Number(avgScores._avg.governanceScore) || 0,
          total: Number(avgScores._avg.totalScore) || 0,
        },
        departmentScores,
        keyMetrics: {
          totalEmployees,
          totalDepartments,
          totalCarbon: Number(totalCarbon._sum.co2Emitted || 0),
          totalActivities,
          totalChallenges,
        },
      },
    });
  } catch (error) {
    console.error("getEsgSummary error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
