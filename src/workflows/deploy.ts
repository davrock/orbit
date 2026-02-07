// 🚀 ORBIT Deploy Workflow
// Install ORBIT into target projects

import { existsSync, mkdirSync, copyFileSync, writeFileSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { colors, printBanner, printSuccess, printError, printWarning } from '../utils/output.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the config directory relative to the compiled deploy.js location
// In dist: dist/workflows/deploy.js → dist/config/
// In dev:  src/workflows/deploy.ts  → src/config/
function getConfigDir(): string {
  const distConfig = join(__dirname, '..', 'config');
  if (existsSync(distConfig)) return distConfig;
  const srcConfig = join(__dirname, '..', '..', 'src', 'config');
  if (existsSync(srcConfig)) return srcConfig;
  return distConfig;
}

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
  const configDir = getConfigDir();
  
  if (targetPath === resolve('.')) {
    printError("Cannot deploy to ORBIT's own directory");
    return false;
  }
  
  console.log(`Config: ${configDir}`);
  console.log(`To:     ${targetPath}`);
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
    const src = join(configDir, file);
    const dest = join(targetPath, '.copilot', file);
    
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`   ✓ ${file}`);
    } else {
      printWarning(`Config file not found: ${file}`);
    }
  }
  
  // Copy dashboard
  const dashboardSrc = join(configDir, 'dashboard/index.html');
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
  console.log('  2. npm install -g @davrock/orbit');
  console.log('  3. orbit launch "your first feature"');
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

### Key Config Files (in \`.copilot/\`)
- \`missions.yaml\` — Defines mission workflows (launch, repair, warp, etc.)
- \`crew.yaml\` — Agent roles and system prompts (commander, pilot, engineer, etc.)
- \`models.yaml\` — LLM model tiers (premium, standard, fast)
- \`best-practices.yaml\` — Coding standards and conventions
- \`state/ground_control.json\` — Automation state and health tracking
- \`skills/\` — Learned patterns from previous runs (DO NOT DELETE)
- \`plans/\` — Flight plans (implementation plans)
- \`metrics.json\` — Run history and performance data
- \`cargo_manifest.txt\` — Feature queue

### Protected Paths — NEVER modify or delete:
- \`.copilot/skills/\` — ORBIT's learning memory
- \`.copilot/state/\` — Runtime state
- \`.copilot/metrics.json\` — Historical data
- \`.copilot/*.yaml\` — Configuration definitions

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
1. Read the relevant \`.copilot/*.yaml\` files for context before making changes
2. Never delete or overwrite files in \`.copilot/skills/\` or \`.copilot/state/\`
3. Run \`orbit doctor\` to verify system health after changes
4. Follow patterns in \`best-practices.yaml\` for code style

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
