const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validateAccessToken = require("../middlewares/validateAccessToken");

router.get("/:username", userController.getUserProfile);
router.get("/:username/comments", userController.getUserComments);
router.get("/:username/following", userController.getUserFollowing);
router.get("/:username/followers", userController.getUserFollowers);

// ✅ NEW ROUTE
router.get("/:username/topics", userController.getUserTopics);

router.put("/:username/follow", validateAccessToken, userController.toggleUserFollow);
router.put("/:username", validateAccessToken, userController.updateUserProfile);

module.exports = router;