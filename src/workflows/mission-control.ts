// 🛸 ORBIT Mission Control
// Main orchestrator for executing missions

import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  type MissionType,
  type Phase,
  type CrewMember,
  type MissionConfig,
  type MissionResult,
  type PhaseResult,
  type ProjectConfig,
  type ModelTier,
  getPhasesForMission,
  getCrewForPhase,
  selectModelTier,
  getModelIcon,
  trackFuel,
  appendLog,
  detectProjectConfig,
  extractSkill,
  metricsStart,
  metricsPhaseStart,
  metricsPhaseEnd,
  metricsEnd,
  metricsFilesChanged,
  initHUD,
  setPhase,
  completePhase,
  endHUD,
  hasProviders,
  getProviderSummary,
  crossValidate,
  checkDesignConsistency
} from '../core/index.js';
import { createPersistenceManager, type PersistenceManager } from '../core/persistence.js';
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
import { checkCriticalFilesBeforeMission, checkCriticalFilesAfterMission, getCriticalFilesWarning } from '../utils/safeguards.js';

const STATE_DIR = '.copilot/state';

export interface MissionControlOptions {
  mission: MissionType;
  task: string;
  dryRun?: boolean;
  interactive?: boolean;
  customCrew?: CrewMember;
  modelTier?: 'auto' | 'premium' | 'standard' | 'fast' | 'ecomode';
  resumeFrom?: Phase[];  // Phases to run when resuming
  enableCrossValidation?: boolean;  // Enable AI provider cross-validation
  enableConsistencyCheck?: boolean; // Enable design consistency checks
}

export class MissionControl {
  private config: ProjectConfig;
  private missionConfig: MissionConfig;
  private startTime: Date;
  private phaseResults: PhaseResult[] = [];
  private phasesToRun: Phase[];
  private persistenceManager?: PersistenceManager;
  private enableCrossValidation: boolean;
  private enableConsistencyCheck: boolean;

  constructor(options: MissionControlOptions) {
    this.config = detectProjectConfig();
    this.startTime = new Date();

    const phases = getPhasesForMission(options.mission);
    if (phases.length === 0) {
      throw new Error(`Unknown mission type: ${options.mission}`);
    }

    const isPersistentMode = options.mission === 'ralph';

    this.missionConfig = {
      type: options.mission,
      task: options.task,
      phases,
      modelTier: options.modelTier === 'auto' ? 'standard' : (options.modelTier || 'standard'),
      dryRun: options.dryRun || false,
      interactive: options.interactive || false,
      customCrew: options.customCrew,
      persistenceMode: isPersistentMode
    };

    // Use resumeFrom phases if provided, otherwise run all phases
    this.phasesToRun = options.resumeFrom || phases;

    // Initialize persistence manager for ralph mode
    if (isPersistentMode) {
      this.persistenceManager = createPersistenceManager();
    }

    // AI provider integration settings
    this.enableCrossValidation = options.enableCrossValidation || false;
    this.enableConsistencyCheck = options.enableConsistencyCheck || false;
  }

  async execute(): Promise<MissionResult> {
    this.ensureStateDir();
    
    // Check critical files before starting
    if (!checkCriticalFilesBeforeMission()) {
      throw new Error('Critical configuration files missing. Cannot start mission.');
    }
    
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

    // Display AI provider integration status
    if (this.enableCrossValidation || this.enableConsistencyCheck) {
      const providerInfo = hasProviders() ? getProviderSummary() : 'No external AI providers configured';
      console.log(`AI Validation: ${colors.secondary(providerInfo)}`);
      if (this.enableCrossValidation) {
        console.log(`Cross-validation: ${colors.success('Enabled')}`);
      }
      if (this.enableConsistencyCheck) {
        console.log(`Consistency checks: ${colors.success('Enabled')}`);
      }
    }
    
    console.log('');

    this.initFlightLog();
    appendLog(`${isResuming ? 'Resuming' : 'Starting'} mission: ${this.missionConfig.task} (${this.missionConfig.type})`);

    // Initialize metrics and HUD
    metricsStart(this.missionConfig.task, this.missionConfig.type);
    initHUD(this.missionConfig.task, this.missionConfig.phases);

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

      let result: PhaseResult;
      
      if (this.persistenceManager) {
        // Ralph mode: retry with escalation until verified complete
        result = await this.runPhaseWithPersistence(phase);
      } else {
        // Normal mode: single attempt
        result = await this.runPhase(phase);
      }
      
      // Perform AI provider validations if enabled and phase succeeded
      if (result.success && (this.enableCrossValidation || this.enableConsistencyCheck) && hasProviders()) {
        await this.performAIValidation(phase, result);
      }

      this.phaseResults.push(result);

      // Update HUD with completed phase
      if (result.success) {
        completePhase(phase);
      }

      if (!result.success) {
        // End metrics and HUD with failure
        metricsFilesChanged(getChangedFiles().length);
        metricsEnd(false);
        endHUD(false);

        if (this.persistenceManager) {
          printError(`Mission failed at phase: ${phase} after ${this.persistenceManager['state'].totalAttempts} attempts`);
        } else {
          printError(`Mission failed at phase: ${phase}`);
          printWarning('Run "orbit resume" to retry from this phase');
        }
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

    // End metrics and HUD with success
    metricsFilesChanged(getChangedFiles().length);
    metricsEnd(true);
    endHUD(true);

    const duration = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    printMissionComplete(this.phaseResults.length, duration);
    
    appendLog(`Mission complete: ${this.phaseResults.length} phases in ${duration}s`);
    
    // Check if critical files were deleted during mission
    checkCriticalFilesAfterMission();

    return this.buildResult(true, beforeCommit);
  }

  private async runPhaseWithPersistence(phase: Phase): Promise<PhaseResult> {
    if (!this.persistenceManager) {
      return this.runPhase(phase);
    }

    this.persistenceManager.reset();
    let lastResult: PhaseResult | undefined;

    console.log(colors.warning('🔄 Persistence mode enabled - will retry until verified complete'));
    console.log('');

    while (this.persistenceManager.shouldRetry()) {
      const state = this.persistenceManager['state'];
      
      if (state.attempt > 0) {
        console.log('');
        console.log(colors.warning(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
        console.log(this.persistenceManager.getStatus());
        console.log(colors.warning(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
        console.log('');
      }

      // Get potentially modified crew and tier
      let crew = getCrewForPhase(phase, this.missionConfig.customCrew);
      let tier = selectModelTier(this.missionConfig.task, phase, crew);

      if (state.attempt > 0) {
        if (this.persistenceManager.shouldChangeCrew()) {
          crew = this.persistenceManager.getAlternativeCrew(phase, crew);
          console.log(colors.warning(`🔄 Switching to ${crew} for different perspective`));
        }

        tier = this.persistenceManager.getEscalatedTier(tier);
        if (tier !== selectModelTier(this.missionConfig.task, phase, crew)) {
          console.log(colors.warning(`🚀 Escalating to ${tier} tier for better reasoning`));
        }
      }

      // Run the phase with persistence-aware prompt
      const result = await this.runPhase(phase, crew, tier, lastResult);
      
      // Verify completion
      const verification = await this.persistenceManager.verifyPhaseCompletion(phase, result);
      
      if (verification.verified) {
        console.log(colors.success(`✓ Phase ${phase} verified complete!`));
        this.persistenceManager.recordAttempt(true);
        return result;
      }

      // Not verified, record failure and retry
      console.log(colors.error(`✗ Verification failed: ${verification.reason}`));
      this.persistenceManager.recordAttempt(false, verification.reason);
      lastResult = result;

      if (!this.persistenceManager.shouldRetry()) {
        console.log(colors.error(`Maximum retry attempts (${this.persistenceManager['config'].maxAttempts}) reached`));
        return {
          ...result,
          success: false,
          error: `Failed after ${this.persistenceManager['state'].totalAttempts} attempts`
        };
      }

      // Brief pause before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return lastResult || {
      phase,
      crew: getCrewForPhase(phase),
      modelTier: 'standard',
      success: false,
      duration: 0,
      error: 'Persistence retry loop exited unexpectedly'
    };
  }

  private async runPhase(phase: Phase, overrideCrew?: CrewMember, overrideTier?: ModelTier, previousResult?: PhaseResult): Promise<PhaseResult> {
    const crew = overrideCrew || getCrewForPhase(phase, this.missionConfig.customCrew);
    const tier = overrideTier || selectModelTier(this.missionConfig.task, phase, crew);
    const icon = getModelIcon(tier);
    const phaseStart = Date.now();

    printPhase(phase, crew, tier, icon);

    // Update HUD with current phase
    setPhase(phase, crew, tier);

    // Start metrics for this phase
    metricsPhaseStart(phase, tier);

    if (this.missionConfig.dryRun) {
      console.log(colors.warning(`[DRY RUN] Would execute phase: ${phase}`));
      metricsPhaseEnd(phase, 'skipped', 0);
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
        metricsPhaseEnd(phase, 'skipped', 0);
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
      metricsPhaseEnd(phase, 'failed', 0);
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
    let prompt = this.generatePrompt(phase, crew);
    
    // Enhance prompt with persistence instructions if in ralph mode
    if (this.persistenceManager && previousResult) {
      prompt = this.persistenceManager.generatePersistencePrompt(prompt, phase, crew, previousResult);
    }
    
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
    
    // Record phase metrics
    metricsPhaseEnd(phase, result.success ? 'success' : 'failed', duration);
    
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
    
    // Check if plan requirements exist
    let planSection = '';
    try {
      const planReqs = this.loadPlanRequirements();
      if (planReqs) {
        planSection = `

REQUIREMENTS SPECIFICATION (from planning interview):

Detailed Requirements:
${planReqs.detailedRequirements}

Technical Approach:
${planReqs.technicalApproach}

Acceptance Criteria:
${planReqs.acceptanceCriteria.map((c: string) => `✓ ${c}`).join('\n')}

User Interview Q&A:
${planReqs.userAnswers.map((qa: any, i: number) => `Q${i+1}: ${qa.question}\nA${i+1}: ${qa.answer}`).join('\n\n')}
`;
      }
    } catch (error) {
      // No plan requirements available, continue normally
    }
    
    return `${crewPrompt}

TASK: ${this.missionConfig.task}${planSection}
PHASE: ${phase}
PROJECT: ${this.config.name}

Read .copilot/state/flight_log.md first, update when done.
Reference .copilot/best-practices.yaml for standards.
${getCriticalFilesWarning()}
Complete the ${phase} phase then say '${phase.toUpperCase()} COMPLETE'`;
  }

  private loadPlanRequirements(): any | null {
    const specFile = join(STATE_DIR, 'plan_requirements.json');
    if (!existsSync(specFile)) {
      return null;
    }
    try {
      const content = readFileSync(specFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
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

  private async performAIValidation(phase: Phase, result: PhaseResult): Promise<void> {
    console.log('');
    console.log(colors.secondary('🤖 Running AI provider validations...'));

    try {
      // Get changed files to validate
      const changedFiles = getChangedFiles();
      if (changedFiles.length === 0) {
        console.log(colors.dim('  No files changed, skipping validation'));
        return;
      }

      // Read changes (simplified - in real scenario would diff actual content)
      const changesContext = `Phase: ${phase}\nFiles changed: ${changedFiles.join(', ')}\nTask: ${this.missionConfig.task}`;
      const codeSnippet = result.output?.slice(0, 2000) || 'No output available';

      // Cross-validation
      if (this.enableCrossValidation) {
        console.log(colors.secondary('  Running cross-validation...'));
        const validation = await crossValidate(codeSnippet, changesContext);
        
        console.log(colors.secondary(`  Agreement rate: ${(validation.agreementRate * 100).toFixed(0)}%`));
        console.log(colors.secondary(`  Consensus: ${validation.consensus ? '✓' : '✗'}`));
        console.log(colors.dim(`  ${validation.recommendation}`));
        
        appendLog(`Cross-validation: ${validation.agreementRate >= 0.7 ? 'PASS' : 'CONCERNS'} (${validation.validations.length} providers)`);
      }

      // Design consistency check
      if (this.enableConsistencyCheck && phase === 'implement') {
        console.log(colors.secondary('  Checking design consistency...'));
        const patterns = ['Follow TypeScript best practices', 'Use async/await patterns'];
        const checks = await checkDesignConsistency(codeSnippet, patterns);
        
        const inconsistent = checks.filter(c => !c.consistent);
        if (inconsistent.length > 0) {
          console.log(colors.warning(`  Found ${inconsistent.length} consistency issues`));
          inconsistent.forEach(issue => {
            console.log(colors.dim(`    - ${issue.aspect}: ${issue.details}`));
          });
        } else {
          console.log(colors.success('  Design patterns consistent ✓'));
        }
        
        appendLog(`Design consistency: ${inconsistent.length} issues found`);
      }

    } catch (error) {
      console.log(colors.warning(`  Validation error: ${error}`));
      appendLog(`AI validation error: ${error}`);
    }

    console.log('');
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
