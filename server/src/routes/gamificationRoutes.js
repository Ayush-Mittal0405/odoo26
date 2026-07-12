const express = require("express");
const router = express.Router();
const { authenticate, adminOnly } = require("../middleware/auth");
const ctrl = require("../controllers/gamificationController");

router.get("/challenges", authenticate, ctrl.getChallenges);
router.post("/challenges", authenticate, adminOnly, ctrl.addChallenge);
router.post("/challenges/:id/join", authenticate, ctrl.joinChallenge);
router.put("/challenges/:id/complete", authenticate, adminOnly, ctrl.completeChallenge);
router.get("/badges", authenticate, ctrl.getBadges);
router.get("/rewards", authenticate, ctrl.getRewards);
router.post("/rewards/:id/redeem", authenticate, ctrl.redeemReward);
router.get("/leaderboard", authenticate, ctrl.getLeaderboard);

module.exports = router;
