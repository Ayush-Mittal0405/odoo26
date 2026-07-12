const prisma = require("../config/db");
const multer = require("multer");
const path = require("path");

// Multer setup for proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
exports.upload = upload;

// ============================================================
// GET /api/social/activities
// ============================================================
exports.getActivities = async (req, res) => {
  try {
    const { departmentId, status } = req.query;
    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const activities = await prisma.csrActivity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        department: { select: { name: true, code: true } },
        category: { select: { name: true } },
        _count: { select: { participations: true } },
      },
    });

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error("getActivities error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/social/activities
// ============================================================
exports.addActivity = async (req, res) => {
  try {
    const { departmentId, categoryId, title, description, activityDate, status } = req.body;

    const activity = await prisma.csrActivity.create({
      data: {
        departmentId,
        categoryId,
        title,
        description,
        activityDate: new Date(activityDate),
        status: status || "DRAFT",
      },
      include: {
        department: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    console.error("addActivity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/social/activities/:id/join
// ============================================================
exports.joinActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.id;

    const participation = await prisma.employeeParticipation.create({
      data: {
        employeeId,
        activityId: id,
      },
    });

    res.status(201).json({ success: true, data: participation });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "Already joined this activity" });
    }
    console.error("joinActivity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// PUT /api/social/participations/:id/proof
// ============================================================
exports.uploadProof = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const updated = await prisma.employeeParticipation.update({
      where: { id },
      data: {
        proofFile: req.file.filename,
        completionDate: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("uploadProof error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// PUT /api/social/participations/:id/approve
// ============================================================
exports.approveParticipation = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus, pointsEarned } = req.body;

    const updated = await prisma.employeeParticipation.update({
      where: { id },
      data: {
        approvalStatus,
        pointsEarned: pointsEarned || 0,
      },
    });

    // If approved, add points to employee
    if (approvalStatus === "APPROVED" && pointsEarned > 0) {
      await prisma.employee.update({
        where: { id: updated.employeeId },
        data: {
          pointsBalance: { increment: pointsEarned },
          xpTotal: { increment: pointsEarned },
        },
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("approveParticipation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
