const express = require("express");
const router = express.Router();
const { authenticate, adminOnly } = require("../middleware/auth");
const ctrl = require("../controllers/governanceController");

router.get("/policies", authenticate, ctrl.getPolicies);
router.post("/policies", authenticate, adminOnly, ctrl.addPolicy);
router.post("/policies/:id/acknowledge", authenticate, ctrl.acknowledgePolicy);
router.get("/audits", authenticate, ctrl.getAudits);
router.post("/audits", authenticate, adminOnly, ctrl.addAudit);
router.get("/compliance-issues", authenticate, ctrl.getComplianceIssues);
router.post("/compliance-issues", authenticate, adminOnly, ctrl.addComplianceIssue);
router.put("/compliance-issues/:id", authenticate, adminOnly, ctrl.updateIssueStatus);

module.exports = router;
