const prisma = require("../config/db");

// ============================================================
// GET /api/gamification/challenges
// ============================================================
exports.getChallenges = async (req, res) => {
  try {
    const { status, difficulty, categoryId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (difficulty) where.difficulty = difficulty;
    if (categoryId) where.categoryId = categoryId;

    const challenges = await prisma.challenge.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        _count: { select: { participations: true } },
      },
    });

    res.json({ success: true, data: challenges });
  } catch (error) {
    console.error("getChallenges error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/gamification/challenges
// ============================================================
exports.addChallenge = async (req, res) => {
  try {
    const { categoryId, title, description, xp, difficulty, evidenceRequired, deadline, status } = req.body;

    const challenge = await prisma.challenge.create({
      data: {
        categoryId,
        title,
        description,
        xp: xp || 100,
        difficulty: difficulty || "MEDIUM",
        evidenceRequired: evidenceRequired || false,
        deadline: deadline ? new Date(deadline) : null,
        status: status || "ACTIVE",
      },
      include: { category: { select: { name: true } } },
    });

    res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    console.error("addChallenge error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/gamification/challenges/:id/join
// ============================================================
exports.joinChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.id;

    const participation = await prisma.challengeParticipation.create({
      data: {
        challengeId: id,
        employeeId,
      },
    });

    res.status(201).json({ success: true, data: participation });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "Already joined this challenge" });
    }
    console.error("joinChallenge error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// PUT /api/gamification/challenges/:id/complete
// ============================================================
exports.completeChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, xpAwarded } = req.body;

    const updated = await prisma.challengeParticipation.updateMany({
      where: { challengeId: id, employeeId },
      data: {
        progress: 100,
        approvalStatus: "APPROVED",
        xpAwarded: xpAwarded || 0,
      },
    });

    if (xpAwarded > 0) {
      await prisma.employee.update({
        where: { id: employeeId },
        data: {
          xpTotal: { increment: xpAwarded },
          pointsBalance: { increment: Math.floor(xpAwarded / 2) },
        },
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("completeChallenge error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/gamification/badges
// ============================================================
exports.getBadges = async (req, res) => {
  try {
    const badges = await prisma.badge.findMany({
      include: {
        _count: { select: { employeeBadges: true } },
      },
    });

    // If user is authenticated, include their earned badges
    if (req.user) {
      const myBadges = await prisma.employeeBadge.findMany({
        where: { employeeId: req.user.id },
        select: { badgeId: true },
      });
      const myBadgeIds = new Set(myBadges.map((b) => b.badgeId));

      const enriched = badges.map((badge) => ({
        ...badge,
        earned: myBadgeIds.has(badge.id),
      }));

      return res.json({ success: true, data: enriched });
    }

    res.json({ success: true, data: badges });
  } catch (error) {
    console.error("getBadges error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/gamification/rewards
// ============================================================
exports.getRewards = async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({
      orderBy: { pointsRequired: "asc" },
    });
    res.json({ success: true, data: rewards });
  } catch (error) {
    console.error("getRewards error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/gamification/rewards/:id/redeem
// ============================================================
exports.redeemReward = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.id;

    const [reward, employee] = await Promise.all([
      prisma.reward.findUnique({ where: { id } }),
      prisma.employee.findUnique({ where: { id: employeeId } }),
    ]);

    if (!reward) return res.status(404).json({ success: false, message: "Reward not found" });
    if (reward.status !== "ACTIVE") return res.status(400).json({ success: false, message: "Reward not available" });
    if (reward.stock <= 0) return res.status(400).json({ success: false, message: "Out of stock" });
    if (employee.pointsBalance < reward.pointsRequired) {
      return res.status(400).json({ success: false, message: "Insufficient points" });
    }

    const [redemption] = await prisma.$transaction([
      prisma.rewardRedemption.create({
        data: {
          employeeId,
          rewardId: id,
          pointsDeducted: reward.pointsRequired,
        },
      }),
      prisma.employee.update({
        where: { id: employeeId },
        data: { pointsBalance: { decrement: reward.pointsRequired } },
      }),
      prisma.reward.update({
        where: { id },
        data: { stock: { decrement: 1 } },
      }),
    ]);

    res.status(201).json({ success: true, data: redemption });
  } catch (error) {
    console.error("redeemReward error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/gamification/leaderboard
// ============================================================
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const leaderboard = await prisma.employee.findMany({
      take: Number(limit),
      orderBy: { xpTotal: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        xpTotal: true,
        pointsBalance: true,
        department: { select: { name: true, code: true } },
        _count: {
          select: {
            employeeBadges: true,
            challengeParticipations: true,
          },
        },
      },
    });

    // Add rank
    const ranked = leaderboard.map((emp, idx) => ({
      rank: idx + 1,
      ...emp,
    }));

    res.json({ success: true, data: ranked });
  } catch (error) {
    console.error("getLeaderboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
