const prisma = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    // ======================
    // Basic Counts
    // ======================

    const totalEmployees = await prisma.employee.count();
    const totalDepartments = await prisma.department.count();
    const totalChallenges = await prisma.challenge.count();

    // ======================
    // Carbon Calculation
    // ======================

    const carbonData = await prisma.carbonTransaction.aggregate({
      _sum: {
        co2Emitted: true,
      },
    });

    const totalCarbon = Number(carbonData._sum.co2Emitted || 0);

    // ======================
    // ESG Scores (from DepartmentScore averages or defaults)
    // ======================

    const scoreData = await prisma.departmentScore.aggregate({
      _avg: {
        environmentalScore: true,
        socialScore: true,
        governanceScore: true,
        totalScore: true,
      },
    });

    const environmentalScore = Number(scoreData._avg.environmentalScore) || 82;
    const socialScore = Number(scoreData._avg.socialScore) || 74;
    const governanceScore = Number(scoreData._avg.governanceScore) || 88;
    const overallScore = Number(scoreData._avg.totalScore) || Number(
      (environmentalScore * 0.4 + socialScore * 0.3 + governanceScore * 0.3).toFixed(2)
    );

    // ======================
    // Recent Challenges
    // ======================

    const recentChallenges = await prisma.challenge.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        _count: {
          select: { participations: true },
        },
      },
    });

    // ======================
    // Monthly Carbon Trend (last 6 months)
    // ======================

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const carbonTrend = await prisma.carbonTransaction.groupBy({
      by: ["txnDate"],
      _sum: { co2Emitted: true },
      where: { txnDate: { gte: sixMonthsAgo } },
      orderBy: { txnDate: "asc" },
    });

    // ======================
    // Department Breakdown
    // ======================

    const departmentBreakdown = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        employeeCount: true,
        _count: {
          select: {
            carbonTxns: true,
            csrActivities: true,
          },
        },
      },
    });

    // ======================
    // Recent Activities
    // ======================

    const recentActivities = await prisma.csrActivity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        department: { select: { name: true } },
        category: { select: { name: true } },
        _count: { select: { participations: true } },
      },
    });

    // ======================
    // Response
    // ======================

    res.status(200).json({
      success: true,

      statistics: {
        totalEmployees,
        totalDepartments,
        totalChallenges,
        totalCarbon,
      },

      scores: {
        environmentalScore,
        socialScore,
        governanceScore,
        overallScore,
      },

      recentChallenges,
      carbonTrend,
      departmentBreakdown,
      recentActivities,
    });
  } catch (error) {
    console.log("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};