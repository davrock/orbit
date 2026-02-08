// 🛸 ORBIT Cargo Bay Tests
// Tests for autonomous mission payload processor

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { CargoBay, processCargo, showCargo } from './cargo-bay.js';
import { setStateConfig, resetStateConfig } from '../core/state.js';
import * as missionControl from './mission-control.js';

// Mock mission control
vi.mock('./mission-control.js');

const TEST_STATE_DIR = '.copilot-test/state';
const TEST_SKILLS_DIR = '.copilot-test/skills';
const TEST_CARGO_FILE = '.copilot-test/cargo_manifest.txt';

const mockRunMission = vi.mocked(missionControl.runMission);

describe('Cargo Bay', () => {
  let consoleSpy: any;
  
  beforeEach(() => {
    // Configure to use test directories
    setStateConfig({
      stateDir: TEST_STATE_DIR,
      skillsDir: TEST_SKILLS_DIR,
      cargoFile: TEST_CARGO_FILE
    });
    
    // Clean up test state
    try {
      if (existsSync('.copilot-test')) {
        rmSync('.copilot-test', { recursive: true, force: true });
      }
    } catch (e) {
      // Ignore cleanup errors
    }
    
    // Mock console methods to reduce test output noise
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore console
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    
    // Reset configuration
    resetStateConfig();
    
    // Clean up test state
    try {
      if (existsSync('.copilot-test')) {
        rmSync('.copilot-test', { recursive: true, force: true });
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('CargoBay class', () => {
    it('should create with default options', () => {
      const bay = new CargoBay();
      expect(bay).toBeDefined();
    });

    it('should create with custom options', () => {
      const bay = new CargoBay({ dryRun: true, mission: 'test' });
      expect(bay).toBeDefined();
    });

    it('should show empty manifest when no cargo file exists', () => {
      const bay = new CargoBay();
      
      // Should not throw
      expect(() => bay.showManifest()).not.toThrow();
      
      // Should display success message about empty cargo bay
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should show manifest with cargo items', () => {
      const content = `# HIGH PRIORITY
Task 1
Task 2

# MEDIUM PRIORITY  
Task 3`;

      mkdirSync('.copilot-test', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, content);

      const bay = new CargoBay();
      bay.showManifest();

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('1. Task 1'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('2. Task 2'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('3. Task 3'));
    });

    it('should handle empty cargo bay', async () => {
      mkdirSync('.copilot-test', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, '# No tasks here');

      const bay = new CargoBay();
      
      // Mock the private sleep method to be instant
      const sleepSpy = vi.spyOn(bay as any, 'sleep').mockResolvedValue(undefined);
      
      const result = await bay.process();

      expect(result.delivered).toBe(0);
      expect(result.lost).toBe(0);
      expect(mockRunMission).not.toHaveBeenCalled();
      
      sleepSpy.mockRestore();
    });

    it('should process cargo in dry run mode', async () => {
      const content = `# HIGH PRIORITY
Test task 1
Test task 2`;

      mkdirSync('.copilot-test', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, content);

      const bay = new CargoBay({ dryRun: true });
      
      // Mock the private sleep method to be instant
      const sleepSpy = vi.spyOn(bay as any, 'sleep').mockResolvedValue(undefined);
      
      const result = await bay.process();

      expect(result.delivered).toBe(2);
      expect(result.lost).toBe(0);
      expect(mockRunMission).not.toHaveBeenCalled();
      
      sleepSpy.mockRestore();
    });

    it('should handle cargo file with special characters', async () => {
      const content = `# HIGH PRIORITY
Task with special chars: !@#$%^&*()
Task with unicode: 🚀 🛸 ✓`;

      mkdirSync('.copilot-test', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, content);

      mockRunMission.mockResolvedValue({ 
        success: true,
        mission: 'launch',
        task: 'Task',
        phases: [],
        totalDuration: 1000,
        filesChanged: 0
      });

      const bay = new CargoBay();
      
      // Mock the private sleep method to be instant
      const sleepSpy = vi.spyOn(bay as any, 'sleep').mockResolvedValue(undefined);
      
      const result = await bay.process();

      expect(result.delivered).toBe(2);
      expect(result.lost).toBe(0);
      
      sleepSpy.mockRestore();
    });

    it('should skip already delivered cargo', async () => {
      const content = `# HIGH PRIORITY
# ✓ Already delivered (2024-01-01)
Not delivered yet`;

      mkdirSync('.copilot-test', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, content);

      mockRunMission.mockResolvedValue({ 
        success: true,
        mission: 'launch',
        task: 'Not delivered yet',
        phases: [],
        totalDuration: 1000,
        filesChanged: 0
      });

      const bay = new CargoBay();
      
      // Mock the private sleep method to be instant
      const sleepSpy = vi.spyOn(bay as any, 'sleep').mockResolvedValue(undefined);
      
      const result = await bay.process();

      expect(result.delivered).toBe(1);
      expect(result.lost).toBe(0);
      expect(mockRunMission).toHaveBeenCalledTimes(1);
      expect(mockRunMission).toHaveBeenCalledWith({
        mission: 'launch',
        task: 'Not delivered yet',
        modelTier: 'auto'
      });
      
      sleepSpy.mockRestore();
    });
  });

  describe('CLI functions', () => {
    it('should process cargo via CLI function', async () => {
      const content = `# HIGH PRIORITY
CLI test task`;

      mkdirSync('.copilot-test', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, content);

      mockRunMission.mockResolvedValue({ 
        success: true,
        mission: 'launch',
        task: 'CLI test task',
        phases: [],
        totalDuration: 1000,
        filesChanged: 0
      });

      await processCargo({ dryRun: true });

      // Should complete without error
      expect(mockRunMission).not.toHaveBeenCalled(); // dry run
    });

    it('should show cargo via CLI function', () => {
      const content = `# HIGH PRIORITY
Show this task`;

      mkdirSync('.copilot-test', { recursive: true });
      writeFileSync(TEST_CARGO_FILE, content);

      expect(() => showCargo()).not.toThrow();
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('1. Show this task'));
    });

    it('should handle missing cargo file in show function', () => {
      expect(() => showCargo()).not.toThrow();
    });
  });
});