const router = require("express").Router();
const adminController = require("../controllers/adminController");
const validateAdminToken = require("../middlewares/validateAdminToken");

router.post("/login", adminController.loginAdmin);
router.post("/create", validateAdminToken, adminController.createAdmin); // Protected
router.get("/stats", validateAdminToken, adminController.getDashboardStats); // Protected
router.get("/users", validateAdminToken, adminController.getAllUsers);
router.post("/users/:id/manage", validateAdminToken, adminController.manageUser);
// ✅ Tag Routes
router.get("/tags", validateAdminToken, adminController.getAllTags);
router.post("/tags", validateAdminToken, adminController.createTag);
router.delete("/tags/:id", validateAdminToken, adminController.deleteTag);

// ✅ Comment Routes
router.get("/comments", validateAdminToken, adminController.getAllComments);
router.delete("/comments/:id", validateAdminToken, adminController.deleteComment);
router.get("/reports", validateAdminToken, adminController.getReportedContent);
router.put("/reports/:id/dismiss", validateAdminToken, adminController.dismissReports);
router.delete("/reports/:id/delete", validateAdminToken, adminController.deleteTopicByAdmin);

module.exports = router;