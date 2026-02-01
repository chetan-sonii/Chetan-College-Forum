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
            const today = new Date();
            const last30Days = new Date(today.setDate(today.getDate() - 30));

            // 1. Basic Counts
            const totalUsers = await User.countDocuments();
            const totalTopics = await Topic.countDocuments();
            const totalComments = await Comment.countDocuments();
            const totalTags = await Tag.countDocuments();

            // 2. Analytics: User Growth (Last 30 Days)
            const userGrowth = await User.aggregate([
                { $match: { createdAt: { $gte: last30Days } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        users: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]);

            // 3. Analytics: Topic Creation (Last 30 Days)
            const topicGrowth = await Topic.aggregate([
                { $match: { createdAt: { $gte: last30Days } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        topics: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]);

            // Merge Growth Data for the Chart
            const growthMap = new Map();
            userGrowth.forEach(d => growthMap.set(d._id, { date: d._id, users: d.users, topics: 0 }));
            topicGrowth.forEach(d => {
                if (growthMap.has(d._id)) growthMap.get(d._id).topics = d.topics;
                else growthMap.set(d._id, { date: d._id, users: 0, topics: d.topics });
            });
            const growthData = Array.from(growthMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

            // 4. Analytics: Topics per Space (Pie Chart)
            const topicsPerSpace = await Topic.aggregate([
                {
                    $lookup: {
                        from: "spaces",
                        localField: "space",
                        foreignField: "name", // Assuming stored as name, change to _id if storing ObjectId
                        as: "spaceInfo"
                    }
                },
                { $group: { _id: "$space", count: { $sum: 1 } } },
                { $limit: 5 } // Top 5 spaces
            ]);

            // 5. Recent Users
            const recentUsers = await User.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("username email createdAt avatar");

            res.json({
                counts: { totalUsers, totalTopics, totalComments, totalTags },
                charts: { growthData, topicsPerSpace },
                recentUsers,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: err.message });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const { search } = req.query;
            let query = {};

            if (search) {
                query = {
                    $or: [
                        { username: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                        { firstName: { $regex: search, $options: "i" } },
                        { lastName: { $regex: search, $options: "i" } }
                    ]
                };
            }

            // Fetch users sorted by newest
            const users = await User.find(query).select("-password").sort({ createdAt: -1 });

            return res.json(users);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    // 5. Ban or Delete User
    manageUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { action } = req.body; // 'ban', 'unban', 'delete'

            const user = await User.findById(id);
            if (!user) return res.status(404).json({ message: "User not found" });

            if (action === "delete") {
                await User.findByIdAndDelete(id);
                // Optional: Delete their topics/comments here if you want a hard delete
                return res.json({ message: "User deleted successfully", userId: id, action: "delete" });
            }

            else if (action === "ban") {
                // Assuming you add an 'isBanned' field to your User Model (Step 1.1 below)
                user.isBanned = true;
                await user.save();
                return res.json({ message: "User banned successfully", userId: id, action: "ban" });
            }

            else if (action === "unban") {
                user.isBanned = false;
                await user.save();
                return res.json({ message: "User unbanned successfully", userId: id, action: "unban" });
            }

            return res.status(400).json({ message: "Invalid action" });

        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },
    getAllTags: async (req, res) => {
        try {
            const tags = await Tag.find().sort({ count: -1 }); // Sort by usage count
            res.json(tags);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    createTag: async (req, res) => {
        try {
            const { name, color } = req.body;
            const existing = await Tag.findOne({ name: name.toLowerCase() });
            if (existing) return res.status(400).json({ message: "Tag already exists" });

            const newTag = await Tag.create({
                name: name.toLowerCase(),
                color: color || "#343a40" // Default dark color
            });
            res.status(201).json(newTag);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    deleteTag: async (req, res) => {
        try {
            await Tag.findByIdAndDelete(req.params.id);
            res.json({ message: "Tag deleted", id: req.params.id });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // === COMMENTS MODERATION (Useful Tab) ===
    getAllComments: async (req, res) => {
        try {
            // Fetch latest 50 comments for moderation
            const comments = await Comment.find()
                .populate("author", "username avatar") // Changed from "user" to "author" based on your schema usage
                .populate("parentTopic", "title")
                .sort({ createdAt: -1 })
                .limit(50);
            res.json(comments);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    deleteComment: async (req, res) => {
        try {
            await Comment.findByIdAndDelete(req.params.id);
            // Optional: Decrement topic comment count here if strict consistency needed
            res.json({ message: "Comment deleted", id: req.params.id });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    // === REPORT MANAGEMENT ===
    getReportedContent: async (req, res) => {
        try {
            // Find topics where reports array is not empty
            const topics = await Topic.find({ reports: { $exists: true, $not: { $size: 0 } } })
                .populate("reports.reporter", "username avatar") // Get reporter details
                .populate("author", "username firstName lastName") // Get topic author
                .sort({ "reports.createdAt": -1 }); // Newest reports first

            res.json(topics);
        } catch (err) {

            return res.status(500).json({ message: err.message });
        }
    },

    dismissReports: async (req, res) => {
        try {
            const { id } = req.params; // Topic ID
            const topic = await Topic.findById(id);

            if (!topic) return res.status(404).json({ message: "Topic not found" });

            // Clear the reports array
            topic.reports = [];
            await topic.save();

            return res.json({ message: "Reports dismissed", id });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },

    deleteTopicByAdmin: async (req, res) => {
        try {
            const { id } = req.params;
            await Topic.findByIdAndDelete(id);
            // Clean up associated comments
            await Comment.deleteMany({ parentTopic: id });

            return res.json({ message: "Topic deleted by Admin", id });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    },
};