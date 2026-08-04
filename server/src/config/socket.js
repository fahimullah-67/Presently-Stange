const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const Session = require('../models/Session');

// Store active connections
const activeUsers = new Map();
const sessionConnections = new Map();

const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: process.env.SOCKET_CORS_CREDENTIALS === 'true',
    },
  });

  // Middleware to verify JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      console.error('Socket Auth Error:', error.message);
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', async (socket) => {
    console.log('User connected:', socket.userId);

    // Store user connection
    activeUsers.set(socket.userId, socket.id);

    // Join session room
    socket.on('join-session', async (sessionId) => {
      try {
        socket.join(`session:${sessionId}`);

        // Track connection
        if (!sessionConnections.has(sessionId)) {
          sessionConnections.set(sessionId, new Set());
        }
        sessionConnections.get(sessionId).add(socket.userId);

        // Notify others
        io.to(`session:${sessionId}`).emit('user-joined', {
          userId: socket.userId,
          sessionId,
          activeUsers: sessionConnections.get(sessionId).size,
        });

        console.log(`User ${socket.userId} joined session ${sessionId}`);
      } catch (error) {
        console.error('Join Session Error:', error.message);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Leave session
    socket.on('leave-session', (sessionId) => {
      try {
        socket.leave(`session:${sessionId}`);

        if (sessionConnections.has(sessionId)) {
          sessionConnections.get(sessionId).delete(socket.userId);

          io.to(`session:${sessionId}`).emit('user-left', {
            userId: socket.userId,
            sessionId,
            activeUsers: sessionConnections.get(sessionId).size,
          });
        }

        console.log(`User ${socket.userId} left session ${sessionId}`);
      } catch (error) {
        console.error('Leave Session Error:', error.message);
      }
    });

    // Chat message
    socket.on('send-message', async (data) => {
      try {
        const { sessionId, message } = data;

        // Save to database
        const chatMessage = await ChatMessage.create({
          sessionId,
          senderId: socket.userId,
          message,
          messageType: 'text',
        });

        // Populate user info
        await chatMessage.populate('senderId', 'name email avatar');

        // Broadcast to session
        io.to(`session:${sessionId}`).emit('new-message', {
          id: chatMessage._id,
          sender: chatMessage.senderName,
          message: chatMessage.message,
          timestamp: chatMessage.createdAt,
        });

        console.log(`Message sent in session ${sessionId}`);
      } catch (error) {
        console.error('Send Message Error:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Poll update
    socket.on('poll-response', async (data) => {
      try {
        const { sessionId, pollId, response } = data;

        // Broadcast poll response
        io.to(`session:${sessionId}`).emit('poll-updated', {
          pollId,
          response,
          timestamp: new Date(),
        });

        console.log(`Poll response in session ${sessionId}`);
      } catch (error) {
        console.error('Poll Response Error:', error.message);
        socket.emit('error', { message: 'Failed to process poll response' });
      }
    });

    // Poll creation
    socket.on('create-poll', (data) => {
      try {
        const { sessionId, poll } = data;

        io.to(`session:${sessionId}`).emit('new-poll', {
          poll,
          createdBy: socket.userId,
          timestamp: new Date(),
        });

        console.log(`Poll created in session ${sessionId}`);
      } catch (error) {
        console.error('Create Poll Error:', error.message);
      }
    });

    // Poll end
    socket.on('end-poll', (data) => {
      try {
        const { sessionId, pollId } = data;

        io.to(`session:${sessionId}`).emit('poll-ended', {
          pollId,
          timestamp: new Date(),
        });

        console.log(`[Poll ended in session ${sessionId}`);
      } catch (error) {
        console.error('[v0] End Poll Error:', error.message);
      }
    });

    // Typing indicator
    socket.on('user-typing', (data) => {
      const { sessionId, typing } = data;
      io.to(`session:${sessionId}`).emit('user-typing-indicator', {
        userId: socket.userId,
        typing,
      });
    });

    // Real-time notifications
    socket.on('attendee-joined', (data) => {
      const { sessionId, attendee } = data;
      io.to(`session:${sessionId}`).emit('attendee-joined', {
        attendee,
        timestamp: new Date(),
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      activeUsers.delete(socket.userId);

      // Notify all sessions user was in
      sessionConnections.forEach((users, sessionId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          io.to(`session:${sessionId}`).emit('user-disconnected', {
            userId: socket.userId,
            activeUsers: users.size,
          });
        }
      });

      console.log('User disconnected:', socket.userId);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error('Socket Error:', error);
    });
  });

  return io;
};

module.exports = { initSocket, activeUsers, sessionConnections };
