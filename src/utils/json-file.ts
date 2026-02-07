// 🛸 ORBIT JSON File Utilities
// Generic JSON read/write with error handling

import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';

export interface JsonFileOptions<T> {
  defaultValue: T;
  validate?: (data: unknown) => T;
}

interface WriteOptions {
  maxRetries?: number;
  retryDelayMs?: number;
}

const DEFAULT_WRITE_OPTIONS: Required<WriteOptions> = {
  maxRetries: 3,
  retryDelayMs: 50
};

/**
 * Safely reads a JSON file with fallback to default value.
 * Handles file not found, invalid JSON, and validation errors.
 */
export function readJsonFile<T>(filePath: string, options: JsonFileOptions<T>): T {
  if (!existsSync(filePath)) {
    return options.defaultValue;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return options.validate ? options.validate(parsed) : parsed;
  } catch {
    return options.defaultValue;
  }
}

/**
 * Writes data to a JSON file with automatic directory creation.
 * Creates parent directories if they don't exist.
 * Uses atomic write (temp file + rename) to prevent data corruption.
 * Includes retry logic for transient file system errors.
 */
export function writeJsonFile<T>(filePath: string, data: T, options: WriteOptions = {}): void {
  const { maxRetries, retryDelayMs } = { ...DEFAULT_WRITE_OPTIONS, ...options };
  const dir = dirname(filePath);
  
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const tempFile = join(dir, `.orbit-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);
    
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      writeFileSync(tempFile, jsonContent, { mode: 0o644 });
      renameSync(tempFile, filePath);
      return; // Success
    } catch (error) {
      lastError = error as Error;
      
      // Clean up temp file if it exists
      cleanupTempFile(tempFile);
      
      // Check if error is retryable
      const isRetryable = isRetryableError(error as NodeJS.ErrnoException);
      
      if (!isRetryable || attempt === maxRetries) {
        break; // Don't retry or max retries reached
      }
      
      // Exponential backoff with jitter
      const delay = retryDelayMs * Math.pow(2, attempt) + Math.random() * 10;
      sleepSync(delay);
    }
  }
  
  throw lastError || new Error('Failed to write JSON file after retries');
}

/**
 * Helper: Clean up a temporary file safely.
 */
function cleanupTempFile(tempFile: string): void {
  if (existsSync(tempFile)) {
    try {
      unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors - file may not exist or be locked
    }
  }
}

/**
 * Helper: Check if an error is retryable.
 */
function isRetryableError(error: NodeJS.ErrnoException): boolean {
  const retryableCodes = ['EBUSY', 'ENOENT', 'EPERM', 'EMFILE', 'ENFILE'];
  return error.code ? retryableCodes.includes(error.code) : false;
}

/**
 * Helper: Synchronous sleep for retry delays.
 */
function sleepSync(ms: number): void {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // Busy wait - only for short delays (< 1s)
  }
}

/**
 * Updates a JSON file by loading it, applying a transform function, and saving.
 * Atomically reads, transforms, and writes the file.
 */
export function updateJsonFile<T>(
  filePath: string,
  options: JsonFileOptions<T>,
  transform: (data: T) => T,
  writeOptions?: WriteOptions
): void {
  const current = readJsonFile(filePath, options);
  const updated = transform(current);
  writeJsonFile(filePath, updated, writeOptions);
}
