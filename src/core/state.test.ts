// 🛸 ORBIT State Management Tests
// Tests for persistence layer

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  loadGroundControl,
  saveGroundControl,
  recordSuccess,
  recordFailure,
  resetGroundControl,
  loadFuelUsage,
  saveFuelUsage,
  trackFuel
} from './state.js';

const TEST_STATE_DIR = '.copilot/state';
const TEST_GC_FILE = join(TEST_STATE_DIR, 'ground_control.json');
const TEST_FUEL_FILE = join(TEST_STATE_DIR, 'fuel_tracking.json');

describe('State Management', () => {
  beforeEach(() => {
    // Clean up test state before each test
    if (existsSync(TEST_STATE_DIR)) {
      rmSync(TEST_STATE_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test state after each test
    if (existsSync(TEST_STATE_DIR)) {
      rmSync(TEST_STATE_DIR, { recursive: true, force: true });
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
