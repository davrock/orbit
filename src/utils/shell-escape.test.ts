// 🛸 ORBIT Shell Escape Tests
// Security-critical utility tests

import { describe, it, expect } from 'vitest';
import { escapeShellArg, escapeShellArgs, joinShellArgs } from './shell-escape.js';

describe('escapeShellArg', () => {
  it('should wrap simple strings in single quotes', () => {
    expect(escapeShellArg('hello')).toBe("'hello'");
    expect(escapeShellArg('test123')).toBe("'test123'");
  });

  it('should escape single quotes within strings', () => {
    expect(escapeShellArg("it's")).toBe("'it'\\''s'");
    expect(escapeShellArg("can't")).toBe("'can'\\''t'");
  });

  it('should handle multiple single quotes', () => {
    expect(escapeShellArg("'quoted'")).toBe("''\\''quoted'\\'''");
  });

  it('should handle empty strings', () => {
    expect(escapeShellArg('')).toBe("''");
  });

  it('should prevent command injection with semicolons', () => {
    const malicious = 'test; rm -rf /';
    const escaped = escapeShellArg(malicious);
    expect(escaped).toBe("'test; rm -rf /'");
    // The semicolon is now safely quoted, preventing execution
    expect(escaped.startsWith("'")).toBe(true);
    expect(escaped.endsWith("'")).toBe(true);
  });

  it('should prevent command injection with backticks', () => {
    const malicious = 'test`whoami`';
    const escaped = escapeShellArg(malicious);
    expect(escaped).toBe("'test`whoami`'");
  });

  it('should prevent command injection with dollar signs', () => {
    const malicious = 'test$(whoami)';
    const escaped = escapeShellArg(malicious);
    expect(escaped).toBe("'test$(whoami)'");
  });

  it('should handle special characters safely', () => {
    const special = '!@#$%^&*()[]{}|\\<>?';
    const escaped = escapeShellArg(special);
    expect(escaped).toBe(`'!@#$%^&*()[]{}|\\<>?'`);
  });

  it('should handle newlines and tabs', () => {
    const withWhitespace = 'line1\nline2\ttab';
    const escaped = escapeShellArg(withWhitespace);
    expect(escaped).toBe("'line1\nline2\ttab'");
  });
});

describe('escapeShellArgs', () => {
  it('should escape multiple arguments', () => {
    const args = ['hello', 'world', "it's"];
    const escaped = escapeShellArgs(args);
    expect(escaped).toEqual(["'hello'", "'world'", "'it'\\''s'"]);
  });

  it('should handle empty array', () => {
    expect(escapeShellArgs([])).toEqual([]);
  });

  it('should escape each argument independently', () => {
    const args = ['arg1', 'arg2; evil', 'arg3'];
    const escaped = escapeShellArgs(args);
    expect(escaped).toEqual(["'arg1'", "'arg2; evil'", "'arg3'"]);
  });
});

describe('joinShellArgs', () => {
  it('should join arguments with spaces', () => {
    const args = ['git', 'commit', '-m'];
    const joined = joinShellArgs(args);
    expect(joined).toBe("'git' 'commit' '-m'");
  });

  it('should escape and join complex arguments', () => {
    const args = ['echo', "it's working", 'test; rm -rf /'];
    const joined = joinShellArgs(args);
    expect(joined).toBe("'echo' 'it'\\''s working' 'test; rm -rf /'");
  });

  it('should handle empty array', () => {
    expect(joinShellArgs([])).toBe('');
  });

  it('should handle single argument', () => {
    expect(joinShellArgs(['test'])).toBe("'test'");
  });

  it('should prevent injection in commit messages', () => {
    const args = ['git', 'commit', '-m', 'fix: resolved issue; rm -rf /'];
    const joined = joinShellArgs(args);
    // The dangerous command is safely quoted within the message
    expect(joined).toContain("'fix: resolved issue; rm -rf /'");
    expect(joined).toBe("'git' 'commit' '-m' 'fix: resolved issue; rm -rf /'");
  });
});
