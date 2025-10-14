"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const globalForRedis = global;
exports.redis = globalForRedis.redis ??
    new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        lazyConnect: true,
    });
if (process.env.NODE_ENV !== 'production')
    globalForRedis.redis = exports.redis;
// Connecter au démarrage
exports.redis.connect().catch((err) => {
    console.error('Erreur connexion Redis:', err);
});
// Constantes TTL cache
exports.CACHE_TTL = {
    PRODUCTS: 60 * 5, // 5 minutes
    PRODUCT_DETAIL: 60 * 10, // 10 minutes
    USER_SESSION: 60 * 60 * 24, // 24 heures
};
