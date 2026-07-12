const express = require("express");
const router = express.Router();
const { authenticate, adminOnly } = require("../middleware/auth");
const ctrl = require("../controllers/settingsController");

// Departments
router.get("/departments", authenticate, ctrl.getDepartments);
router.post("/departments", authenticate, adminOnly, ctrl.addDepartment);
router.put("/departments/:id", authenticate, adminOnly, ctrl.updateDepartment);

// Categories
router.get("/categories", authenticate, ctrl.getCategories);
router.post("/categories", authenticate, adminOnly, ctrl.addCategory);

// App Settings
router.get("/app", authenticate, adminOnly, ctrl.getAppSettings);
router.put("/app", authenticate, adminOnly, ctrl.updateAppSettings);

// Notifications
router.get("/notifications", authenticate, ctrl.getNotifications);
router.put("/notifications/:id/read", authenticate, ctrl.markNotificationRead);
router.put("/notifications/read-all", authenticate, ctrl.markAllRead);

module.exports = router;
