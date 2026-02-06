// 🛸 ORBIT Rate Limit Tests
// Comprehensive tests for rate limiting and exponential backoff logic

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectRateLimit,
  calculateBackoff,
  formatDelay,
  createRateLimitHandler,
  sleepWithCountdown,
  RATE_LIMIT_DEFAULTS
} from './rate-limit.js';

describe('detectRateLimit', () => {
  it('should detect rate limit from "rate limit" text', () => {
    const result = detectRateLimit('Error: rate limit exceeded');
    expect(result.isRateLimited).toBe(true);
  });

  it('should detect rate limit from "too many requests" text', () => {
    const result = detectRateLimit('Too many requests, please slow down');
    expect(result.isRateLimited).toBe(true);
  });

  it('should detect rate limit from HTTP 429 status', () => {
    const result = detectRateLimit('HTTP 429: Too Many Requests');
    expect(result.isRateLimited).toBe(true);
  });

  it('should detect rate limit from throttle message', () => {
    const result = detectRateLimit('Request throttled by server');
    expect(result.isRateLimited).toBe(true);
  });

  it('should detect rate limit from quota exceeded', () => {
    const result = detectRateLimit('quota exceeded for this period');
    expect(result.isRateLimited).toBe(true);
  });

  it('should detect rate limit from try again later message', () => {
    const result = detectRateLimit('Please try again later');
    expect(result.isRateLimited).toBe(true);
  });

  it('should detect rate limit from slow down message', () => {
    const result = detectRateLimit('Slow down your requests');
    expect(result.isRateLimited).toBe(true);
  });

  it('should detect rate limit from rate_limit_exceeded', () => {
    const result = detectRateLimit('error: rate_limit_exceeded');
    expect(result.isRateLimited).toBe(true);
  });

  it('should detect rate limit from x-ratelimit-remaining header', () => {
    const result = detectRateLimit('x-ratelimit-remaining: 0');
    expect(result.isRateLimited).toBe(true);
  });

  it('should detect rate limit from exceeded limit message', () => {
    const result = detectRateLimit('You have exceeded your API limit');
    expect(result.isRateLimited).toBe(true);
  });

  it('should not detect rate limit in normal output', () => {
    const result = detectRateLimit('Successfully processed request');
    expect(result.isRateLimited).toBe(false);
  });

  it('should be case insensitive', () => {
    const result = detectRateLimit('RATE LIMIT EXCEEDED');
    expect(result.isRateLimited).toBe(true);
  });

  it('should extract retry-after from "retry-after:" header', () => {
    const result = detectRateLimit('rate limit exceeded\nretry-after: 60');
    expect(result.isRateLimited).toBe(true);
    expect(result.retryAfterMs).toBe(60000);
  });

  it('should extract retry-after from "try again in X seconds"', () => {
    const result = detectRateLimit('Too many requests. Try again in 30 seconds');
    expect(result.isRateLimited).toBe(true);
    expect(result.retryAfterMs).toBe(30000);
  });

  it('should extract retry-after from "wait X seconds"', () => {
    const result = detectRateLimit('rate limited. wait 45 seconds');
    expect(result.isRateLimited).toBe(true);
    expect(result.retryAfterMs).toBe(45000);
  });

  it('should extract retry-after from "reset in X"', () => {
    const result = detectRateLimit('Rate limit reset in 120 seconds');
    expect(result.isRateLimited).toBe(true);
    expect(result.retryAfterMs).toBe(120000);
  });

  it('should include message when rate limited', () => {
    const result = detectRateLimit('Rate limit exceeded for API key');
    expect(result.isRateLimited).toBe(true);
    expect(result.message).toBeTruthy();
    expect(result.message).toContain('Rate limit');
  });

  it('should truncate long messages to 200 characters', () => {
    const longMessage = 'Rate limit exceeded. ' + 'A'.repeat(300);
    const result = detectRateLimit(longMessage);
    expect(result.isRateLimited).toBe(true);
    expect(result.message?.length).toBeLessThanOrEqual(200);
  });
});

describe('calculateBackoff', () => {
  it('should use server retry-after when provided', () => {
    const delay = calculateBackoff(1, RATE_LIMIT_DEFAULTS, 5000);
    expect(delay).toBeGreaterThanOrEqual(5000);
    expect(delay).toBeLessThanOrEqual(5500); // 5000 + jitter
  });

  it('should respect max delay even with server retry-after', () => {
    const config = { ...RATE_LIMIT_DEFAULTS, maxDelayMs: 10000 };
    const delay = calculateBackoff(1, config, 50000);
    expect(delay).toBeLessThanOrEqual(10000);
  });

  it('should use exponential backoff for attempt 0', () => {
    const delay = calculateBackoff(0, RATE_LIMIT_DEFAULTS);
    // baseDelay * 2^0 = 1000 * 1 = 1000, plus jitter (0-500)
    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThanOrEqual(1500);
  });

  it('should use exponential backoff for attempt 1', () => {
    const delay = calculateBackoff(1, RATE_LIMIT_DEFAULTS);
    // baseDelay * 2^1 = 1000 * 2 = 2000, plus jitter (0-500)
    expect(delay).toBeGreaterThanOrEqual(2000);
    expect(delay).toBeLessThanOrEqual(2500);
  });

  it('should use exponential backoff for attempt 2', () => {
    const delay = calculateBackoff(2, RATE_LIMIT_DEFAULTS);
    // baseDelay * 2^2 = 1000 * 4 = 4000, plus jitter (0-500)
    expect(delay).toBeGreaterThanOrEqual(4000);
    expect(delay).toBeLessThanOrEqual(4500);
  });

  it('should cap at max delay', () => {
    const delay = calculateBackoff(10, RATE_LIMIT_DEFAULTS);
    expect(delay).toBeLessThanOrEqual(RATE_LIMIT_DEFAULTS.maxDelayMs);
  });

  it('should add jitter to prevent thundering herd', () => {
    const delays = new Set<number>();
    for (let i = 0; i < 10; i++) {
      delays.add(calculateBackoff(1, RATE_LIMIT_DEFAULTS));
    }
    // Jitter should cause some variation in delays
    expect(delays.size).toBeGreaterThan(1);
  });

  it('should respect custom config', () => {
    const config = {
      maxRetries: 3,
      baseDelayMs: 500,
      maxDelayMs: 10000,
      jitterMs: 100
    };
    const delay = calculateBackoff(0, config);
    expect(delay).toBeGreaterThanOrEqual(500);
    expect(delay).toBeLessThanOrEqual(600);
  });
});

describe('formatDelay', () => {
  it('should format milliseconds', () => {
    expect(formatDelay(500)).toBe('500ms');
    expect(formatDelay(999)).toBe('999ms');
  });

  it('should format seconds', () => {
    expect(formatDelay(1000)).toBe('1s');
    expect(formatDelay(5000)).toBe('5s');
    expect(formatDelay(45000)).toBe('45s');
  });

  it('should format minutes and seconds', () => {
    expect(formatDelay(60000)).toBe('1m 0s');
    expect(formatDelay(75000)).toBe('1m 15s');
    expect(formatDelay(125000)).toBe('2m 5s');
  });

  it('should round seconds', () => {
    expect(formatDelay(1500)).toBe('2s');
    expect(formatDelay(2499)).toBe('2s');
    expect(formatDelay(2500)).toBe('3s');
  });
});

describe('createRateLimitHandler', () => {
  it('should create handler with default config', () => {
    const handler = createRateLimitHandler();
    expect(handler.config.maxRetries).toBe(5);
    expect(handler.config.baseDelayMs).toBe(1000);
    expect(handler.config.maxDelayMs).toBe(60000);
    expect(handler.config.jitterMs).toBe(500);
  });

  it('should merge custom config with defaults', () => {
    const handler = createRateLimitHandler({ maxRetries: 3, baseDelayMs: 2000 });
    expect(handler.config.maxRetries).toBe(3);
    expect(handler.config.baseDelayMs).toBe(2000);
    expect(handler.config.maxDelayMs).toBe(60000); // default
    expect(handler.config.jitterMs).toBe(500); // default
  });

  it('should allow retries below max', () => {
    const handler = createRateLimitHandler({ maxRetries: 3 });
    expect(handler.shouldRetry(0)).toBe(true);
    expect(handler.shouldRetry(1)).toBe(true);
    expect(handler.shouldRetry(2)).toBe(true);
  });

  it('should not allow retries at or above max', () => {
    const handler = createRateLimitHandler({ maxRetries: 3 });
    expect(handler.shouldRetry(3)).toBe(false);
    expect(handler.shouldRetry(4)).toBe(false);
  });

  it('should calculate delays correctly', () => {
    const handler = createRateLimitHandler({ baseDelayMs: 1000, jitterMs: 0 });
    expect(handler.getDelay(0)).toBe(1000); // 1000 * 2^0
    expect(handler.getDelay(1)).toBe(2000); // 1000 * 2^1
    expect(handler.getDelay(2)).toBe(4000); // 1000 * 2^2
  });

  it('should use server retry-after in getDelay', () => {
    const handler = createRateLimitHandler({ jitterMs: 0 });
    const delay = handler.getDelay(1, 5000);
    expect(delay).toBe(5000);
  });
});

describe('sleepWithCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should resolve after specified delay', async () => {
    const promise = sleepWithCountdown(3000);
    
    expect(process.stdout.write).toHaveBeenCalled();
    
    await vi.advanceTimersByTimeAsync(3000);
    
    await expect(promise).resolves.toBeUndefined();
  });

  it('should display countdown messages', async () => {
    const promise = sleepWithCountdown(2000, 'Testing');
    
    // Initial message
    expect(process.stdout.write).toHaveBeenCalledWith(
      expect.stringContaining('Testing')
    );
    
    await vi.advanceTimersByTimeAsync(1000);
    
    // Countdown update
    expect(process.stdout.write).toHaveBeenCalled();
    
    await vi.advanceTimersByTimeAsync(1000);
    
    await promise;
  });

  it('should display completion message', async () => {
    const promise = sleepWithCountdown(1000);
    
    await vi.advanceTimersByTimeAsync(1000);
    await promise;
    
    expect(process.stdout.write).toHaveBeenCalledWith(
      expect.stringContaining('Wait complete')
    );
  });

  it('should use custom message', async () => {
    const promise = sleepWithCountdown(1000, 'Custom retry message');
    
    expect(process.stdout.write).toHaveBeenCalledWith(
      expect.stringContaining('Custom retry message')
    );
    
    await vi.advanceTimersByTimeAsync(1000);
    await promise;
  });
});
