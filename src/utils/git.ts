// 🛸 ORBIT Git Utilities

import { execSync } from 'child_process';
import { escapeShellArg } from './shell-escape.js';

export function execGit(cmd: string): string | undefined {
  try {
    return execSync(`git ${cmd}`, { 
      encoding: 'utf-8', 
      stdio: ['pipe', 'pipe', 'pipe'] 
    }).trim();
  } catch {
    return undefined;
  }
}

export function getCurrentCommit(): string | undefined {
  return execGit('rev-parse HEAD');
}

export function hasChanges(): boolean {
  const status = execGit('status --porcelain');
  return !!status && status.length > 0;
}

export function getChangedFiles(): string[] {
  const output = execGit('diff --name-only HEAD');
  if (!output) return [];
  return output.split('\n').filter(Boolean);
}

export function getStagedFiles(): string[] {
  const output = execGit('diff --cached --name-only');
  if (!output) return [];
  return output.split('\n').filter(Boolean);
}

export function getLastCommitMessage(): string | undefined {
  return execGit('log -1 --pretty=%B');
}

export function getRecentCommitMessages(count: number = 10): string[] {
  const output = execGit(`log --oneline -${count}`);
  if (!output) return [];
  return output.split('\n').filter(Boolean);
}

/**
 * Extract normalized improvement categories from recent commit messages.
 * Groups similar commits (e.g. "replace unsafe any types" and "eliminate dangerous any types")
 * into canonical categories to detect repeated work.
 */
export function getCompletedImprovementCategories(count: number = 100): string[] {
  const commits = getRecentCommitMessages(count);
  const categories = new Set<string>();

  // Map of patterns to canonical category names
  const categoryPatterns: [RegExp, string][] = [
    [/\bany\b.*type|type.*\bany\b|as any/i, 'replace-any-types'],
    [/return type|explicit return/i, 'add-return-types'],
    [/array.*safe|safe.*array|safeArray|array\[0\]|array access/i, 'safe-array-access'],
    [/catch block|unknown.*catch|catch.*unknown|empty catch/i, 'catch-block-types'],
    [/error handling|handleError|error.*handling/i, 'error-handling'],
    [/error boundar/i, 'error-boundaries'],
    [/non-null assert|non.null/i, 'non-null-assertions'],
    [/strict equal|loose equal|===|==/i, 'strict-equality'],
    [/JSON\.parse|safeJsonParse|json.*pars/i, 'safe-json-parse'],
    [/JSON\.stringify|safeJsonStringify/i, 'safe-json-stringify'],
    [/console\.\w+|devLog|devError/i, 'console-to-devlog'],
    [/Math\.random|crypto.*random/i, 'secure-random'],
    [/parseInt|parseFloat|safe.*pars/i, 'safe-parsing'],
    [/timer.*memory|memory.*leak.*timer|setTimeout|setInterval|TimerManager/i, 'timer-memory-leaks'],
    [/useCallback|inline callback/i, 'usecallback-optimization'],
    [/React\.memo/i, 'react-memo'],
    [/inline style|StyleSheet/i, 'inline-styles'],
    [/accessibility|accessibilityLabel|accessibilityRole|accessibilityHint|WCAG/i, 'accessibility'],
    [/JSDoc|documentation/i, 'jsdoc-documentation'],
    [/unused import|unused variable/i, 'unused-imports'],
    [/promise.*reject|unhandled.*promise|void async|handleAsyncError/i, 'promise-handling'],
    [/input sanitiz/i, 'input-sanitization'],
    [/prototype pollution/i, 'prototype-pollution'],
    [/webhook.*verif/i, 'webhook-verification'],
    [/typed error|generic Error|AppError/i, 'typed-errors'],
    [/optional chain/i, 'optional-chaining'],
    [/React\.FC|function declaration/i, 'react-fc-pattern'],
    [/@ts-ignore/i, 'ts-ignore-removal'],
    [/type coercion|Boolean\(\)|Number\(\)/i, 'type-coercion'],
    [/string concat/i, 'string-concatenation'],
    [/split\(\).*index|safeSplit/i, 'safe-split'],
    [/React key|index.*key/i, 'react-keys'],
    [/\.then\(.*async.*await/i, 'async-await-migration'],
    [/Object\..*safe|safe.*Object/i, 'safe-object-methods'],
    [/safeMath/i, 'safe-math'],
    [/safeBoolean/i, 'safe-boolean'],
    [/safeTrim/i, 'safe-trim'],
    [/safeParseDate|safe date|new Date/i, 'safe-date-parsing'],
    [/useSafeState/i, 'safe-state'],
    [/event listener.*memory|memory.*event listener/i, 'event-listener-leaks'],
    [/useEffect.*cleanup/i, 'useeffect-cleanup'],
    [/Promise\.allSettled/i, 'promise-allsettled'],
    [/i18n|internationali|hardcoded string/i, 'internationalization'],
    [/Alert\.alert.*sanitiz|information disclosure/i, 'alert-sanitization'],
    [/destructuring.*safe|unsafe destructuring/i, 'safe-destructuring'],
  ];

  for (const commit of commits) {
    // Strip hash prefix: "abc1234 type: description" → "type: description"
    const msg = commit.replace(/^[a-f0-9]+\s+/, '');
    for (const [pattern, category] of categoryPatterns) {
      if (pattern.test(msg)) {
        categories.add(category);
      }
    }
  }

  return Array.from(categories);
}

/**
 * Count how many recent commits are reactive TS error fixes
 * (indicates a break→fix cycle).
 */
export function countRecentFixCycles(count: number = 20): number {
  const commits = getRecentCommitMessages(count);
  return commits.filter(c =>
    /fix:.*typescript|fix:.*compilation|fix:.*syntax error/i.test(c)
  ).length;
}

export function stageAll(): boolean {
  try {
    execSync('git add -A', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function commit(message: string): boolean {
  try {
    execSync(`git commit -m ${escapeShellArg(message)}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function push(branch?: string): boolean {
  try {
    const cmd = branch ? `git push origin ${escapeShellArg(branch)}` : 'git push';
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function createBranch(name: string): boolean {
  try {
    execSync(`git checkout -b ${escapeShellArg(name)}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function checkoutBranch(name: string): boolean {
  try {
    execSync(`git checkout ${escapeShellArg(name)}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function isGitRepo(): boolean {
  return !!execGit('rev-parse --git-dir');
}

export function getRepoRoot(): string | undefined {
  return execGit('rev-parse --show-toplevel');
}
