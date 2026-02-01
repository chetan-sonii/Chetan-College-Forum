const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const validateAdminToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Admin access required." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);

        // ✅ Verify against ADMIN collection
        const admin = await Admin.findById(decoded.id).select("-password");
        if (!admin) {
            return res.status(401).json({ message: "Invalid Admin Token." });
        }

        req.admin = admin;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized Admin Access." });
    }
};

module.exports = validateAdminToken;