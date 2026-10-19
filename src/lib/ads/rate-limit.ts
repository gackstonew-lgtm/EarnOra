/**
 * Sliding-window server-side rate limiter for sensitive API endpoints
 * (payment initiation, webhooks, campaign creation, submission).
 */

interface RateBucket {
  timestamps: number[];
}

const buckets = new Map<string, RateBucket>();

export function checkRateLimit(
  key: string,
  limit = 15,
  windowMs = 60_000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key) || { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterSeconds: 0,
  };
}
