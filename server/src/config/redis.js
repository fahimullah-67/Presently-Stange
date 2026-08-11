import redis from "redis";

let redisClient = null;

// Initialize Redis

const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",

      socket: {
        reconnectStrategy: (retries) => {
          const delay = Math.min(retries * 50, 500);
          return delay;
        },
      },
    });

    // Redis error handler
    redisClient.on("error", (error) => {
      console.error("Redis Client Error:", error);
    });

    // Redis connection handler
    redisClient.on("connect", () => {
      console.log("Redis Connected");
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error("Redis Connection Error:", error.message);
    throw error;
  }
};

// Get Redis Client

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized");
  }

  return redisClient;
};

// Close Redis Connection

const closeRedis = async () => {
  if (!redisClient) {
    return;
  }

  await redisClient.quit();

  console.log("Redis Disconnected");
};

// Cache Helpers

// Set cache
const cacheSet = async (key, value, ttl = 3600) => {
  try {
    const client = getRedisClient();
    const serializedValue = JSON.stringify(value);

    if (ttl) {
      await client.setEx(key, ttl, serializedValue);
    } else {
      await client.set(key, serializedValue);
    }
  } catch (error) {
    console.error("Redis Set Error:", error.message);
  }
};

// Get cache
const cacheGet = async (key) => {
  try {
    const client = getRedisClient();

    const data = await client.get(key);

    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Redis Get Error:", error.message);

    return null;
  }
};

// Delete cache
const cacheDelete = async (key) => {
  try {
    const client = getRedisClient();

    await client.del(key);
  } catch (error) {
    console.error("Redis Delete Error:", error.message);
  }
};

// Clear entire database
const cacheClear = async () => {
  try {
    const client = getRedisClient();

    await client.flushDb();
  } catch (error) {
    console.error("Redis Clear Error:", error.message);
  }
};

// Increment a Redis value
const cacheIncr = async (key) => {
  try {
    const client = getRedisClient();

    return await client.incr(key);
  } catch (error) {
    console.error("Redis Increment Error:", error.message);
    throw error;
  }
};

// Set expiration for a Redis key
const cacheExpire = async (key, seconds) => {
  try {
    const client = getRedisClient();

    await client.expire(key, seconds);
  } catch (error) {
    console.error("Redis Expire Error:", error.message);
    throw error;
  }
};

export {
  initRedis,
  getRedisClient,
  closeRedis,
  cacheSet,
  cacheGet,
  cacheDelete,
  cacheClear,
  cacheIncr,
  cacheExpire,
};
