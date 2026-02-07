// 🛸 ORBIT Launch Sequence Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as exec from '../utils/exec.js';

// Mock the exec module
vi.mock('../utils/exec.js', () => ({
  execQuiet: vi.fn(),
  commandExists: vi.fn()
}));

// Import after mocking
const { LaunchSequence } = await import('./launch-sequence.js');

describe('LaunchSequence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('closeGitHubIssue', () => {
    it('should validate issue number is a positive integer', () => {
      const execQuietMock = vi.mocked(exec.execQuiet);
      const sequence = new LaunchSequence({ once: true });
      
      // Use type assertion to access private method for testing
      const closeIssue = (sequence as any).closeGitHubIssue.bind(sequence);
      
      // Valid positive integer should call execQuiet
      closeIssue(123);
      expect(execQuietMock).toHaveBeenCalledWith('gh issue close 123 --comment "Fixed by ORBIT"');
      
      vi.clearAllMocks();
      
      // Zero should not call execQuiet (security check)
      closeIssue(0);
      expect(execQuietMock).not.toHaveBeenCalled();
      
      // Negative number should not call execQuiet (security check)
      closeIssue(-1);
      expect(execQuietMock).not.toHaveBeenCalled();
      
      // Float should not call execQuiet (security check)
      closeIssue(1.5);
      expect(execQuietMock).not.toHaveBeenCalled();
      
      // NaN should not call execQuiet (security check)
      closeIssue(NaN);
      expect(execQuietMock).not.toHaveBeenCalled();
    });

    it('should handle execQuiet errors gracefully', () => {
      const execQuietMock = vi.mocked(exec.execQuiet);
      execQuietMock.mockImplementation(() => {
        throw new Error('Command failed');
      });
      
      const sequence = new LaunchSequence({ once: true });
      const closeIssue = (sequence as any).closeGitHubIssue.bind(sequence);
      
      // Should not throw error when execQuiet fails
      expect(() => closeIssue(123)).not.toThrow();
    });
  });
});
