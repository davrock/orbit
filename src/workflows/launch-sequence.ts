// 🛸 ORBIT Launch Sequence
// Self-improving autonomous loop

import {
  type GroundControlState,
  loadGroundControl,
  saveGroundControl,
  recordSuccess,
  recordFailure,
  resetGroundControl,
  getNextCargoItem,
  markCargoDelivered,
  appendLog,
  getRandomQuote
} from '../core/index.js';
import { generateSelfImprovementTask } from '../core/autonomous-prompts.js';
import {
  printLaunchBanner,
  printSection,
  printSuccess,
  printError,
  printWarning,
  printMissionComplete,
  colors
} from '../utils/output.js';
import { getCurrentCommit, getRecentCommitMessages } from '../utils/git.js';
import { execQuiet, commandExists } from '../utils/exec.js';
import { runMission } from './mission-control.js';

export interface LaunchOptions {
  once?: boolean;
  turbo?: boolean;
  maxIterations?: number;
  loopDelay?: number;
}

const MAX_FAILS = 3;
const MAX_NO_PROGRESS = 5;

interface WorkItem {
  source: 'cargo' | 'github' | 'plan' | 'self';
  task: string;
  issueNumber?: number;
}

export class LaunchSequence {
  private options: LaunchOptions;
  private running = true;
  private lastWorkSource: WorkItem['source'] = 'self';

  constructor(options: LaunchOptions = {}) {
    this.options = {
      once: options.once || false,
      turbo: options.turbo || false,
      maxIterations: options.maxIterations || 0,
      loopDelay: options.turbo ? 30 : (options.loopDelay || 120)
    };
  }

  async launch(): Promise<void> {
    printLaunchBanner();

    // Reset failure counters from any previous run (preserve cumulative stats)
    const gc = loadGroundControl();
    gc.fails = 0;
    gc.noProgress = 0;
    saveGroundControl(gc);
    
    console.log(`Mode: ${colors.secondary(this.options.once ? 'Single' : 'Continuous')}`);
    if (this.options.maxIterations! > 0) {
      console.log(`Max: ${colors.secondary(String(this.options.maxIterations))}`);
    }
    console.log(`Delay: ${colors.secondary(`${this.options.loopDelay}s`)}`);
    console.log(`Ground Control: ${colors.success('ACTIVE')}`);
    console.log('');
    console.log(colors.warning('Ctrl+C to abort'));

    appendLog('Launch sequence initiated');

    let i = 0;
    while (this.running) {
      i++;
      
      if (this.options.maxIterations! > 0 && i > this.options.maxIterations!) {
        break;
      }

      const result = await this.runCycle(i);
      
      if (result === 'abort') break;
      if (this.options.once) break;

      // Use shorter delay for self-improvement (no external API rate limits)
      const delay = this.lastWorkSource === 'self'
        ? Math.min(this.options.loopDelay!, 30)
        : this.options.loopDelay!;
      console.log(colors.secondary(`💫 Next in ${delay}s...`));
      await this.sleep(delay * 1000);
    }

    const state = loadGroundControl();
    printMissionComplete(state.cycles, state.successes);
    appendLog(`Complete: ${state.cycles} cycles, ${state.successes} improvements`);
  }

  private async runCycle(cycleNum: number): Promise<'success' | 'fail' | 'abort'> {
    printSection(`🚀 Launch Cycle #${cycleNum}`);

    // Check ground control failsafes
    const gcCheck = this.checkGroundControl();
    if (gcCheck === 'abort') return 'abort';
    if (gcCheck === 'cooldown') {
      await this.sleep(60000);
    }

    // Get next work item
    const work = await this.getWork();
    this.printWorkItem(work);

    // Execute the work
    const beforeCommit = getCurrentCommit();
    
    try {
      const result = await runMission({
        mission: work.source === 'self' ? 'evolve' : 'warp',
        task: work.task,
        modelTier: 'auto'
      });

      const afterCommit = getCurrentCommit();
      
      if (beforeCommit !== afterCommit) {
        const msg = execQuiet('git log -1 --pretty=%B')?.split('\n')[0] || 'Unknown';
        printSuccess(`Success: ${msg}`);
        
        if (work.source === 'cargo') {
          markCargoDelivered(work.task);
        }
        if (work.source === 'github' && work.issueNumber) {
          this.closeGitHubIssue(work.issueNumber);
        }
        
        recordSuccess(work.source, msg);
        appendLog(`Cycle ${cycleNum} [${work.source}]: ${msg}`);
        return 'success';
      } else {
        printWarning('No changes');
        recordFailure('no_change');
        return 'fail';
      }
    } catch (error) {
      printError('Failed');
      recordFailure(String(error));
      return 'fail';
    }
  }

  private async getWork(): Promise<WorkItem> {
    // 1. Check cargo manifest
    const cargoItem = getNextCargoItem();
    if (cargoItem) {
      this.lastWorkSource = 'cargo';
      return { source: 'cargo', task: cargoItem.task };
    }

    // 2. Check GitHub issues
    const githubIssue = await this.getGitHubIssue();
    if (githubIssue) {
      this.lastWorkSource = 'github';
      return githubIssue;
    }

    // 3. Self-improvement with recent commit context
    this.lastWorkSource = 'self';
    const recentCommits = getRecentCommitMessages(10);
    return {
      source: 'self',
      task: generateSelfImprovementTask(recentCommits)
    };
  }

  private async getGitHubIssue(): Promise<WorkItem | null> {
    if (!commandExists('gh')) return null;

    const result = execQuiet('gh issue list --state open --limit 1 --json number,title');
    if (!result) return null;

    try {
      const issues = JSON.parse(result);
      if (issues.length > 0) {
        return {
          source: 'github',
          task: `Fix issue #${issues[0].number}: ${issues[0].title}`,
          issueNumber: issues[0].number
        };
      }
    } catch {
      return null;
    }

    return null;
  }

  private closeGitHubIssue(number: number): void {
    // Validate that number is actually a positive integer to prevent command injection
    if (!Number.isInteger(number) || number <= 0) {
      return;
    }
    
    try {
      execQuiet(`gh issue close ${number} --comment "Fixed by ORBIT"`);
    } catch {
      // Ignore errors
    }
  }

  private printWorkItem(work: WorkItem): void {
    switch (work.source) {
      case 'cargo':
        console.log(colors.secondary(`📦 Cargo: ${work.task}`));
        break;
      case 'github':
        console.log(colors.secondary(`🐙 GitHub #${work.issueNumber}: ${work.task}`));
        break;
      case 'self':
        console.log(colors.secondary('🔍 Self-Improvement'));
        break;
    }
  }

  private checkGroundControl(): 'ok' | 'cooldown' | 'abort' {
    const state = loadGroundControl();

    if (state.fails >= MAX_FAILS) {
      console.log(colors.error(`🚨 GROUND CONTROL: ${state.fails} failures!`));
      console.log(colors.warning(`   "${getRandomQuote()}"`));
      console.log(colors.warning('   Cooling down 60s...'));
      
      // Reset fail counter
      state.fails = 0;
      saveGroundControl(state);
      
      return 'cooldown';
    }

    if (state.noProgress >= MAX_NO_PROGRESS) {
      console.log(colors.error(`🚨 GROUND CONTROL: No progress for ${state.noProgress} cycles!`));
      console.log(colors.warning(`   "${getRandomQuote()}" - Aborting`));
      return 'abort';
    }

    return 'ok';
  }

  stop(): void {
    this.running = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Status display
export function showStatus(): void {
  const state = loadGroundControl();
  console.log(colors.secondary('🚀 Status'));
  console.log(JSON.stringify(state, null, 2));
}

// Reset state
export function reset(): void {
  resetGroundControl();
  console.log('Reset.');
}

// CLI entry point
export async function launchSequence(options: LaunchOptions = {}): Promise<void> {
  const launcher = new LaunchSequence(options);
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log(colors.warning('\n🛑 Aborted'));
    launcher.stop();
    process.exit(0);
  });

  await launcher.launch();
}
