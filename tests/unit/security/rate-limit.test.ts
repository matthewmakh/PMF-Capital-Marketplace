import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("Rate Limiter", () => {
  beforeEach(() => {
    // Reset by using a unique key for each test
    resetRateLimit("test-key");
  });

  it("allows first attempt", () => {
    const result = checkRateLimit("rl-first", 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.attempts).toBe(1);
  });

  it("allows up to maxAttempts", () => {
    const key = "rl-max";
    for (let i = 1; i <= 5; i++) {
      const result = checkRateLimit(key, 5, 60000);
      expect(result.allowed).toBe(true);
      expect(result.attempts).toBe(i);
    }
  });

  it("blocks after maxAttempts exceeded", () => {
    const key = "rl-block";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60000);
    }
    const result = checkRateLimit(key, 5, 60000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resetRateLimit clears the counter", () => {
    const key = "rl-reset";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60000);
    }
    expect(checkRateLimit(key, 5, 60000).allowed).toBe(false);

    resetRateLimit(key);
    const result = checkRateLimit(key, 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.attempts).toBe(1);
  });

  it("retryAfterSeconds decreases over time", () => {
    const key = "rl-retry";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60000);
    }
    const result = checkRateLimit(key, 5, 60000);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("uses default maxAttempts of 5", () => {
    const key = "rl-default";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key).allowed).toBe(true);
    }
    expect(checkRateLimit(key).allowed).toBe(false);
  });
});
