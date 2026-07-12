const express = require("express");
const router = express.Router();
const { authenticate, adminOnly } = require("../middleware/auth");
const ctrl = require("../controllers/socialController");

router.get("/activities", authenticate, ctrl.getActivities);
router.post("/activities", authenticate, adminOnly, ctrl.addActivity);
router.post("/activities/:id/join", authenticate, ctrl.joinActivity);
router.put("/participations/:id/proof", authenticate, ctrl.upload.single("proof"), ctrl.uploadProof);
router.put("/participations/:id/approve", authenticate, adminOnly, ctrl.approveParticipation);

module.exports = router;
