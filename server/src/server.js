require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');

// Database and Redis
const { connectDB, disconnectDB } = require('./config/database');
const { initRedis, closeRedis } = require('./config/redis');

// Socket.io
const { initSocket } = require('./config/socket');

// Middleware
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const pollRoutes = require('./routes/polls');
const chatRoutes = require('./routes/chat');
const zoomRoutes = require('./routes/zoom');

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet());

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Compression
app.use(compression());


app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
app.use(morgan('dev'));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/zoom', zoomRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Presently API v1.0',
    endpoints: {
      auth: '/api/auth',
      sessions: '/api/sessions',
      polls: '/api/polls',
      chat: '/api/chat',
      zoom: '/api/zoom',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Global Error Handler
app.use(errorHandler);

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Redis
    await initRedis();

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          🚀 Presently Backend Server Started 🚀           ║
║                                                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}
║  Port: ${PORT}
║  API: http://localhost:${PORT}/api
║  Health: http://localhost:${PORT}/health
║                                                            ║
║  Socket.io enabled for real-time features                  ║
║  Redis connected for caching                               ║
║  MongoDB connected for persistence                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Server Startup Error:', error.message);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');

  server.close(async () => {
    console.log('HTTP server closed');

    await disconnectDB();
    await closeRedis();

    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');

  server.close(async () => {
    console.log('HTTP server closed');

    await disconnectDB();
    await closeRedis();

    process.exit(0);
  });
});

// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

// Start server
startServer();

module.exports = { app, server, io };
