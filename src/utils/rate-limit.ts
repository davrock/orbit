// 🛸 ORBIT Rate Limit Detection and Auto-Resume
// Handles API rate limits with exponential backoff

import { colors } from './output.js';

export interface RateLimitConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterMs: number;
}

export interface RateLimitResult {
  isRateLimited: boolean;
  retryAfterMs?: number;
  message?: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRetries: 5,
  baseDelayMs: 1000,
  maxDelayMs: 60000,
  jitterMs: 500
};

// Rate limit detection patterns
const RATE_LIMIT_PATTERNS = [
  /rate limit/i,
  /too many requests/i,
  /429/,
  /throttl/i,
  /quota exceeded/i,
  /try again later/i,
  /slow down/i,
  /rate_limit_exceeded/i,
  /x-ratelimit-remaining:\s*0/i,
  /exceeded.*limit/i
];

// Extract retry-after header value (in seconds) from output
const RETRY_AFTER_PATTERNS = [
  /retry[- ]after:\s*(\d+)/i,
  /try again in (\d+)\s*second/i,
  /wait (\d+)\s*second/i,
  /reset in (\d+)/i
];

/**
 * Detects if the output indicates a rate limit error.
 */
export function detectRateLimit(output: string): RateLimitResult {
  const isRateLimited = RATE_LIMIT_PATTERNS.some(pattern => pattern.test(output));
  
  if (!isRateLimited) {
    return { isRateLimited: false };
  }

  // Try to extract retry-after value
  let retryAfterMs: number | undefined;
  for (const pattern of RETRY_AFTER_PATTERNS) {
    const match = output.match(pattern);
    if (match?.[1]) {
      retryAfterMs = parseInt(match[1], 10) * 1000;
      break;
    }
  }

  return {
    isRateLimited: true,
    retryAfterMs,
    message: extractRateLimitMessage(output)
  };
}

/**
 * Extracts a user-friendly rate limit message from output.
 */
function extractRateLimitMessage(output: string): string {
  const lines = output.split('\n');
  for (const line of lines) {
    if (RATE_LIMIT_PATTERNS.some(pattern => pattern.test(line))) {
      return line.trim().slice(0, 200);
    }
  }
  return 'Rate limit exceeded';
}

/**
 * Calculates exponential backoff delay with jitter.
 */
export function calculateBackoff(
  attempt: number,
  config: RateLimitConfig = DEFAULT_CONFIG,
  retryAfterMs?: number
): number {
  // If server provided retry-after, use it (with a small buffer)
  if (retryAfterMs && retryAfterMs > 0) {
    return Math.min(retryAfterMs + config.jitterMs, config.maxDelayMs);
  }

  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
  
  // Add random jitter to prevent thundering herd
  const jitter = Math.random() * config.jitterMs;
  
  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, config.maxDelayMs);
}

/**
 * Formats delay for user display.
 */
export function formatDelay(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Sleeps for the specified duration with countdown display.
 */
export async function sleepWithCountdown(
  delayMs: number,
  message = 'Rate limited. Waiting'
): Promise<void> {
  const totalSeconds = Math.ceil(delayMs / 1000);
  let remaining = totalSeconds;

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        process.stdout.write(`\r${colors.warning('⏳')} ${message}: ${colors.secondary(formatDelay(remaining * 1000))} remaining...  `);
      }
    }, 1000);

    process.stdout.write(`\r${colors.warning('⏳')} ${message}: ${colors.secondary(formatDelay(delayMs))} remaining...  `);

    setTimeout(() => {
      clearInterval(interval);
      process.stdout.write(`\r${colors.success('✓')} Wait complete, resuming...                    \n`);
      resolve();
    }, delayMs);
  });
}

/**
 * Creates a rate limit handler with the given configuration.
 */
export function createRateLimitHandler(config: Partial<RateLimitConfig> = {}): {
  config: RateLimitConfig;
  shouldRetry: (attempt: number) => boolean;
  getDelay: (attempt: number, retryAfterMs?: number) => number;
} {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  return {
    config: mergedConfig,
    shouldRetry: (attempt: number) => attempt < mergedConfig.maxRetries,
    getDelay: (attempt: number, retryAfterMs?: number) => 
      calculateBackoff(attempt, mergedConfig, retryAfterMs)
  };
}

export { DEFAULT_CONFIG as RATE_LIMIT_DEFAULTS };
