const prisma = require("../config/db");

// ============================================================
// GET /api/governance/policies
// ============================================================
exports.getPolicies = async (req, res) => {
  try {
    const { status, category } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const policies = await prisma.esgPolicy.findMany({
      where,
      orderBy: { effectiveDate: "desc" },
      include: {
        _count: { select: { acknowledgements: true } },
      },
    });

    res.json({ success: true, data: policies });
  } catch (error) {
    console.error("getPolicies error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/governance/policies
// ============================================================
exports.addPolicy = async (req, res) => {
  try {
    const { title, description, category, version, status, effectiveDate } = req.body;

    const policy = await prisma.esgPolicy.create({
      data: {
        title,
        description,
        category,
        version: version || "1.0",
        status: status || "DRAFT",
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
      },
    });

    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    console.error("addPolicy error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/governance/policies/:id/acknowledge
// ============================================================
exports.acknowledgePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.id;

    const ack = await prisma.policyAcknowledgement.upsert({
      where: {
        policyId_employeeId: { policyId: id, employeeId },
      },
      update: {
        status: "ACKNOWLEDGED",
        acknowledgedDate: new Date(),
      },
      create: {
        policyId: id,
        employeeId,
        status: "ACKNOWLEDGED",
        acknowledgedDate: new Date(),
      },
    });

    res.json({ success: true, data: ack });
  } catch (error) {
    console.error("acknowledgePolicy error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/governance/audits
// ============================================================
exports.getAudits = async (req, res) => {
  try {
    const { departmentId, status } = req.query;
    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const audits = await prisma.audit.findMany({
      where,
      orderBy: { auditDate: "desc" },
      include: {
        department: { select: { name: true, code: true } },
        _count: { select: { complianceIssues: true } },
      },
    });

    res.json({ success: true, data: audits });
  } catch (error) {
    console.error("getAudits error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/governance/audits
// ============================================================
exports.addAudit = async (req, res) => {
  try {
    const { departmentId, auditType, auditor, auditDate, status } = req.body;

    const audit = await prisma.audit.create({
      data: {
        departmentId,
        auditType,
        auditor,
        auditDate: new Date(auditDate),
        status: status || "PLANNED",
      },
      include: { department: { select: { name: true } } },
    });

    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    console.error("addAudit error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/governance/compliance-issues
// ============================================================
exports.getComplianceIssues = async (req, res) => {
  try {
    const { auditId, severity, status } = req.query;
    const where = {};
    if (auditId) where.auditId = auditId;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const issues = await prisma.complianceIssue.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        audit: {
          select: {
            auditType: true,
            department: { select: { name: true } },
          },
        },
        ownerEmployee: { select: { name: true, email: true } },
      },
    });

    res.json({ success: true, data: issues });
  } catch (error) {
    console.error("getComplianceIssues error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/governance/compliance-issues
// ============================================================
exports.addComplianceIssue = async (req, res) => {
  try {
    const { auditId, severity, description, ownerEmployeeId, dueDate } = req.body;

    const issue = await prisma.complianceIssue.create({
      data: {
        auditId,
        severity,
        description,
        ownerEmployeeId,
        dueDate: new Date(dueDate),
      },
      include: {
        ownerEmployee: { select: { name: true } },
      },
    });

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    console.error("addComplianceIssue error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// PUT /api/governance/compliance-issues/:id
// ============================================================
exports.updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.complianceIssue.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("updateIssueStatus error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
