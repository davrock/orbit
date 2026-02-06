// 📊 ORBIT Metrics Tests
// Comprehensive test coverage for metrics tracking

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, rmSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  metricsStart,
  metricsPhaseStart,
  metricsPhaseEnd,
  metricsRetry,
  metricsValidation,
  metricsFilesChanged,
  metricsEnd,
  getMetricsSummary,
  getRecentRuns,
  exportMetricsForDashboard,
  setMetricsConfig,
  resetMetricsConfig
} from './metrics.js';

const TEST_METRICS_DIR = '.copilot-test';
const TEST_METRICS_FILE = '.copilot-test/metrics.json';

describe('metrics', () => {
  beforeEach(() => {
    // Configure to use test directory
    setMetricsConfig({ metricsFile: TEST_METRICS_FILE });
    
    // Clean up before each test
    if (existsSync(TEST_METRICS_DIR)) {
      rmSync(TEST_METRICS_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Reset to default configuration
    resetMetricsConfig();
    
    // Clean up after each test
    if (existsSync(TEST_METRICS_DIR)) {
      rmSync(TEST_METRICS_DIR, { recursive: true, force: true });
    }
  });

  describe('metricsStart', () => {
    it('should start a new metrics run', () => {
      const id = metricsStart('test task', 'launch');
      expect(id).toMatch(/^run-\d+-\d+$/);
    });

    it('should create unique IDs for different runs', async () => {
      const id1 = metricsStart('task 1', 'launch');
      // Wait 1ms to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      const id2 = metricsStart('task 2', 'repair');
      expect(id1).not.toBe(id2);
    });

    it('should handle different mission types', () => {
      const missions = ['launch', 'repair', 'warp', 'mayday'] as const;
      for (const mission of missions) {
        const id = metricsStart('test', mission);
        expect(id).toBeDefined();
      }
    });
  });

  describe('metricsPhaseStart', () => {
    it('should record phase start', () => {
      metricsStart('test', 'launch');
      expect(() => metricsPhaseStart('plan', 'standard')).not.toThrow();
    });

    it('should handle multiple phases', () => {
      metricsStart('test', 'launch');
      metricsPhaseStart('plan', 'standard');
      metricsPhaseStart('implement', 'standard');
      metricsPhaseStart('test', 'fast');
      expect(() => metricsEnd(true)).not.toThrow();
    });

    it('should not throw when no run is active', () => {
      expect(() => metricsPhaseStart('plan', 'standard')).not.toThrow();
    });

    it('should record different model tiers', () => {
      metricsStart('test', 'launch');
      metricsPhaseStart('plan', 'premium');
      metricsPhaseStart('implement', 'standard');
      metricsPhaseStart('test', 'fast');
      expect(() => metricsEnd(true)).not.toThrow();
    });
  });

  describe('metricsPhaseEnd', () => {
    it('should record phase completion', () => {
      metricsStart('test', 'launch');
      metricsPhaseStart('plan', 'standard');
      expect(() => metricsPhaseEnd('plan', 'success', 100)).not.toThrow();
    });

    it('should handle different phase statuses', () => {
      metricsStart('test', 'launch');
      metricsPhaseStart('plan', 'standard');
      metricsPhaseEnd('plan', 'success', 100);
      
      metricsPhaseStart('implement', 'standard');
      metricsPhaseEnd('implement', 'failed', 50);
      
      metricsPhaseStart('test', 'standard');
      metricsPhaseEnd('test', 'timeout', 300);
      
      metricsPhaseStart('review', 'standard');
      metricsPhaseEnd('review', 'skipped', 0);
      
      expect(() => metricsEnd(false)).not.toThrow();
    });

    it('should not throw when no run is active', () => {
      expect(() => metricsPhaseEnd('plan', 'success', 100)).not.toThrow();
    });

    it('should record phase duration correctly', () => {
      metricsStart('test', 'launch');
      metricsPhaseStart('plan', 'standard');
      metricsPhaseEnd('plan', 'success', 250);
      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].phases[0].duration).toBe(250);
    });
  });

  describe('metricsRetry', () => {
    it('should increment retry count', () => {
      metricsStart('test', 'launch');
      metricsPhaseStart('plan', 'standard');
      metricsRetry();
      metricsRetry();
      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].retries).toBe(2);
    });

    it('should increment phase attempt count', () => {
      metricsStart('test', 'launch');
      metricsPhaseStart('implement', 'standard');
      metricsRetry();
      metricsRetry();
      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].phases[0].attempts).toBe(3);
    });

    it('should not throw when no run is active', () => {
      expect(() => metricsRetry()).not.toThrow();
    });
  });

  describe('metricsValidation', () => {
    it('should record typeCheck validation', () => {
      metricsStart('test', 'launch');
      metricsValidation('typeCheck', true);
      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].validations.typeCheck).toBe(true);
    });

    it('should record tests validation', () => {
      metricsStart('test', 'launch');
      metricsValidation('tests', false);
      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].validations.tests).toBe(false);
    });

    it('should record lint validation', () => {
      metricsStart('test', 'launch');
      metricsValidation('lint', true);
      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].validations.lint).toBe(true);
    });

    it('should record multiple validations', () => {
      metricsStart('test', 'launch');
      metricsValidation('typeCheck', true);
      metricsValidation('tests', true);
      metricsValidation('lint', false);
      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].validations).toEqual({
        typeCheck: true,
        tests: true,
        lint: false
      });
    });

    it('should not throw when no run is active', () => {
      expect(() => metricsValidation('tests', true)).not.toThrow();
    });
  });

  describe('metricsFilesChanged', () => {
    it('should record files changed count', () => {
      metricsStart('test', 'launch');
      metricsFilesChanged(5);
      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].filesChanged).toBe(5);
    });

    it('should handle zero files changed', () => {
      metricsStart('test', 'launch');
      metricsFilesChanged(0);
      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].filesChanged).toBe(0);
    });

    it('should not throw when no run is active', () => {
      expect(() => metricsFilesChanged(10)).not.toThrow();
    });
  });

  describe('metricsEnd', () => {
    it('should save metrics to file', () => {
      metricsStart('test', 'launch');
      metricsEnd(true);

      expect(existsSync(TEST_METRICS_FILE)).toBe(true);
    });

    it('should record success status', () => {
      metricsStart('test', 'launch');
      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].success).toBe(true);
    });

    it('should record failure status', () => {
      metricsStart('test', 'launch');
      metricsEnd(false);

      const recent = getRecentRuns(1);
      expect(recent[0].success).toBe(false);
    });

    it('should calculate total duration', () => {
      metricsStart('test', 'launch');
      // Sleep briefly to ensure measurable duration
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Wait
      }
      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].totalDuration).toBeGreaterThanOrEqual(0);
    });

    it('should not throw when no run is active', () => {
      expect(() => metricsEnd(true)).not.toThrow();
    });

    it('should handle multiple consecutive runs', () => {
      metricsStart('task 1', 'launch');
      metricsEnd(true);

      metricsStart('task 2', 'repair');
      metricsEnd(false);

      metricsStart('task 3', 'warp');
      metricsEnd(true);

      const recent = getRecentRuns(3);
      expect(recent.length).toBe(3);
    });

    it('should limit stored runs to 100', () => {
      // Create 105 runs
      for (let i = 0; i < 105; i++) {
        metricsStart(`task ${i}`, 'launch');
        metricsEnd(true);
      }

      const metrics = JSON.parse(readFileSync(TEST_METRICS_FILE, 'utf-8'));
      expect(metrics.runs.length).toBe(100);
    });
  });

  describe('getMetricsSummary', () => {
    it('should return empty aggregates when no runs exist', () => {
      const summary = getMetricsSummary();
      expect(summary.totalRuns).toBe(0);
      expect(summary.successRate).toBe(0);
    });

    it('should calculate success rate correctly', () => {
      metricsStart('task 1', 'launch');
      metricsEnd(true);

      metricsStart('task 2', 'launch');
      metricsEnd(true);

      metricsStart('task 3', 'launch');
      metricsEnd(false);

      const summary = getMetricsSummary();
      expect(summary.totalRuns).toBe(3);
      expect(summary.successRate).toBe(67); // 2/3 = 66.67% rounded to 67
    });

    it('should calculate average duration', () => {
      metricsStart('task 1', 'launch');
      const start1 = Date.now();
      while (Date.now() - start1 < 10) {}
      metricsEnd(true);

      metricsStart('task 2', 'launch');
      const start2 = Date.now();
      while (Date.now() - start2 < 10) {}
      metricsEnd(true);

      const summary = getMetricsSummary();
      expect(summary.avgDuration).toBeGreaterThanOrEqual(0);
    });

    it('should aggregate by mission type', () => {
      metricsStart('task 1', 'launch');
      metricsEnd(true);

      metricsStart('task 2', 'launch');
      metricsEnd(false);

      metricsStart('task 3', 'repair');
      metricsEnd(true);

      const summary = getMetricsSummary();
      expect(summary.byMission.launch).toBeDefined();
      expect(summary.byMission.launch.count).toBe(2);
      expect(summary.byMission.launch.successRate).toBe(50);
      expect(summary.byMission.repair.count).toBe(1);
      expect(summary.byMission.repair.successRate).toBe(100);
    });

    it('should aggregate by phase', () => {
      metricsStart('task 1', 'launch');
      metricsPhaseStart('plan', 'standard');
      metricsPhaseEnd('plan', 'success', 100);
      metricsPhaseStart('implement', 'standard');
      metricsPhaseEnd('implement', 'failed', 50);
      metricsEnd(false);

      metricsStart('task 2', 'launch');
      metricsPhaseStart('plan', 'standard');
      metricsPhaseEnd('plan', 'success', 200);
      metricsEnd(true);

      const summary = getMetricsSummary();
      expect(summary.byPhase.plan).toBeDefined();
      expect(summary.byPhase.plan.successRate).toBe(100);
      expect(summary.byPhase.plan.avgDuration).toBe(150); // (100+200)/2
      expect(summary.byPhase.implement).toBeDefined();
      expect(summary.byPhase.implement.successRate).toBe(0);
    });
  });

  describe('getRecentRuns', () => {
    it('should return empty array when no runs exist', () => {
      const runs = getRecentRuns();
      expect(runs).toEqual([]);
    });

    it('should return recent runs', () => {
      metricsStart('task 1', 'launch');
      metricsEnd(true);

      metricsStart('task 2', 'repair');
      metricsEnd(false);

      const runs = getRecentRuns();
      expect(runs.length).toBe(2);
      expect(runs[0].task).toBe('task 1');
      expect(runs[1].task).toBe('task 2');
    });

    it('should limit results by specified limit', () => {
      for (let i = 0; i < 20; i++) {
        metricsStart(`task ${i}`, 'launch');
        metricsEnd(true);
      }

      const runs = getRecentRuns(5);
      expect(runs.length).toBe(5);
    });

    it('should return most recent runs', () => {
      for (let i = 0; i < 15; i++) {
        metricsStart(`task ${i}`, 'launch');
        metricsEnd(true);
      }

      const runs = getRecentRuns(3);
      expect(runs[0].task).toBe('task 12');
      expect(runs[1].task).toBe('task 13');
      expect(runs[2].task).toBe('task 14');
    });
  });

  describe('exportMetricsForDashboard', () => {
    it('should export metrics in dashboard format', () => {
      metricsStart('task 1', 'launch');
      metricsPhaseStart('plan', 'standard');
      metricsPhaseEnd('plan', 'success', 100);
      metricsEnd(true);

      const exported = exportMetricsForDashboard();
      expect(exported).toHaveProperty('aggregates');
      expect(exported).toHaveProperty('timeline');
      expect(exported).toHaveProperty('phaseBreakdown');
      expect(exported).toHaveProperty('missionBreakdown');
    });

    it('should include timeline data', () => {
      metricsStart('task 1', 'launch');
      metricsEnd(true);

      const exported = exportMetricsForDashboard() as any;
      expect(exported.timeline).toBeInstanceOf(Array);
      expect(exported.timeline.length).toBe(1);
      expect(exported.timeline[0]).toHaveProperty('date');
      expect(exported.timeline[0]).toHaveProperty('duration');
      expect(exported.timeline[0]).toHaveProperty('success');
      expect(exported.timeline[0]).toHaveProperty('mission');
    });

    it('should limit timeline to 50 most recent runs', () => {
      for (let i = 0; i < 60; i++) {
        metricsStart(`task ${i}`, 'launch');
        metricsEnd(true);
      }

      const exported = exportMetricsForDashboard() as any;
      expect(exported.timeline.length).toBe(50);
    });

    it('should handle empty metrics', () => {
      const exported = exportMetricsForDashboard();
      expect(exported).toBeDefined();
    });
  });

  describe('file persistence', () => {
    it('should create metrics directory if it does not exist', () => {
      metricsStart('test', 'launch');
      metricsEnd(true);

      expect(existsSync(TEST_METRICS_DIR)).toBe(true);
    });

    it('should preserve metrics across multiple operations', () => {
      metricsStart('task 1', 'launch');
      metricsEnd(true);

      const firstRun = getRecentRuns(1);

      metricsStart('task 2', 'repair');
      metricsEnd(false);

      const allRuns = getRecentRuns(2);
      expect(allRuns.length).toBe(2);
      expect(allRuns[0].task).toBe(firstRun[0].task);
    });

    it('should handle corrupted metrics file gracefully', () => {
      mkdirSync(TEST_METRICS_DIR, { recursive: true });
      writeFileSync(TEST_METRICS_FILE, 'invalid json{', 'utf-8');

      expect(() => metricsStart('test', 'launch')).not.toThrow();
      expect(() => metricsEnd(true)).not.toThrow();
    });
  });

  describe('complete workflow', () => {
    it('should track a complete mission workflow', () => {
      const id = metricsStart('Implement user authentication', 'launch');
      expect(id).toBeDefined();

      metricsPhaseStart('plan', 'standard');
      metricsPhaseEnd('plan', 'success', 45);

      metricsPhaseStart('implement', 'standard');
      metricsRetry(); // First attempt failed
      metricsPhaseEnd('implement', 'success', 180);

      metricsPhaseStart('test', 'fast');
      metricsPhaseEnd('test', 'success', 30);

      metricsValidation('typeCheck', true);
      metricsValidation('tests', true);
      metricsValidation('lint', true);

      metricsFilesChanged(8);

      metricsEnd(true);

      const recent = getRecentRuns(1);
      expect(recent[0].task).toBe('Implement user authentication');
      expect(recent[0].mission).toBe('launch');
      expect(recent[0].phases.length).toBe(3);
      expect(recent[0].retries).toBe(1);
      expect(recent[0].filesChanged).toBe(8);
      expect(recent[0].success).toBe(true);
      expect(recent[0].validations.typeCheck).toBe(true);
    });
  });
});
