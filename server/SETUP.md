# Backend Setup - Quick Start

## Redis Docker Running 

- To run Redis in a Docker container, use the following command:

```bash
docker run -d --name presently-redis -p 6379:6379 redis:latest
```

- To verify that Redis is running, you can use the following command:

```bash
docker ps
```

- Every time restart the docker computer:
- restart the Redis container:

```bash
docker start presently-redis
```

- for stopping the Redis container, use:

```bash
docker stop presently-redis
```


## Prerequisites

- Node.js 16+
- MongoDB 4.4+
- Redis 6.0+

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Create .env file
cp .env.example .env

# Edit .env with your settings:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/presently
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key_generate_with_(openssl rand -base64 32)
```

### 3. Start Database Services

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Redis:**
```bash
redis-server
```

### 4. Start Backend Server

**Terminal 3:**
```bash
npm run dev
```

✅ Server running on `http://localhost:5000`

## Verify Installation

```bash
# Health check
curl http://localhost:5000/health

# Should return:
{
  "success": true,
  "message": "Server is running"
}
```

## Test API Endpoints

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Session
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Session",
    "startTime": "2024-08-05T10:00:00Z"
  }'
```

## Frontend Integration

### 1. Install Socket.io Client
```bash
cd ../presently-app
npm install socket.io-client
```

### 2. Connect Frontend to Backend

In `src/App.jsx`:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('authToken')
  }
});

socket.on('connect', () => {
  console.log('Connected to backend');
});
```

### 3. Update API URL

In `presently-app/.env.local`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Using with Docker

### Build
```bash
docker build -t presently-backend .
```

### Run
```bash
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/presently \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  presently-backend
```

## Common Issues

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongo --version

# Start MongoDB
mongod

# Or use MongoDB Atlas:
# Update MONGODB_URI in .env to your cloud connection
```

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG

# Start Redis
redis-server
```

### JWT Token Errors
```bash
# Generate new JWT secret
openssl rand -base64 32

# Update JWT_SECRET in .env
JWT_SECRET=your_new_secret_here
```

### CORS Errors
Make sure `CORS_ORIGIN` matches your frontend:
```
CORS_ORIGIN=http://localhost:5173
```

## Production Deployment

### 1. Generate Strong JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Set Environment Variables
```
NODE_ENV=production
JWT_SECRET=your_generated_secret
MONGODB_URI=your_atlas_connection
REDIS_URL=your_redis_cloud_url
```

### 3. Build and Deploy
```bash
npm run build
npm start
```

## Monitoring

### View Server Logs
```bash
# Development
npm run dev

# Production
npm start
```

### Check Active Connections
```bash
# In Node terminal
# Look for Socket.io connection logs
```

## Next Steps

1. ✅ Backend running
2. ✅ Database connected
3. ✅ Redis working
4. ⏭️ Connect frontend
5. ⏭️ Test Socket.io
6. ⏭️ Deploy to production

## Need Help?

Check:
- `.env` file is configured correctly
- MongoDB is running on port 27017
- Redis is running on port 6379
- Frontend `CORS_ORIGIN` matches backend URL
- JWT token is valid

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm start` | Start production server |
| `npm run test` | Run tests |
| `npm run seed` | Seed sample data |
| `npm install` | Install dependencies |

---

**Backend ready! Start the frontend and connect them together.** 🚀
