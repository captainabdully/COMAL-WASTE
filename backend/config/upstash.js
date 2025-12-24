import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import "dotenv/config";

// Fixed: Use different variable name to avoid conflict
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m") // Fixed: Use Ratelimit, not RateLimit
});

export default ratelimit;