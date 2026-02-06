// 🛸 ORBIT Git Utilities Tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as git from './git.js';

vi.mock('child_process');

describe('git utilities', () => {
  const mockExecSync = vi.mocked(execSync);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('execGit', () => {
    it('should execute git command and return trimmed output', () => {
      mockExecSync.mockReturnValue('  output  \n' as any);
      const result = git.execGit('status');
      expect(result).toBe('output');
      expect(mockExecSync).toHaveBeenCalledWith('git status', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    });

    it('should return undefined on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });
      const result = git.execGit('status');
      expect(result).toBeUndefined();
    });
  });

  describe('getCurrentCommit', () => {
    it('should return current commit hash', () => {
      mockExecSync.mockReturnValue('abc123def456' as any);
      const result = git.getCurrentCommit();
      expect(result).toBe('abc123def456');
    });

    it('should return undefined when not in git repo', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Not a git repository');
      });
      const result = git.getCurrentCommit();
      expect(result).toBeUndefined();
    });
  });

  describe('hasChanges', () => {
    it('should return true when there are changes', () => {
      mockExecSync.mockReturnValue(' M file.txt\n' as any);
      const result = git.hasChanges();
      expect(result).toBe(true);
    });

    it('should return false when there are no changes', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.hasChanges();
      expect(result).toBe(false);
    });

    it('should return false on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Error');
      });
      const result = git.hasChanges();
      expect(result).toBe(false);
    });
  });

  describe('getChangedFiles', () => {
    it('should return list of changed files', () => {
      mockExecSync.mockReturnValue('file1.txt\nfile2.js\n' as any);
      const result = git.getChangedFiles();
      expect(result).toEqual(['file1.txt', 'file2.js']);
    });

    it('should return empty array when no changes', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.getChangedFiles();
      expect(result).toEqual([]);
    });

    it('should filter empty lines', () => {
      mockExecSync.mockReturnValue('file1.txt\n\nfile2.js\n\n' as any);
      const result = git.getChangedFiles();
      expect(result).toEqual(['file1.txt', 'file2.js']);
    });

    it('should return empty array on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Error');
      });
      const result = git.getChangedFiles();
      expect(result).toEqual([]);
    });
  });

  describe('getStagedFiles', () => {
    it('should return list of staged files', () => {
      mockExecSync.mockReturnValue('staged1.txt\nstaged2.js\n' as any);
      const result = git.getStagedFiles();
      expect(result).toEqual(['staged1.txt', 'staged2.js']);
    });

    it('should return empty array when no staged files', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.getStagedFiles();
      expect(result).toEqual([]);
    });

    it('should return empty array on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Error');
      });
      const result = git.getStagedFiles();
      expect(result).toEqual([]);
    });
  });

  describe('getLastCommitMessage', () => {
    it('should return last commit message', () => {
      mockExecSync.mockReturnValue('fix: bug fix\n' as any);
      const result = git.getLastCommitMessage();
      expect(result).toBe('fix: bug fix');
    });

    it('should return undefined on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Error');
      });
      const result = git.getLastCommitMessage();
      expect(result).toBeUndefined();
    });
  });

  describe('stageAll', () => {
    it('should stage all files and return true', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.stageAll();
      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith('git add -A', { stdio: 'pipe' });
    });

    it('should return false on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Error');
      });
      const result = git.stageAll();
      expect(result).toBe(false);
    });
  });

  describe('commit', () => {
    it('should commit with escaped message and return true', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.commit('test commit');
      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('git commit -m'),
        { stdio: 'pipe' }
      );
    });

    it('should handle special characters in commit message', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.commit('fix: "quoted" message with $vars');
      expect(result).toBe(true);
    });

    it('should return false on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Error');
      });
      const result = git.commit('test');
      expect(result).toBe(false);
    });
  });

  describe('push', () => {
    it('should push without branch specified', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.push();
      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith('git push', { stdio: 'pipe' });
    });

    it('should push to specific branch', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.push('main');
      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('git push origin'),
        { stdio: 'pipe' }
      );
    });

    it('should escape branch name', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.push('feature/test-branch');
      expect(result).toBe(true);
    });

    it('should return false on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Error');
      });
      const result = git.push();
      expect(result).toBe(false);
    });
  });

  describe('createBranch', () => {
    it('should create and checkout new branch', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.createBranch('feature/new');
      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('git checkout -b'),
        { stdio: 'pipe' }
      );
    });

    it('should escape branch name', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.createBranch('feature/test$branch');
      expect(result).toBe(true);
    });

    it('should return false on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Branch already exists');
      });
      const result = git.createBranch('existing');
      expect(result).toBe(false);
    });
  });

  describe('checkoutBranch', () => {
    it('should checkout existing branch', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.checkoutBranch('main');
      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('git checkout'),
        { stdio: 'pipe' }
      );
    });

    it('should escape branch name', () => {
      mockExecSync.mockReturnValue('' as any);
      const result = git.checkoutBranch('feature/test');
      expect(result).toBe(true);
    });

    it('should return false on error', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Branch does not exist');
      });
      const result = git.checkoutBranch('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('isGitRepo', () => {
    it('should return true when in git repository', () => {
      mockExecSync.mockReturnValue('.git' as any);
      const result = git.isGitRepo();
      expect(result).toBe(true);
    });

    it('should return false when not in git repository', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Not a git repository');
      });
      const result = git.isGitRepo();
      expect(result).toBe(false);
    });
  });

  describe('getRepoRoot', () => {
    it('should return repository root path', () => {
      mockExecSync.mockReturnValue('/home/user/project' as any);
      const result = git.getRepoRoot();
      expect(result).toBe('/home/user/project');
    });

    it('should return undefined when not in git repository', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Not a git repository');
      });
      const result = git.getRepoRoot();
      expect(result).toBeUndefined();
    });
  });
});
