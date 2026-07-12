const prisma = require("../config/db");

// ============================================================
// GET /api/environmental/transactions
// ============================================================
exports.getTransactions = async (req, res) => {
  try {
    const { departmentId, sourceType, page = 1, limit = 20 } = req.query;

    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (sourceType) where.sourceType = sourceType;

    const [transactions, total] = await Promise.all([
      prisma.carbonTransaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { txnDate: "desc" },
        include: {
          department: { select: { name: true, code: true } },
          emissionFactor: { select: { activityType: true, unit: true, co2PerUnit: true } },
        },
      }),
      prisma.carbonTransaction.count({ where }),
    ]);

    res.json({ success: true, data: transactions, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error("getTransactions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/environmental/transactions
// ============================================================
exports.addTransaction = async (req, res) => {
  try {
    const { departmentId, emissionFactorId, sourceType, sourceRefId, quantity, txnDate } = req.body;

    // Auto-calculate CO2
    const factor = await prisma.emissionFactor.findUnique({ where: { id: emissionFactorId } });
    if (!factor) {
      return res.status(404).json({ success: false, message: "Emission factor not found" });
    }

    const co2Emitted = Number(quantity) * Number(factor.co2PerUnit);

    const transaction = await prisma.carbonTransaction.create({
      data: {
        departmentId,
        emissionFactorId,
        sourceType: sourceType || "MANUAL",
        sourceRefId,
        quantity,
        co2Emitted,
        txnDate: new Date(txnDate),
        autoCalculated: true,
      },
      include: {
        department: { select: { name: true } },
        emissionFactor: { select: { activityType: true, unit: true } },
      },
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error("addTransaction error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/environmental/goals
// ============================================================
exports.getGoals = async (req, res) => {
  try {
    const { departmentId, status } = req.query;
    const where = {};
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const goals = await prisma.environmentalGoal.findMany({
      where,
      orderBy: { deadline: "asc" },
      include: { department: { select: { name: true, code: true } } },
    });

    res.json({ success: true, data: goals });
  } catch (error) {
    console.error("getGoals error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/environmental/goals
// ============================================================
exports.addGoal = async (req, res) => {
  try {
    const { departmentId, metric, targetValue, deadline } = req.body;

    const goal = await prisma.environmentalGoal.create({
      data: {
        departmentId,
        metric,
        targetValue,
        deadline: new Date(deadline),
      },
      include: { department: { select: { name: true } } },
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    console.error("addGoal error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// PUT /api/environmental/goals/:id/progress
// ============================================================
exports.updateGoalProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentValue } = req.body;

    const goal = await prisma.environmentalGoal.findUnique({ where: { id } });
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    const newStatus = Number(currentValue) >= Number(goal.targetValue) ? "COMPLETED" : "ON_TRACK";

    const updated = await prisma.environmentalGoal.update({
      where: { id },
      data: { currentValue, status: newStatus },
      include: { department: { select: { name: true } } },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("updateGoalProgress error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/environmental/products
// ============================================================
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.productEsgProfile.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// POST /api/environmental/products
// ============================================================
exports.addProduct = async (req, res) => {
  try {
    const { productName, carbonScore, recyclable, sustainabilityNotes } = req.body;

    const product = await prisma.productEsgProfile.create({
      data: { productName, carbonScore, recyclable: recyclable || false, sustainabilityNotes },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("addProduct error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================
// GET /api/environmental/emission-factors
// ============================================================
exports.getEmissionFactors = async (req, res) => {
  try {
    const factors = await prisma.emissionFactor.findMany({
      orderBy: { activityType: "asc" },
    });
    res.json({ success: true, data: factors });
  } catch (error) {
    console.error("getEmissionFactors error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
