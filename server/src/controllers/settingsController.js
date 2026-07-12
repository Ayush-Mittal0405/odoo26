const prisma = require("../config/db");

// ============================================================
// Departments
// ============================================================
exports.getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        headEmployee: { select: { name: true, email: true } },
        parentDepartment: { select: { name: true } },
        _count: { select: { employees: true, carbonTxns: true, csrActivities: true } },
      },
    });
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error("getDepartments error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    const { name, code, parentDepartmentId, headEmployeeId } = req.body;
    const dept = await prisma.department.create({
      data: { name, code, parentDepartmentId, headEmployeeId },
    });
    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "Department code already exists" });
    }
    console.error("addDepartment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, status, headEmployeeId, parentDepartmentId } = req.body;
    const updated = await prisma.department.update({
      where: { id },
      data: { name, code, status, headEmployeeId, parentDepartmentId },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("updateDepartment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// Categories
// ============================================================
exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const where = {};
    if (type) where.type = type;

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { csrActivities: true, challenges: true } },
      },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, type, status } = req.body;
    const category = await prisma.category.create({
      data: { name, type, status: status || "ACTIVE" },
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "Category name+type already exists" });
    }
    console.error("addCategory error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// App Settings
// ============================================================
exports.getAppSettings = async (req, res) => {
  try {
    let settings = await prisma.appSetting.findFirst();
    if (!settings) {
      settings = await prisma.appSetting.create({ data: {} });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error("getAppSettings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAppSettings = async (req, res) => {
  try {
    const { autoEmissionCalculation, requireEvidenceForCSR, autoAwardBadges, complianceNotifications } = req.body;

    let settings = await prisma.appSetting.findFirst();
    if (!settings) {
      settings = await prisma.appSetting.create({ data: {} });
    }

    const updated = await prisma.appSetting.update({
      where: { id: settings.id },
      data: {
        autoEmissionCalculation: autoEmissionCalculation ?? settings.autoEmissionCalculation,
        requireEvidenceForCSR: requireEvidenceForCSR ?? settings.requireEvidenceForCSR,
        autoAwardBadges: autoAwardBadges ?? settings.autoAwardBadges,
        complianceNotifications: complianceNotifications ?? settings.complianceNotifications,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("updateAppSettings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// Notifications
// ============================================================
exports.getNotifications = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { unreadOnly } = req.query;

    const where = { employeeId };
    if (unreadOnly === "true") where.isRead = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { employeeId, isRead: false },
    });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("markNotificationRead error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const employeeId = req.user.id;
    await prisma.notification.updateMany({
      where: { employeeId, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllRead error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
