// 🚀 ORBIT Deploy Workflow
// Install ORBIT into target projects

import { existsSync, mkdirSync, copyFileSync, writeFileSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { colors, printBanner, printSuccess, printError, printWarning } from '../utils/output.js';

const ORBIT_FILES = {
  // Core configs
  '.copilot/best-practices.yaml': true,
  '.copilot/crew.yaml': true,
  '.copilot/missions.yaml': true,
  '.copilot/models.yaml': true,
  
  // State directories (create empty)
  '.copilot/state': 'dir',
  '.copilot/plans': 'dir',
  '.copilot/skills': 'dir',
  
  // Dashboard
  '.copilot/dashboard/index.html': true
};

export interface DeployOptions {
  targetDir: string;
  force?: boolean;
  skipNode?: boolean;
}

export function deploy(options: DeployOptions): boolean {
  const { targetDir, force = false, skipNode = false } = options;
  
  printBanner();
  console.log(colors.secondary('🚀 Deploying ORBIT'));
  console.log('');
  
  // Validate target
  if (!existsSync(targetDir)) {
    printError(`Directory does not exist: ${targetDir}`);
    return false;
  }
  
  const targetPath = join(process.cwd(), targetDir);
  const orbitPath = process.cwd(); // Assuming running from ORBIT dir
  
  if (targetPath === orbitPath) {
    printError("Cannot deploy to ORBIT's own directory");
    return false;
  }
  
  console.log(`From: ${orbitPath}`);
  console.log(`To:   ${targetPath}`);
  console.log('');
  
  // Check for existing .copilot
  const targetCopilot = join(targetPath, '.copilot');
  if (existsSync(targetCopilot) && !force) {
    printWarning('.copilot already exists. Use --force to overwrite.');
    return false;
  }
  
  // Create directories
  console.log(colors.secondary('📁 Creating directories...'));
  mkdirSync(join(targetPath, '.copilot/state'), { recursive: true });
  mkdirSync(join(targetPath, '.copilot/plans'), { recursive: true });
  mkdirSync(join(targetPath, '.copilot/skills'), { recursive: true });
  mkdirSync(join(targetPath, '.copilot/dashboard'), { recursive: true });
  printSuccess('Directories created');
  
  // Copy config files
  console.log(colors.secondary('📋 Copying configuration files...'));
  const configFiles = [
    'best-practices.yaml',
    'crew.yaml', 
    'missions.yaml',
    'models.yaml'
  ];
  
  for (const file of configFiles) {
    const src = join(orbitPath, 'src/config', file);
    const dest = join(targetPath, '.copilot', file);
    
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`   ✓ ${file}`);
    }
  }
  
  // Copy dashboard
  const dashboardSrc = join(orbitPath, 'src/config/dashboard/index.html');
  const dashboardDest = join(targetPath, '.copilot/dashboard/index.html');
  if (existsSync(dashboardSrc)) {
    copyFileSync(dashboardSrc, dashboardDest);
    console.log('   ✓ dashboard/index.html');
  }
  
  // Initialize state files
  console.log(colors.secondary('📊 Initializing state...'));
  
  // Empty cargo manifest
  writeFileSync(join(targetPath, '.copilot/cargo_manifest.txt'), `# 🚀 ORBIT Cargo Manifest - Feature Queue
# Priority order: HIGH → MEDIUM → LOW

# HIGH PRIORITY

# MEDIUM PRIORITY

# LOW PRIORITY

# COMPLETED
`);
  
  // Initial metrics
  writeFileSync(join(targetPath, '.copilot/metrics.json'), JSON.stringify({
    version: '1.0',
    runs: [],
    aggregates: {
      totalRuns: 0,
      successRate: 0,
      avgDuration: 0,
      byMission: {},
      byPhase: {}
    }
  }, null, 2));
  
  // Initial ground control
  writeFileSync(join(targetPath, '.copilot/state/ground_control.json'), JSON.stringify({
    fails: 0,
    noProgress: 0,
    types: [],
    cycles: 0,
    successes: 0
  }, null, 2));
  
  printSuccess('State initialized');
  
  // Add npm scripts if package.json exists and not skipped
  if (!skipNode) {
    const pkgPath = join(targetPath, 'package.json');
    if (existsSync(pkgPath)) {
      console.log(colors.secondary('📦 Adding npm scripts...'));
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        pkg.scripts = pkg.scripts || {};
        
        // Only add if not already present
        const orbitScripts = {
          'orbit': 'npx orbit',
          'orbit:launch': 'npx orbit launch',
          'orbit:evolve': 'npx orbit evolve --once',
          'orbit:status': 'npx orbit status',
          'orbit:cargo': 'npx orbit cargo'
        };
        
        let added = 0;
        for (const [name, cmd] of Object.entries(orbitScripts)) {
          if (!pkg.scripts[name]) {
            pkg.scripts[name] = cmd;
            added++;
          }
        }
        
        if (added > 0) {
          writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
          console.log(`   ✓ Added ${added} npm scripts`);
        } else {
          console.log('   (scripts already exist)');
        }
      } catch (e) {
        printWarning('Could not update package.json');
      }
    }
  }
  
  console.log('');
  printSuccess('ORBIT deployed successfully! 🛸');
  console.log('');
  console.log('Next steps:');
  console.log('  1. cd ' + targetDir);
  console.log('  2. npm install orbit-cli (or use npx)');
  console.log('  3. orbit launch "your first feature"');
  console.log('');
  
  return true;
}

// CLI entry
export function runDeploy(targetDir: string, options: { force?: boolean } = {}): void {
  const success = deploy({
    targetDir,
    force: options.force
  });
  
  process.exit(success ? 0 : 1);
}
