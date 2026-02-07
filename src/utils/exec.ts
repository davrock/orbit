// 🛸 ORBIT Shell Execution Utilities

import { spawn, execSync, SpawnOptions } from 'child_process';
import {
  detectRateLimit,
  createRateLimitHandler,
  sleepWithCountdown,
  formatDelay,
  type RateLimitConfig
} from './rate-limit.js';
import { colors } from './output.js';
import { escapeShellArg } from './shell-escape.js';

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

export function execQuiet(cmd: string): string | undefined {
  if (!cmd || cmd.trim().length === 0) {
    return undefined;
  }
  
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
  if (!cmd || cmd.trim().length === 0) {
    return {
      stdout: '',
      stderr: 'Error: Command cannot be empty',
      exitCode: 1,
      success: false
    };
  }

  if (timeout <= 0) {
    return {
      stdout: '',
      stderr: 'Error: Timeout must be greater than 0',
      exitCode: 1,
      success: false
    };
  }

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
  if (!cmd || cmd.trim().length === 0) {
    return {
      stdout: '',
      stderr: 'Error: Command cannot be empty',
      exitCode: 1,
      success: false
    };
  }

  return new Promise((resolve) => {
    const proc = spawn(cmd, args, {
      shell: true,
      ...options
    });

    let stdout = '';
    let stderr = '';
    let resolved = false;

    const resolveOnce = (result: ExecResult) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolveOnce({
        stdout,
        stderr,
        exitCode: code || 0,
        success: code === 0
      });
    });

    proc.on('error', (error) => {
      resolveOnce({
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
  if (!cmd || cmd.trim().length === 0) {
    return false;
  }
  return !!execQuiet(`which ${escapeShellArg(cmd)}`);
}

export interface CopilotResult {
  success: boolean;
  output: string;
  exitCode: number;
  rateLimited?: boolean;
  retryCount?: number;
}

export interface CopilotOptions {
  timeout?: number;
  allowAllPaths?: boolean;
  additionalArgs?: string[];
  rateLimitConfig?: Partial<RateLimitConfig>;
  onRateLimit?: (attempt: number, delayMs: number) => void;
}

/**
 * Execute a prompt using the Copilot CLI in non-interactive mode.
 * Uses --allow-all-tools for autonomous execution.
 * Automatically handles rate limits with exponential backoff.
 */
export async function execCopilot(
  prompt: string,
  options: CopilotOptions = {}
): Promise<CopilotResult> {
  const {
    timeout = 600,
    allowAllPaths = false,
    additionalArgs = [],
    rateLimitConfig,
    onRateLimit
  } = options;

  if (!commandExists('copilot')) {
    return {
      success: false,
      output: 'Copilot CLI not found. Install it from: https://github.com/github/copilot-cli',
      exitCode: 1
    };
  }

  const rateLimitHandler = createRateLimitHandler(rateLimitConfig);
  let attempt = 0;
  let lastResult: CopilotResult | null = null;

  while (rateLimitHandler.shouldRetry(attempt)) {
    const result = await executeCopilotOnce(prompt, timeout, allowAllPaths, additionalArgs);
    lastResult = result;

    // Check for rate limiting
    const rateLimitCheck = detectRateLimit(result.output);
    
    if (!rateLimitCheck.isRateLimited) {
      return {
        ...result,
        retryCount: attempt
      };
    }

    // Rate limited - calculate backoff and retry
    attempt++;
    
    if (!rateLimitHandler.shouldRetry(attempt)) {
      console.log(colors.error(`\n✗ Rate limit exceeded after ${attempt} retries`));
      return {
        ...result,
        rateLimited: true,
        retryCount: attempt
      };
    }

    const delayMs = rateLimitHandler.getDelay(attempt, rateLimitCheck.retryAfterMs);
    
    console.log('');
    console.log(colors.warning(`⚠ Rate limit detected (attempt ${attempt}/${rateLimitHandler.config.maxRetries})`));
    if (rateLimitCheck.message) {
      console.log(colors.dim(`  ${rateLimitCheck.message}`));
    }
    
    onRateLimit?.(attempt, delayMs);
    
    await sleepWithCountdown(delayMs, `Retry ${attempt}/${rateLimitHandler.config.maxRetries}`);
  }

  // Should not reach here, but handle edge case
  return lastResult || {
    success: false,
    output: 'Max retries exceeded',
    exitCode: 1,
    rateLimited: true,
    retryCount: attempt
  };
}

/**
 * Single execution of Copilot CLI (internal helper).
 */
async function executeCopilotOnce(
  prompt: string,
  timeout: number,
  allowAllPaths: boolean,
  additionalArgs: string[]
): Promise<CopilotResult> {
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
    let resolved = false;

    const resolveOnce = (result: CopilotResult) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        resolve(result);
      }
    };

    proc.stdout?.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      process.stdout.write(text);
    });

    proc.stderr?.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(text);
    });

    const timeoutId = setTimeout(() => {
      proc.kill('SIGTERM');
      resolveOnce({
        success: false,
        output: stdout + '\n[TIMEOUT] Copilot CLI exceeded time limit',
        exitCode: 124
      });
    }, timeout * 1000);

    proc.on('close', (code) => {
      resolveOnce({
        success: code === 0,
        output: stdout + (stderr ? `\n${stderr}` : ''),
        exitCode: code || 0
      });
    });

    proc.on('error', (error) => {
      resolveOnce({
        success: false,
        output: `Failed to start Copilot CLI: ${error.message}`,
        exitCode: 1
      });
    });
  });
}
