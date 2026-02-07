// 🚀 ORBIT Deploy Workflow
// Initialize ORBIT in target projects
// Creates .orbit/ for per-project state and .github/copilot-instructions.md
// Config YAML files are read directly from the npm package — no copying needed

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { colors, printBanner, printSuccess, printError, printWarning } from '../utils/output.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  
  const targetPath = resolve(targetDir);
  
  // Prevent deploying into ORBIT's own package directory
  const orbitRoot = resolve(__dirname, '..', '..');
  if (targetPath === orbitRoot) {
    printError("Cannot deploy to ORBIT's own directory");
    return false;
  }
  
  console.log(`To: ${targetPath}`);
  console.log('');
  
  // Check for existing .orbit
  const targetOrbit = join(targetPath, '.orbit');
  if (existsSync(targetOrbit) && !force) {
    printWarning('.orbit already exists. Use --force to overwrite.');
    return false;
  }
  
  // Create .orbit state directories
  console.log(colors.secondary('📁 Creating state directories...'));
  mkdirSync(join(targetPath, '.orbit/state'), { recursive: true });
  mkdirSync(join(targetPath, '.orbit/plans'), { recursive: true });
  mkdirSync(join(targetPath, '.orbit/skills'), { recursive: true });
  printSuccess('State directories created');
  
  // Initialize state files
  console.log(colors.secondary('📊 Initializing state...'));
  
  // Empty cargo manifest
  writeFileSync(join(targetPath, '.orbit/cargo_manifest.txt'), `# 🚀 ORBIT Cargo Manifest - Feature Queue
# Priority order: HIGH → MEDIUM → LOW

# HIGH PRIORITY

# MEDIUM PRIORITY

# LOW PRIORITY

# COMPLETED
`);
  
  // Initial metrics
  writeFileSync(join(targetPath, '.orbit/metrics.json'), JSON.stringify({
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
  writeFileSync(join(targetPath, '.orbit/state/ground_control.json'), JSON.stringify({
    fails: 0,
    noProgress: 0,
    types: [],
    cycles: 0,
    successes: 0
  }, null, 2));
  
  printSuccess('State initialized');

  // Deploy copilot-instructions.md
  console.log(colors.secondary('📝 Setting up Copilot instructions...'));
  deployOrbitInstructions(targetPath);

  // Add npm scripts if package.json exists and not skipped
  if (!skipNode) {
    const pkgPath = join(targetPath, 'package.json');
    if (existsSync(pkgPath)) {
      console.log(colors.secondary('📦 Adding npm scripts...'));
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        pkg.scripts = pkg.scripts || {};
        
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
  console.log('  2. npm install -g @davrock/orbit');
  console.log('  3. orbit launch "your first feature"');
  console.log('');
  console.log(colors.dim('Config files are read from the npm package — no local copies needed.'));
  console.log(colors.dim('Per-project state is stored in .orbit/'));
  console.log('');
  
  return true;
}

const ORBIT_MARKER = '<!-- ORBIT-INSTRUCTIONS-START -->';
const ORBIT_MARKER_END = '<!-- ORBIT-INSTRUCTIONS-END -->';

const ORBIT_INSTRUCTIONS = `
${ORBIT_MARKER}

## 🛸 ORBIT — Autonomous Development Toolkit

This project uses [ORBIT](https://github.com/davrock/orbit) for AI-powered autonomous development.
ORBIT orchestrates Copilot CLI to plan, implement, test, and commit changes.

### Config Files
Config files (missions.yaml, crew.yaml, models.yaml, best-practices.yaml) are read directly
from the ORBIT npm package — they are NOT stored in the project.

### Per-Project State (in \`.orbit/\`)
- \`state/ground_control.json\` — Automation state and health tracking
- \`skills/\` — Learned patterns from previous runs (DO NOT DELETE)
- \`plans/\` — Flight plans (implementation plans)
- \`metrics.json\` — Run history and performance data
- \`cargo_manifest.txt\` — Feature queue

### Protected Paths — NEVER modify or delete:
- \`.orbit/skills/\` — ORBIT's learning memory
- \`.orbit/state/\` — Runtime state
- \`.orbit/metrics.json\` — Historical data

### Common ORBIT Commands
\`\`\`bash
orbit launch "feature"    # Full mission: plan → implement → test → commit
orbit repair "bug"        # Debug mission: analyze → fix → test → commit
orbit warp "change"       # Quick change: implement → commit
orbit evolve --once       # Self-improvement cycle
orbit doctor              # System health check
orbit flight-plan new "x" # Create implementation plan
orbit status              # Show current state
\`\`\`

### When working on ORBIT tasks:
1. Never delete or overwrite files in \`.orbit/skills/\` or \`.orbit/state/\`
2. Run \`orbit doctor\` to verify system health after changes
3. Config is in the npm package — do not create local copies

${ORBIT_MARKER_END}
`;

function deployOrbitInstructions(targetPath: string): void {
  const ghDir = join(targetPath, '.github');
  const instructionsFile = join(ghDir, 'copilot-instructions.md');

  if (!existsSync(ghDir)) {
    mkdirSync(ghDir, { recursive: true });
  }

  if (existsSync(instructionsFile)) {
    const existing = readFileSync(instructionsFile, 'utf-8');

    if (existing.includes(ORBIT_MARKER)) {
      // Replace existing ORBIT section
      const updated = existing.replace(
        new RegExp(`${ORBIT_MARKER}[\\s\\S]*?${ORBIT_MARKER_END}`),
        ORBIT_INSTRUCTIONS.trim()
      );
      writeFileSync(instructionsFile, updated);
      console.log('   ✓ Updated ORBIT section in copilot-instructions.md');
    } else {
      // Append to existing file
      const appended = existing.trimEnd() + '\n\n' + ORBIT_INSTRUCTIONS;
      writeFileSync(instructionsFile, appended);
      console.log('   ✓ Appended ORBIT instructions to copilot-instructions.md');
    }
  } else {
    // Create new file
    const header = `# Copilot Instructions\n\nThis file is auto-read by GitHub Copilot before every task.\n`;
    writeFileSync(instructionsFile, header + ORBIT_INSTRUCTIONS);
    console.log('   ✓ Created .github/copilot-instructions.md');
  }
}

// CLI entry
export function runDeploy(targetDir: string, options: { force?: boolean } = {}): void {
  const success = deploy({
    targetDir,
    force: options.force
  });
  
  process.exit(success ? 0 : 1);
}
