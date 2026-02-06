// 🛸 ORBIT JSON File Utilities
// Generic JSON read/write with error handling

import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';

export interface JsonFileOptions<T> {
  defaultValue: T;
  validate?: (data: unknown) => T;
}

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
 */
export function writeJsonFile<T>(filePath: string, data: T): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const tempFile = join(dir, `.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`);
  const jsonContent = JSON.stringify(data, null, 2);

  try {
    writeFileSync(tempFile, jsonContent);
    renameSync(tempFile, filePath);
  } catch (error) {
    // Clean up temp file if it exists
    if (existsSync(tempFile)) {
      try {
        unlinkSync(tempFile);
      } catch {
        // Ignore cleanup errors
      }
    }
    throw error;
  }
}

/**
 * Updates a JSON file by loading it, applying a transform function, and saving.
 * Atomically reads, transforms, and writes the file.
 */
export function updateJsonFile<T>(
  filePath: string,
  options: JsonFileOptions<T>,
  transform: (data: T) => T
): void {
  const current = readJsonFile(filePath, options);
  const updated = transform(current);
  writeJsonFile(filePath, updated);
}
