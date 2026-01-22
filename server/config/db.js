// db.js
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // keep strictQuery explicit if you want the old behavior warning suppressed
        mongoose.set("strictQuery", false);

        // connect WITHOUT legacy options (Mongoose v7+ doesn't accept them)
        await mongoose.connect(process.env.MONGODB_URL_CONNECTION);

        console.log("MongoDB Connected!");
    } catch (err) {
        console.error("MongoDB connection error:", err.message);
        // exit process so the app doesn't run in a bad state
        process.exit(1);
    }

    // Optional: attach event listeners for more detailed runtime info
    mongoose.connection.on("error", (err) => {
        console.error("MongoDB runtime error:", err);
    });
    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected.");
    });
};

module.exports = connectDB;
