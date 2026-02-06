// 🛸 ORBIT Git Utilities

import { execSync } from 'child_process';

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
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function push(branch?: string): boolean {
  try {
    const cmd = branch ? `git push origin ${branch}` : 'git push';
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function createBranch(name: string): boolean {
  try {
    execSync(`git checkout -b ${name}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function checkoutBranch(name: string): boolean {
  try {
    execSync(`git checkout ${name}`, { stdio: 'pipe' });
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
