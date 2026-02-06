// 🛸 ORBIT Shell Execution Utilities

import { spawn, execSync, SpawnOptions } from 'child_process';

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

export function execQuiet(cmd: string): string | undefined {
  try {
    return execSync(cmd, { 
      encoding: 'utf-8', 
      stdio: ['pipe', 'pipe', 'pipe'] 
    }).trim();
  } catch {
    return undefined;
  }
}

export function exec(cmd: string, timeout = 600): ExecResult {
  try {
    const stdout = execSync(cmd, {
      encoding: 'utf-8',
      timeout: timeout * 1000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { stdout, stderr: '', exitCode: 0, success: true };
  } catch (error: unknown) {
    const e = error as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: e.stdout?.toString() || '',
      stderr: e.stderr?.toString() || '',
      exitCode: e.status || 1,
      success: false
    };
  }
}

export async function execAsync(
  cmd: string,
  args: string[] = [],
  options: SpawnOptions = {}
): Promise<ExecResult> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, {
      shell: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
        success: code === 0
      });
    });

    proc.on('error', (error) => {
      resolve({
        stdout,
        stderr: error.message,
        exitCode: 1,
        success: false
      });
    });
  });
}

export function runWithTimeout(cmd: string, timeoutSecs: number): ExecResult {
  return exec(cmd, timeoutSecs);
}

export function commandExists(cmd: string): boolean {
  return !!execQuiet(`which ${cmd}`);
}
