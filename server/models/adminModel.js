const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: "admin" }, // Scalable for "superadmin", "moderator"
    },
    { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);