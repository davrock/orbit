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

export interface CopilotResult {
  success: boolean;
  output: string;
  exitCode: number;
}

/**
 * Execute a prompt using the Copilot CLI in non-interactive mode.
 * Uses --allow-all-tools for autonomous execution.
 */
export async function execCopilot(
  prompt: string,
  options: {
    timeout?: number;
    allowAllPaths?: boolean;
    additionalArgs?: string[];
  } = {}
): Promise<CopilotResult> {
  const { timeout = 600, allowAllPaths = false, additionalArgs = [] } = options;

  if (!commandExists('copilot')) {
    return {
      success: false,
      output: 'Copilot CLI not found. Install it from: https://github.com/github/copilot-cli',
      exitCode: 1
    };
  }

  const args = [
    '-p', prompt,
    '--allow-all-tools'
  ];

  if (allowAllPaths) {
    args.push('--allow-all-paths');
  }

  args.push(...additionalArgs);

  return new Promise((resolve) => {
    const proc = spawn('copilot', args, {
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      // Stream output to console
      process.stdout.write(text);
    });

    proc.stderr?.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(text);
    });

    const timeoutId = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({
        success: false,
        output: stdout + '\n[TIMEOUT] Copilot CLI exceeded time limit',
        exitCode: 124
      });
    }, timeout * 1000);

    proc.on('close', (code) => {
      clearTimeout(timeoutId);
      resolve({
        success: code === 0,
        output: stdout + (stderr ? `\n${stderr}` : ''),
        exitCode: code || 0
      });
    });

    proc.on('error', (error) => {
      clearTimeout(timeoutId);
      resolve({
        success: false,
        output: `Failed to start Copilot CLI: ${error.message}`,
        exitCode: 1
      });
    });
  });
}
