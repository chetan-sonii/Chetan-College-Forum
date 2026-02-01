const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Topic = require("../models/topicModel");
const Comment = require("../models/commentModel"); // Ensure you have this
const Tag = require("../models/tagModel");
const bcrypt = require("bcrypt");
const { createAccessToken } = require("../middlewares/generateTokens");

module.exports = {
    // 1. Admin Login
    loginAdmin: async (req, res) => {
        try {
            const { username, password } = req.body;
            const admin = await Admin.findOne({ username });
            if (!admin) return res.status(400).json({ message: "Admin not found." });

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) return res.status(400).json({ message: "Incorrect password." });

            const access_token = createAccessToken({ id: admin._id });

            res.json({
                message: "Admin Login Success!",
                access_token,
                admin: { username: admin.username, role: admin.role },
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 2. Create New Admin (Protected: Only existing admins can do this)
    createAdmin: async (req, res) => {
        try {
            const { username, password } = req.body;
            const existing = await Admin.findOne({ username });
            if (existing) return res.status(400).json({ message: "Admin username exists." });

            const passwordHash = await bcrypt.hash(password, 12);
            const newAdmin = await Admin.create({ username, password: passwordHash });

            res.status(201).json({ message: "New Admin created!", admin: newAdmin.username });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 3. Dashboard Stats (Overview)
    getDashboardStats: async (req, res) => {
        try {
            const totalUsers = await User.countDocuments();
            const totalTopics = await Topic.countDocuments();
            const totalComments = await Comment.countDocuments(); // Ensure Comment model exists
            const totalTags = await Tag.countDocuments();

            // Get recent users (last 5)
            const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select("username email createdAt");

            res.json({
                counts: { totalUsers, totalTopics, totalComments, totalTags },
                recentUsers
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
};