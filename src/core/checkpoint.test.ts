// 📍 ORBIT Checkpoint Tests

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  saveCheckpoint,
  loadCheckpoint,
  checkpointExists,
  clearCheckpoint,
  getCheckpointInfo,
  shouldResume,
  getResumePhases,
  setCheckpointConfig,
  resetCheckpointConfig,
  type Checkpoint
} from './checkpoint.js';
import type { Phase } from './types.js';

const TEST_DIR = '.test-checkpoint';

beforeEach(() => {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
  mkdirSync(TEST_DIR, { recursive: true });
  setCheckpointConfig({ stateDir: TEST_DIR });
});

afterEach(() => {
  resetCheckpointConfig();
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe('saveCheckpoint', () => {
  it('should save checkpoint with all data', () => {
    const phases: Phase[] = ['plan', 'implement'];
    saveCheckpoint('launch', 'Add feature X', 'implement', phases, 'standard', false);
    
    expect(checkpointExists()).toBe(true);
  });

  it('should create checkpoint directory if not exists', () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    saveCheckpoint('launch', 'Task', 'plan', [], 'fast', false);
    
    expect(existsSync(TEST_DIR)).toBe(true);
  });

  it('should overwrite existing checkpoint', () => {
    saveCheckpoint('launch', 'Task 1', 'plan', [], 'standard', false);
    saveCheckpoint('warp', 'Task 2', 'test', ['plan'], 'premium', true);
    
    const checkpoint = loadCheckpoint();
    expect(checkpoint?.mission).toBe('warp');
    expect(checkpoint?.task).toBe('Task 2');
  });

  it('should include timestamp', () => {
    const before = Date.now();
    saveCheckpoint('launch', 'Task', 'plan', [], 'standard', false);
    const after = Date.now();
    
    const checkpoint = loadCheckpoint();
    const timestamp = new Date(checkpoint!.timestamp).getTime();
    
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });

  it('should save dryRun flag', () => {
    saveCheckpoint('launch', 'Task', 'plan', [], 'standard', true);
    
    const checkpoint = loadCheckpoint();
    expect(checkpoint?.dryRun).toBe(true);
  });
});

describe('loadCheckpoint', () => {
  it('should return null when checkpoint does not exist', () => {
    const checkpoint = loadCheckpoint();
    expect(checkpoint).toBeNull();
  });

  it('should load valid checkpoint', () => {
    saveCheckpoint('launch', 'Test task', 'implement', ['plan'], 'standard', false);
    
    const checkpoint = loadCheckpoint();
    expect(checkpoint).not.toBeNull();
    expect(checkpoint?.mission).toBe('launch');
    expect(checkpoint?.task).toBe('Test task');
    expect(checkpoint?.currentPhase).toBe('implement');
    expect(checkpoint?.phasesCompleted).toEqual(['plan']);
  });

  it('should handle corrupted checkpoint file', () => {
    const checkpointFile = join(TEST_DIR, 'checkpoint.json');
    writeFileSync(checkpointFile, 'invalid json{');
    
    const checkpoint = loadCheckpoint();
    expect(checkpoint).toBeNull();
  });

  it('should handle empty file', () => {
    const checkpointFile = join(TEST_DIR, 'checkpoint.json');
    writeFileSync(checkpointFile, '');
    
    const checkpoint = loadCheckpoint();
    expect(checkpoint).toBeNull();
  });

  it('should provide default values for missing fields', () => {
    const checkpointFile = join(TEST_DIR, 'checkpoint.json');
    writeFileSync(checkpointFile, JSON.stringify({
      mission: 'launch',
      task: 'Task',
      currentPhase: 'plan'
    }));
    
    const checkpoint = loadCheckpoint();
    expect(checkpoint).not.toBeNull();
    expect(checkpoint?.version).toBe('1.0');
    expect(checkpoint?.phasesCompleted).toEqual([]);
    expect(checkpoint?.dryRun).toBe(false);
  });
});

describe('checkpointExists', () => {
  it('should return false when no checkpoint exists', () => {
    expect(checkpointExists()).toBe(false);
  });

  it('should return true when checkpoint exists', () => {
    saveCheckpoint('launch', 'Task', 'plan', [], 'standard', false);
    expect(checkpointExists()).toBe(true);
  });
});

describe('clearCheckpoint', () => {
  it('should remove checkpoint file', () => {
    saveCheckpoint('launch', 'Task', 'plan', [], 'standard', false);
    expect(checkpointExists()).toBe(true);
    
    clearCheckpoint();
    expect(checkpointExists()).toBe(false);
  });

  it('should not throw if checkpoint does not exist', () => {
    expect(() => clearCheckpoint()).not.toThrow();
  });

  it('should handle multiple clear calls', () => {
    saveCheckpoint('launch', 'Task', 'plan', [], 'standard', false);
    clearCheckpoint();
    clearCheckpoint();
    
    expect(checkpointExists()).toBe(false);
  });
});

describe('getCheckpointInfo', () => {
  it('should return null when no checkpoint exists', () => {
    const info = getCheckpointInfo();
    expect(info).toBeNull();
  });

  it('should return formatted checkpoint info', () => {
    saveCheckpoint('launch', 'Add feature X', 'implement', ['plan'], 'standard', false);
    
    const info = getCheckpointInfo();
    expect(info).toContain('Mission: launch');
    expect(info).toContain('Task: Add feature X');
    expect(info).toContain('Phase: implement');
    expect(info).toContain('Completed: plan');
  });

  it('should show "none" for empty completed phases', () => {
    saveCheckpoint('warp', 'Task', 'plan', [], 'fast', false);
    
    const info = getCheckpointInfo();
    expect(info).toContain('Completed: none');
  });

  it('should format age in seconds', () => {
    saveCheckpoint('launch', 'Task', 'plan', [], 'standard', false);
    
    const info = getCheckpointInfo();
    expect(info).toMatch(/Age: \d+s ago/);
  });

  it('should format age in minutes and seconds', () => {
    const checkpointFile = join(TEST_DIR, 'checkpoint.json');
    const oldTimestamp = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const checkpoint: Checkpoint = {
      version: '1.0',
      mission: 'launch',
      task: 'Task',
      currentPhase: 'plan',
      phasesCompleted: [],
      modelTier: 'standard',
      timestamp: oldTimestamp,
      dryRun: false
    };
    writeFileSync(checkpointFile, JSON.stringify(checkpoint));
    
    const info = getCheckpointInfo();
    expect(info).toMatch(/Age: \d+m \d+s ago/);
  });

  it('should format age in hours and minutes', () => {
    const checkpointFile = join(TEST_DIR, 'checkpoint.json');
    const oldTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const checkpoint: Checkpoint = {
      version: '1.0',
      mission: 'launch',
      task: 'Task',
      currentPhase: 'plan',
      phasesCompleted: [],
      modelTier: 'standard',
      timestamp: oldTimestamp,
      dryRun: false
    };
    writeFileSync(checkpointFile, JSON.stringify(checkpoint));
    
    const info = getCheckpointInfo();
    expect(info).toMatch(/Age: \d+h \d+m ago/);
  });
});

describe('shouldResume', () => {
  it('should return true for recent checkpoint', () => {
    const checkpoint: Checkpoint = {
      version: '1.0',
      mission: 'launch',
      task: 'Task',
      currentPhase: 'plan',
      phasesCompleted: [],
      modelTier: 'standard',
      timestamp: new Date().toISOString(),
      dryRun: false
    };
    
    expect(shouldResume(checkpoint)).toBe(true);
  });

  it('should return false for old checkpoint (> 1 hour)', () => {
    const oldTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const checkpoint: Checkpoint = {
      version: '1.0',
      mission: 'launch',
      task: 'Task',
      currentPhase: 'plan',
      phasesCompleted: [],
      modelTier: 'standard',
      timestamp: oldTimestamp,
      dryRun: false
    };
    
    expect(shouldResume(checkpoint)).toBe(false);
  });

  it('should return true for checkpoint at 59 minutes', () => {
    const timestamp = new Date(Date.now() - 59 * 60 * 1000).toISOString();
    const checkpoint: Checkpoint = {
      version: '1.0',
      mission: 'launch',
      task: 'Task',
      currentPhase: 'plan',
      phasesCompleted: [],
      modelTier: 'standard',
      timestamp,
      dryRun: false
    };
    
    expect(shouldResume(checkpoint)).toBe(true);
  });
});

describe('getResumePhases', () => {
  it('should return all phases when none completed', () => {
    const allPhases: Phase[] = ['plan', 'implement', 'test'];
    const checkpoint: Checkpoint = {
      version: '1.0',
      mission: 'launch',
      task: 'Task',
      currentPhase: 'plan',
      phasesCompleted: [],
      modelTier: 'standard',
      timestamp: new Date().toISOString(),
      dryRun: false
    };
    
    const remaining = getResumePhases(allPhases, checkpoint);
    expect(remaining).toEqual(['plan', 'implement', 'test']);
  });

  it('should exclude completed phases', () => {
    const allPhases: Phase[] = ['plan', 'implement', 'test'];
    const checkpoint: Checkpoint = {
      version: '1.0',
      mission: 'launch',
      task: 'Task',
      currentPhase: 'test',
      phasesCompleted: ['plan', 'implement'],
      modelTier: 'standard',
      timestamp: new Date().toISOString(),
      dryRun: false
    };
    
    const remaining = getResumePhases(allPhases, checkpoint);
    expect(remaining).toEqual(['test']);
  });

  it('should return empty array when all phases completed', () => {
    const allPhases: Phase[] = ['plan', 'implement'];
    const checkpoint: Checkpoint = {
      version: '1.0',
      mission: 'launch',
      task: 'Task',
      currentPhase: 'implement',
      phasesCompleted: ['plan', 'implement'],
      modelTier: 'standard',
      timestamp: new Date().toISOString(),
      dryRun: false
    };
    
    const remaining = getResumePhases(allPhases, checkpoint);
    expect(remaining).toEqual([]);
  });

  it('should handle phases in any order', () => {
    const allPhases: Phase[] = ['plan', 'implement', 'test', 'commit'];
    const checkpoint: Checkpoint = {
      version: '1.0',
      mission: 'launch',
      task: 'Task',
      currentPhase: 'commit',
      phasesCompleted: ['test', 'plan'],
      modelTier: 'standard',
      timestamp: new Date().toISOString(),
      dryRun: false
    };
    
    const remaining = getResumePhases(allPhases, checkpoint);
    expect(remaining).toEqual(['implement', 'commit']);
  });
});
