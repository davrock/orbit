// 🛸 ORBIT Ultrawork - Parallel Execution Mode
// Distributes subtasks across multiple concurrent agent sessions

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getConfigPaths } from '../utils/paths.js';
import {
  type Phase,
  type CrewMember,
  type ProjectConfig,
  type ModelTier,
  getCrewForPhase,
  selectModelTier,
  getModelIcon,
  getModelForTier,
  trackFuel,
  appendLog,
  detectProjectConfig,
  metricsStart,
  metricsPhaseStart,
  metricsPhaseEnd,
  metricsEnd,
  metricsFilesChanged,
  initHUD,
  setPhase,
  completePhase,
  endHUD
} from '../core/index.js';
import { getAgentSystemPrompt } from '../agents/index.js';
import {
  printBanner,
  printPhase,
  printMissionComplete,
  printSuccess,
  printError,
  printWarning,
  colors
} from '../utils/output.js';
import { getCurrentCommit, getChangedFiles } from '../utils/git.js';
import { execCopilot, commandExists } from '../utils/exec.js';

const STATE_DIR = getConfigPaths().state;
const ULTRAWORK_DIR = `${STATE_DIR}/ultrawork`;

export interface Subtask {
  id: string;
  description: string;
  crew: CrewMember;
  priority: number;
  estimatedComplexity: 'low' | 'medium' | 'high';
}

export interface SubtaskResult {
  subtask: Subtask;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}

export interface UltraworkOptions {
  task: string;
  maxConcurrency?: number;
  dryRun?: boolean;
  modelTier?: 'auto' | 'premium' | 'standard' | 'fast' | 'ecomode';
}

export interface UltraworkResult {
  task: string;
  subtasks: SubtaskResult[];
  totalDuration: number;
  success: boolean;
  filesChanged: number;
  commitHash?: string;
}

/**
 * Ultrawork: Parallel execution mode for distributing work across concurrent sessions
 */
export class UltraworkExecutor {
  private config: ProjectConfig;
  private startTime: Date;
  private modelTier: ModelTier;
  private maxConcurrency: number;
  private dryRun: boolean;

  constructor(options: UltraworkOptions) {
    this.config = detectProjectConfig();
    this.startTime = new Date();
    this.modelTier = options.modelTier === 'auto' ? 'standard' : (options.modelTier || 'standard');
    this.maxConcurrency = options.maxConcurrency || 4;
    this.dryRun = options.dryRun || false;
  }

  async execute(task: string): Promise<UltraworkResult> {
    this.ensureStateDir();
    printBanner();

    console.log(`Task: ${colors.secondary(task)}`);
    console.log(`Mission: ${colors.secondary('ultrawork')}`);
    console.log(`Max Concurrency: ${colors.secondary(String(this.maxConcurrency))}`);
    
    if (this.dryRun) {
      console.log(`Mode: ${colors.warning('DRY RUN')}`);
    }
    console.log('');

    this.initFlightLog(task);
    appendLog(`Starting ultrawork mission: ${task}`);

    metricsStart(task, 'ultrawork');
    initHUD(task, ['plan', 'implement', 'review', 'commit']);

    const beforeCommit = getCurrentCommit();

    try {
      // Phase 1: Plan and break down into subtasks
      setPhase('plan', 'mission-planner', this.modelTier);
      console.log(colors.secondary('━'.repeat(64)));
      console.log(colors.primary('📋 PHASE 1: PLANNING & TASK BREAKDOWN'));
      console.log(colors.secondary('━'.repeat(64)));
      console.log('');

      const subtasks = await this.planSubtasks(task);
      
      if (!subtasks || subtasks.length === 0) {
        metricsEnd(false);
        endHUD(false);
        printError('Failed to break down task into subtasks');
        return this.buildResult(task, [], false, beforeCommit);
      }

      completePhase('plan');
      printSuccess(`Identified ${subtasks.length} subtasks`);
      console.log('');

      // Phase 2: Execute subtasks in parallel
      setPhase('implement', 'pilot', this.modelTier);
      console.log(colors.secondary('━'.repeat(64)));
      console.log(colors.primary('🚀 PHASE 2: PARALLEL EXECUTION'));
      console.log(colors.secondary('━'.repeat(64)));
      console.log('');

      this.printSubtaskSummary(subtasks);
      console.log('');

      const results = await this.executeSubtasksInParallel(subtasks);
      completePhase('implement');

      const failedSubtasks = results.filter(r => !r.success);
      if (failedSubtasks.length > 0) {
        console.log('');
        printWarning(`${failedSubtasks.length} subtask(s) failed:`);
        failedSubtasks.forEach(r => {
          console.log(`  ✗ ${r.subtask.description}`);
        });
      }

      // Phase 3: Review and integration
      setPhase('review', 'navigator', this.modelTier);
      console.log('');
      console.log(colors.secondary('━'.repeat(64)));
      console.log(colors.primary('🔍 PHASE 3: REVIEW & INTEGRATION'));
      console.log(colors.secondary('━'.repeat(64)));
      console.log('');

      const reviewResult = await this.reviewIntegration(task, results);
      completePhase('review');

      if (!reviewResult.success) {
        metricsFilesChanged(getChangedFiles().length);
        metricsEnd(false);
        endHUD(false);
        printError('Review phase failed');
        return this.buildResult(task, results, false, beforeCommit);
      }

      const duration = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
      const success = failedSubtasks.length === 0;

      metricsFilesChanged(getChangedFiles().length);
      metricsEnd(success);
      endHUD(success);

      if (success) {
        printMissionComplete(results.length, duration);
        appendLog(`Ultrawork mission complete: ${results.length} subtasks in ${duration}s`);
      } else {
        printError('Ultrawork mission failed');
      }

      return this.buildResult(task, results, success, beforeCommit);
    } catch (error) {
      metricsEnd(false);
      endHUD(false);
      printError(`Ultrawork mission crashed: ${error instanceof Error ? error.message : String(error)}`);
      appendLog(`Ultrawork mission error: ${error instanceof Error ? error.message : String(error)}`);
      return this.buildResult(task, [], false, beforeCommit);
    }
  }

  private async planSubtasks(task: string): Promise<Subtask[]> {
    metricsPhaseStart('plan', this.modelTier);
    const phaseStart = Date.now();

    if (!commandExists('copilot')) {
      printError('Copilot CLI not found');
      metricsPhaseEnd('plan', 'failed', 0);
      return [];
    }

    const crew: CrewMember = 'mission-planner';
    const tier = selectModelTier(task, 'plan', crew);
    const icon = getModelIcon(tier);

    printPhase('plan', crew, tier, icon);
    trackFuel(tier);

    const prompt = this.generatePlanningPrompt(task);
    this.writePromptFile('plan', prompt);

    if (this.dryRun) {
      console.log(colors.warning('[DRY RUN] Would generate subtasks'));
      metricsPhaseEnd('plan', 'skipped', 0);
      return this.getMockSubtasks(task);
    }

    console.log(colors.secondary(`📋 Prompt saved to: ${STATE_DIR}/pending_prompt.md`));
    console.log(colors.warning('🚀 Executing with Copilot CLI...'));
    console.log('');

    const result = await execCopilot(prompt, {
      timeout: 300,
      allowAllPaths: true,
      model: getModelForTier(tier)
    });

    const duration = Math.floor((Date.now() - phaseStart) / 1000);
    metricsPhaseEnd('plan', result.success ? 'success' : 'failed', duration);

    if (!result.success) {
      printError(`Planning failed: ${result.output.slice(0, 100)}`);
      return [];
    }

    return this.parseSubtasksFromOutput(result.output);
  }

  private async executeSubtasksInParallel(subtasks: Subtask[]): Promise<SubtaskResult[]> {
    const results: SubtaskResult[] = [];
    const sortedSubtasks = [...subtasks].sort((a, b) => b.priority - a.priority);

    // Execute in batches based on maxConcurrency
    for (let i = 0; i < sortedSubtasks.length; i += this.maxConcurrency) {
      const batch = sortedSubtasks.slice(i, i + this.maxConcurrency);
      
      console.log(colors.primary(`📦 Executing batch ${Math.floor(i / this.maxConcurrency) + 1} (${batch.length} subtasks)`));
      console.log('');

      const batchPromises = batch.map(subtask => this.executeSubtask(subtask));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);

      // Print batch summary
      const batchSuccess = batchResults.filter(r => r.success).length;
      console.log('');
      console.log(colors.secondary(`Batch complete: ${batchSuccess}/${batch.length} succeeded`));
      console.log('');
    }

    return results;
  }

  private async executeSubtask(subtask: Subtask): Promise<SubtaskResult> {
    const phaseStart = Date.now();
    metricsPhaseStart('implement', this.modelTier);

    console.log(colors.primary(`🔧 ${subtask.id}: ${subtask.description}`));
    console.log(colors.dim(`   Crew: ${subtask.crew} | Priority: ${subtask.priority} | Complexity: ${subtask.estimatedComplexity}`));

    if (!commandExists('copilot')) {
      metricsPhaseEnd('implement', 'failed', 0);
      return {
        subtask,
        success: false,
        duration: 0,
        error: 'Copilot CLI not found'
      };
    }

    const tier = selectModelTier(subtask.description, 'implement', subtask.crew);
    trackFuel(tier);

    const prompt = this.generateSubtaskPrompt(subtask);
    this.writeSubtaskPromptFile(subtask, prompt);

    if (this.dryRun) {
      console.log(colors.warning(`   [DRY RUN] Would execute subtask`));
      metricsPhaseEnd('implement', 'skipped', 0);
      return {
        subtask,
        success: true,
        duration: 0,
        output: 'Dry run'
      };
    }

    const result = await execCopilot(prompt, {
      timeout: 600,
      allowAllPaths: true,
      model: getModelForTier(tier)
    });

    const duration = Math.floor((Date.now() - phaseStart) / 1000);
    metricsPhaseEnd('implement', result.success ? 'success' : 'failed', duration);

    if (result.success) {
      console.log(colors.success(`   ✓ Complete (${duration}s)`));
    } else {
      console.log(colors.error(`   ✗ Failed (${duration}s)`));
    }

    return {
      subtask,
      success: result.success,
      duration,
      output: result.output
    };
  }

  private async reviewIntegration(task: string, results: SubtaskResult[]): Promise<{ success: boolean }> {
    metricsPhaseStart('review', this.modelTier);
    const phaseStart = Date.now();

    if (!commandExists('copilot')) {
      metricsPhaseEnd('review', 'failed', 0);
      return { success: false };
    }

    const crew: CrewMember = 'navigator';
    const tier = selectModelTier(task, 'review', crew);
    const icon = getModelIcon(tier);

    printPhase('review', crew, tier, icon);
    trackFuel(tier);

    const successfulSubtasks = results.filter(r => r.success);
    const prompt = this.generateReviewPrompt(task, successfulSubtasks);
    this.writePromptFile('review', prompt);

    if (this.dryRun) {
      console.log(colors.warning('[DRY RUN] Would review integration'));
      metricsPhaseEnd('review', 'skipped', 0);
      return { success: true };
    }

    console.log(colors.secondary(`📋 Prompt saved to: ${STATE_DIR}/pending_prompt.md`));
    console.log(colors.warning('🚀 Executing with Copilot CLI...'));
    console.log('');

    const result = await execCopilot(prompt, {
      timeout: 300,
      allowAllPaths: true,
      model: getModelForTier(tier)
    });

    const duration = Math.floor((Date.now() - phaseStart) / 1000);
    metricsPhaseEnd('review', result.success ? 'success' : 'failed', duration);

    if (result.success) {
      printSuccess(`Review complete (${duration}s)`);
    } else {
      printError(`Review failed (${duration}s)`);
    }

    return { success: result.success };
  }

  private generatePlanningPrompt(task: string): string {
    const crewPrompt = getAgentSystemPrompt('mission-planner');
    const paths = getConfigPaths();
    
    return `${crewPrompt}

TASK: ${task}
PHASE: plan
PROJECT: ${this.config.name}
MODE: ultrawork (parallel execution)

Your mission is to break down this task into 3-8 independent subtasks that can be executed in parallel.

Requirements:
1. Each subtask should be independent and not require results from other subtasks
2. Subtasks should be clearly defined and actionable
3. Assign appropriate crew members (pilot, specialist, engineer, etc.)
4. Estimate complexity (low/medium/high) and priority (1-10)
5. Output subtasks in this format:

SUBTASK: <id>
DESCRIPTION: <clear description>
CREW: <crew-member>
PRIORITY: <1-10>
COMPLEXITY: <low/medium/high>

Read ${paths.flightLog} first, update when done.
Output all subtasks then say 'PLAN COMPLETE'`;
  }

  private generateSubtaskPrompt(subtask: Subtask): string {
    const crewPrompt = getAgentSystemPrompt(subtask.crew);
    const paths = getConfigPaths();
    
    return `${crewPrompt}

SUBTASK: ${subtask.description}
PHASE: implement
PROJECT: ${this.config.name}
MODE: ultrawork (parallel execution - independent work)

This is subtask ${subtask.id} in a parallel execution mission.
Complete this specific subtask independently.

Read ${paths.flightLog} for context.
Reference ${paths.bestPractices} for standards.
Complete the subtask then say 'SUBTASK ${subtask.id} COMPLETE'`;
  }

  private generateReviewPrompt(task: string, successfulResults: SubtaskResult[]): string {
    const crewPrompt = getAgentSystemPrompt('navigator');
    const paths = getConfigPaths();
    
    return `${crewPrompt}

TASK: ${task}
PHASE: review
PROJECT: ${this.config.name}
MODE: ultrawork integration review

You are reviewing the integration of ${successfulResults.length} parallel subtasks:

${successfulResults.map(r => `- ${r.subtask.id}: ${r.subtask.description}`).join('\n')}

Your mission:
1. Review all changes made by the parallel subtasks
2. Ensure they integrate properly without conflicts
3. Verify consistency across all changes
4. Check for any integration issues or gaps
5. Suggest fixes if needed
6. Commit all changes using conventional commit format (feat/fix/refactor(scope): description) and push to the remote branch

Read ${paths.flightLog} first, update when done.
Complete the review then say 'REVIEW COMPLETE'`;
  }

  private parseSubtasksFromOutput(output: string): Subtask[] {
    const subtasks: Subtask[] = [];
    const lines = output.split('\n');
    let currentSubtask: Partial<Subtask> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('SUBTASK:')) {
        if (currentSubtask.id) {
          subtasks.push(currentSubtask as Subtask);
        }
        currentSubtask = { id: trimmed.replace('SUBTASK:', '').trim() };
      } else if (trimmed.startsWith('DESCRIPTION:')) {
        currentSubtask.description = trimmed.replace('DESCRIPTION:', '').trim();
      } else if (trimmed.startsWith('CREW:')) {
        currentSubtask.crew = trimmed.replace('CREW:', '').trim() as CrewMember;
      } else if (trimmed.startsWith('PRIORITY:')) {
        currentSubtask.priority = parseInt(trimmed.replace('PRIORITY:', '').trim()) || 5;
      } else if (trimmed.startsWith('COMPLEXITY:')) {
        const complexity = trimmed.replace('COMPLEXITY:', '').trim().toLowerCase();
        currentSubtask.estimatedComplexity = (complexity === 'low' || complexity === 'medium' || complexity === 'high') 
          ? complexity 
          : 'medium';
      }
    }

    // Add last subtask
    if (currentSubtask.id && currentSubtask.description) {
      subtasks.push(currentSubtask as Subtask);
    }

    // Validate and set defaults
    return subtasks.map((st, idx) => ({
      id: st.id || `subtask-${idx + 1}`,
      description: st.description || 'Undefined subtask',
      crew: st.crew || 'pilot',
      priority: st.priority || 5,
      estimatedComplexity: st.estimatedComplexity || 'medium'
    }));
  }

  private getMockSubtasks(task: string): Subtask[] {
    // For dry-run mode
    return [
      {
        id: 'subtask-1',
        description: `Mock subtask 1 for: ${task}`,
        crew: 'pilot',
        priority: 8,
        estimatedComplexity: 'medium'
      },
      {
        id: 'subtask-2',
        description: `Mock subtask 2 for: ${task}`,
        crew: 'specialist',
        priority: 6,
        estimatedComplexity: 'low'
      }
    ];
  }

  private printSubtaskSummary(subtasks: Subtask[]): void {
    console.log(colors.primary('Subtasks to execute:'));
    subtasks.forEach((st, idx) => {
      const priorityColor = st.priority >= 7 ? colors.error : st.priority >= 4 ? colors.warning : colors.dim;
      console.log(`  ${idx + 1}. [${priorityColor(st.priority.toString())}] ${st.description}`);
      console.log(`     ${colors.dim(`Crew: ${st.crew} | Complexity: ${st.estimatedComplexity}`)}`);
    });
  }

  private writePromptFile(phase: Phase, prompt: string): void {
    const content = `# 🚀 ORBIT Ultrawork - Phase: ${phase.toUpperCase()}

## Task
${prompt}

---
*Execute this with Copilot CLI*
`;
    writeFileSync(join(STATE_DIR, 'pending_prompt.md'), content);
  }

  private writeSubtaskPromptFile(subtask: Subtask, prompt: string): void {
    const content = `# 🚀 ORBIT Ultrawork - Subtask: ${subtask.id}

## Description
${subtask.description}

## Crew
${subtask.crew}

## Instructions
${prompt}

---
*Execute this with Copilot CLI*
`;
    const filename = `subtask_${subtask.id.replace(/[^a-z0-9]/gi, '_')}.md`;
    writeFileSync(join(ULTRAWORK_DIR, filename), content);
  }

  private initFlightLog(task: string): void {
    const logPath = join(STATE_DIR, 'flight_log.md');
    const content = `# 🛸 Flight Log
Task: ${task}
Mission: ultrawork
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
    if (!existsSync(ULTRAWORK_DIR)) {
      mkdirSync(ULTRAWORK_DIR, { recursive: true });
    }
  }

  private buildResult(
    task: string,
    results: SubtaskResult[],
    success: boolean,
    beforeCommit?: string
  ): UltraworkResult {
    const afterCommit = getCurrentCommit();
    const filesChanged = getChangedFiles().length;
    const duration = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    return {
      task,
      subtasks: results,
      totalDuration: duration,
      success,
      filesChanged,
      commitHash: afterCommit !== beforeCommit ? afterCommit : undefined
    };
  }
}

/**
 * Execute an ultrawork mission
 */
export async function runUltrawork(options: UltraworkOptions): Promise<UltraworkResult> {
  const executor = new UltraworkExecutor(options);
  return executor.execute(options.task);
}
