/**
 * Simple sliding-window rate limiter using the Cloudflare Cache API.
 * Free (no paid binding required). Uses `caches.default` which is available
 * in the Cloudflare Workers runtime.
 *
 * Pattern: allows `maxRequests` per `windowSeconds` per client IP.
 */

const RATE_LIMIT_PREFIX = 'https://ratelimit.internal/';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds until window resets (only set when blocked)
}

/**
 * Check rate limit for the given request.
 * @param request - The incoming request (used for IP extraction)
 * @param maxRequests - Max requests allowed per window (default: 60)
 * @param windowSeconds - Window size in seconds (default: 60)
 * @returns RateLimitResult with allowed status and remaining count
 */
export async function checkRateLimit(
  request: Request,
  maxRequests: number = 60,
  windowSeconds: number = 60,
): Promise<RateLimitResult> {
  // Extract client IP from Cloudflare header
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
  const cacheKey = new Request(`${RATE_LIMIT_PREFIX}${ip}/${windowStart}`);

  const cache = caches.default;

  // Try to read the current count from cache
  let count = 0;
  const cached = await cache.match(cacheKey);
  if (cached) {
    count = Number(cached.headers.get('X-RateLimit-Count') ?? '0');
  }

  count += 1;
  const remaining = Math.max(0, maxRequests - count);

  if (count > maxRequests) {
    const retryAfter = windowStart + windowSeconds - now;
    return { allowed: false, remaining: 0, retryAfter };
  }

  // Store updated count in cache with TTL = window size
  const cacheResponse = new Response('ok', {
    headers: {
      'Cache-Control': `public, max-age=${windowSeconds}`,
      'X-RateLimit-Count': String(count),
    },
  });
  // Fire-and-forget cache put (don't block the response)
  cache.put(cacheKey, cacheResponse).catch(() => {});

  return { allowed: true, remaining, retryAfter: 0 };
}

/**
 * Helper to create a 429 Rate Limit response.
 */
export function rateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': '60',
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}
