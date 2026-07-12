const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const ctrl = require("../controllers/environmentalController");

router.get("/transactions", authenticate, ctrl.getTransactions);
router.post("/transactions", authenticate, ctrl.addTransaction);
router.get("/goals", authenticate, ctrl.getGoals);
router.post("/goals", authenticate, ctrl.addGoal);
router.put("/goals/:id/progress", authenticate, ctrl.updateGoalProgress);
router.get("/products", authenticate, ctrl.getProducts);
router.post("/products", authenticate, ctrl.addProduct);
router.get("/emission-factors", authenticate, ctrl.getEmissionFactors);

module.exports = router;
