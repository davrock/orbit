// 🛸 ORBIT Pipeline - Sequential Multi-Stage Processing
// Sequential execution with handoffs between stages

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import {
  type Phase,
  type CrewMember,
  type ProjectConfig,
  type ModelTier,
  selectModelTier,
  getModelIcon,
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

const STATE_DIR = '.copilot/state';
const PIPELINE_DIR = '.copilot/state/pipeline';

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  crew: CrewMember;
  phase: Phase;
  inputFromPrevious: boolean;
}

export interface PipelineStageResult {
  stage: PipelineStage;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
  filesAffected?: string[];
  handoffContext?: string;
}

export interface PipelineOptions {
  task: string;
  dryRun?: boolean;
  modelTier?: 'auto' | 'premium' | 'standard' | 'fast' | 'ecomode';
  customStages?: PipelineStage[];
}

export interface PipelineResult {
  task: string;
  stages: PipelineStageResult[];
  totalDuration: number;
  success: boolean;
  filesChanged: number;
  commitHash?: string;
}

/**
 * Pipeline: Sequential multi-stage processing with explicit handoffs
 */
export class PipelineExecutor {
  private config: ProjectConfig;
  private startTime: Date;
  private modelTier: ModelTier;
  private dryRun: boolean;
  private handoffContext: string;

  constructor(options: PipelineOptions) {
    this.config = detectProjectConfig();
    this.startTime = new Date();
    this.modelTier = options.modelTier === 'auto' ? 'standard' : (options.modelTier || 'standard');
    this.dryRun = options.dryRun || false;
    this.handoffContext = '';
  }

  async execute(task: string, customStages?: PipelineStage[]): Promise<PipelineResult> {
    this.ensureStateDir();
    printBanner();

    console.log(`Task: ${colors.secondary(task)}`);
    console.log(`Mission: ${colors.secondary('pipeline')}`);
    
    if (this.dryRun) {
      console.log(`Mode: ${colors.warning('DRY RUN')}`);
    }
    console.log('');

    this.initFlightLog(task);
    appendLog(`Starting pipeline mission: ${task}`);

    metricsStart(task, 'pipeline');
    initHUD(task, ['plan', 'implement', 'test', 'review', 'commit']);

    const beforeCommit = getCurrentCommit();

    // Phase 1: Plan pipeline stages
    setPhase('plan', 'mission-planner', this.modelTier);
    console.log(colors.secondary('━'.repeat(64)));
    console.log(colors.primary('📋 PHASE 1: PIPELINE PLANNING'));
    console.log(colors.secondary('━'.repeat(64)));
    console.log('');

    const stages = customStages || await this.planPipelineStages(task);
    
    if (!stages || stages.length === 0) {
      metricsEnd(false);
      endHUD(false);
      printError('Failed to generate pipeline plan');
      return this.buildResult(task, [], false, beforeCommit);
    }

    completePhase('plan');
    printSuccess(`Planned ${stages.length} sequential stages`);
    console.log('');

    this.printPipelinePlan(stages);
    console.log('');

    // Phase 2: Execute pipeline stages sequentially
    console.log(colors.secondary('━'.repeat(64)));
    console.log(colors.primary('⚡ PHASE 2: PIPELINE EXECUTION'));
    console.log(colors.secondary('━'.repeat(64)));
    console.log('');

    const results = await this.executePipelineStages(stages);
    
    const failedStages = results.filter(r => !r.success);
    if (failedStages.length > 0) {
      console.log('');
      printError(`Pipeline failed at stage: ${failedStages[0].stage.name}`);
      metricsFilesChanged(getChangedFiles().length);
      metricsEnd(false);
      endHUD(false);
      return this.buildResult(task, results, false, beforeCommit);
    }

    // Phase 3: Final review
    setPhase('review', 'navigator', this.modelTier);
    console.log('');
    console.log(colors.secondary('━'.repeat(64)));
    console.log(colors.primary('🔍 PHASE 3: PIPELINE REVIEW'));
    console.log(colors.secondary('━'.repeat(64)));
    console.log('');

    const reviewResult = await this.reviewPipeline(task, results);
    completePhase('review');

    if (!reviewResult.success) {
      metricsFilesChanged(getChangedFiles().length);
      metricsEnd(false);
      endHUD(false);
      printError('Pipeline review failed');
      return this.buildResult(task, results, false, beforeCommit);
    }

    // Phase 4: Commit
    setPhase('commit', 'pilot', this.modelTier);
    console.log('');
    console.log(colors.secondary('━'.repeat(64)));
    console.log(colors.primary('✅ PHASE 4: COMMIT'));
    console.log(colors.secondary('━'.repeat(64)));
    console.log('');

    const commitResult = await this.commitChanges(task);
    completePhase('commit');

    const duration = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    const success = commitResult.success;

    metricsFilesChanged(getChangedFiles().length);
    metricsEnd(success);
    endHUD(success);

    if (success) {
      printMissionComplete(results.length, duration);
      appendLog(`Pipeline mission complete: ${results.length} stages in ${duration}s`);
    } else {
      printError('Pipeline mission failed');
    }

    return this.buildResult(task, results, success, beforeCommit);
  }

  private async planPipelineStages(task: string): Promise<PipelineStage[]> {
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
      console.log(colors.warning('[DRY RUN] Would generate pipeline plan'));
      metricsPhaseEnd('plan', 'skipped', 0);
      return this.getMockPipelineStages(task);
    }

    console.log(colors.secondary(`📋 Prompt saved to: ${STATE_DIR}/pending_prompt.md`));
    console.log(colors.warning('🚀 Executing with Copilot CLI...'));
    console.log('');

    const result = await execCopilot(prompt, {
      timeout: 300,
      allowAllPaths: true
    });

    const duration = Math.floor((Date.now() - phaseStart) / 1000);
    metricsPhaseEnd('plan', result.success ? 'success' : 'failed', duration);

    if (!result.success) {
      printError(`Planning failed: ${result.output.slice(0, 100)}`);
      return [];
    }

    return this.parsePipelineStagesFromOutput(result.output);
  }

  private async executePipelineStages(stages: PipelineStage[]): Promise<PipelineStageResult[]> {
    const results: PipelineStageResult[] = [];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      
      console.log(colors.primary(`\n🔧 STAGE ${i + 1}/${stages.length}: ${stage.name.toUpperCase()}`));
      console.log(colors.dim(`   ${stage.description}`));
      console.log(colors.dim(`   Crew: ${stage.crew} | Phase: ${stage.phase}`));
      
      if (i > 0 && stage.inputFromPrevious) {
        console.log(colors.dim(`   📥 Receiving handoff from previous stage`));
      }
      console.log('');

      const result = await this.executePipelineStage(stage);
      results.push(result);

      if (!result.success) {
        printError(`Stage ${stage.name} failed - pipeline halted`);
        break;
      }

      // Store handoff context for next stage
      if (result.handoffContext) {
        this.handoffContext = result.handoffContext;
      }

      printSuccess(`Stage ${stage.name} complete (${result.duration}s)`);
      
      if (i < stages.length - 1) {
        console.log(colors.secondary(`   📤 Handing off to next stage...`));
      }
      console.log('');
    }

    return results;
  }

  private async executePipelineStage(stage: PipelineStage): Promise<PipelineStageResult> {
    const phaseStart = Date.now();
    metricsPhaseStart(stage.phase, this.modelTier);

    if (!commandExists('copilot')) {
      metricsPhaseEnd(stage.phase, 'failed', 0);
      return {
        stage,
        success: false,
        duration: 0,
        error: 'Copilot CLI not found'
      };
    }

    const tier = selectModelTier(stage.description, stage.phase, stage.crew);
    trackFuel(tier);

    const prompt = this.generateStagePrompt(stage);
    this.writeStagePromptFile(stage, prompt);

    if (this.dryRun) {
      console.log(colors.warning(`   [DRY RUN] Would execute stage`));
      metricsPhaseEnd(stage.phase, 'skipped', 0);
      return {
        stage,
        success: true,
        duration: 0,
        output: 'Dry run',
        handoffContext: 'Dry run handoff'
      };
    }

    const result = await execCopilot(prompt, {
      timeout: 600,
      allowAllPaths: true
    });

    const duration = Math.floor((Date.now() - phaseStart) / 1000);
    metricsPhaseEnd(stage.phase, result.success ? 'success' : 'failed', duration);

    // Extract handoff context from output
    const handoffContext = this.extractHandoffContext(result.output);

    return {
      stage,
      success: result.success,
      duration,
      output: result.output,
      filesAffected: getChangedFiles(),
      handoffContext
    };
  }

  private async reviewPipeline(task: string, results: PipelineStageResult[]): Promise<{ success: boolean }> {
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

    const prompt = this.generateReviewPrompt(task, results);
    this.writePromptFile('review', prompt);

    if (this.dryRun) {
      console.log(colors.warning('[DRY RUN] Would review pipeline'));
      metricsPhaseEnd('review', 'skipped', 0);
      return { success: true };
    }

    console.log(colors.secondary(`📋 Prompt saved to: ${STATE_DIR}/pending_prompt.md`));
    console.log(colors.warning('🚀 Executing with Copilot CLI...'));
    console.log('');

    const result = await execCopilot(prompt, {
      timeout: 300,
      allowAllPaths: true
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

  private async commitChanges(task: string): Promise<{ success: boolean }> {
    metricsPhaseStart('commit', this.modelTier);
    const phaseStart = Date.now();

    if (!commandExists('copilot')) {
      metricsPhaseEnd('commit', 'failed', 0);
      return { success: false };
    }

    const crew: CrewMember = 'pilot';
    const tier = selectModelTier(task, 'commit', crew);
    const icon = getModelIcon(tier);

    printPhase('commit', crew, tier, icon);
    trackFuel(tier);

    const prompt = this.generateCommitPrompt(task);
    this.writePromptFile('commit', prompt);

    if (this.dryRun) {
      console.log(colors.warning('[DRY RUN] Would commit changes'));
      metricsPhaseEnd('commit', 'skipped', 0);
      return { success: true };
    }

    console.log(colors.secondary(`📋 Prompt saved to: ${STATE_DIR}/pending_prompt.md`));
    console.log(colors.warning('🚀 Executing with Copilot CLI...'));
    console.log('');

    const result = await execCopilot(prompt, {
      timeout: 120,
      allowAllPaths: true
    });

    const duration = Math.floor((Date.now() - phaseStart) / 1000);
    metricsPhaseEnd('commit', result.success ? 'success' : 'failed', duration);

    if (result.success) {
      printSuccess(`Commit complete (${duration}s)`);
    } else {
      printError(`Commit failed (${duration}s)`);
    }

    return { success: result.success };
  }

  private generatePlanningPrompt(task: string): string {
    const crewPrompt = getAgentSystemPrompt('mission-planner');
    
    return `${crewPrompt}

TASK: ${task}
PHASE: plan
PROJECT: ${this.config.name}
MODE: pipeline (sequential multi-stage processing with handoffs)

Your mission is to break down this task into 3-7 sequential stages where each stage:
1. Completes a distinct part of the work
2. Can hand off context/results to the next stage
3. Has a clear crew member assigned
4. Maps to a specific phase (implement/test/review/document)

Requirements:
- Stages execute sequentially (one completes before next starts)
- Each stage should produce output that feeds into the next
- Identify which stages need input from previous stages
- Assign appropriate crew members based on stage type
- Each stage should have a clear completion criteria

Output format (one stage per block):

STAGE: <id>
NAME: <short name>
DESCRIPTION: <what this stage does>
CREW: <crew-member>
PHASE: <implement|test|review|document>
INPUT_FROM_PREVIOUS: <yes|no>

Example:
STAGE: stage-1
NAME: Setup
DESCRIPTION: Configure base infrastructure and dependencies
CREW: pilot
PHASE: implement
INPUT_FROM_PREVIOUS: no

STAGE: stage-2
NAME: Implementation
DESCRIPTION: Implement core functionality using setup from stage-1
CREW: pilot
PHASE: implement
INPUT_FROM_PREVIOUS: yes

Read .copilot/state/flight_log.md first, update when done.
Output all stages then say 'PIPELINE PLAN COMPLETE'`;
  }

  private generateStagePrompt(stage: PipelineStage): string {
    const crewPrompt = getAgentSystemPrompt(stage.crew);
    
    let handoffSection = '';
    if (stage.inputFromPrevious && this.handoffContext) {
      handoffSection = `\n\nHANDOFF FROM PREVIOUS STAGE:
${this.handoffContext}

Use this context to inform your work in this stage.
`;
    }
    
    return `${crewPrompt}

TASK: ${stage.description}
STAGE: ${stage.id} - ${stage.name}
PHASE: ${stage.phase}
PROJECT: ${this.config.name}
MODE: pipeline (sequential stage ${stage.id})
${handoffSection}

This is stage ${stage.id} in a sequential pipeline.
Complete this stage and prepare handoff context for the next stage.

At the end of your work, create a HANDOFF section with:
1. What you completed
2. Key decisions made
3. Important context for next stage
4. Files created/modified

Format:
=== HANDOFF ===
<your handoff context here>
=== END HANDOFF ===

Read .copilot/state/flight_log.md for context.
Reference .copilot/best-practices.yaml for standards.
Complete the stage then say 'STAGE ${stage.id} COMPLETE'`;
  }

  private generateReviewPrompt(task: string, results: PipelineStageResult[]): string {
    const crewPrompt = getAgentSystemPrompt('navigator');
    
    return `${crewPrompt}

TASK: ${task}
PHASE: review
PROJECT: ${this.config.name}
MODE: pipeline review

You are reviewing the complete pipeline execution of ${results.length} sequential stages:

${results.map((r, i) => `${i + 1}. ${r.stage.name}: ${r.stage.description} (crew: ${r.stage.crew})`).join('\n')}

Your mission:
1. Review all changes made through the pipeline
2. Verify each stage completed its objectives
3. Check that handoffs between stages were effective
4. Ensure consistency and quality across all stages
5. Verify the final result meets the original task requirements

Read .copilot/state/flight_log.md first, update when done.
Reference .copilot/best-practices.yaml for standards.
Complete the review then say 'REVIEW COMPLETE'`;
  }

  private generateCommitPrompt(task: string): string {
    const crewPrompt = getAgentSystemPrompt('pilot');
    
    return `${crewPrompt}

TASK: ${task}
PHASE: commit
PROJECT: ${this.config.name}
MODE: pipeline finalization

Commit all changes from the pipeline execution.

Create a clear commit message that describes:
1. The overall task accomplished
2. That work was completed in sequential pipeline stages
3. Key changes made

Use conventional commit format: feat/fix/refactor(scope): description

Complete the commit then say 'COMMIT COMPLETE'`;
  }

  private parsePipelineStagesFromOutput(output: string): PipelineStage[] {
    const stages: PipelineStage[] = [];
    const lines = output.split('\n');
    let currentStage: Partial<PipelineStage> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('STAGE:')) {
        if (currentStage.id) {
          stages.push(this.finalizePipelineStage(currentStage));
        }
        currentStage = { id: trimmed.replace('STAGE:', '').trim() };
      } else if (trimmed.startsWith('NAME:')) {
        currentStage.name = trimmed.replace('NAME:', '').trim();
      } else if (trimmed.startsWith('DESCRIPTION:')) {
        currentStage.description = trimmed.replace('DESCRIPTION:', '').trim();
      } else if (trimmed.startsWith('CREW:')) {
        currentStage.crew = trimmed.replace('CREW:', '').trim() as CrewMember;
      } else if (trimmed.startsWith('PHASE:')) {
        const phaseStr = trimmed.replace('PHASE:', '').trim().toLowerCase();
        currentStage.phase = phaseStr as Phase;
      } else if (trimmed.startsWith('INPUT_FROM_PREVIOUS:')) {
        const inputStr = trimmed.replace('INPUT_FROM_PREVIOUS:', '').trim().toLowerCase();
        currentStage.inputFromPrevious = inputStr === 'yes' || inputStr === 'true';
      }
    }

    // Add last stage
    if (currentStage.id && currentStage.name) {
      stages.push(this.finalizePipelineStage(currentStage));
    }

    return stages;
  }

  private finalizePipelineStage(partial: Partial<PipelineStage>): PipelineStage {
    return {
      id: partial.id || `stage-${Date.now()}`,
      name: partial.name || 'Unnamed Stage',
      description: partial.description || 'No description',
      crew: partial.crew || 'pilot',
      phase: partial.phase || 'implement',
      inputFromPrevious: partial.inputFromPrevious || false
    };
  }

  private extractHandoffContext(output: string): string {
    const handoffRegex = /=== HANDOFF ===([\s\S]*?)=== END HANDOFF ===/;
    const match = output.match(handoffRegex);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // Fallback: extract last 500 chars as context
    return output.slice(-500);
  }

  private getMockPipelineStages(task: string): PipelineStage[] {
    return [
      {
        id: 'stage-1',
        name: 'Setup',
        description: `Setup for: ${task}`,
        crew: 'pilot',
        phase: 'implement',
        inputFromPrevious: false
      },
      {
        id: 'stage-2',
        name: 'Implementation',
        description: `Core implementation for: ${task}`,
        crew: 'pilot',
        phase: 'implement',
        inputFromPrevious: true
      },
      {
        id: 'stage-3',
        name: 'Testing',
        description: `Tests for: ${task}`,
        crew: 'specialist',
        phase: 'test',
        inputFromPrevious: true
      }
    ];
  }

  private printPipelinePlan(stages: PipelineStage[]): void {
    console.log(colors.primary('Pipeline execution plan (sequential):'));
    console.log('');
    
    stages.forEach((stage, idx) => {
      const arrow = idx === 0 ? '  ' : '  ↓';
      console.log(colors.secondary(arrow));
      console.log(colors.primary(`  ${idx + 1}. ${stage.name.toUpperCase()}`));
      console.log(`     ${colors.dim(stage.description)}`);
      console.log(`     ${colors.dim(`Crew: ${stage.crew} | Phase: ${stage.phase}`)}`);
      
      if (stage.inputFromPrevious) {
        console.log(`     ${colors.dim('📥 Receives handoff from previous stage')}`);
      }
      
      if (idx < stages.length - 1) {
        console.log(`     ${colors.dim('📤 Hands off to next stage')}`);
      }
    });
  }

  private writePromptFile(phase: Phase, prompt: string): void {
    const content = `# 🚀 ORBIT Pipeline - Phase: ${phase.toUpperCase()}

## Task
${prompt}

---
*Execute this with Copilot CLI*
`;
    writeFileSync(join(STATE_DIR, 'pending_prompt.md'), content);
  }

  private writeStagePromptFile(stage: PipelineStage, prompt: string): void {
    const content = `# 🚀 ORBIT Pipeline - Stage: ${stage.id}

## Stage Name
${stage.name}

## Description
${stage.description}

## Crew
${stage.crew}

## Phase
${stage.phase}

## Instructions
${prompt}

---
*Execute this with Copilot CLI*
`;
    const filename = `pipeline_${stage.id.replace(/[^a-z0-9]/gi, '_')}.md`;
    writeFileSync(join(PIPELINE_DIR, filename), content);
  }

  private initFlightLog(task: string): void {
    const logPath = join(STATE_DIR, 'flight_log.md');
    const content = `# 🛸 Flight Log
Task: ${task}
Mission: pipeline
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
    if (!existsSync(PIPELINE_DIR)) {
      mkdirSync(PIPELINE_DIR, { recursive: true });
    }
  }

  private buildResult(
    task: string,
    results: PipelineStageResult[],
    success: boolean,
    beforeCommit?: string
  ): PipelineResult {
    const afterCommit = getCurrentCommit();
    const filesChanged = getChangedFiles().length;
    const duration = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    return {
      task,
      stages: results,
      totalDuration: duration,
      success,
      filesChanged,
      commitHash: afterCommit !== beforeCommit ? afterCommit : undefined
    };
  }
}

/**
 * Execute a pipeline mission
 */
export async function runPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const executor = new PipelineExecutor(options);
  return executor.execute(options.task, options.customStages);
}
