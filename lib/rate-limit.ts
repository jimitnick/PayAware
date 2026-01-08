import Redis from 'ioredis'

// Initialize Redis client with robust error handling
// Default to localhost, but fail gracefully if unavailable
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 1, // Fail fast if Redis is down
    retryStrategy: (times) => {
        // Don't retry endlessly in dev if it's clearly not running
        if (times > 3) return null
        return Math.min(times * 50, 2000)
    }
})

// Prevent unhandled error events from crashing the server
redis.on('error', (err) => {
    // Log once or suppress in development
    if (process.env.NODE_ENV === 'development') {
        // console.warn('Redis connection error (rate limiting disabled):', err.message)
    } else {
        console.error('Redis connection error:', err)
    }
})

interface RateLimitConfig {
    uniqueToken: string
    limit: number
    window: number // in seconds
}

interface RateLimitResult {
    success: boolean
    remaining: number
    reset: number
}

// Function to check rate limit (Sliding Window or Fixed Window)
export async function rateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    const { uniqueToken, limit, window } = config
    const key = `rate_limit:${uniqueToken}`

    try {
        const currentUsage = await redis.incr(key)

        if (currentUsage === 1) {
            await redis.expire(key, window)
        }

        const ttl = await redis.ttl(key)

        return {
            success: currentUsage <= limit,
            remaining: Math.max(0, limit - currentUsage),
            reset: Date.now() + (ttl * 1000),
        }
    } catch (error) {
        // Fail open: If Redis is down, allow the request
        // console.warn('Rate limit check failed, allowing request.')
        return {
            success: true,
            remaining: limit,
            reset: Date.now() + (window * 1000)
        }
    }
}
