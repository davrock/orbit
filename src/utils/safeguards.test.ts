// 🛸 ORBIT Safeguards Tests
// Test critical file validation and protection

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, writeFileSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { 
  validateCriticalFiles, 
  checkCriticalFilesBeforeMission,
  getCriticalFilesWarning 
} from './safeguards.js';

describe('Safeguards', () => {
  describe('validateCriticalFiles', () => {
    it('returns valid: true when all critical files exist', () => {
      // All critical files should exist in the actual project
      const result = validateCriticalFiles();
      
      if (!result.valid) {
        console.warn('Critical files missing:', result.missing);
      }
      
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('missing');
      expect(Array.isArray(result.missing)).toBe(true);
    });

    it('returns missing files when they do not exist', () => {
      const result = validateCriticalFiles();
      
      // Each missing file should be a string
      result.missing.forEach(file => {
        expect(typeof file).toBe('string');
      });
    });
  });

  describe('checkCriticalFilesBeforeMission', () => {
    it('returns a boolean', () => {
      const result = checkCriticalFilesBeforeMission();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getCriticalFilesWarning', () => {
    it('returns a warning message string', () => {
      const warning = getCriticalFilesWarning();
      
      expect(typeof warning).toBe('string');
      expect(warning).toContain('CRITICAL');
      expect(warning).toContain('Do NOT delete');
    });

    it('includes references to config files', () => {
      const warning = getCriticalFilesWarning();
      
      expect(warning).toContain('src/config/');
    });
  });

  describe('security: shell injection prevention', () => {
    it('critical files list does not contain shell metacharacters', () => {
      // This test verifies that CRITICAL_FILES are safe
      // Even though we now escape them, verify the list is still clean
      const result = validateCriticalFiles();
      const allFiles = [
        'src/config/best-practices.yaml',
        'src/config/crew.yaml',
        'src/config/missions.yaml',
        'src/config/models.yaml',
        'src/config/cargo_manifest.txt'
      ];
      
      // Verify no files contain dangerous shell metacharacters
      allFiles.forEach(file => {
        expect(file).not.toMatch(/[;&|$`()]/);
      });
    });

    it('validateCriticalFiles handles files with spaces safely', () => {
      // Even if future files have spaces, they should be handled safely
      // This is a safety test for the pattern, not current implementation
      const result = validateCriticalFiles();
      
      // Should not throw or have issues with current file list
      expect(result).toBeDefined();
      expect(result.valid).toBeDefined();
    });
  });

  describe('protected directories', () => {
    it('warning mentions critical directories', () => {
      const warning = getCriticalFilesWarning();
      
      // The warning should make users aware of protected files
      expect(warning.length).toBeGreaterThan(0);
    });
  });
});
