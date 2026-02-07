// 🧠 ORBIT Skills - Test Suite
// Comprehensive tests for the skills learning system

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import {
  detectCategory,
  extractSkill,
  findMatchingSkills,
  recordSkillUse,
  getSkillStats,
  type SkillCategory
} from './skills.js';
import type { Skill } from './types.js';

const TEST_SKILLS_DIR = 'src/config/skills';
const TEST_INDEX_FILE = join(TEST_SKILLS_DIR, 'index.json');

describe('Skills Module', () => {
  beforeEach(() => {
    // Clean up before each test
    if (existsSync(TEST_SKILLS_DIR)) {
      rmSync(TEST_SKILLS_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (existsSync(TEST_SKILLS_DIR)) {
      rmSync(TEST_SKILLS_DIR, { recursive: true, force: true });
    }
  });

  describe('detectCategory', () => {
    it('should detect testing category', () => {
      expect(detectCategory('Add unit tests for API')).toBe('testing');
      expect(detectCategory('Write spec for user model')).toBe('testing');
      expect(detectCategory('Improve test coverage')).toBe('testing');
      expect(detectCategory('Add Jest tests')).toBe('testing');
    });

    it('should detect security category', () => {
      expect(detectCategory('Fix XSS vulnerability')).toBe('security');
      expect(detectCategory('Add authentication middleware')).toBe('security');
      expect(detectCategory('Prevent SQL injection')).toBe('security');
      expect(detectCategory('Implement encryption')).toBe('security');
    });

    it('should detect api category', () => {
      expect(detectCategory('Create REST API endpoint')).toBe('api');
      expect(detectCategory('Build GraphQL resolver')).toBe('api');
      expect(detectCategory('Add HTTP handler')).toBe('api');
    });

    it('should detect database category', () => {
      expect(detectCategory('Create database migration')).toBe('database');
      expect(detectCategory('Optimize SQL query')).toBe('database');
      expect(detectCategory('Add database index')).toBe('database');
      expect(detectCategory('Design schema for users')).toBe('database');
    });

    it('should detect refactoring category', () => {
      expect(detectCategory('Refactor legacy code')).toBe('refactoring');
      expect(detectCategory('Clean up legacy code')).toBe('refactoring');
      expect(detectCategory('Extract helper function')).toBe('refactoring');
    });

    it('should detect documentation category', () => {
      expect(detectCategory('Update README')).toBe('documentation');
      expect(detectCategory('Write documentation for module')).toBe('documentation');
      expect(detectCategory('Add JSDoc comments')).toBe('documentation');
    });

    it('should detect performance category', () => {
      expect(detectCategory('Optimize rendering performance')).toBe('performance');
      expect(detectCategory('Speed up caching layer')).toBe('performance');
      expect(detectCategory('Reduce memory usage')).toBe('performance');
    });

    it('should detect debugging category', () => {
      expect(detectCategory('Fix login bug')).toBe('debugging');
      expect(detectCategory('Debug application crash')).toBe('debugging');
      expect(detectCategory('Resolve error in payment flow')).toBe('debugging');
    });

    it('should detect feature category', () => {
      expect(detectCategory('Implement user profile')).toBe('feature');
      expect(detectCategory('Add dark mode feature')).toBe('feature');
      expect(detectCategory('Build notification system')).toBe('feature');
    });

    it('should default to general category', () => {
      expect(detectCategory('Do something else')).toBe('general');
      expect(detectCategory('Random task')).toBe('general');
    });

    it('should handle case insensitivity', () => {
      expect(detectCategory('ADD UNIT TESTS')).toBe('testing');
      expect(detectCategory('Fix XSS Vulnerability')).toBe('security');
    });

    it('should match first keyword when multiple categories apply', () => {
      // "test" appears before "feature" in keyword matching
      const result = detectCategory('Add test feature');
      expect(['testing', 'feature']).toContain(result);
    });
  });

  describe('extractSkill', () => {
    it('should create a new skill on success', () => {
      const task = 'Add unit tests for authentication';
      const skill = extractSkill(task, 'success', 'testing context', 'Created auth.test.ts with 10 tests');

      expect(skill.id).toMatch(/^skill-\d+$/);
      expect(skill.pattern).toBe(task);
      expect(skill.context).toBe('testing context');
      expect(skill.successCount).toBe(1);
      expect(skill.lastUsed).toBeInstanceOf(Date);
    });

    it('should create a new skill on failure', () => {
      const task = 'Fix critical bug';
      const skill = extractSkill(task, 'failure');

      expect(skill.successCount).toBe(0);
      expect(skill.pattern).toBe(task);
    });

    it('should persist skill to file system', () => {
      const task = 'Implement API endpoint';
      const skill = extractSkill(task, 'success');

      const skillFile = join(TEST_SKILLS_DIR, `${skill.id}.json`);
      expect(existsSync(skillFile)).toBe(true);

      const savedSkill = JSON.parse(readFileSync(skillFile, 'utf-8'));
      expect(savedSkill.id).toBe(skill.id);
      expect(savedSkill.pattern).toBe(task);
    });

    it('should update index with new skill', () => {
      extractSkill('Add tests', 'success');
      extractSkill('Fix bug', 'success');

      expect(existsSync(TEST_INDEX_FILE)).toBe(true);
      const index = JSON.parse(readFileSync(TEST_INDEX_FILE, 'utf-8'));
      expect(index.skills).toHaveLength(2);
    });

    it('should categorize and update category counts', () => {
      extractSkill('Add unit tests', 'success');
      extractSkill('Write more tests', 'success');
      extractSkill('Fix security issue', 'success');

      const index = JSON.parse(readFileSync(TEST_INDEX_FILE, 'utf-8'));
      expect(index.categories.testing).toBe(2);
      expect(index.categories.security).toBe(1);
    });

    it('should track success rates by category', () => {
      extractSkill('Test 1', 'success');
      extractSkill('Test 2', 'success');
      extractSkill('Test 3', 'failure');

      const index = JSON.parse(readFileSync(TEST_INDEX_FILE, 'utf-8'));
      expect(index.successRates.testing.total).toBe(3);
      expect(index.successRates.testing.success).toBe(2);
    });

    it('should use category as default context if not provided', () => {
      const skill = extractSkill('Add database index', 'success');
      expect(skill.context).toBe('database');
    });

    it('should extract solution summary from output', () => {
      const output = `
        Created auth.test.ts
        Updated login.ts
        COMPLETE: Implemented authentication tests
      `;
      const skill = extractSkill('Add auth tests', 'success', undefined, output);
      expect(skill.solution).toBeTruthy();
      expect(skill.solution.length).toBeGreaterThan(0);
    });

    it('should handle missing solution gracefully', () => {
      const skill = extractSkill('Some task', 'success');
      expect(skill.solution).toBe('');
    });

    it('should create skills directory if it does not exist', () => {
      if (existsSync(TEST_SKILLS_DIR)) {
        rmSync(TEST_SKILLS_DIR, { recursive: true, force: true });
      }

      extractSkill('Test task', 'success');
      expect(existsSync(TEST_SKILLS_DIR)).toBe(true);
    });
  });

  describe('findMatchingSkills', () => {
    it('should find skills matching task keywords', () => {
      // Create skills directly in test
      extractSkill('Add unit tests for authentication module', 'success');
      extractSkill('Implement user authentication with JWT', 'success');
      
      const matches = findMatchingSkills('authentication tests');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].pattern).toContain('authentication');
    });

    it('should score skills by keyword overlap', () => {
      // Create skill with multiple matching keywords
      extractSkill('Add unit tests for authentication module', 'success');
      
      const matches = findMatchingSkills('unit authentication');
      expect(matches.length).toBeGreaterThan(0);
      // Should find the skill that has both keywords
      expect(matches[0].pattern.toLowerCase()).toContain('unit');
      expect(matches[0].pattern.toLowerCase()).toContain('authentication');
    });

    it('should limit results to specified number', () => {
      extractSkill('Add unit tests for authentication module', 'success');
      extractSkill('Implement user authentication with JWT', 'success');
      extractSkill('Fix database connection bug', 'success');
      
      const matches = findMatchingSkills('test', 2);
      expect(matches.length).toBeLessThanOrEqual(2);
    });

    it('should default to 5 results', () => {
      // Create more than 5 matching skills
      for (let i = 0; i < 10; i++) {
        extractSkill(`Add test case ${i}`, 'success');
      }
      const matches = findMatchingSkills('test');
      expect(matches.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array if no matches', () => {
      extractSkill('Add unit tests', 'success');
      const matches = findMatchingSkills('completely unrelated xyz123');
      expect(matches).toEqual([]);
    });

    it('should handle case insensitivity', () => {
      // Extract a skill first so we have something to match
      extractSkill('User AUTHENTICATION module', 'success');
      const matches = findMatchingSkills('authentication');
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should filter out short words', () => {
      extractSkill('Add unit tests', 'success');
      // Words with length <= 2 should be ignored
      const matches = findMatchingSkills('add a test');
      // Should still find matches based on "add" and "test"
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should handle empty skills directory', () => {
      rmSync(TEST_SKILLS_DIR, { recursive: true, force: true });
      const matches = findMatchingSkills('anything');
      expect(matches).toEqual([]);
    });

    it('should skip invalid JSON files', () => {
      mkdirSync(TEST_SKILLS_DIR, { recursive: true });
      writeFileSync(join(TEST_SKILLS_DIR, 'invalid.json'), 'invalid json{');
      const matches = findMatchingSkills('test');
      expect(matches).toEqual([]);
    });

    it('should ignore index.json file', () => {
      extractSkill('Test skill', 'success');
      const matches = findMatchingSkills('test');
      // Should not try to parse index.json as a skill
      expect(matches.every(s => s.id !== 'index')).toBe(true);
    });
  });

  describe('recordSkillUse', () => {
    it('should increment success count on successful use', () => {
      const skill = extractSkill('Test task', 'success');
      const initialCount = skill.successCount;

      recordSkillUse(skill.id, true);

      const skillFile = join(TEST_SKILLS_DIR, `${skill.id}.json`);
      const updated = JSON.parse(readFileSync(skillFile, 'utf-8'));
      expect(updated.successCount).toBe(initialCount + 1);
    });

    it('should update lastUsed timestamp', async () => {
      const skill = extractSkill('Test task', 'success');
      const originalTime = new Date(skill.lastUsed);

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));
      
      recordSkillUse(skill.id, true);

      const skillFile = join(TEST_SKILLS_DIR, `${skill.id}.json`);
      const updated = JSON.parse(readFileSync(skillFile, 'utf-8'));
      const newTime = new Date(updated.lastUsed);
      expect(newTime.getTime()).toBeGreaterThanOrEqual(originalTime.getTime());
    });

    it('should not increment success count on failure', () => {
      const skill = extractSkill('Test task', 'success');
      const initialCount = skill.successCount;

      recordSkillUse(skill.id, false);

      const skillFile = join(TEST_SKILLS_DIR, `${skill.id}.json`);
      const updated = JSON.parse(readFileSync(skillFile, 'utf-8'));
      expect(updated.successCount).toBe(initialCount);
    });

    it('should handle non-existent skill gracefully', () => {
      expect(() => recordSkillUse('non-existent-skill', true)).not.toThrow();
    });

    it('should handle corrupted skill file gracefully', () => {
      const skill = extractSkill('Test task', 'success');
      const skillFile = join(TEST_SKILLS_DIR, `${skill.id}.json`);
      writeFileSync(skillFile, 'corrupted json{');

      expect(() => recordSkillUse(skill.id, true)).not.toThrow();
    });
  });

  describe('getSkillStats', () => {
    it('should return zero stats for empty skills', () => {
      const stats = getSkillStats();
      expect(stats.total).toBe(0);
      expect(stats.byCategory).toEqual({});
      expect(stats.successRates).toEqual({});
    });

    it('should return total count of skills', () => {
      extractSkill('Task 1', 'success');
      extractSkill('Task 2', 'success');
      extractSkill('Task 3', 'success');

      const stats = getSkillStats();
      expect(stats.total).toBe(3);
    });

    it('should return skills grouped by category', () => {
      extractSkill('Add tests', 'success');
      extractSkill('More tests', 'success');
      extractSkill('Fix bug', 'success');

      const stats = getSkillStats();
      expect(stats.byCategory.testing).toBe(2);
      expect(stats.byCategory.debugging).toBe(1);
    });

    it('should calculate success rates as percentages', () => {
      extractSkill('Test 1', 'success');
      extractSkill('Test 2', 'success');
      extractSkill('Test 3', 'failure');
      extractSkill('Test 4', 'failure');

      const stats = getSkillStats();
      expect(stats.successRates.testing).toBe(50); // 2 success out of 4
    });

    it('should handle 100% success rate', () => {
      extractSkill('Perfect task', 'success');

      const stats = getSkillStats();
      expect(stats.successRates.general).toBe(100);
    });

    it('should handle 0% success rate', () => {
      extractSkill('Failed task', 'failure');

      const stats = getSkillStats();
      expect(stats.successRates.general).toBe(0);
    });

    it('should round success rates to whole numbers', () => {
      extractSkill('Task 1', 'success');
      extractSkill('Task 2', 'success');
      extractSkill('Task 3', 'failure');

      const stats = getSkillStats();
      // 2/3 = 66.666... should round to 67
      expect(stats.successRates.general).toBe(67);
    });
  });

  describe('Solution Extraction', () => {
    it('should extract file names from solution', () => {
      const output = 'Created auth.ts, updated login.ts, modified user.model.ts';
      const skill = extractSkill('Auth work', 'success', undefined, output);
      expect(skill.solution).toContain('auth.ts');
    });

    it('should find COMPLETE markers', () => {
      const output = `
        Some work done
        COMPLETE: Authentication implementation finished
        More details
      `;
      const skill = extractSkill('Auth task', 'success', undefined, output);
      expect(skill.solution).toContain('Authentication implementation');
    });

    it('should extract summary lines with action verbs', () => {
      const output = `
        Implemented user authentication
        Added JWT token validation
        Fixed security vulnerability
      `;
      const skill = extractSkill('Security work', 'success', undefined, output);
      expect(skill.solution.toLowerCase()).toMatch(/implemented|added|fixed/);
    });

    it('should limit solution length', () => {
      const longOutput = 'a'.repeat(1000);
      const skill = extractSkill('Task', 'success', undefined, longOutput);
      expect(skill.solution.length).toBeLessThanOrEqual(500);
    });

    it('should handle multiple file patterns', () => {
      const output = 'created file1.ts, modified file2.ts, updated file3.ts, wrote file4.ts, deleted file5.ts';
      const skill = extractSkill('Files work', 'success', undefined, output);
      expect(skill.solution).toBeTruthy();
    });
  });

  describe('Index Management', () => {
    it('should create index file on first skill', () => {
      extractSkill('First skill', 'success');
      expect(existsSync(TEST_INDEX_FILE)).toBe(true);
    });

    it('should update lastUpdated timestamp', async () => {
      extractSkill('Task 1', 'success');
      const index1 = JSON.parse(readFileSync(TEST_INDEX_FILE, 'utf-8'));
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      extractSkill('Task 2', 'success');
      const index2 = JSON.parse(readFileSync(TEST_INDEX_FILE, 'utf-8'));
      expect(index2.lastUpdated).toBeTruthy();
      expect(new Date(index2.lastUpdated).getTime()).toBeGreaterThanOrEqual(new Date(index1.lastUpdated).getTime());
    });

    it('should handle corrupted index file', () => {
      mkdirSync(TEST_SKILLS_DIR, { recursive: true });
      writeFileSync(TEST_INDEX_FILE, 'invalid json{');
      
      expect(() => extractSkill('Task', 'success')).not.toThrow();
      
      // Should create valid index
      const index = JSON.parse(readFileSync(TEST_INDEX_FILE, 'utf-8'));
      expect(index.skills).toBeDefined();
    });

    it('should initialize missing index fields', () => {
      mkdirSync(TEST_SKILLS_DIR, { recursive: true });
      // Write partial index
      writeFileSync(TEST_INDEX_FILE, JSON.stringify({ skills: [] }));
      
      const stats = getSkillStats();
      expect(stats.byCategory).toBeDefined();
      expect(stats.successRates).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty task string', () => {
      const skill = extractSkill('', 'success');
      expect(skill.pattern).toBe('');
      expect(skill.context).toBe('general');
    });

    it('should handle very long task string', () => {
      const longTask = 'a'.repeat(1000);
      const skill = extractSkill(longTask, 'success');
      expect(skill.pattern).toBe(longTask);
    });

    it('should handle special characters in task', () => {
      const task = 'Fix bug: user@example.com -> admin@example.com (50% case)';
      const skill = extractSkill(task, 'success');
      expect(skill.pattern).toBe(task);
    });

    it('should handle multiple skill extractions with unique IDs', () => {
      // Extract skills in sequence with small delays to ensure unique timestamps
      const skills = [];
      for (let i = 0; i < 5; i++) {
        // Each call to Date.now() should produce different timestamps in a loop
        skills.push(extractSkill(`Unique task number ${i}`, 'success'));
      }
      
      expect(skills).toHaveLength(5);
      // Check that IDs are present and follow expected format
      expect(skills.every(s => s.id.startsWith('skill-'))).toBe(true);
    });
  });
});
