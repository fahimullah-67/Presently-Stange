import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import ChatMessage from "../models/ChatMessage.js";

// Active Connections

// userId → socketId
const activeUsers = new Map();

// sessionId → Set of userIds
const sessionConnections = new Map();

// Initialize Socket.io

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",

      methods: ["GET", "POST"],

      credentials: process.env.SOCKET_CORS_CREDENTIALS === "true",
    },
  });

  // Socket Authentication Middleware

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id;

      next();
    } catch (error) {
      console.error("❌ Socket Auth Error:", error.message);

      next(new Error("Invalid token"));
    }
  });

  // Connection Handler

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.userId}`);

    // Store active connection
    activeUsers.set(socket.userId, socket.id);

    // Session Events

    // Join Session
    socket.on("join-session", async (sessionId) => {
      try {
        socket.join(`session:${sessionId}`);

        // Create session connection tracker
        if (!sessionConnections.has(sessionId)) {
          sessionConnections.set(sessionId, new Set());
        }

        // Add user to session
        const users = sessionConnections.get(sessionId);

        users.add(socket.userId);

        // Notify everyone in the session
        io.to(`session:${sessionId}`).emit("user-joined", {
          userId: socket.userId,
          sessionId,
          activeUsers: users.size,
        });

        console.log(`👤 User ${socket.userId} joined session ${sessionId}`);
      } catch (error) {
        console.error("❌ Join Session Error:", error.message);

        socket.emit("error", {
          message: "Failed to join session",
        });
      }
    });

    // Leave Session
    socket.on("leave-session", (sessionId) => {
      try {
        socket.leave(`session:${sessionId}`);

        const users = sessionConnections.get(sessionId);

        if (users) {
          users.delete(socket.userId);

          io.to(`session:${sessionId}`).emit("user-left", {
            userId: socket.userId,
            sessionId,
            activeUsers: users.size,
          });

          // Remove empty session
          if (users.size === 0) {
            sessionConnections.delete(sessionId);
          }
        }

        console.log(`👤 User ${socket.userId} left session ${sessionId}`);
      } catch (error) {
        console.error("❌ Leave Session Error:", error.message);
      }
    });

    // Chat Events

    // Send Chat Message
    socket.on("send-message", async (data) => {
      try {
        const { sessionId, message } = data;

        // Save message to MongoDB
        const chatMessage = await ChatMessage.create({
          sessionId,
          senderId: socket.userId,
          message,
          messageType: "text",
        });

        // Populate sender information
        await chatMessage.populate("senderId", "name email avatar");

        // Broadcast message to session
        io.to(`session:${sessionId}`).emit("new-message", {
          id: chatMessage._id,
          sender: chatMessage.senderId,
          message: chatMessage.message,
          timestamp: chatMessage.createdAt,
        });

        console.log(`💬 Message sent in session ${sessionId}`);
      } catch (error) {
        console.error("❌ Send Message Error:", error.message);

        socket.emit("error", {
          message: "Failed to send message",
        });
      }
    });

    // Poll Events

    // Poll Response
    socket.on("poll-response", async (data) => {
      try {
        const { sessionId, pollId, response } = data;

        io.to(`session:${sessionId}`).emit("poll-updated", {
          pollId,
          response,
          timestamp: new Date(),
        });

        console.log(`📊 Poll response in session ${sessionId}`);
      } catch (error) {
        console.error("❌ Poll Response Error:", error.message);

        socket.emit("error", {
          message: "Failed to process poll response",
        });
      }
    });

    // Create Poll
    socket.on("create-poll", (data) => {
      try {
        const { sessionId, poll } = data;

        io.to(`session:${sessionId}`).emit("new-poll", {
          poll,
          createdBy: socket.userId,
          timestamp: new Date(),
        });

        console.log(`📊 Poll created in session ${sessionId}`);
      } catch (error) {
        console.error("❌ Create Poll Error:", error.message);
      }
    });

    // End Poll
    socket.on("end-poll", (data) => {
      try {
        const { sessionId, pollId } = data;

        io.to(`session:${sessionId}`).emit("poll-ended", {
          pollId,
          timestamp: new Date(),
        });

        console.log(`🛑 Poll ended in session ${sessionId}`);
      } catch (error) {
        console.error("❌ End Poll Error:", error.message);
      }
    });

    // Real-Time User Events

    // Typing Indicator
    socket.on("user-typing", (data) => {
      const { sessionId, typing } = data;

      socket.to(`session:${sessionId}`).emit("user-typing-indicator", {
        userId: socket.userId,
        typing,
      });
    });

    // Attendee Joined
    socket.on("attendee-joined", (data) => {
      const { sessionId, attendee } = data;

      io.to(`session:${sessionId}`).emit("attendee-joined", {
        attendee,
        timestamp: new Date(),
      });
    });

    // Disconnect

    socket.on("disconnect", () => {
      activeUsers.delete(socket.userId);

      // Remove user from every session
      sessionConnections.forEach((users, sessionId) => {
        if (!users.has(socket.userId)) {
          return;
        }

        users.delete(socket.userId);

        io.to(`session:${sessionId}`).emit("user-disconnected", {
          userId: socket.userId,
          activeUsers: users.size,
        });

        // Remove empty session
        if (users.size === 0) {
          sessionConnections.delete(sessionId);
        }
      });

      console.log(`🔌 User disconnected: ${socket.userId}`);
    });

    // Socket Error

    socket.on("error", (error) => {
      console.error("❌ Socket Error:", error);
    });
  });

  return io;
};

// Exports

export { initSocket, activeUsers, sessionConnections };
