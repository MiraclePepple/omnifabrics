import Redis from 'ioredis';

// Create a Redis client using environment variables
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1', // fallback to localhost
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379, // fallback to 6379
  password: process.env.REDIS_PASSWORD || undefined, // optional password
});

export default redis;
