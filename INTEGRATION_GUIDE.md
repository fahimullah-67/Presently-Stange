# Frontend & Backend Integration Guide

Complete guide to integrate React frontend with Node.js backend.

## Architecture Overview

```
┌─────────────────────┐
│  React Frontend     │
│  (Port 5173)        │
└──────────┬──────────┘
           │
           ├─ REST API (HTTP)
           │
           └─ WebSocket (Socket.io)
           │
           ▼
┌─────────────────────┐
│  Express Backend    │
│  (Port 5000)        │
└──────────┬──────────┘
           │
           ├─ MongoDB
           │
           └─ Redis
```

## Step 1: Setup Backend

### Start Backend Services

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Redis:**
```bash
redis-server
```

**Terminal 3 - Express Server:**
```bash
cd server
npm install
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║          🚀 Presently Backend Server Started 🚀          ║
║  Environment: development                                ║
║  Port: 5000                                              ║
║  Socket.io enabled for real-time features               ║
║  Redis connected for caching                            ║
║  MongoDB connected for persistence                      ║
╚════════════════════════════════════════════════════════════╝
```

## Step 2: Configure Frontend

### Update API URL

Edit `presently-app/.env.local`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Install Socket.io Client

```bash
cd presently-app
npm install socket.io-client
```

## Step 3: Replace localStorage with API Calls

### Example: Update Auth Pages

**Before (localStorage):**
```javascript
// src/pages/Auth.jsx
const handleSubmit = (e) => {
  e.preventDefault();
  localStorage.setItem('userAuth', JSON.stringify({ email }));
  navigate('/dashboard');
};
```

**After (API):**
```javascript
import { authAPI } from '../services/api';
import { useState } from 'react';

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await authAPI.login(email, password);
    localStorage.setItem('authToken', response.data.token);
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## Step 4: Integrate Socket.io

### Create Socket Service

Create `presently-app/src/services/socket.js`:
```javascript
import io from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  socket = io(process.env.REACT_APP_API_URL?.replace('/api', ''), {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('[v0] Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('[v0] Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('[v0] Socket error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const emitEvent = (event, data) => {
  if (socket) {
    socket.emit(event, data);
  }
};

export const onEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const offEvent = (event) => {
  if (socket) {
    socket.off(event);
  }
};
```

### Update Dashboard Component

Update `presently-app/src/pages/Dashboard.jsx`:
```javascript
import { useEffect, useState } from 'react';
import { initSocket, onEvent, emitEvent } from '../services/socket';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const sessionId = '...'; // Get from params or state

    // Initialize Socket.io
    const socket = initSocket(token);

    // Join session
    socket.emit('join-session', sessionId);

    // Listen for new messages
    onEvent('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.emit('leave-session', sessionId);
    };
  }, []);

  const handleSendMessage = (text) => {
    const sessionId = '...';
    emitEvent('send-message', {
      sessionId,
      message: text,
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      {/* Rest of component */}
    </div>
  );
};

export default Dashboard;
```

## Step 5: API Integration Examples

### Login & Store Token

```javascript
import { authAPI } from '../services/api';

const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    const { token, user } = response.data;
    
    // Store token
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Initialize Socket.io
    initSocket(token);
    
    navigate('/dashboard');
  } catch (error) {
    console.error('Login error:', error.response.data.message);
  }
};
```

### Create Session

```javascript
import { sessionsAPI } from '../services/api';

const handleCreateSession = async (title, description, startTime) => {
  try {
    const response = await sessionsAPI.createSession({
      title,
      description,
      startTime,
    });
    
    const sessionId = response.data.session._id;
    navigate(`/session/${sessionId}`);
  } catch (error) {
    console.error('Create session error:', error);
  }
};
```

### Send Poll Response

```javascript
import { pollsAPI } from '../services/api';
import { emitEvent } from '../services/socket';

const handlePollResponse = async (pollId, selectedOption) => {
  try {
    const response = await pollsAPI.addResponse(pollId, {
      selectedOption,
    });
    
    // Broadcast to all connected users
    emitEvent('poll-response', {
      pollId,
      response: selectedOption,
    });
    
    console.log('Poll response recorded');
  } catch (error) {
    console.error('Poll response error:', error);
  }
};
```

### Get Messages with Real-Time Sync

```javascript
import { useEffect, useState } from 'react';
import { chatAPI } from '../services/api';
import { onEvent } from '../services/socket';

const ChatComponent = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch initial messages
    chatAPI.getMessages(sessionId).then(response => {
      setMessages(response.data.messages);
    });

    // Listen for real-time messages
    onEvent('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Cleanup
    return () => {
      offEvent('new-message');
    };
  }, [sessionId]);

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.sender}:</strong> {msg.message}
        </div>
      ))}
    </div>
  );
};
```

## Step 6: Testing the Integration

### Test 1: User Registration & Login

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Response should include JWT token
```

### Test 2: Create Session

```bash
# Use token from login
TOKEN="your_jwt_token"

curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Session",
    "startTime": "2024-08-05T10:00:00Z"
  }'
```

### Test 3: Socket.io Connection

Open browser console:
```javascript
// Connect to backend
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('authToken')
  }
});

// Join session
socket.emit('join-session', 'session_id_here');

// Send message
socket.emit('send-message', {
  sessionId: 'session_id_here',
  message: 'Hello from Socket.io!'
});

// Listen for messages
socket.on('new-message', (message) => {
  console.log('New message:', message);
});
```

## Step 7: Environment Setup

Create files:

**presently-app/.env.local:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

**server/.env:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/presently
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## Step 8: Full Workflow Test

### 1. Register New User
```javascript
// In frontend
const newUser = await authAPI.signup('user@example.com', 'password123', 'User Name');
localStorage.setItem('authToken', newUser.data.token);
```

### 2. Create Session
```javascript
const session = await sessionsAPI.createSession({
  title: 'My First Session',
  startTime: new Date(),
});
const sessionId = session.data.session._id;
```

### 3. Start Session
```javascript
await sessionsAPI.startSession(sessionId);
```

### 4. Send Messages Real-Time
```javascript
// Connect Socket.io
const socket = initSocket(localStorage.getItem('authToken'));
socket.emit('join-session', sessionId);

// Send message
socket.emit('send-message', {
  sessionId,
  message: 'Hello!',
});

// Listen for message
socket.on('new-message', (msg) => {
  console.log('New message:', msg);
});
```

### 5. Create Poll
```javascript
const poll = await pollsAPI.createPoll({
  sessionId,
  question: 'Do you like this?',
  type: 'yes-no',
  options: ['Yes', 'No'],
});
```

### 6. Respond to Poll
```javascript
await pollsAPI.addResponse(poll.data.poll._id, {
  selectedOption: poll.data.poll.options[0]._id,
});
```

### 7. Get Analytics
```javascript
const analytics = await analyticsAPI.getAnalytics(sessionId);
console.log('Analytics:', analytics.data);
```

## Troubleshooting

### API Calls Failing

1. Check backend is running:
```bash
curl http://localhost:5000/health
```

2. Check token is valid:
```javascript
const token = localStorage.getItem('authToken');
console.log('Token:', token);
```

3. Check API URL in .env:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Socket.io Not Connecting

1. Check backend is running with Socket.io
2. Verify auth token in socket connection
3. Check CORS_ORIGIN in .env matches frontend

### Database Not Saving

1. Check MongoDB is running: `mongo --version`
2. Check connection string in .env
3. Check MongoDB logs for errors

## Production Deployment

### 1. Deploy Backend
- Push to GitHub
- Deploy to Heroku, AWS, or DigitalOcean
- Set environment variables

### 2. Update Frontend API URL
```
REACT_APP_API_URL=https://your-backend.herokuapp.com/api
```

### 3. Deploy Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or similar

## Next Steps

✅ Backend running on port 5000
✅ Frontend running on port 5173
✅ API calls working
✅ Socket.io real-time features working
✅ Database persistence working
✅ Redis caching working

Start building features! 🚀
