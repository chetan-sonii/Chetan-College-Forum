const router = require("express").Router();
const adminController = require("../controllers/adminController");
const validateAdminToken = require("../middlewares/validateAdminToken");

router.post("/login", adminController.loginAdmin);
router.post("/create", validateAdminToken, adminController.createAdmin); // Protected
router.get("/stats", validateAdminToken, adminController.getDashboardStats); // Protected
router.get("/users", validateAdminToken, adminController.getAllUsers);
router.post("/users/:id/manage", validateAdminToken, adminController.manageUser);
module.exports = router;