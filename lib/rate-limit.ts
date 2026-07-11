const rateMap = new Map<string, { count: number; resetAt: number }>();
const isUpstashConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let upstashClient: any = null;
const ratelimitInstances = new Map<string, any>();

async function getUpstashClient() {
  if (!isUpstashConfigured) return null;
  if (upstashClient) return upstashClient;
  try {
    const { Redis } = await import("@upstash/redis");
    upstashClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    return upstashClient;
  } catch {
    return null;
  }
}

async function getRatelimit(maxRequests: number, windowMs: number) {
  const key = `${maxRequests}:${windowMs}`;
  if (ratelimitInstances.has(key)) return ratelimitInstances.get(key);

  const { Ratelimit } = await import("@upstash/ratelimit");
  const redis = await getUpstashClient();
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const instance = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSec} s`),
    prefix: "papad_rl",
  });
  ratelimitInstances.set(key, instance);
  return instance;
}

export async function checkRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 60_000,
): Promise<{ allowed: boolean; remaining: number }> {
  const redis = await getUpstashClient();
  if (redis) {
    try {
      const ratelimit = await getRatelimit(maxRequests, windowMs);
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
