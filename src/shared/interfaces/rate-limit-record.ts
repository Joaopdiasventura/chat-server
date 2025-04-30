interface RateLimitRecord {
  count: number;
  windowStart: number;
  blockedUntil: number;
}
