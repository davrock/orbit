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
  openDashboard,
  runUltrawork,
  runSwarm,
  runPipeline,
  runDoctor,
  runPlanMode,
  runDesignReview,
  runDesignReviewPreCommit,
  runDesignReviewCI,
  generateDesignReport
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
import { handleMissionCommand, handleParallelCommand } from './command-handler.js';

const program = new Command();

program
  .name('orbit')
  .description('🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit')
  .version('1.0.0')
  .addHelpText('after', `
Command Groups:
  Missions:   launch, repair, warp, mayday, preflight, shields-up, dock, transmit, apollo, ralph
  Parallel:   ultrawork, swarm, pipeline
  Planning:   plan, flight-plan, design-review
  Automation: evolve, cargo, cargo-add, cargo-run
  Info:       status, config, doctor, skills, fuel, metrics, hud, missions, crews
  Setup:      deploy, dashboard, reset, resume

Examples:
  orbit launch "Add user authentication"
  orbit repair "Fix login timeout bug"
  orbit warp "Update README"
  orbit evolve --once
  orbit doctor
`)
  .action(() => {
    // Default action: show quick overview when no command given
    printBanner();

    const config = detectProjectConfig();
    console.log(colors.secondary('📍 Project: ') + config.name + ` (${config.techStack})`);
    console.log(colors.secondary('🌿 Branch:  ') + config.gitBranch);
    console.log('');

    try {
      const summary = getMetricsSummary();
      if (summary.totalRuns > 0) {
        console.log(colors.secondary('📊 Runs: ') + `${summary.totalRuns} (${summary.successRate}% success)`);
      }
    } catch { /* no metrics yet */ }

    try {
      const fuel = loadFuelUsage();
      if (fuel.sessions > 0) {
        console.log(colors.secondary('⛽ Fuel: ') + `${fuel.total.toFixed(1)} units (${fuel.sessions} sessions)`);
      }
    } catch { /* no fuel data yet */ }

    console.log('');
    console.log('Quick start:');
    console.log(`  ${colors.success('orbit launch')} "Add a feature"    Plan → implement → test → commit`);
    console.log(`  ${colors.success('orbit repair')} "Fix a bug"        Debug → implement → test → commit`);
    console.log(`  ${colors.success('orbit warp')}   "Quick change"     Implement → commit`);
    console.log(`  ${colors.success('orbit doctor')}                    Check system health`);
    console.log('');
    console.log(`Run ${colors.secondary('orbit --help')} for all commands.`);
  });

// Mission Control
program
  .command('launch <task>')
  .description('Full feature mission (plan → implement → test → review → commit)')
  .option('--dry-run', 'Show what would happen')
  .option('-i, --interactive', 'Confirm each phase')
  .option('--plan', 'Conduct planning interview before execution')
  .option('--premium', 'Use premium models (3x fuel)')
  .option('--economy', 'Use fast models (0.5x fuel)')
  .option('--ecomode', 'Budget-conscious mode (30-50% savings)')
  .option('--crew <name>', 'Override crew member')
  .option('--cross-validate', 'Enable AI provider cross-validation')
  .option('--consistency-check', 'Enable design consistency checks')
  .action((task, options) => handleMissionCommand('launch', task, options));

program
  .command('repair <task>')
  .description('Bug fix mission (debug → implement → test → commit)')
  .option('--dry-run', 'Show what would happen')
  .option('--ecomode', 'Budget-conscious mode (30-50% savings)')
  .option('--cross-validate', 'Enable AI provider cross-validation')
  .option('--consistency-check', 'Enable design consistency checks')
  .action((task, options) => handleMissionCommand('repair', task, options));

program
  .command('warp <task>')
  .description('Minimal mission (implement → commit)')
  .option('--dry-run', 'Show what would happen')
  .option('--plan', 'Conduct planning interview before execution')
  .option('--ecomode', 'Budget-conscious mode (30-50% savings)')
  .option('--cross-validate', 'Enable AI provider cross-validation')
  .option('--consistency-check', 'Enable design consistency checks')
  .action((task, options) => handleMissionCommand('warp', task, options));

program
  .command('mayday <task>')
  .description('Emergency hotfix (debug → implement → commit)')
  .option('--dry-run', 'Show what would happen')
  .action((task, options) => handleMissionCommand('mayday', task, options));

program
  .command('preflight <task>')
  .description('TDD mission (test → implement → test → review → commit)')
  .option('--dry-run', 'Show what would happen')
  .action((task, options) => handleMissionCommand('preflight', task, options));

program
  .command('shields-up <task>')
  .description('Security-focused development')
  .option('--dry-run', 'Show what would happen')
  .action((task, options) => handleMissionCommand('shields-up', task, options));

program
  .command('dock <task>')
  .description('API development')
  .option('--dry-run', 'Show what would happen')
  .action((task, options) => handleMissionCommand('dock', task, options));

program
  .command('transmit <task>')
  .description('Documentation only')
  .option('--dry-run', 'Show what would happen')
  .action((task, options) => handleMissionCommand('transmit', task, options));

program
  .command('apollo <task>')
  .description('All phases mission')
  .option('--dry-run', 'Show what would happen')
  .action((task, options) => handleMissionCommand('apollo', task, options));

program
  .command('ralph <task>')
  .description('Persistent mode - never gives up (retry with escalation)')
  .option('--dry-run', 'Show what would happen')
  .option('--max-attempts <n>', 'Maximum retry attempts', '10')
  .action((task, options) => handleMissionCommand('ralph', task, options));

program
  .command('ultrawork <task>')
  .description('Parallel execution - distributes subtasks across concurrent sessions')
  .option('--dry-run', 'Show what would happen')
  .option('--concurrency <n>', 'Max concurrent sessions', '4')
  .option('--premium', 'Use premium models (3x fuel)')
  .option('--economy', 'Use fast models (0.5x fuel)')
  .option('--ecomode', 'Budget-conscious mode (30-50% savings)')
  .action(async (task, options) => {
    await handleParallelCommand(
      task,
      options,
      runUltrawork,
      { maxConcurrency: parseInt(options.concurrency) || 4 }
    );
  });

program
  .command('swarm <task>')
  .description('Coordinated parallel execution - intelligent task distribution with dependencies')
  .option('--dry-run', 'Show what would happen')
  .option('--concurrency <n>', 'Max concurrent sessions', '4')
  .option('--premium', 'Use premium models (3x fuel)')
  .option('--economy', 'Use fast models (0.5x fuel)')
  .option('--ecomode', 'Budget-conscious mode (30-50% savings)')
  .option('--no-coordination', 'Disable inter-agent coordination')
  .action(async (task, options) => {
    await handleParallelCommand(
      task,
      options,
      runSwarm,
      { 
        maxConcurrency: parseInt(options.concurrency) || 4,
        enableCoordination: options.coordination
      }
    );
  });

program
  .command('pipeline <task>')
  .description('Sequential multi-stage processing with handoffs between stages')
  .option('--dry-run', 'Show what would happen')
  .option('--premium', 'Use premium models (3x fuel)')
  .option('--economy', 'Use fast models (0.5x fuel)')
  .option('--ecomode', 'Budget-conscious mode (30-50% savings)')
  .action(async (task, options) => {
    await handleParallelCommand(task, options, runPipeline);
  });

program
  .command('plan <task>')
  .description('Planning interview mode - gather requirements before execution')
  .option('--dry-run', 'Show what would happen')
  .action(async (task, options) => {
    await runPlanMode({
      task,
      dryRun: options.dryRun
    });
  });

// Design Review
program
  .command('design-review')
  .description('Review UI/UX changes for consistency and accessibility')
  .option('--files <files...>', 'Specific files to review')
  .option('--external-ai', 'Use external AI providers for consistency checking')
  .option('--no-ui', 'Skip UI pattern checks')
  .option('--no-ux', 'Skip UX pattern checks')
  .option('--no-accessibility', 'Skip accessibility checks')
  .option('--no-responsiveness', 'Skip responsiveness checks')
  .option('--patterns <path>', 'Path to existing patterns directory')
  .option('--pre-commit', 'Run as pre-commit hook (blocks on critical issues)')
  .option('--ci', 'Run in CI/CD mode')
  .option('--fail-on-warnings', 'Fail on warnings (CI mode only)')
  .option('--report <format>', 'Generate report (console|json|markdown)', 'console')
  .action(async (options) => {
    if (options.preCommit) {
      await runDesignReviewPreCommit();
    } else if (options.ci) {
      await runDesignReviewCI({
        useExternalAI: options.externalAi,
        failOnWarnings: options.failOnWarnings
      });
    } else if (options.files) {
      await generateDesignReport(options.files, options.report);
    } else {
      await runDesignReview({
        files: options.files,
        useExternalAI: options.externalAi,
        checkUI: options.ui !== false,
        checkUX: options.ux !== false,
        checkAccessibility: options.accessibility !== false,
        checkResponsiveness: options.responsiveness !== false,
        existingPatternsPath: options.patterns,
        exitOnFailure: false
      });
    }
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

program
  .command('init')
  .description('Initialize ORBIT in the current project')
  .option('-f, --force', 'Overwrite existing .copilot')
  .action((options) => {
    runDeploy('.', { force: options.force });
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
    console.log(`  Avg duration: ${summary.avgDuration ? `${summary.avgDuration}s` : 'N/A'}`);
    console.log('');
    console.log('  By mission:');
    for (const [mission, data] of Object.entries(summary.byMission)) {
      if (!mission || mission === 'undefined') continue;
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
    console.log('  plan        Planning interview mode (gather requirements before execution)');
    console.log('  ultrawork   Parallel execution (distributes subtasks across concurrent sessions)');
    console.log('  swarm       Coordinated parallel (intelligent task distribution with dependencies)');
    console.log('  pipeline    Sequential multi-stage processing with handoffs between stages');
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

// Doctor
program
  .command('doctor')
  .description('Run system diagnostics and check installation')
  .action(async () => {
    await runDoctor();
  });

program.parse();
