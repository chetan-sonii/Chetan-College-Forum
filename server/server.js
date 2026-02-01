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
const adminRoutes = require("./routes/adminRoutes");
const path = require("path");
const http = require("http"); // Import HTTP module
const { Server } = require("socket.io"); // Import Socket.io

// load .env
dotenv.config();

// config
const PORT = process.env.PORT || 5000;
const CLIENT_URL =
    process.env.CLIENT_URL || process.env.REACT_APP_URL || "http://localhost:3000";

const app = express();
const server = http.createServer(app); // Wrap Express app with HTTP server

// --- Socket.io Setup ---
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Store io instance to use in controllers
app.set("io", io);

io.on("connection", (socket) => {
    // Join a specific topic room
    socket.on("join_topic", (topicId) => {
        socket.join(topicId);
        console.log(`User with ID: ${socket.id} joined topic room: ${topicId}`);
    });

    socket.on("disconnect", () => {
        // console.log("User Disconnected", socket.id);
    });
});

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
app.use("/api/admin", adminRoutes);

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
        // Use server.listen instead of app.listen to enable WebSockets
        server.listen(PORT, () => {
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