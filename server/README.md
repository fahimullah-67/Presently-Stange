# Presently Backend - Node.js + Express + MongoDB

Complete production-ready backend server for Presently Live Interaction Tool with real-time capabilities.

## Features

✅ **Authentication**
- JWT-based authentication
- Password hashing with bcryptjs
- User registration and login
- Session management

✅ **Real-Time Communication**
- Socket.io for live events
- Real-time chat messaging
- Live poll updates
- Attendee presence tracking
- Typing indicators

✅ **Core Features**
- Session management (create, start, end)
- Poll creation and response tracking
- Live chat with reactions
- Attendee management
- Engagement analytics
- Message persistence

✅ **Caching & Performance**
- Redis for caching
- Fast data retrieval
- Session caching
- Rate limiting ready

✅ **Database**
- MongoDB with Mongoose
- Comprehensive data models
- Indexing for performance
- Analytics tracking

## Installation

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/presently
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

### 3. Start MongoDB and Redis

**MongoDB (if using local):**
```bash
mongod
```

**Redis (if using local):**
```bash
redis-server
```

### 4. Run Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id/start` - Start session
- `PUT /api/sessions/:id/end` - End session
- `POST /api/sessions/:id/attendees` - Add attendee
- `GET /api/sessions/:id/analytics` - Get analytics

### Polls
- `POST /api/polls` - Create poll
- `GET /api/polls/:id` - Get poll with results
- `POST /api/polls/:id/respond` - Respond to poll
- `PUT /api/polls/:id/end` - End poll
- `DELETE /api/polls/:id` - Delete poll
- `GET /api/polls/session/:sessionId` - Get session polls

### Chat
- `POST /api/chat/:sessionId/messages` - Send message
- `GET /api/chat/:sessionId/messages` - Get messages
- `PUT /api/chat/messages/:id` - Update message
- `DELETE /api/chat/messages/:id` - Delete message
- `POST /api/chat/messages/:id/react` - Add reaction
- `PUT /api/chat/messages/:id/pin` - Pin message

## Socket.io Events

### Client to Server (Emit)
- `join-session` - Join a session room
- `leave-session` - Leave session room
- `send-message` - Send chat message
- `poll-response` - Respond to poll
- `create-poll` - Create new poll
- `end-poll` - End poll
- `user-typing` - Indicate typing
- `attendee-joined` - New attendee joined

### Server to Client (Emit)
- `user-joined` - User joined session
- `user-left` - User left session
- `new-message` - New chat message
- `message-updated` - Message edited
- `message-deleted` - Message deleted
- `poll-updated` - Poll response received
- `new-poll` - New poll created
- `poll-ended` - Poll ended
- `user-typing-indicator` - User typing
- `attendee-joined` - Attendee joined
- `user-disconnected` - User disconnected

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   ├── redis.js         # Redis client & helpers
│   │   └── socket.js        # Socket.io setup
│   ├── controllers/
│   │   ├── authController.js      # Auth logic
│   │   ├── sessionController.js   # Session logic
│   │   ├── pollController.js      # Poll logic
│   │   └── chatController.js      # Chat logic
│   ├── models/
│   │   ├── User.js          # User schema
│   │   ├── Session.js       # Session schema
│   │   ├── Poll.js          # Poll schema
│   │   ├── ChatMessage.js   # Message schema
│   │   └── Attendee.js      # Attendee schema
│   ├── routes/
│   │   ├── auth.js          # Auth routes
│   │   ├── sessions.js      # Session routes
│   │   ├── polls.js         # Poll routes
│   │   └── chat.js          # Chat routes
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   └── errorHandler.js  # Error handling
│   └── server.js            # Main server file
├── package.json             # Dependencies
└── .env.example             # Environment template
```

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  role: String (user/admin/organizer),
  status: String (active/inactive/banned),
  preferences: Object,
  metadata: Object
}
```

### Session
```javascript
{
  title: String,
  organizerId: ObjectId,
  status: String (scheduled/live/completed),
  startTime: Date,
  endTime: Date,
  attendees: Array,
  polls: Array,
  settings: Object,
  analytics: Object
}
```

### Poll
```javascript
{
  sessionId: ObjectId,
  createdBy: ObjectId,
  question: String,
  type: String (yes-no/multiple-choice/rating),
  options: Array,
  responses: Array,
  isActive: Boolean,
  analytics: Object
}
```

### ChatMessage
```javascript
{
  sessionId: ObjectId,
  senderId: ObjectId,
  message: String,
  messageType: String (text/image/file/system),
  reactions: Array,
  isDeleted: Boolean,
  timestamp: Date
}
```

### Attendee
```javascript
{
  sessionId: ObjectId,
  userId: ObjectId,
  name: String,
  status: String (invited/registered/joined),
  joinTime: Date,
  engagement: Object,
  feedback: Object
}
```

## Redis Caching

Caching helpers available:
- `cacheSet(key, value, ttl)` - Set cache
- `cacheGet(key)` - Get from cache
- `cacheDelete(key)` - Delete from cache
- `cacheClear()` - Clear all cache

Usage:
```javascript
const { cacheSet, cacheGet }   from './config/redis');

// Set cache
await cacheSet(`user:${userId}`, userData, 3600);

// Get cache
const user = await cacheGet(`user:${userId}`);
```

## Socket.io Integration

### Frontend Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: jwtToken
  }
});

// Join session
socket.emit('join-session', sessionId);

// Send message
socket.emit('send-message', {
  sessionId,
  message: 'Hello!'
});

// Listen for events
socket.on('new-message', (message) => {
  console.log('New message:', message);
});
```

## Error Handling

All endpoints return consistent error responses:
```javascript
{
  success: false,
  message: "Error description",
  statusCode: 400,
  stack: "..." // Only in development
}
```

## Security Features

- JWT authentication
- Password hashing (bcryptjs)
- Helmet for security headers
- CORS enabled
- Input validation
- Rate limiting ready
- MongoDB injection prevention

## Testing

Run tests:
```bash
npm run test
```

## Deployment

### Heroku
```bash
git push heroku main
```

### AWS/DigitalOcean
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t presently-backend .
docker run -p 5000:5000 presently-backend
```

## Environment Variables

See `.env.example` for complete list:
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - JWT signing key
- `CORS_ORIGIN` - CORS allowed origin
- `NODE_ENV` - Environment (development/production)

## Performance Optimization

- Database indexing on frequently queried fields
- Redis caching for user and session data
- Message pagination (50 per request)
- Connection pooling
- Compression enabled
- Real-time updates via Socket.io

## Monitoring

Console logs with `[v0]` prefix for debugging:
- Connection events
- API requests
- Error messages
- Socket.io events

## Support

For issues, check:
1. MongoDB is running: `mongod`
2. Redis is running: `redis-server`
3. Environment variables are set
4. JWT secret is configured
5. CORS origin matches frontend

## License

MIT
