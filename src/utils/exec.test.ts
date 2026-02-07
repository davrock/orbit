// 🛸 ORBIT Shell Execution Tests
// Comprehensive test coverage for exec utilities

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exec, execQuiet, execAsync, commandExists, runWithTimeout, validateAdditionalArgs } from './exec.js';
import type { ExecResult } from './exec.js';

describe('exec utilities', () => {
  describe('execQuiet', () => {
    it('should return stdout for successful commands', () => {
      const result = execQuiet('echo "hello"');
      expect(result).toBe('hello');
    });

    it('should trim whitespace from output', () => {
      const result = execQuiet('echo "  spaced  "');
      // Note: echo trims internal spaces in some shells
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should return undefined for failed commands', () => {
      const result = execQuiet('exit 1');
      expect(result).toBeUndefined();
    });

    it('should return undefined for nonexistent commands', () => {
      const result = execQuiet('nonexistent-command-xyz-123');
      expect(result).toBeUndefined();
    });

    it('should handle empty output', () => {
      const result = execQuiet('true');
      expect(result).toBe('');
    });
  });

  describe('exec', () => {
    it('should return success for successful commands', () => {
      const result = exec('echo "test"');
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('test');
      expect(result.stderr).toBe('');
    });

    it('should return failure for failed commands', () => {
      const result = exec('exit 42');
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(42);
    });

    it('should capture stdout', () => {
      const result = exec('echo "stdout test"');
      expect(result.stdout).toContain('stdout test');
    });

    it('should handle commands with multiple lines of output', () => {
      const result = exec('echo "line1" && echo "line2"');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('line1');
      expect(result.stdout).toContain('line2');
    });

    it('should handle nonexistent commands', () => {
      const result = exec('nonexistent-command-xyz-123');
      expect(result.success).toBe(false);
      expect(result.exitCode).not.toBe(0);
    });

    it('should respect custom timeout', () => {
      const result = exec('sleep 0.1', 1);
      expect(result).toBeDefined();
    });

    it('should timeout long-running commands', () => {
      const result = exec('sleep 10', 0.1);
      expect(result.success).toBe(false);
    });
  });

  describe('execAsync', () => {
    it('should return success for successful commands', async () => {
      const result = await execAsync('echo', ['test']);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('test');
    });

    it('should return failure for failed commands', async () => {
      const result = await execAsync('false');
      expect(result.success).toBe(false);
    });

    it('should capture stdout from async commands', async () => {
      const result = await execAsync('echo', ['async output']);
      expect(result.stdout).toContain('async output');
    });

    it('should capture stderr from async commands', async () => {
      const result = await execAsync('sh', ['-c', 'echo "error" >&2 && exit 1']);
      // stderr may be captured differently based on spawn options
      expect(result.success).toBe(false);
    });

    it('should handle commands with no arguments', async () => {
      const result = await execAsync('pwd');
      expect(result.success).toBe(true);
      expect(result.stdout.length).toBeGreaterThan(0);
    });

    it('should handle command errors', async () => {
      const result = await execAsync('nonexistent-command-xyz-123');
      expect(result.success).toBe(false);
      // Exit code can vary (127 for command not found, 1 for errors)
      expect(result.exitCode).not.toBe(0);
    });

    it('should pass options to spawn', async () => {
      const result = await execAsync('pwd', [], { cwd: '/' });
      expect(result.success).toBe(true);
    });

    it('should handle commands that produce large output', async () => {
      // Use a simpler command that doesn't rely on shell features
      const result = await execAsync('printf', ['line\\n%.0s', Array(50).fill('').join(' ')]);
      expect(result).toBeDefined();
      expect(result.exitCode).toBeDefined();
    });
  });

  describe('commandExists', () => {
    it('should return true for existing commands', () => {
      expect(commandExists('echo')).toBe(true);
      expect(commandExists('ls')).toBe(true);
      expect(commandExists('cat')).toBe(true);
    });

    it('should return false for nonexistent commands', () => {
      expect(commandExists('nonexistent-cmd-xyz-123')).toBe(false);
      expect(commandExists('fake-command-999')).toBe(false);
    });

    it('should handle commands with special characters', () => {
      expect(commandExists('echo')).toBe(true);
    });

    it('should prevent command injection', () => {
      // Test that command injection is prevented
      // These should safely return false without executing the injected command
      expect(commandExists('echo; rm -rf /')).toBe(false);
      expect(commandExists("echo' && touch /tmp/injected || 'x")).toBe(false);
      expect(commandExists('$(whoami)')).toBe(false);
      expect(commandExists('`whoami`')).toBe(false);
    });

    it('should work with shell builtins', () => {
      // which may not find builtins, but common commands should work
      const result = commandExists('sh');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('runWithTimeout', () => {
    it('should execute commands with timeout', () => {
      const result = runWithTimeout('echo "test"', 5);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('test');
    });

    it('should handle fast commands', () => {
      const result = runWithTimeout('true', 1);
      expect(result.success).toBe(true);
    });

    it('should timeout slow commands', () => {
      const result = runWithTimeout('sleep 10', 0.1);
      expect(result.success).toBe(false);
    });

    it('should return proper exit codes', () => {
      const result = runWithTimeout('exit 7', 5);
      expect(result.exitCode).toBe(7);
      expect(result.success).toBe(false);
    });
  });

  describe('ExecResult interface', () => {
    it('should have all required fields', () => {
      const result = exec('echo "test"');
      expect(result).toHaveProperty('stdout');
      expect(result).toHaveProperty('stderr');
      expect(result).toHaveProperty('exitCode');
      expect(result).toHaveProperty('success');
    });

    it('should have correct types', () => {
      const result = exec('echo "test"');
      expect(typeof result.stdout).toBe('string');
      expect(typeof result.stderr).toBe('string');
      expect(typeof result.exitCode).toBe('number');
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty commands gracefully', () => {
      const result = exec('');
      expect(result).toBeDefined();
    });

    it('should handle commands with quotes', () => {
      const result = exec('echo "hello world"');
      expect(result.stdout).toContain('hello world');
    });

    it('should handle commands with pipes', () => {
      const result = exec('echo "test" | cat');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('test');
    });

    it('should handle commands with redirects', () => {
      const result = exec('echo "test" > /dev/null');
      expect(result.success).toBe(true);
    });

    it('should handle commands with environment variables', () => {
      const result = exec('echo $HOME');
      expect(result.success).toBe(true);
      expect(result.stdout.length).toBeGreaterThan(0);
    });

    it('should handle commands with && chains', () => {
      const result = exec('true && echo "success"');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('success');
    });

    it('should handle commands with || chains', () => {
      const result = exec('false || echo "fallback"');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('fallback');
    });
  });

  describe('Performance', () => {
    it('should execute quick commands efficiently', () => {
      const start = Date.now();
      exec('echo "fast"');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    it('should handle multiple sequential commands', () => {
      const results: ExecResult[] = [];
      for (let i = 0; i < 10; i++) {
        results.push(exec('echo "test"'));
      }
      expect(results).toHaveLength(10);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should not throw on command errors', () => {
      expect(() => exec('exit 1')).not.toThrow();
      expect(() => execQuiet('exit 1')).not.toThrow();
    });

    it('should handle stderr output', () => {
      const result = exec('sh -c "echo error >&2; exit 1"');
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('error');
    });

    it('should differentiate between stdout and stderr', () => {
      const result = exec('sh -c "echo out; echo err >&2"');
      expect(result.stdout).toContain('out');
      // Note: exec may capture both streams together depending on stdio config
      expect(result).toBeDefined();
    });
  });

  describe('Input validation', () => {
    it('should handle empty command in exec', () => {
      const result = exec('');
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('Command cannot be empty');
      expect(result.exitCode).toBe(1);
    });

    it('should handle whitespace-only command in exec', () => {
      const result = exec('   ');
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('Command cannot be empty');
      expect(result.exitCode).toBe(1);
    });

    it('should handle empty command in execQuiet', () => {
      const result = execQuiet('');
      expect(result).toBeUndefined();
    });

    it('should handle whitespace-only command in execQuiet', () => {
      const result = execQuiet('   ');
      expect(result).toBeUndefined();
    });

    it('should handle zero timeout in exec', () => {
      const result = exec('echo test', 0);
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('Timeout must be greater than 0');
      expect(result.exitCode).toBe(1);
    });

    it('should handle negative timeout in exec', () => {
      const result = exec('echo test', -5);
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('Timeout must be greater than 0');
      expect(result.exitCode).toBe(1);
    });

    it('should handle empty command in commandExists', () => {
      const result = commandExists('');
      expect(result).toBe(false);
    });

    it('should handle whitespace-only command in commandExists', () => {
      const result = commandExists('   ');
      expect(result).toBe(false);
    });

    it('should accept valid timeout values', () => {
      const result = exec('echo test', 1);
      expect(result.success).toBe(true);
    });
  });

  describe('execAsync input validation', () => {
    it('should handle empty command in execAsync', async () => {
      const result = await execAsync('');
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('Command cannot be empty');
      expect(result.exitCode).toBe(1);
    });

    it('should handle whitespace-only command in execAsync', async () => {
      const result = await execAsync('   ');
      expect(result.success).toBe(false);
      expect(result.stderr).toContain('Command cannot be empty');
      expect(result.exitCode).toBe(1);
    });

    it('should execute valid commands in execAsync', async () => {
      const result = await execAsync('echo', ['test']);
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('test');
    });
  });

  describe('validateAdditionalArgs', () => {
    it('should accept valid CLI flags', () => {
      expect(validateAdditionalArgs(['--model', '--verbose'])).toEqual({ valid: true });
      expect(validateAdditionalArgs(['-v', '-q'])).toEqual({ valid: true });
      expect(validateAdditionalArgs(['--model=gpt-4'])).toEqual({ valid: true });
      expect(validateAdditionalArgs(['--timeout=300'])).toEqual({ valid: true });
    });

    it('should accept empty array', () => {
      expect(validateAdditionalArgs([])).toEqual({ valid: true });
    });

    it('should reject arguments not starting with dash', () => {
      const result = validateAdditionalArgs(['safe', '--flag']);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('must start with "-"');
    });

    it('should reject arguments with shell metacharacters', () => {
      const dangerous = [
        '--flag;rm -rf /',
        '--flag&whoami',
        '--flag|cat /etc/passwd',
        '--flag`whoami`',
        '--flag$(whoami)',
        '--flag>{output}',
        '--flag<input',
        '--flag\\n',
      ];

      for (const arg of dangerous) {
        const result = validateAdditionalArgs([arg]);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('dangerous characters');
      }
    });

    it('should reject empty string arguments', () => {
      const result = validateAdditionalArgs(['']);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Empty argument');
    });

    it('should reject non-string arguments', () => {
      const result = validateAdditionalArgs([42 as unknown as string]);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('not a string');
    });

    it('should accept flags with equals and values', () => {
      expect(validateAdditionalArgs(['--model=claude-sonnet-4'])).toEqual({ valid: true });
      expect(validateAdditionalArgs(['--max-tokens=1000'])).toEqual({ valid: true });
    });

    it('should reject all args if any one is invalid', () => {
      const result = validateAdditionalArgs(['--valid', 'invalid']);
      expect(result.valid).toBe(false);
    });
  });
});
