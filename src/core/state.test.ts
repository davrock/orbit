// 🛸 ORBIT State Management Tests
// Tests for persistence layer

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  loadGroundControl,
  saveGroundControl,
  recordSuccess,
  recordFailure,
  resetGroundControl,
  loadFuelUsage,
  saveFuelUsage,
  trackFuel,
  loadSkills,
  saveSkill,
  findMatchingSkill,
  loadCargo,
  getNextCargoItem,
  markCargoDelivered,
  addCargoItem,
  appendLog
} from './state.js';

const TEST_STATE_DIR = '.copilot/state';
const TEST_SKILLS_DIR = '.copilot/skills';
const TEST_CARGO_FILE = '.copilot/cargo_manifest.txt';
const TEST_GC_FILE = join(TEST_STATE_DIR, 'ground_control.json');
const TEST_FUEL_FILE = join(TEST_STATE_DIR, 'fuel_tracking.json');
const TEST_LOG_FILE = join(TEST_STATE_DIR, 'mission.log');

describe('State Management', () => {
  beforeEach(() => {
    // Clean up test state before each test
    if (existsSync(TEST_STATE_DIR)) {
      rmSync(TEST_STATE_DIR, { recursive: true, force: true });
    }
    if (existsSync(TEST_SKILLS_DIR)) {
      rmSync(TEST_SKILLS_DIR, { recursive: true, force: true });
    }
    if (existsSync(TEST_CARGO_FILE)) {
      rmSync(TEST_CARGO_FILE, { force: true });
    }
  });

  afterEach(() => {
    // Clean up test state after each test
    if (existsSync(TEST_STATE_DIR)) {
      rmSync(TEST_STATE_DIR, { recursive: true, force: true });
    }
    if (existsSync(TEST_SKILLS_DIR)) {
      rmSync(TEST_SKILLS_DIR, { recursive: true, force: true });
    }
    if (existsSync(TEST_CARGO_FILE)) {
      rmSync(TEST_CARGO_FILE, { force: true });
    }
  });

  describe('Ground Control State', () => {
    it('should create initial state when file does not exist', () => {
      const state = loadGroundControl();
      expect(state).toEqual({
        fails: 0,
        noProgress: 0,
        types: [],
        cycles: 0,
        successes: 0
      });
    });

    it('should save and load state correctly', () => {
      const state = {
        fails: 2,
        noProgress: 1,
        types: ['launch', 'repair'],
        cycles: 5,
        successes: 3,
        lastTask: 'test task',
        lastError: 'test error'
      };
      saveGroundControl(state);
      const loaded = loadGroundControl();
      expect(loaded).toEqual(state);
    });

    it('should record success and reset fail counters', () => {
      saveGroundControl({
        fails: 3,
        noProgress: 2,
        types: [],
        cycles: 5,
        successes: 10
      });

      recordSuccess('launch');
      const state = loadGroundControl();

      expect(state.fails).toBe(0);
      expect(state.noProgress).toBe(0);
      expect(state.successes).toBe(11);
      expect(state.cycles).toBe(6);
      expect(state.types).toContain('launch');
    });

    it('should keep last 3 task types', () => {
      resetGroundControl();
      recordSuccess('type1');
      recordSuccess('type2');
      recordSuccess('type3');
      recordSuccess('type4');

      const state = loadGroundControl();
      expect(state.types).toEqual(['type2', 'type3', 'type4']);
      expect(state.types.length).toBe(3);
    });

    it('should record failure and increment counters', () => {
      resetGroundControl();
      recordFailure('test error');

      const state = loadGroundControl();
      expect(state.fails).toBe(1);
      expect(state.noProgress).toBe(1);
      expect(state.cycles).toBe(1);
      expect(state.lastError).toBe('test error');
    });

    it('should reset ground control state', () => {
      saveGroundControl({
        fails: 5,
        noProgress: 3,
        types: ['test'],
        cycles: 10,
        successes: 7
      });

      resetGroundControl();
      const state = loadGroundControl();

      expect(state).toEqual({
        fails: 0,
        noProgress: 0,
        types: [],
        cycles: 0,
        successes: 0
      });
    });

    it('should handle legacy snake_case format', () => {
      mkdirSync(TEST_STATE_DIR, { recursive: true });
      writeFileSync(
        TEST_GC_FILE,
        JSON.stringify({
          fails: 1,
          no_progress: 2,
          types: ['legacy'],
          cycles: 3,
          successes: 4,
          last_task: 'legacy task',
          last_error: 'legacy error'
        })
      );

      const state = loadGroundControl();
      expect(state.noProgress).toBe(2);
      expect(state.lastTask).toBe('legacy task');
      expect(state.lastError).toBe('legacy error');
    });

    it('should handle corrupted JSON file gracefully', () => {
      mkdirSync(TEST_STATE_DIR, { recursive: true });
      writeFileSync(TEST_GC_FILE, 'invalid json {]');

      const state = loadGroundControl();
      expect(state).toEqual({
        fails: 0,
        noProgress: 0,
        types: [],
        cycles: 0,
        successes: 0
      });
    });
  });

  describe('Skills Management', () => {
    it('should return empty array when skills directory does not exist', () => {
      const skills = loadSkills();
      expect(skills).toEqual([]);
    });

    it('should save and load a skill correctly', () => {
      const skill = {
        id: 'test-skill-1',
        pattern: 'test pattern',
        solution: 'test solution',
        context: 'test context',
        successCount: 0,
        lastUsed: new Date('2024-01-01')
      };
      
      saveSkill(skill);
      const skills = loadSkills();
      
      expect(skills).toHaveLength(1);
      expect(skills[0].id).toBe('test-skill-1');
      expect(skills[0].pattern).toBe('test pattern');
    });

    it('should load multiple skills from directory', () => {
      const skill1 = {
        id: 'skill-1',
        pattern: 'pattern 1',
        solution: 'solution 1',
        context: 'context 1',
        successCount: 1,
        lastUsed: new Date()
      };
      
      const skill2 = {
        id: 'skill-2',
        pattern: 'pattern 2',
        solution: 'solution 2',
        context: 'context 2',
        successCount: 2,
        lastUsed: new Date()
      };

      saveSkill(skill1);
      saveSkill(skill2);

      const skills = loadSkills();
      expect(skills).toHaveLength(2);
      expect(skills.map(s => s.id)).toContain('skill-1');
      expect(skills.map(s => s.id)).toContain('skill-2');
    });

    it('should skip invalid JSON files when loading skills', () => {
      mkdirSync(TEST_SKILLS_DIR, { recursive: true });
      writeFileSync(join(TEST_SKILLS_DIR, 'valid.json'), JSON.stringify({
        id: 'valid',
        pattern: 'test',
        solution: 'test',
        context: 'test',
        successCount: 0,
        lastUsed: new Date()
      }));
      writeFileSync(join(TEST_SKILLS_DIR, 'invalid.json'), 'not valid json');

      const skills = loadSkills();
      expect(skills).toHaveLength(1);
      expect(skills[0].id).toBe('valid');
    });

    it('should find matching skill by pattern (exact match)', () => {
      saveSkill({
        id: 'test-1',
        pattern: 'fix typescript error',
        solution: 'use type assertion',
        context: 'typescript',
        successCount: 0,
        lastUsed: new Date()
      });

      const skill = findMatchingSkill('fix typescript error in file');
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('test-1');
    });

    it('should find matching skill by pattern (partial match)', () => {
      saveSkill({
        id: 'test-2',
        pattern: 'install dependencies',
        solution: 'npm install',
        context: 'node',
        successCount: 0,
        lastUsed: new Date()
      });

      const skill = findMatchingSkill('need to install dependencies');
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('test-2');
    });

    it('should return undefined when no matching skill found', () => {
      saveSkill({
        id: 'test-3',
        pattern: 'debug python error',
        solution: 'use debugger',
        context: 'python',
        successCount: 0,
        lastUsed: new Date()
      });

      const skill = findMatchingSkill('fix java compilation issue');
      expect(skill).toBeUndefined();
    });

    it('should be case-insensitive when finding skills', () => {
      saveSkill({
        id: 'test-4',
        pattern: 'Run Tests',
        solution: 'npm test',
        context: 'testing',
        successCount: 0,
        lastUsed: new Date()
      });

      const skill = findMatchingSkill('run tests in ci');
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('test-4');
    });
  });

  describe('Cargo Management', () => {
    it('should return empty array when cargo file does not exist', () => {
      const items = loadCargo();
      expect(items).toEqual([]);
    });

    it('should load cargo items with correct priorities', () => {
      const content = `# 🚀 ORBIT Cargo Manifest
# HIGH PRIORITY
Implement critical feature
Fix security bug

# MEDIUM PRIORITY
Add new API endpoint

# LOW PRIORITY
Update documentation`;

      mkdirSync('.copilot', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, content);

      const items = loadCargo();
      expect(items).toHaveLength(4);
      expect(items[0].priority).toBe('high');
      expect(items[2].priority).toBe('medium');
      expect(items[3].priority).toBe('low');
    });

    it('should mark completed items correctly', () => {
      const content = `# HIGH PRIORITY
# ✓ Completed task (2024-01-01)
Active task`;

      mkdirSync('.copilot', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, content);

      const items = loadCargo();
      expect(items).toHaveLength(2);
      expect(items[0].delivered).toBe(true);
      expect(items[1].delivered).toBe(false);
    });

    it('should get next undelivered cargo item', () => {
      const content = `# HIGH PRIORITY
# ✓ Done task (2024-01-01)
Next task
Another task`;

      mkdirSync('.copilot', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, content);

      const next = getNextCargoItem();
      expect(next).toBeDefined();
      expect(next?.task).toBe('Next task');
      expect(next?.delivered).toBe(false);
    });

    it('should return undefined when all cargo delivered', () => {
      const content = `# HIGH PRIORITY
# ✓ Task 1 (2024-01-01)
# ✓ Task 2 (2024-01-02)`;

      mkdirSync('.copilot', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, content);

      const next = getNextCargoItem();
      expect(next).toBeUndefined();
    });

    it('should mark cargo item as delivered', () => {
      const content = `# HIGH PRIORITY
Complete this task
Another task`;

      mkdirSync('.copilot', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, content);

      markCargoDelivered('Complete this task');

      const updatedContent = readFileSync(TEST_CARGO_FILE, 'utf-8');
      expect(updatedContent).toContain('# ✓ Complete this task');
    });

    it('should add cargo item to high priority section', () => {
      addCargoItem('New high priority task', 'high');

      const content = readFileSync(TEST_CARGO_FILE, 'utf-8');
      expect(content).toContain('# HIGH PRIORITY');
      expect(content).toContain('New high priority task');
    });

    it('should add cargo item to medium priority section by default', () => {
      addCargoItem('New task');

      const content = readFileSync(TEST_CARGO_FILE, 'utf-8');
      expect(content).toContain('# MEDIUM PRIORITY');
      expect(content).toContain('New task');
    });

    it('should add cargo item to low priority section', () => {
      addCargoItem('Low priority task', 'low');

      const content = readFileSync(TEST_CARGO_FILE, 'utf-8');
      expect(content).toContain('# LOW PRIORITY');
      expect(content).toContain('Low priority task');
    });

    it('should create cargo file with template if it does not exist', () => {
      addCargoItem('First task', 'medium');

      expect(existsSync(TEST_CARGO_FILE)).toBe(true);
      const content = readFileSync(TEST_CARGO_FILE, 'utf-8');
      expect(content).toContain('🚀 ORBIT Cargo Manifest');
      expect(content).toContain('First task');
    });
  });

  describe('Log Management', () => {
    const TEST_LOG_FILE = join(TEST_STATE_DIR, 'mission.log');

    it('should create log file and append message', () => {
      appendLog('Test log message');

      expect(existsSync(TEST_LOG_FILE)).toBe(true);
      const content = readFileSync(TEST_LOG_FILE, 'utf-8');
      expect(content).toContain('Test log message');
      expect(content).toMatch(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/);
    });

    it('should append to existing log file', () => {
      appendLog('First message');
      appendLog('Second message');

      const content = readFileSync(TEST_LOG_FILE, 'utf-8');
      expect(content).toContain('First message');
      expect(content).toContain('Second message');
      
      const lines = content.trim().split('\n');
      expect(lines).toHaveLength(2);
    });

    it('should format timestamp correctly', () => {
      appendLog('Test');
      
      const content = readFileSync(TEST_LOG_FILE, 'utf-8');
      const timestampMatch = content.match(/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
      
      expect(timestampMatch).toBeTruthy();
      expect(timestampMatch![1]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('Fuel Tracking', () => {
    it('should create initial fuel usage when file does not exist', () => {
      const usage = loadFuelUsage();
      expect(usage).toEqual({
        total: 0,
        byTier: { premium: 0, standard: 0, fast: 0, ecomode: 0 },
        sessions: 0
      });
    });

    it('should save and load fuel usage correctly', () => {
      const usage = {
        total: 10.5,
        byTier: { premium: 3, standard: 5, fast: 2, ecomode: 1 },
        sessions: 11
      };
      saveFuelUsage(usage);
      const loaded = loadFuelUsage();
      expect(loaded).toEqual(usage);
    });

    it('should track premium fuel with correct multiplier', () => {
      trackFuel('premium');
      const usage = loadFuelUsage();
      expect(usage.total).toBe(3.0);
      expect(usage.byTier.premium).toBe(1);
      expect(usage.sessions).toBe(1);
    });

    it('should track standard fuel with correct multiplier', () => {
      trackFuel('standard');
      const usage = loadFuelUsage();
      expect(usage.total).toBe(1.0);
      expect(usage.byTier.standard).toBe(1);
    });

    it('should track fast fuel with correct multiplier', () => {
      trackFuel('fast');
      const usage = loadFuelUsage();
      expect(usage.total).toBe(0.5);
      expect(usage.byTier.fast).toBe(1);
    });

    it('should track ecomode fuel with correct multiplier', () => {
      trackFuel('ecomode');
      const usage = loadFuelUsage();
      expect(usage.total).toBe(0.6);
      expect(usage.byTier.ecomode).toBe(1);
    });

    it('should accumulate fuel usage across multiple tracks', () => {
      trackFuel('premium');
      trackFuel('standard');
      trackFuel('fast');

      const usage = loadFuelUsage();
      expect(usage.total).toBe(4.5); // 3.0 + 1.0 + 0.5
      expect(usage.byTier.premium).toBe(1);
      expect(usage.byTier.standard).toBe(1);
      expect(usage.byTier.fast).toBe(1);
      expect(usage.sessions).toBe(3);
    });

    it('should handle legacy snake_case format', () => {
      mkdirSync(TEST_STATE_DIR, { recursive: true });
      writeFileSync(
        TEST_FUEL_FILE,
        JSON.stringify({
          total: 5.5,
          by_tier: { premium: 1, standard: 2, fast: 1, ecomode: 0 },
          sessions: 4
        })
      );

      const usage = loadFuelUsage();
      expect(usage.byTier).toEqual({ premium: 1, standard: 2, fast: 1, ecomode: 0 });
    });

    it('should handle corrupted JSON file gracefully', () => {
      mkdirSync(TEST_STATE_DIR, { recursive: true });
      writeFileSync(TEST_FUEL_FILE, 'corrupted data');

      const usage = loadFuelUsage();
      expect(usage).toEqual({
        total: 0,
        byTier: { premium: 0, standard: 0, fast: 0, ecomode: 0 },
        sessions: 0
      });
    });
  });
});
