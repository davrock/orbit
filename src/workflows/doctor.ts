// 🛸 ORBIT Doctor - Diagnostic Command
// Checks installation, validates configuration, and suggests fixes

import { existsSync, readFileSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { detectProjectConfig } from '../core/detect.js';
import { colors, printSection, printSuccess, printError, printWarning, printInfo } from '../utils/output.js';
import { execQuiet } from '../utils/exec.js';

interface DiagnosticCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'info';
  message: string;
  fix?: string;
}

interface DiagnosticResult {
  checks: DiagnosticCheck[];
  passed: number;
  failed: number;
  warnings: number;
}

function checkNodeVersion(): DiagnosticCheck {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  
  if (major >= 16) {
    return {
      name: 'Node.js Version',
      status: 'pass',
      message: `${version} (>= 16.0.0 required)`
    };
  }
  
  return {
    name: 'Node.js Version',
    status: 'fail',
    message: `${version} (>= 16.0.0 required)`,
    fix: 'Install Node.js 16 or higher from https://nodejs.org'
  };
}

function checkGitInstalled(): DiagnosticCheck {
  const gitVersion = execQuiet('git --version');
  
  if (gitVersion) {
    return {
      name: 'Git Installation',
      status: 'pass',
      message: gitVersion
    };
  }
  
  return {
    name: 'Git Installation',
    status: 'fail',
    message: 'Git not found',
    fix: 'Install Git from https://git-scm.com'
  };
}

function checkGitRepository(): DiagnosticCheck {
  const isRepo = execQuiet('git rev-parse --git-dir');
  
  if (isRepo) {
    const branch = execQuiet('git branch --show-current') || '(detached HEAD)';
    return {
      name: 'Git Repository',
      status: 'pass',
      message: `Initialized (branch: ${branch})`
    };
  }
  
  return {
    name: 'Git Repository',
    status: 'warn',
    message: 'Not a git repository',
    fix: 'Initialize with: git init'
  };
}

function checkCopilotDirectory(): DiagnosticCheck {
  if (existsSync('.copilot')) {
    const stat = statSync('.copilot');
    if (stat.isDirectory()) {
      const subdirs = ['state', 'tasks', 'agents'].filter(d => 
        existsSync(join('.copilot', d))
      );
      return {
        name: '.copilot Directory',
        status: 'pass',
        message: `Present (subdirs: ${subdirs.join(', ')})`
      };
    }
  }
  
  return {
    name: '.copilot Directory',
    status: 'fail',
    message: 'Not found',
    fix: 'Run: orbit deploy . --force'
  };
}

function checkBestPractices(): DiagnosticCheck {
  const path = '.copilot/best-practices.yaml';
  
  if (existsSync(path)) {
    const stat = statSync(path);
    const size = (stat.size / 1024).toFixed(1);
    return {
      name: 'Best Practices File',
      status: 'pass',
      message: `Present (${size} KB)`
    };
  }
  
  return {
    name: 'Best Practices File',
    status: 'warn',
    message: 'Not found',
    fix: 'Run: orbit deploy . --force'
  };
}

function checkFlightLog(): DiagnosticCheck {
  const path = '.copilot/state/flight_log.md';
  
  if (existsSync(path)) {
    const content = readFileSync(path, 'utf-8');
    const lines = content.split('\n').length;
    return {
      name: 'Flight Log',
      status: 'pass',
      message: `Present (${lines} lines)`
    };
  }
  
  return {
    name: 'Flight Log',
    status: 'info',
    message: 'No active mission',
    fix: 'Flight log will be created when a mission starts'
  };
}

function checkProjectConfig(): DiagnosticCheck {
  try {
    const config = detectProjectConfig();
    
    if (config.techStack === 'unknown') {
      return {
        name: 'Project Configuration',
        status: 'warn',
        message: 'Could not detect tech stack',
        fix: 'Add package.json, Cargo.toml, or other project file'
      };
    }
    
    return {
      name: 'Project Configuration',
      status: 'pass',
      message: `Detected: ${config.techStack} (${config.packageManager || 'no package manager'})`
    };
  } catch (error) {
    return {
      name: 'Project Configuration',
      status: 'fail',
      message: 'Failed to detect configuration',
      fix: 'Ensure you are in a valid project directory'
    };
  }
}

function checkTypeChecker(): DiagnosticCheck {
  const config = detectProjectConfig();
  
  if (!config.typeCheckCmd) {
    return {
      name: 'Type Checker',
      status: 'info',
      message: 'None detected for this stack'
    };
  }
  
  return {
    name: 'Type Checker',
    status: 'pass',
    message: config.typeCheckCmd
  };
}

function checkTestRunner(): DiagnosticCheck {
  const config = detectProjectConfig();
  
  if (!config.testCmd) {
    return {
      name: 'Test Runner',
      status: 'warn',
      message: 'None detected',
      fix: 'Install a test framework for better mission verification'
    };
  }
  
  return {
    name: 'Test Runner',
    status: 'pass',
    message: config.testCmd
  };
}

function checkLinter(): DiagnosticCheck {
  const config = detectProjectConfig();
  
  if (!config.lintCmd) {
    return {
      name: 'Linter',
      status: 'info',
      message: 'None detected'
    };
  }
  
  return {
    name: 'Linter',
    status: 'pass',
    message: config.lintCmd
  };
}

function checkGitHubCLI(): DiagnosticCheck {
  const ghVersion = execQuiet('gh --version');
  
  if (ghVersion) {
    const version = ghVersion.split('\n')[0];
    return {
      name: 'GitHub CLI',
      status: 'pass',
      message: version
    };
  }
  
  return {
    name: 'GitHub CLI',
    status: 'info',
    message: 'Not installed (optional)',
    fix: 'Install from https://cli.github.com for enhanced GitHub integration'
  };
}

function checkDiskSpace(): DiagnosticCheck {
  try {
    const df = execQuiet('df -h . | tail -1');
    if (!df) throw new Error('df command failed');
    
    const parts = df.split(/\s+/);
    const usedPercent = parseInt(parts[4]?.replace('%', '') || '0');
    
    if (usedPercent >= 95) {
      return {
        name: 'Disk Space',
        status: 'warn',
        message: `${usedPercent}% used`,
        fix: 'Free up disk space to avoid mission failures'
      };
    }
    
    return {
      name: 'Disk Space',
      status: 'pass',
      message: `${usedPercent}% used`
    };
  } catch {
    return {
      name: 'Disk Space',
      status: 'info',
      message: 'Could not check'
    };
  }
}

function checkWritePermissions(): DiagnosticCheck {
  try {
    const testFile = '.copilot/.orbit-write-test';
    execSync(`touch ${testFile} && rm ${testFile}`, { stdio: 'pipe' });
    
    return {
      name: 'Write Permissions',
      status: 'pass',
      message: 'Can write to .copilot directory'
    };
  } catch {
    return {
      name: 'Write Permissions',
      status: 'fail',
      message: 'Cannot write to .copilot directory',
      fix: 'Fix permissions: chmod -R u+w .copilot'
    };
  }
}

function checkStateFiles(): DiagnosticCheck {
  const stateFiles = [
    'checkpoint.json',
    'fuel-usage.json',
    'ground-control.json',
    'metrics.json'
  ];
  
  const existing = stateFiles.filter(f => existsSync(join('.copilot/state', f)));
  
  if (existing.length === 0) {
    return {
      name: 'State Files',
      status: 'info',
      message: 'No state files (fresh installation)'
    };
  }
  
  return {
    name: 'State Files',
    status: 'pass',
    message: `${existing.length}/${stateFiles.length} state files present`
  };
}

export async function runDoctor(): Promise<void> {
  console.log(colors.primary(`
╔══════════════════════════════════════════════════════════════╗
║  🩺 ORBIT Doctor - System Diagnostics                        ║
╚══════════════════════════════════════════════════════════════╝
`));

  const checks: DiagnosticCheck[] = [];

  printSection('System Requirements');
  checks.push(checkNodeVersion());
  checks.push(checkGitInstalled());
  checks.push(checkGitHubCLI());

  printSection('Project Setup');
  checks.push(checkGitRepository());
  checks.push(checkProjectConfig());
  checks.push(checkTypeChecker());
  checks.push(checkTestRunner());
  checks.push(checkLinter());

  printSection('ORBIT Installation');
  checks.push(checkCopilotDirectory());
  checks.push(checkBestPractices());
  checks.push(checkFlightLog());
  checks.push(checkStateFiles());

  printSection('Permissions & Resources');
  checks.push(checkWritePermissions());
  checks.push(checkDiskSpace());

  // Print results
  console.log('');
  printSection('Diagnostic Results');
  console.log('');

  for (const check of checks) {
    const indent = '  ';
    const name = check.name.padEnd(25);
    
    switch (check.status) {
      case 'pass':
        console.log(`${indent}${colors.success('✓')} ${name} ${colors.dim(check.message)}`);
        break;
      case 'fail':
        console.log(`${indent}${colors.error('✗')} ${name} ${colors.error(check.message)}`);
        break;
      case 'warn':
        console.log(`${indent}${colors.warning('⚠')} ${name} ${colors.warning(check.message)}`);
        break;
      case 'info':
        console.log(`${indent}${colors.info('ℹ')} ${name} ${colors.dim(check.message)}`);
        break;
    }
  }

  // Summary
  const passed = checks.filter(c => c.status === 'pass').length;
  const failed = checks.filter(c => c.status === 'fail').length;
  const warnings = checks.filter(c => c.status === 'warn').length;

  console.log('');
  console.log(colors.secondary('━'.repeat(64)));
  console.log(colors.secondary(`  Summary: ${colors.success(`${passed} passed`)} │ ${colors.error(`${failed} failed`)} │ ${colors.warning(`${warnings} warnings`)}`));
  console.log(colors.secondary('━'.repeat(64)));

  // Fixes
  const needsFix = checks.filter(c => c.fix);
  if (needsFix.length > 0) {
    console.log('');
    printSection('Suggested Fixes');
    console.log('');
    for (const check of needsFix) {
      console.log(`  ${colors.warning('⚡')} ${colors.bold(check.name)}`);
      console.log(`     ${colors.dim(check.fix)}`);
      console.log('');
    }
  }

  // Overall status
  console.log('');
  if (failed === 0 && warnings === 0) {
    console.log(colors.success('✓ All systems operational. ORBIT is ready for missions! 🚀'));
  } else if (failed === 0) {
    console.log(colors.warning('⚠ Some warnings detected. ORBIT is functional but may have issues.'));
  } else {
    console.log(colors.error('✗ Critical issues detected. Please fix errors before launching missions.'));
    process.exit(1);
  }
  console.log('');
}
