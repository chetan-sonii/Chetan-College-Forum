// server/server.js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const topicRoutes = require("./routes/topicRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");
const path = require("path");

// load .env
dotenv.config();

// config
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.REACT_APP_URL || "http://localhost:3000";

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());

// file upload (keeps your original choice)
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: path.join(__dirname, "../tmp"),
        createParentPath: true,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (adjust if needed)
    })
);

// CORS
app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);

// --- Routes ---
app.use("/", authRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/user", userRoutes);

// static uploads (optional; helpful if you serve images from /uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- Error handlers ---
// 404
app.use((req, res, next) => {
    res.status(404).json({ message: "Not Found" });
});

// central error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    const status = err.status || 500;
    res.status(status).json({
        message: err.message || "Internal Server Error",
    });
});

// --- Start server only after DB connects ---
const start = async () => {
    try {
        await connectDB(); // ensure DB connected first
        const server = app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
            console.log(`Accepting requests from: ${CLIENT_URL}`);
        });

        // graceful shutdown
        const shutdown = (signal) => {
            console.log(`Received ${signal}. Closing server...`);
            server.close(() => {
                console.log("HTTP server closed.");
                // close DB connection when your connectDB exposes it, or simply exit
                process.exit(0);
            });

            // force exit after timeout
            setTimeout(() => {
                console.error("Forcing shutdown.");
                process.exit(1);
            }, 10_000);
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

        // catch unhandled errors
        process.on("unhandledRejection", (reason) => {
            console.error("Unhandled Rejection:", reason);
        });
        process.on("uncaughtException", (err) => {
            console.error("Uncaught Exception:", err);
            process.exit(1);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};

start();
