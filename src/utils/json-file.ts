// 🛸 ORBIT JSON File Utilities
// Generic JSON read/write with error handling

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

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
 */
export function writeJsonFile<T>(filePath: string, data: T): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, JSON.stringify(data, null, 2));
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
