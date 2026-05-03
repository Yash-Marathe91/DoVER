require('dotenv').config();
const Queue = require('bull');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Upstash uses rediss:// (TLS). Bull needs tls options explicitly passed.
const isTLS = REDIS_URL.startsWith('rediss://');
const redisOpts = isTLS
    ? { url: REDIS_URL, tls: { rejectUnauthorized: false } }
    : { url: REDIS_URL };

const documentQueue = new Queue('document-processing', {
    redis: redisOpts,
    settings: {
        lockDuration: 180000,
        lockRenewTime: 45000,
        stalledInterval: 120000,
    }
});

documentQueue.on('error', (error) => {
    console.error('[QUEUE_ERROR] Redis connection issue:', error.message);
});

module.exports = documentQueue;