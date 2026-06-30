const rateMap = new Map<string, { count: number; resetAt: number }>();
const isUpstashConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let upstashRatelimit: any = null;

async function getUpstashRatelimit() {
  if (!isUpstashConfigured) return null;
  if (upstashRatelimit) return upstashRatelimit;
  try {
    const { Redis } = await import("@upstash/redis");
    const { Ratelimit } = await import("@upstash/ratelimit");
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      prefix: "papad_store",
    });
    return upstashRatelimit;
  } catch {
    return null;
  }
}

export async function checkRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 60_000,
): Promise<{ allowed: boolean; remaining: number }> {
  const ratelimit = await getUpstashRatelimit();
  if (ratelimit) {
    try {
      const { success, remaining } = await ratelimit.limit(key);
      return { allowed: success, remaining };
    } catch {
      // Fall back to in-memory if Upstash fails
    }
  }

  // In-memory fallback
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}
