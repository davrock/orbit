// 🛡️ ORBIT Safeguards - Protect critical configuration files

import { existsSync } from 'fs';
import { join } from 'path';
import { printError, printWarning, colors } from './output.js';
import { escapeShellArg } from './shell-escape.js';
import { getConfigPaths } from './paths.js';

function getCriticalFiles(): string[] {
  const p = getConfigPaths();
  return [
    p.bestPractices,
    p.crew,
    p.missions,
    p.models,
    p.cargo
  ];
}

function getProtectedDirectories(): string[] {
  const p = getConfigPaths();
  return [
    '.copilot',
    p.skills,
    p.state,
    p.plans
  ];
}

/**
 * Check if all critical configuration files exist
 */
export function validateCriticalFiles(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  const criticalFiles = getCriticalFiles();
  
  for (const file of criticalFiles) {
    if (!existsSync(file)) {
      missing.push(file);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Verify critical files before mission execution
 */
export function checkCriticalFilesBeforeMission(): boolean {
  const result = validateCriticalFiles();
  
  if (!result.valid) {
    printError('Critical configuration files are missing!');
    console.log('');
    console.log(colors.error('Missing files:'));
    result.missing.forEach(file => {
      console.log(colors.error(`  - ${file}`));
    });
    console.log('');
    console.log(colors.warning('These files are required for ORBIT to function properly.'));
    console.log(colors.warning('Restore them from git or run: orbit init --force'));
    console.log('');
    return false;
  }
  
  return true;
}

/**
 * Verify critical files after mission execution
 * Warns if they were deleted during execution
 */
export function checkCriticalFilesAfterMission(): void {
  const result = validateCriticalFiles();
  
  if (!result.valid) {
    console.log('');
    printWarning('⚠️  WARNING: Critical configuration files were deleted during mission execution!');
    console.log('');
    console.log(colors.warning('Missing files:'));
    result.missing.forEach(file => {
      console.log(colors.warning(`  - ${file}`));
    });
    console.log('');
    console.log(colors.warning('This may have been caused by the AI agent.'));
    console.log(colors.warning('Restoring files from git...'));
    console.log('');
    
    // Attempt to restore
    const { execSync } = require('child_process');
    try {
      for (const file of result.missing) {
        execSync(`git checkout HEAD -- ${escapeShellArg(file)}`, { stdio: 'ignore' });
      }
      console.log(colors.success('✓ Critical files restored successfully'));
      console.log('');
    } catch (error) {
      printError('Failed to restore files automatically. Please run: orbit init --force');
      console.log('');
    }
  }
}

/**
 * Add warning to prompts about critical files
 */
export function getCriticalFilesWarning(): string {
  const criticalFiles = getCriticalFiles();
  return `
⚠️  CRITICAL: Do NOT delete or modify these files:
${criticalFiles.map(f => `  - ${f}`).join('\n')}
These files are essential configuration for ORBIT.
`;
}
