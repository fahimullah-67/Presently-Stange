// Environment & Dependencies

import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import http from "http";

// Database & Redis

import { connectDB, disconnectDB } from "./config/database.js";

import { initRedis, closeRedis } from "./config/redis.js";

// Socket.io

import { initSocket } from "./config/socket.js";

// Middleware

import { errorHandler } from "./middleware/errorHandler.js";

// Routes

import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/sessions.js";
import pollRoutes from "./routes/polls.js";
import chatRoutes from "./routes/chat.js";
import zoomRoutes from "./routes/zoom.js";

// App Initialization

const app = express();

// Security Middleware

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",

    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Request Processing

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
  }),
);

app.use(compression());

// Logging

app.use(morgan("dev"));

// Health Check

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date(),
  });
});

// API Routes

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/zoom", zoomRoutes);

// API Information

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Presently API v1.0",

    endpoints: {
      auth: "/api/auth",
      sessions: "/api/sessions",
      polls: "/api/polls",
      chat: "/api/chat",
      zoom: "/api/zoom",
    },
  });
});

// 404 Handler

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Global Error Handler

app.use(errorHandler);

// HTTP & Socket.io Server

const server = http.createServer(app);

const io = initSocket(server);

// Server Configuration

const PORT = process.env.PORT || 5000;

// Start Server

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    await initRedis();

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              🚀 PRESENTLY BACKEND STARTED 🚀              ║
║                                                            ║
║  Environment : ${process.env.NODE_ENV || "development"}
║  Port        : ${PORT}
║  API         : http://localhost:${PORT}/api
║  Health      : http://localhost:${PORT}/health
║                                                            ║
║  Socket.io   : Enabled                                     ║
║  Redis       : Connected                                   ║
║  MongoDB     : Connected                                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Server Startup Error:", error.message);

    process.exit(1);
  }
};

// Graceful Shutdown

const shutdown = async (signal) => {
  console.log(`\n${signal} signal received: shutting down gracefully...`);

  server.close(async () => {
    console.log("HTTP server closed");

    try {
      // Close MongoDB connection
      await disconnectDB();

      // Close Redis connection
      await closeRedis();

      console.log("Database connections closed");
      console.log("👋 Server shutdown complete");

      process.exit(0);
    } catch (error) {
      console.error("❌ Shutdown Error:", error.message);

      process.exit(1);
    }
  });
};

// Process Signals

// SIGTERM
process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

// SIGINT / Ctrl + C
process.on("SIGINT", () => {
  shutdown("SIGINT");
});

// Process-Level Error Handling

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Promise Rejection:", error);

  shutdown("Unhandled Rejection");
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);

  shutdown("Uncaught Exception");
});

// Start Application

startServer();

// Exports

export { app, server, io };
