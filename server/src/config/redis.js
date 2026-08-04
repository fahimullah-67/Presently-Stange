const redis = require('redis');

let redisClient = null;

const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 50, 500);
          return delay;
        },
      },
    });

    redisClient.on('error', (error) => {
      console.error('edis Client Error', error);
    });

    redisClient.on('connect', () => {
      console.log('Redis Connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Redis Connection Error:', error.message);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis Disconnected');
  }
};

// Redis Helper Functions
const cacheSet = async (key, value, ttl = 3600) => {
  try {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    if (ttl) {
      await client.setEx(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }
  } catch (error) {
    console.error('Redis Set Error:', error.message);
  }
};

const cacheGet = async (key) => {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis Get Error:', error.message);
    return null;
  }
};

const cacheDelete = async (key) => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Redis Delete Error:', error.message);
  }
};

const cacheClear = async () => {
  try {
    const client = getRedisClient();
    await client.flushDb();
  } catch (error) {
    console.error('Redis Clear Error:', error.message);
  }
};

module.exports = {
  initRedis,
  getRedisClient,
  closeRedis,
  cacheSet,
  cacheGet,
  cacheDelete,
  cacheClear,
};
