#!/usr/bin/env node
// 🛸 ORBIT CLI
// Orchestrated Robotic Build & Integration Toolkit

import { Command } from 'commander';
import { 
  runMission,
  resumeMission,
  launchSequence,
  showStatus,
  reset,
  processCargo,
  showCargo,
  createFlightPlan,
  listFlightPlans,
  showFlightPlan,
  generateIssuesFromPlan,
  runDeploy,
  generateDashboard,
  openDashboard
} from '../workflows/index.js';
import {
  detectProjectConfig,
  loadFuelUsage,
  addCargoItem,
  getCheckpointInfo,
  getSkillStats,
  getMetricsSummary,
  printHUD
} from '../core/index.js';
import { printBanner, printKeyValue, colors } from '../utils/output.js';

const program = new Command();

program
  .name('orbit')
  .description('🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit')
  .version('1.0.0');

// Mission Control
program
  .command('launch <task>')
  .description('Full feature mission (plan → implement → test → review → commit)')
  .option('--dry-run', 'Show what would happen')
  .option('-i, --interactive', 'Confirm each phase')
  .option('--premium', 'Use premium models (3x fuel)')
  .option('--economy', 'Use fast models (0.5x fuel)')
  .option('--crew <name>', 'Override crew member')
  .action(async (task, options) => {
    await runMission({
      mission: 'launch',
      task,
      dryRun: options.dryRun,
      interactive: options.interactive,
      modelTier: options.premium ? 'premium' : options.economy ? 'fast' : 'auto',
      customCrew: options.crew
    });
  });

program
  .command('repair <task>')
  .description('Bug fix mission (debug → implement → test → commit)')
  .option('--dry-run', 'Show what would happen')
  .action(async (task, options) => {
    await runMission({ mission: 'repair', task, dryRun: options.dryRun });
  });

program
  .command('warp <task>')
  .description('Minimal mission (implement → commit)')
  .option('--dry-run', 'Show what would happen')
  .action(async (task, options) => {
    await runMission({ mission: 'warp', task, dryRun: options.dryRun });
  });

program
  .command('mayday <task>')
  .description('Emergency hotfix (debug → implement → commit)')
  .option('--dry-run', 'Show what would happen')
  .action(async (task, options) => {
    await runMission({ mission: 'mayday', task, dryRun: options.dryRun });
  });

program
  .command('preflight <task>')
  .description('TDD mission (test → implement → test → review → commit)')
  .option('--dry-run', 'Show what would happen')
  .action(async (task, options) => {
    await runMission({ mission: 'preflight', task, dryRun: options.dryRun });
  });

program
  .command('shields-up <task>')
  .description('Security-focused development')
  .option('--dry-run', 'Show what would happen')
  .action(async (task, options) => {
    await runMission({ mission: 'shields-up', task, dryRun: options.dryRun });
  });

program
  .command('dock <task>')
  .description('API development')
  .option('--dry-run', 'Show what would happen')
  .action(async (task, options) => {
    await runMission({ mission: 'dock', task, dryRun: options.dryRun });
  });

program
  .command('transmit <task>')
  .description('Documentation only')
  .option('--dry-run', 'Show what would happen')
  .action(async (task, options) => {
    await runMission({ mission: 'transmit', task, dryRun: options.dryRun });
  });

program
  .command('apollo <task>')
  .description('All phases mission')
  .option('--dry-run', 'Show what would happen')
  .action(async (task, options) => {
    await runMission({ mission: 'apollo', task, dryRun: options.dryRun });
  });

program
  .command('ralph <task>')
  .description('Persistent mode - never gives up (retry with escalation)')
  .option('--dry-run', 'Show what would happen')
  .option('--max-attempts <n>', 'Maximum retry attempts', '10')
  .action(async (task, options) => {
    await runMission({ mission: 'ralph', task, dryRun: options.dryRun });
  });

// Launch Sequence (self-improvement loop)
program
  .command('evolve')
  .description('Start self-improvement loop')
  .option('--once', 'Single cycle only')
  .option('--turbo', 'Fast mode (30s delay)')
  .option('--max <n>', 'Maximum iterations', parseInt)
  .action(async (options) => {
    await launchSequence({
      once: options.once,
      turbo: options.turbo,
      maxIterations: options.max
    });
  });

program
  .command('status')
  .description('Show ground control status')
  .action(() => showStatus());

program
  .command('reset')
  .description('Reset ground control state')
  .action(() => reset());

// Cargo Bay
program
  .command('cargo')
  .description('Show cargo manifest')
  .action(() => showCargo());

program
  .command('cargo-run')
  .description('Process all cargo items')
  .option('--dry-run', 'Show what would happen')
  .action(async (options) => {
    await processCargo({ dryRun: options.dryRun });
  });

program
  .command('cargo-add <task>')
  .description('Add item to cargo manifest')
  .option('-p, --priority <level>', 'Priority: high, medium, low', 'medium')
  .action((task, options) => {
    addCargoItem(task, options.priority);
    console.log(colors.success(`Added to cargo: ${task}`));
  });

// Flight Plan
const flightPlan = program
  .command('flight-plan')
  .description('Implementation planning');

flightPlan
  .command('new <feature>')
  .description('Create a new flight plan')
  .option('--depth <n>', 'Planning depth (1-3)', '2')
  .option('--dry-run', 'Show what would happen')
  .action(async (feature, options) => {
    await createFlightPlan(feature, {
      depth: parseInt(options.depth) as 1 | 2 | 3,
      dryRun: options.dryRun
    });
  });

flightPlan
  .command('list')
  .description('List all flight plans')
  .action(() => listFlightPlans());

flightPlan
  .command('show <planId>')
  .description('Show a flight plan')
  .action((planId) => showFlightPlan(planId));

flightPlan
  .command('issues <planId>')
  .description('Generate GitHub issues from plan')
  .option('--dry-run', 'Show what would happen')
  .action(async (planId, options) => {
    await generateIssuesFromPlan(planId, { dryRun: options.dryRun });
  });

// Deploy
program
  .command('deploy <targetDir>')
  .description('Install ORBIT into a target project')
  .option('-f, --force', 'Overwrite existing .copilot')
  .action((targetDir, options) => {
    runDeploy(targetDir, { force: options.force });
  });

// Dashboard
program
  .command('dashboard')
  .description('Open analytics dashboard')
  .option('--generate', 'Just generate, do not open')
  .action((options) => {
    if (options.generate) {
      generateDashboard();
    } else {
      openDashboard();
    }
  });

// Resume
program
  .command('resume')
  .description('Resume from last checkpoint')
  .action(async () => {
    const info = getCheckpointInfo();
    if (!info) {
      console.log(colors.warning('No checkpoint found'));
      return;
    }
    console.log(colors.secondary('📍 Checkpoint found:'));
    console.log(info);
    console.log('');
    
    await resumeMission();
  });

// Skills
program
  .command('skills')
  .description('Show learned skills')
  .action(() => {
    const stats = getSkillStats();
    console.log(colors.secondary('🧠 Skills'));
    console.log(`  Total: ${stats.total}`);
    console.log('  By category:');
    for (const [cat, count] of Object.entries(stats.byCategory)) {
      const rate = stats.successRates[cat] || 0;
      console.log(`    ${cat}: ${count} (${rate}% success)`);
    }
  });

// HUD
program
  .command('hud')
  .description('Show current mission HUD')
  .action(() => {
    printHUD();
  });

// Metrics
program
  .command('metrics')
  .description('Show performance metrics')
  .action(() => {
    const summary = getMetricsSummary();
    console.log(colors.secondary('📊 Metrics Summary'));
    console.log(`  Total runs: ${summary.totalRuns}`);
    console.log(`  Success rate: ${summary.successRate}%`);
    console.log(`  Avg duration: ${summary.avgDuration}s`);
    console.log('');
    console.log('  By mission:');
    for (const [mission, data] of Object.entries(summary.byMission)) {
      console.log(`    ${mission}: ${(data as any).count} runs (${(data as any).successRate}% success)`);
    }
  });

// Config
program
  .command('config')
  .description('Show auto-detected configuration')
  .action(() => {
    printBanner();
    console.log(colors.secondary('🔧 Auto-Detected Configuration'));
    console.log(colors.secondary('━'.repeat(64)));
    
    const config = detectProjectConfig();
    printKeyValue('Project', config.name);
    printKeyValue('Stack', config.techStack);
    printKeyValue('Branch', config.gitBranch);
    console.log('');
    printKeyValue('Type Check', config.typeCheckCmd || '(none detected)');
    printKeyValue('Test', config.testCmd || '(none detected)');
    printKeyValue('Lint', config.lintCmd || '(none detected)');
  });

// Fuel
program
  .command('fuel')
  .description('Show fuel (token) usage')
  .action(() => {
    const usage = loadFuelUsage();
    console.log(colors.secondary('⛽ Fuel Usage'));
    console.log(`  Total units: ${usage.total.toFixed(1)}`);
    console.log(`  Sessions: ${usage.sessions}`);
    console.log('  By tier:');
    console.log(`    Premium (3x): ${usage.byTier.premium} calls`);
    console.log(`    Standard (1x): ${usage.byTier.standard} calls`);
    console.log(`    Fast (0.5x): ${usage.byTier.fast} calls`);
  });

// Help
program
  .command('missions')
  .description('List all mission types')
  .action(() => {
    console.log(colors.secondary('🚀 Missions:'));
    console.log('  launch      Full feature (plan → implement → test → review → commit)');
    console.log('  repair      Bug fix (debug → implement → test → commit)');
    console.log('  warp        Minimal (implement → commit)');
    console.log('  mayday      Emergency hotfix (debug → implement → commit)');
    console.log('  preflight   TDD (test → implement → test → review → commit)');
    console.log('  shields-up  Security-focused development');
    console.log('  dock        API development');
    console.log('  transmit    Documentation only');
    console.log('  apollo      All phases');
    console.log('  ralph       Persistent mode (retry with escalation until verified)');
  });

program
  .command('crews')
  .description('List all crew members')
  .action(() => {
    console.log(colors.secondary('🧑‍🚀 Crew Members:'));
    console.log('  commander          Master architect');
    console.log('  pilot              Core implementation');
    console.log('  engineer           Debugging expert');
    console.log('  navigator          Code reviewer');
    console.log('  specialist         Testing/QA');
    console.log('  security-officer   Security analysis');
    console.log('  propulsion         Performance');
    console.log('  comms              Documentation');
    console.log('  ground-control     Automation');
    console.log('  mission-planner    Task breakdown');
    console.log('  scout              Research');
    console.log('  hal                Self-improvement');
  });

program.parse();
