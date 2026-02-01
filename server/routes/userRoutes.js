const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validateAccessToken = require("../middlewares/validateAccessToken");

router.get("/saved-topics", validateAccessToken, userController.getSavedTopics);
router.get("/:username/upvoted", userController.getUpvotedTopics);
router.get("/:username", userController.getUserProfile);
router.get("/:username/comments", userController.getUserComments);
router.get("/:username/following", userController.getUserFollowing);
router.get("/:username/followers", userController.getUserFollowers);
router.get("/:username/topics", userController.getUserTopics);
router.put("/:username/follow", validateAccessToken, userController.toggleUserFollow);
router.put("/:username", validateAccessToken, userController.updateUserProfile);
router.post("/save/:id", validateAccessToken, userController.toggleSaveTopic);

module.exports = router;