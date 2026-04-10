const store = new Map<string, { attempts: number; windowStart: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > 15 * 60 * 1000) store.delete(key);
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; retryAfterSeconds?: number; attempts: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { attempts: 1, windowStart: now });
    return { allowed: true, attempts: 1 };
  }
  if (entry.attempts >= maxAttempts) {
    return { allowed: false, retryAfterSeconds: Math.ceil((windowMs - (now - entry.windowStart)) / 1000), attempts: entry.attempts };
  }
  entry.attempts++;
  return { allowed: true, attempts: entry.attempts };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}
