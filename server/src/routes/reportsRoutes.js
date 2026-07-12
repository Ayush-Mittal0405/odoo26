const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const ctrl = require("../controllers/reportsController");

router.get("/environmental", authenticate, ctrl.getEnvironmentalReport);
router.get("/social", authenticate, ctrl.getSocialReport);
router.get("/governance", authenticate, ctrl.getGovernanceReport);
router.get("/esg-summary", authenticate, ctrl.getEsgSummary);

module.exports = router;
