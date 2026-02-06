// 🛸 ORBIT JSON File Utilities Tests

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { readJsonFile, writeJsonFile, updateJsonFile } from './json-file.js';

const TEST_DIR = '.test-json-file';
const TEST_FILE = join(TEST_DIR, 'test.json');

describe('readJsonFile', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should return default value when file does not exist', () => {
    const result = readJsonFile(TEST_FILE, { defaultValue: { count: 0 } });
    expect(result).toEqual({ count: 0 });
  });

  it('should read valid JSON file', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    writeFileSync(TEST_FILE, JSON.stringify({ count: 42 }));
    
    const result = readJsonFile(TEST_FILE, { defaultValue: { count: 0 } });
    expect(result).toEqual({ count: 42 });
  });

  it('should return default value for invalid JSON', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    writeFileSync(TEST_FILE, 'invalid json{');
    
    const result = readJsonFile(TEST_FILE, { defaultValue: { count: 0 } });
    expect(result).toEqual({ count: 0 });
  });

  it('should apply validation function', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    writeFileSync(TEST_FILE, JSON.stringify({ value: 10 }));
    
    const result = readJsonFile(TEST_FILE, {
      defaultValue: { count: 0 },
      validate: (data: any) => ({ count: data.value || 0 })
    });
    
    expect(result).toEqual({ count: 10 });
  });

  it('should handle validation errors gracefully', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    writeFileSync(TEST_FILE, JSON.stringify({ value: 10 }));
    
    const result = readJsonFile(TEST_FILE, {
      defaultValue: { count: 0 },
      validate: () => { throw new Error('validation error'); }
    });
    
    expect(result).toEqual({ count: 0 });
  });

  it('should handle empty file gracefully', () => {
    mkdirSync(TEST_DIR, { recursive: true });
    writeFileSync(TEST_FILE, '');
    
    const result = readJsonFile(TEST_FILE, { defaultValue: { count: 0 } });
    expect(result).toEqual({ count: 0 });
  });
});

describe('writeJsonFile', () => {
  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should write JSON file', () => {
    writeJsonFile(TEST_FILE, { count: 42 });
    
    expect(existsSync(TEST_FILE)).toBe(true);
    const result = readJsonFile(TEST_FILE, { defaultValue: { count: 0 } });
    expect(result).toEqual({ count: 42 });
  });

  it('should create parent directories', () => {
    const nestedFile = join(TEST_DIR, 'nested', 'deep', 'test.json');
    writeJsonFile(nestedFile, { count: 42 });
    
    expect(existsSync(nestedFile)).toBe(true);
    const result = readJsonFile(nestedFile, { defaultValue: { count: 0 } });
    expect(result).toEqual({ count: 42 });
  });

  it('should format JSON with indentation', () => {
    writeJsonFile(TEST_FILE, { count: 42, name: 'test' });
    
    const content = require('fs').readFileSync(TEST_FILE, 'utf-8');
    expect(content).toContain('\n');
    expect(content).toContain('  ');
  });

  it('should overwrite existing file', () => {
    writeJsonFile(TEST_FILE, { count: 1 });
    writeJsonFile(TEST_FILE, { count: 2 });
    
    const result = readJsonFile(TEST_FILE, { defaultValue: { count: 0 } });
    expect(result).toEqual({ count: 2 });
  });
});

describe('updateJsonFile', () => {
  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should update existing file', () => {
    writeJsonFile(TEST_FILE, { count: 5 });
    
    updateJsonFile(
      TEST_FILE,
      { defaultValue: { count: 0 } },
      (data) => ({ count: data.count + 1 })
    );
    
    const result = readJsonFile(TEST_FILE, { defaultValue: { count: 0 } });
    expect(result).toEqual({ count: 6 });
  });

  it('should create file if not exists', () => {
    updateJsonFile(
      TEST_FILE,
      { defaultValue: { count: 0 } },
      (data) => ({ count: data.count + 10 })
    );
    
    const result = readJsonFile(TEST_FILE, { defaultValue: { count: 0 } });
    expect(result).toEqual({ count: 10 });
  });

  it('should apply multiple transformations', () => {
    writeJsonFile(TEST_FILE, { count: 1 });
    
    updateJsonFile(TEST_FILE, { defaultValue: { count: 0 } }, (d) => ({ count: d.count * 2 }));
    updateJsonFile(TEST_FILE, { defaultValue: { count: 0 } }, (d) => ({ count: d.count + 3 }));
    
    const result = readJsonFile(TEST_FILE, { defaultValue: { count: 0 } });
    expect(result).toEqual({ count: 5 });
  });

  it('should handle complex objects', () => {
    interface ComplexData {
      users: string[];
      metadata: { version: number; updated: string };
    }
    
    const defaultValue: ComplexData = {
      users: [],
      metadata: { version: 1, updated: '' }
    };
    
    updateJsonFile(
      TEST_FILE,
      { defaultValue },
      (data) => ({
        ...data,
        users: [...data.users, 'alice'],
        metadata: { ...data.metadata, version: data.metadata.version + 1 }
      })
    );
    
    const result = readJsonFile(TEST_FILE, { defaultValue });
    expect(result.users).toEqual(['alice']);
    expect(result.metadata.version).toBe(2);
  });
});
