const mongoose = require("mongoose");
const Space = require("../models/spaceModel");
require("dotenv").config();

const spaces = [
    { name: "Web Development", avatar: "web-development.png" },
    { name: "Backend Development", avatar: "backend.png" },
    { name: "Frontend Development", avatar: "frontend.png" },
    { name: "Full Stack", avatar: "fullstack.png" },
    { name: "DevOps", avatar: "devops.png" },
    { name: "Cloud Computing", avatar: "cloud.png" },
    { name: "Cyber Security", avatar: "cyber-security.png" },
    { name: "Machine Learning", avatar: "machine-learning.png" },
    { name: "Data Science", avatar: "data-science.png" },
    { name: "Mobile App Development", avatar: "mobile-app.png" },
    { name: "Database Systems", avatar: "database.png" },
    { name: "System Design", avatar: "system-design.png" },
    { name: "Open Source", avatar: "open-source.png" },
    { name: "Programming Languages", avatar: "programming.png" },
    { name: "Computer Networks", avatar: "networking.png" },
    { name: "Operating Systems", avatar: "operating-systems.png" }
];

(async () => {
    try {
        await mongoose.connect('mongodb+srv://chetansonii2000_db_user:chetan309204@collegeforum.y1vvpxj.mongodb.net/');
        await Space.insertMany(spaces);
        console.log("✅ Spaces seeded successfully");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
