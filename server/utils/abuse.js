const { createClient } = require('redis');
const db = require('../db/db');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const isTLS = redisUrl.startsWith('rediss://');
let redisClient;

async function getRedisClient() {
    if (!redisClient) {
        redisClient = createClient({
            url: redisUrl,
            ...(isTLS ? { socket: { tls: true, rejectUnauthorized: false } } : {})
        });
        redisClient.on('error', (err) => console.error('Redis Client Error', err));
        await redisClient.connect();
    }
    return redisClient;
}

// --- In-Memory Fallback Cache ---
const localCache = new Map();

function cleanLocalCache() {
    const now = Date.now();
    for (const [key, value] of localCache.entries()) {
        if (value.expiresAt < now) {
            localCache.delete(key);
        }
    }
}
setInterval(cleanLocalCache, 60000); // Cleanup every minute

async function localIncr(key, weight = 1, ttlSeconds = null) {
    cleanLocalCache();
    let entry = localCache.get(key);
    if (!entry) {
        entry = { count: 0, expiresAt: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : Infinity };
    }
    entry.count += weight;
    localCache.set(key, entry);
    return entry.count;
}

async function localSet(key, value, ttlSeconds = null) {
    localCache.set(key, { 
        count: value, 
        expiresAt: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : Infinity 
    });
}

async function localGet(key) {
    cleanLocalCache();
    const entry = localCache.get(key);
    return entry ? entry.count : null;
}
// --------------------------------

const SCORE_WEIGHTS = {
    FAILED_VERIFICATION: 2,
    RAPID_UPLOAD: 3,
    HASH_COLLISION: 1,
    AUTH_FAILURE: 5
};

const THRESHOLDS = {
    FLAG: 15,
    BLOCK: 30
};

async function recordSignal(userId, signalType) {
    if (!userId) return;

    let newScore;
    const weight = SCORE_WEIGHTS[signalType] || 1;
    const key = `abuse:score:${userId}`;

    try {
        const client = await getRedisClient();
        newScore = await client.incrBy(key, weight);
        if (newScore === weight) await client.expire(key, 3600);
    } catch (error) {
        console.warn('[REDIS_FALLBACK] Redis offline, using local cache for recordSignal');
        newScore = await localIncr(key, weight, 3600);
    }

    try {
        if (newScore >= THRESHOLDS.BLOCK) {
            db.prepare('UPDATE users SET is_flagged = 1, abuse_score = ? WHERE id = ?').run(newScore, userId);
        } else if (newScore >= THRESHOLDS.FLAG) {
            db.prepare('UPDATE users SET is_flagged = 1, abuse_score = ? WHERE id = ?').run(newScore, userId);
        } else {
            db.prepare('UPDATE users SET abuse_score = ? WHERE id = ?').run(newScore, userId);
        }
    } catch (e) {
        console.error('[ABUSE_DB_ERROR]', e);
    }
    
    return newScore;
}

async function recordAuthFailure(ip) {
    let count;
    const key = `abuse:auth_fail:${ip}`;
    const blockKey = `blocklist:${ip}`;

    try {
        const client = await getRedisClient();
        count = await client.incr(key);
        if (count === 1) await client.expire(key, 900);
        
        if (count >= 5) {
            await client.set(blockKey, '1', { EX: 900 });
        }
    } catch (error) {
        console.warn('[REDIS_FALLBACK] Redis offline, using local cache for recordAuthFailure');
        count = await localIncr(key, 1, 900);
        if (count >= 5) {
            await localSet(blockKey, '1', 900);
        }
    }

    if (count >= 5) {
        try {
            db.prepare(`INSERT INTO audit_log (document_id, action, actor, details) VALUES (?, ?, ?, ?)`)
              .run(0, 'IP_BLOCKED', ip, `IP ${ip} blocked after ${count} auth failures.`);
        } catch (e) {}
    }
    return count;
}

async function isIpBlocked(ip) {
    const key = `blocklist:${ip}`;
    try {
        const client = await getRedisClient();
        const isBlocked = await client.get(key);
        return !!isBlocked;
    } catch (error) {
        return !!(await localGet(key));
    }
}

async function recordUploadVelocity(userId) {
    const key = `abuse:upload_velocity:${userId}`;
    try {
        const client = await getRedisClient();
        const count = await client.incr(key);
        if (count === 1) await client.expire(key, 60); // 1 minute window
        return count;
    } catch (error) {
        console.warn('[REDIS_FALLBACK] Redis offline, using local cache for recordUploadVelocity');
        return await localIncr(key, 1, 60);
    }
}

module.exports = {
    recordSignal,
    recordAuthFailure,
    isIpBlocked,
    recordUploadVelocity
};
