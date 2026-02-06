// 🛸 ORBIT Mission Control
// Main orchestrator for executing missions

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  type MissionType,
  type Phase,
  type CrewMember,
  type MissionConfig,
  type MissionResult,
  type PhaseResult,
  type ProjectConfig,
  getPhasesForMission,
  getCrewForPhase,
  selectModelTier,
  getModelIcon,
  trackFuel,
  appendLog,
  detectProjectConfig,
  extractSkill
} from '../core/index.js';
import { getAgentSystemPrompt } from '../agents/index.js';
import {
  printBanner,
  printPhase,
  printMissionComplete,
  printSuccess,
  printError,
  printWarning,
  printKeyValue,
  colors
} from '../utils/output.js';
import { getCurrentCommit, hasChanges, getChangedFiles } from '../utils/git.js';
import { exec, execCopilot, commandExists } from '../utils/exec.js';
import { saveCheckpoint, clearCheckpoint, loadCheckpoint, shouldResume, getResumePhases } from '../core/checkpoint.js';

const STATE_DIR = '.copilot/state';

export interface MissionControlOptions {
  mission: MissionType;
  task: string;
  dryRun?: boolean;
  interactive?: boolean;
  customCrew?: CrewMember;
  modelTier?: 'auto' | 'premium' | 'standard' | 'fast';
  resumeFrom?: Phase[];  // Phases to run when resuming
}

export class MissionControl {
  private config: ProjectConfig;
  private missionConfig: MissionConfig;
  private startTime: Date;
  private phaseResults: PhaseResult[] = [];
  private phasesToRun: Phase[];

  constructor(options: MissionControlOptions) {
    this.config = detectProjectConfig();
    this.startTime = new Date();

    const phases = getPhasesForMission(options.mission);
    if (phases.length === 0) {
      throw new Error(`Unknown mission type: ${options.mission}`);
    }

    this.missionConfig = {
      type: options.mission,
      task: options.task,
      phases,
      modelTier: options.modelTier === 'auto' ? 'standard' : (options.modelTier || 'standard'),
      dryRun: options.dryRun || false,
      interactive: options.interactive || false,
      customCrew: options.customCrew
    };

    // Use resumeFrom phases if provided, otherwise run all phases
    this.phasesToRun = options.resumeFrom || phases;
  }

  async execute(): Promise<MissionResult> {
    this.ensureStateDir();
    printBanner();

    const isResuming = this.phasesToRun.length < this.missionConfig.phases.length;
    const completedPhases = this.missionConfig.phases.filter(p => !this.phasesToRun.includes(p));

    console.log(`Task: ${colors.secondary(this.missionConfig.task)}`);
    console.log(`Mission: ${colors.secondary(this.missionConfig.type)}`);
    if (isResuming) {
      console.log(`Resuming: ${colors.warning(this.phasesToRun.join(' → '))}`);
      console.log(`Completed: ${colors.success(completedPhases.join(', '))}`);
    } else {
      console.log(`Phases: ${colors.secondary(this.missionConfig.phases.join(' → '))}`);
    }
    
    if (this.missionConfig.dryRun) {
      console.log(`Mode: ${colors.warning('DRY RUN')}`);
    }
    console.log('');

    this.initFlightLog();
    appendLog(`${isResuming ? 'Resuming' : 'Starting'} mission: ${this.missionConfig.task} (${this.missionConfig.type})`);

    const beforeCommit = getCurrentCommit();

    for (const phase of this.phasesToRun) {
      // Save checkpoint before each phase
      saveCheckpoint(
        this.missionConfig.type,
        this.missionConfig.task,
        phase,
        completedPhases.concat(this.phaseResults.map(r => r.phase)),
        this.missionConfig.modelTier,
        this.missionConfig.dryRun
      );

      const result = await this.runPhase(phase);
      this.phaseResults.push(result);

      if (!result.success) {
        printError(`Mission failed at phase: ${phase}`);
        printWarning('Run "orbit resume" to retry from this phase');
        return this.buildResult(false, beforeCommit);
      }
    }

    // Clear checkpoint on successful completion
    clearCheckpoint();

    // Extract skill from successful mission
    const allOutput = this.phaseResults.map(r => r.output || '').join('\n');
    extractSkill(
      this.missionConfig.task,
      'success',
      this.missionConfig.type,
      allOutput
    );

    const duration = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    printMissionComplete(this.phaseResults.length, duration);
    
    appendLog(`Mission complete: ${this.phaseResults.length} phases in ${duration}s`);

    return this.buildResult(true, beforeCommit);
  }

  private async runPhase(phase: Phase): Promise<PhaseResult> {
    const crew = getCrewForPhase(phase, this.missionConfig.customCrew);
    const tier = selectModelTier(this.missionConfig.task, phase, crew);
    const icon = getModelIcon(tier);
    const phaseStart = Date.now();

    printPhase(phase, crew, tier, icon);

    if (this.missionConfig.dryRun) {
      console.log(colors.warning(`[DRY RUN] Would execute phase: ${phase}`));
      return {
        phase,
        crew,
        modelTier: tier,
        success: true,
        duration: 0
      };
    }

    if (this.missionConfig.interactive) {
      const proceed = await this.confirmPhase(phase);
      if (!proceed) {
        return {
          phase,
          crew,
          modelTier: tier,
          success: true,
          duration: 0,
          output: 'Skipped by user'
        };
      }
    }

    trackFuel(tier);
    
    // Check if Copilot CLI is available
    if (!commandExists('copilot')) {
      printError('Copilot CLI not found. Install from: https://github.com/github/copilot-cli');
      return {
        phase,
        crew,
        modelTier: tier,
        success: false,
        duration: 0,
        output: 'Copilot CLI not installed'
      };
    }
    
    // Generate the prompt for this phase
    const prompt = this.generatePrompt(phase, crew);
    
    // Write prompt to file for reference
    this.writePromptFile(phase, prompt);
    
    console.log(colors.secondary(`📋 Prompt saved to: ${STATE_DIR}/pending_prompt.md`));
    console.log(colors.warning('🚀 Executing with Copilot CLI...'));
    console.log('');

    // Execute with Copilot CLI
    const result = await execCopilot(prompt, {
      timeout: 600, // 10 minute timeout per phase
      allowAllPaths: true
    });

    const duration = Math.floor((Date.now() - phaseStart) / 1000);
    
    if (result.success) {
      printSuccess(`${phase} complete (${duration}s)`);
      appendLog(`Phase ${phase} completed (${crew}, ${tier}, ${duration}s)`);
    } else {
      printError(`${phase} failed (exit code: ${result.exitCode})`);
      appendLog(`Phase ${phase} failed: ${result.output.slice(0, 200)}`);
    }

    return {
      phase,
      crew,
      modelTier: tier,
      success: result.success,
      duration,
      output: result.output
    };
  }

  private generatePrompt(phase: Phase, crew: CrewMember): string {
    const crewPrompt = getAgentSystemPrompt(crew);
    
    return `${crewPrompt}

TASK: ${this.missionConfig.task}
PHASE: ${phase}
PROJECT: ${this.config.name}

Read .copilot/state/flight_log.md first, update when done.
Reference .copilot/best-practices.yaml for standards.
Complete the ${phase} phase then say '${phase.toUpperCase()} COMPLETE'`;
  }

  private writePromptFile(phase: Phase, prompt: string): void {
    const crew = getCrewForPhase(phase, this.missionConfig.customCrew);
    const content = `# 🚀 ORBIT Mission - Phase: ${phase.toUpperCase()}

## Crew Member
${crew}

## Task
${this.missionConfig.task}

## Instructions
${prompt}

---
*Execute this with Copilot CLI or read the prompt above to understand what needs to be done.*
`;

    writeFileSync(join(STATE_DIR, 'pending_prompt.md'), content);
  }

  private initFlightLog(): void {
    const logPath = join(STATE_DIR, 'flight_log.md');
    const content = `# 🛸 Flight Log
Task: ${this.missionConfig.task}
Mission: ${this.missionConfig.type}
Launched: ${this.startTime.toISOString()}

## Status
Phase: launching

## Mission Notes
`;
    writeFileSync(logPath, content);
  }

  private ensureStateDir(): void {
    if (!existsSync(STATE_DIR)) {
      mkdirSync(STATE_DIR, { recursive: true });
    }
  }

  private async confirmPhase(phase: Phase): Promise<boolean> {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${colors.warning(`Execute phase "${phase}"? [Y/n] `)}`, (answer) => {
        rl.close();
        const normalized = answer.trim().toLowerCase();
        resolve(normalized === '' || normalized === 'y' || normalized === 'yes');
      });
    });
  }

  private buildResult(success: boolean, beforeCommit?: string): MissionResult {
    const afterCommit = getCurrentCommit();
    const filesChanged = getChangedFiles().length;
    const duration = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    return {
      mission: this.missionConfig.type,
      task: this.missionConfig.task,
      phases: this.phaseResults,
      totalDuration: duration,
      success,
      filesChanged,
      commitHash: afterCommit !== beforeCommit ? afterCommit : undefined
    };
  }
}

// CLI entry point
export async function runMission(options: MissionControlOptions): Promise<MissionResult> {
  const controller = new MissionControl(options);
  return controller.execute();
}

// Resume from checkpoint
export async function resumeMission(): Promise<MissionResult | null> {
  const checkpoint = loadCheckpoint();
  
  if (!checkpoint) {
    printWarning('No checkpoint found. Nothing to resume.');
    return null;
  }

  if (!shouldResume(checkpoint)) {
    printWarning('Checkpoint is too old (>1 hour). Starting fresh is recommended.');
    printWarning('Clear with: orbit reset');
    return null;
  }

  const allPhases = getPhasesForMission(checkpoint.mission);
  const remainingPhases = getResumePhases(allPhases, checkpoint);

  if (remainingPhases.length === 0) {
    printSuccess('All phases already completed!');
    clearCheckpoint();
    return null;
  }

  console.log(colors.secondary('📍 Resuming from checkpoint...'));
  console.log('');

  const controller = new MissionControl({
    mission: checkpoint.mission,
    task: checkpoint.task,
    dryRun: checkpoint.dryRun,
    modelTier: checkpoint.modelTier,
    resumeFrom: remainingPhases
  });

  return controller.execute();
}
