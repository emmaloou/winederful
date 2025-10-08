import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Connecter au démarrage
redis.connect().catch((err) => {
  console.error('Erreur connexion Redis:', err);
});

// Constantes TTL cache
export const CACHE_TTL = {
  PRODUCTS: 60 * 5, // 5 minutes
  PRODUCT_DETAIL: 60 * 10, // 10 minutes
  USER_SESSION: 60 * 60 * 24, // 24 heures
};
