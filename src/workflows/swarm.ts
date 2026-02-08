// 🛸 ORBIT Swarm - Coordinated Parallel Execution Mode
// Intelligent task distribution with inter-agent awareness and coordination

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
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
const SWARM_DIR = `${STATE_DIR}/swarm`;

export interface SwarmTask {
  id: string;
  description: string;
  crew: CrewMember;
  priority: number;
  dependencies: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'complete' | 'failed';
}

export interface SwarmTaskResult {
  task: SwarmTask;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
  filesAffected?: string[];
}

export interface SwarmCoordinationState {
  completedTasks: string[];
  inProgressTasks: string[];
  failedTasks: string[];
  sharedContext: Record<string, any>;
}

export interface SwarmOptions {
  task: string;
  maxConcurrency?: number;
  dryRun?: boolean;
  modelTier?: 'auto' | 'premium' | 'standard' | 'fast' | 'ecomode';
  enableCoordination?: boolean;
}

export interface SwarmResult {
  task: string;
  tasks: SwarmTaskResult[];
  totalDuration: number;
  success: boolean;
  filesChanged: number;
  commitHash?: string;
}

/**
 * Swarm: Coordinated parallel execution with awareness between agents
 */
export class SwarmExecutor {
  private config: ProjectConfig;
  private startTime: Date;
  private modelTier: ModelTier;
  private maxConcurrency: number;
  private dryRun: boolean;
  private enableCoordination: boolean;
  private coordinationState: SwarmCoordinationState;

  constructor(options: SwarmOptions) {
    this.config = detectProjectConfig();
    this.startTime = new Date();
    this.modelTier = options.modelTier === 'auto' ? 'standard' : (options.modelTier || 'standard');
    this.maxConcurrency = options.maxConcurrency || 4;
    this.dryRun = options.dryRun || false;
    this.enableCoordination = options.enableCoordination !== false;
    this.coordinationState = {
      completedTasks: [],
      inProgressTasks: [],
      failedTasks: [],
      sharedContext: {}
    };
  }

  async execute(task: string): Promise<SwarmResult> {
    this.ensureStateDir();
    printBanner();

    console.log(`Task: ${colors.secondary(task)}`);
    console.log(`Mission: ${colors.secondary('swarm')}`);
    console.log(`Max Concurrency: ${colors.secondary(String(this.maxConcurrency))}`);
    console.log(`Coordination: ${colors.secondary(this.enableCoordination ? 'enabled' : 'disabled')}`);
    
    if (this.dryRun) {
      console.log(`Mode: ${colors.warning('DRY RUN')}`);
    }
    console.log('');

    this.initFlightLog(task);
    appendLog(`Starting swarm mission: ${task}`);

    metricsStart(task, 'swarm');
    initHUD(task, ['plan', 'implement', 'review', 'commit']);

    const beforeCommit = getCurrentCommit();

    try {
      // Phase 1: Intelligent task planning with dependency analysis
      setPhase('plan', 'mission-planner', this.modelTier);
      console.log(colors.secondary('━'.repeat(64)));
      console.log(colors.primary('📋 PHASE 1: INTELLIGENT TASK PLANNING'));
      console.log(colors.secondary('━'.repeat(64)));
      console.log('');

      const tasks = await this.planSwarmTasks(task);
      
      if (!tasks || tasks.length === 0) {
        metricsEnd(false);
        endHUD(false);
        printError('Failed to generate swarm task plan');
        return this.buildResult(task, [], false, beforeCommit);
      }

      completePhase('plan');
      printSuccess(`Planned ${tasks.length} coordinated tasks`);
      console.log('');

      // Phase 2: Coordinated parallel execution with dependency management
      setPhase('implement', 'pilot', this.modelTier);
      console.log(colors.secondary('━'.repeat(64)));
      console.log(colors.primary('🐝 PHASE 2: COORDINATED SWARM EXECUTION'));
      console.log(colors.secondary('━'.repeat(64)));
      console.log('');

      this.printSwarmPlan(tasks);
      console.log('');

      const results = await this.executeSwarmTasks(tasks);
      completePhase('implement');

      const failedTasks = results.filter(r => !r.success);
      if (failedTasks.length > 0) {
        console.log('');
        printWarning(`${failedTasks.length} task(s) failed:`);
        failedTasks.forEach(r => {
          console.log(`  ✗ ${r.task.description}`);
        });
      }

      // Phase 3: Integration review
      setPhase('review', 'navigator', this.modelTier);
      console.log('');
      console.log(colors.secondary('━'.repeat(64)));
      console.log(colors.primary('🔍 PHASE 3: INTEGRATION REVIEW'));
      console.log(colors.secondary('━'.repeat(64)));
      console.log('');

      const reviewResult = await this.reviewIntegration(task, results);
      completePhase('review');

      if (!reviewResult.success) {
        metricsFilesChanged(getChangedFiles().length);
        metricsEnd(false);
        endHUD(false);
        printError('Integration review failed');
        return this.buildResult(task, results, false, beforeCommit);
      }

      const duration = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
      const success = failedTasks.length === 0;

      metricsFilesChanged(getChangedFiles().length);
      metricsEnd(success);
      endHUD(success);

      if (success) {
        printMissionComplete(results.length, duration);
        appendLog(`Swarm mission complete: ${results.length} tasks in ${duration}s`);
      } else {
        printError('Swarm mission failed');
      }

      return this.buildResult(task, results, success, beforeCommit);
    } catch (error) {
      metricsEnd(false);
      endHUD(false);
      printError(`Swarm mission crashed: ${error instanceof Error ? error.message : String(error)}`);
      appendLog(`Swarm mission error: ${error instanceof Error ? error.message : String(error)}`);
      return this.buildResult(task, [], false, beforeCommit);
    }
  }

  private async planSwarmTasks(task: string): Promise<SwarmTask[]> {
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
      console.log(colors.warning('[DRY RUN] Would generate swarm task plan'));
      metricsPhaseEnd('plan', 'skipped', 0);
      return this.getMockSwarmTasks(task);
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

    return this.parseSwarmTasksFromOutput(result.output);
  }

  private async executeSwarmTasks(tasks: SwarmTask[]): Promise<SwarmTaskResult[]> {
    const results: SwarmTaskResult[] = [];
    const pendingTasks = [...tasks];
    
    while (pendingTasks.length > 0) {
      // Find tasks ready to execute (no pending dependencies)
      const readyTasks = pendingTasks.filter(task => 
        task.dependencies.every(dep => this.coordinationState.completedTasks.includes(dep))
      );

      if (readyTasks.length === 0) {
        // All remaining tasks have dependencies on failed tasks
        printError('Dependency deadlock detected - cannot proceed with remaining tasks');
        break;
      }

      // Execute batch of ready tasks
      const batch = readyTasks.slice(0, this.maxConcurrency);
      
      console.log(colors.primary(`📦 Executing wave ${Math.ceil((tasks.length - pendingTasks.length + 1) / this.maxConcurrency)} (${batch.length} tasks)`));
      if (batch.some(t => t.dependencies.length > 0)) {
        console.log(colors.dim(`   Dependencies: ${batch.filter(t => t.dependencies.length > 0).map(t => `${t.id}: [${t.dependencies.join(', ')}]`).join(' | ')}`));
      }
      console.log('');

      // Update in-progress tracking
      batch.forEach(t => {
        t.status = 'in-progress';
        this.coordinationState.inProgressTasks.push(t.id);
      });

      const batchPromises = batch.map(task => this.executeSwarmTask(task));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);

      // Update coordination state
      batchResults.forEach(result => {
        const taskId = result.task.id;
        const index = this.coordinationState.inProgressTasks.indexOf(taskId);
        if (index > -1) {
          this.coordinationState.inProgressTasks.splice(index, 1);
        }

        if (result.success) {
          this.coordinationState.completedTasks.push(taskId);
          result.task.status = 'complete';
          
          // Store shared context for coordination
          if (result.output) {
            this.coordinationState.sharedContext[taskId] = {
              output: result.output.slice(0, 500),
              files: result.filesAffected || []
            };
          }
        } else {
          this.coordinationState.failedTasks.push(taskId);
          result.task.status = 'failed';
        }
      });

      // Remove completed/failed tasks from pending
      batch.forEach(task => {
        const index = pendingTasks.findIndex(t => t.id === task.id);
        if (index > -1) {
          pendingTasks.splice(index, 1);
        }
      });

      // Save coordination state for reference
      this.saveCoordinationState();

      // Print batch summary
      const batchSuccess = batchResults.filter(r => r.success).length;
      console.log('');
      console.log(colors.secondary(`Wave complete: ${batchSuccess}/${batch.length} succeeded`));
      console.log('');

      // Brief pause between waves for visibility
      if (pendingTasks.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  private async executeSwarmTask(task: SwarmTask): Promise<SwarmTaskResult> {
    const phaseStart = Date.now();
    metricsPhaseStart('implement', this.modelTier);

    console.log(colors.primary(`🔧 ${task.id}: ${task.description}`));
    console.log(colors.dim(`   Crew: ${task.crew} | Priority: ${task.priority} | Complexity: ${task.estimatedComplexity}`));
    if (task.dependencies.length > 0) {
      console.log(colors.dim(`   Depends on: ${task.dependencies.join(', ')}`));
    }

    if (!commandExists('copilot')) {
      metricsPhaseEnd('implement', 'failed', 0);
      return {
        task,
        success: false,
        duration: 0,
        error: 'Copilot CLI not found'
      };
    }

    const tier = selectModelTier(task.description, 'implement', task.crew);
    trackFuel(tier);

    const prompt = this.generateSwarmTaskPrompt(task);
    this.writeSwarmTaskPromptFile(task, prompt);

    if (this.dryRun) {
      console.log(colors.warning(`   [DRY RUN] Would execute task`));
      metricsPhaseEnd('implement', 'skipped', 0);
      return {
        task,
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
      task,
      success: result.success,
      duration,
      output: result.output,
      filesAffected: getChangedFiles()
    };
  }

  private async reviewIntegration(task: string, results: SwarmTaskResult[]): Promise<{ success: boolean }> {
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

    const successfulResults = results.filter(r => r.success);
    const prompt = this.generateReviewPrompt(task, successfulResults);
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
MODE: swarm (coordinated parallel execution with dependencies)

Your mission is to break down this task into 3-10 coordinated tasks that can be executed in parallel waves based on dependencies.

Requirements:
1. Identify tasks that can run in parallel vs those that depend on others
2. Create a dependency graph (use task IDs)
3. Assign appropriate crew members
4. Estimate complexity (low/medium/high) and priority (1-10)
5. Independent tasks should have no dependencies (empty array)
6. Dependent tasks must list IDs of tasks they depend on

Output format (one task per block):

TASK: <id>
DESCRIPTION: <clear description>
CREW: <crew-member>
PRIORITY: <1-10>
COMPLEXITY: <low/medium/high>
DEPENDS_ON: <comma-separated task IDs or "none">

Example:
TASK: task-1
DESCRIPTION: Set up base configuration
CREW: pilot
PRIORITY: 9
COMPLEXITY: low
DEPENDS_ON: none

TASK: task-2
DESCRIPTION: Implement feature using config
CREW: pilot
PRIORITY: 7
COMPLEXITY: medium
DEPENDS_ON: task-1

Read ${paths.flightLog} first, update when done.
Output all tasks then say 'SWARM PLAN COMPLETE'`;
  }

  private generateSwarmTaskPrompt(task: SwarmTask): string {
    const crewPrompt = getAgentSystemPrompt(task.crew);
    const paths = getConfigPaths();
    
    let coordinationContext = '';
    if (this.enableCoordination && task.dependencies.length > 0) {
      coordinationContext = '\n\nCOORDINATION CONTEXT:\n';
      coordinationContext += 'You are part of a coordinated swarm. Review completed dependency tasks:\n';
      
      task.dependencies.forEach(depId => {
        const depContext = this.coordinationState.sharedContext[depId];
        if (depContext) {
          coordinationContext += `\nTask ${depId}:\n`;
          coordinationContext += `  Files: ${depContext.files.join(', ')}\n`;
          coordinationContext += `  Summary: ${depContext.output}\n`;
        }
      });
      
      coordinationContext += `\nCoordination state: ${JSON.stringify(this.getCoordinationSummary(), null, 2)}\n`;
    }
    
    return `${crewPrompt}

TASK: ${task.description}
TASK_ID: ${task.id}
PHASE: implement
PROJECT: ${this.config.name}
MODE: swarm (coordinated parallel execution)

This is task ${task.id} in a swarm mission.
${task.dependencies.length > 0 ? `Dependencies: ${task.dependencies.join(', ')} (already complete)` : 'No dependencies - independent task'}
${coordinationContext}

Complete this specific task. Be aware of work done by dependency tasks.

Read ${paths.flightLog} for context.
Reference ${paths.bestPractices} for standards.
Complete the task then say 'TASK ${task.id} COMPLETE'`;
  }

  private generateReviewPrompt(task: string, successfulResults: SwarmTaskResult[]): string {
    const crewPrompt = getAgentSystemPrompt('navigator');
    const paths = getConfigPaths();
    
    return `${crewPrompt}

TASK: ${task}
PHASE: review
PROJECT: ${this.config.name}
MODE: swarm integration review

You are reviewing the integration of ${successfulResults.length} coordinated swarm tasks:

${successfulResults.map(r => `- ${r.task.id}: ${r.task.description} (crew: ${r.task.crew})`).join('\n')}

Your mission:
1. Review all changes made by the swarm tasks
2. Verify proper integration and coordination between tasks
3. Check that dependencies were properly handled
4. Ensure consistency and quality across all changes
5. Suggest fixes if needed
6. Commit all changes using conventional commit format (feat/fix/refactor(scope): description) and push to the remote branch

Read ${paths.flightLog} first, update when done.
Complete the review then say 'REVIEW COMPLETE'`;
  }

  private parseSwarmTasksFromOutput(output: string): SwarmTask[] {
    const tasks: SwarmTask[] = [];
    const lines = output.split('\n');
    let currentTask: Partial<SwarmTask> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('TASK:')) {
        if (currentTask.id) {
          tasks.push(this.finalizeSwarmTask(currentTask));
        }
        currentTask = { id: trimmed.replace('TASK:', '').trim(), status: 'pending' };
      } else if (trimmed.startsWith('DESCRIPTION:')) {
        currentTask.description = trimmed.replace('DESCRIPTION:', '').trim();
      } else if (trimmed.startsWith('CREW:')) {
        currentTask.crew = trimmed.replace('CREW:', '').trim() as CrewMember;
      } else if (trimmed.startsWith('PRIORITY:')) {
        currentTask.priority = parseInt(trimmed.replace('PRIORITY:', '').trim()) || 5;
      } else if (trimmed.startsWith('COMPLEXITY:')) {
        const complexity = trimmed.replace('COMPLEXITY:', '').trim().toLowerCase();
        currentTask.estimatedComplexity = (complexity === 'low' || complexity === 'medium' || complexity === 'high') 
          ? complexity 
          : 'medium';
      } else if (trimmed.startsWith('DEPENDS_ON:')) {
        const depsStr = trimmed.replace('DEPENDS_ON:', '').trim().toLowerCase();
        currentTask.dependencies = depsStr === 'none' || depsStr === '' 
          ? [] 
          : depsStr.split(',').map(d => d.trim()).filter(d => d.length > 0);
      }
    }

    // Add last task
    if (currentTask.id && currentTask.description) {
      tasks.push(this.finalizeSwarmTask(currentTask));
    }

    return tasks;
  }

  private finalizeSwarmTask(partial: Partial<SwarmTask>): SwarmTask {
    return {
      id: partial.id || `task-${Date.now()}`,
      description: partial.description || 'Undefined task',
      crew: partial.crew || 'pilot',
      priority: partial.priority || 5,
      dependencies: partial.dependencies || [],
      estimatedComplexity: partial.estimatedComplexity || 'medium',
      status: partial.status || 'pending'
    };
  }

  private getMockSwarmTasks(task: string): SwarmTask[] {
    return [
      {
        id: 'task-1',
        description: `Setup for: ${task}`,
        crew: 'pilot',
        priority: 8,
        dependencies: [],
        estimatedComplexity: 'low',
        status: 'pending'
      },
      {
        id: 'task-2',
        description: `Core implementation for: ${task}`,
        crew: 'pilot',
        priority: 7,
        dependencies: ['task-1'],
        estimatedComplexity: 'medium',
        status: 'pending'
      },
      {
        id: 'task-3',
        description: `Tests for: ${task}`,
        crew: 'specialist',
        priority: 6,
        dependencies: ['task-2'],
        estimatedComplexity: 'medium',
        status: 'pending'
      }
    ];
  }

  private printSwarmPlan(tasks: SwarmTask[]): void {
    console.log(colors.primary('Swarm execution plan:'));
    
    // Group by dependency level
    const levels: SwarmTask[][] = [];
    const processed = new Set<string>();
    
    while (processed.size < tasks.length) {
      const currentLevel = tasks.filter(t => 
        !processed.has(t.id) && 
        t.dependencies.every(dep => processed.has(dep))
      );
      
      if (currentLevel.length === 0) break; // Circular dependency
      
      levels.push(currentLevel);
      currentLevel.forEach(t => processed.add(t.id));
    }

    levels.forEach((level, idx) => {
      console.log(colors.secondary(`\n  Wave ${idx + 1} (${level.length} tasks in parallel):`));
      level.forEach(task => {
        const priorityColor = task.priority >= 7 ? colors.error : task.priority >= 4 ? colors.warning : colors.dim;
        console.log(`    [${priorityColor(task.priority.toString())}] ${task.id}: ${task.description}`);
        console.log(`        ${colors.dim(`Crew: ${task.crew} | Complexity: ${task.estimatedComplexity}`)}`);
        if (task.dependencies.length > 0) {
          console.log(`        ${colors.dim(`Depends on: ${task.dependencies.join(', ')}`)}`);
        }
      });
    });
  }

  private getCoordinationSummary() {
    return {
      completed: this.coordinationState.completedTasks.length,
      inProgress: this.coordinationState.inProgressTasks.length,
      failed: this.coordinationState.failedTasks.length
    };
  }

  private saveCoordinationState(): void {
    const statePath = join(SWARM_DIR, 'coordination_state.json');
    writeFileSync(statePath, JSON.stringify(this.coordinationState, null, 2));
  }

  private writePromptFile(phase: Phase, prompt: string): void {
    const content = `# 🚀 ORBIT Swarm - Phase: ${phase.toUpperCase()}

## Task
${prompt}

---
*Execute this with Copilot CLI*
`;
    writeFileSync(join(STATE_DIR, 'pending_prompt.md'), content);
  }

  private writeSwarmTaskPromptFile(task: SwarmTask, prompt: string): void {
    const content = `# 🚀 ORBIT Swarm - Task: ${task.id}

## Description
${task.description}

## Crew
${task.crew}

## Dependencies
${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}

## Instructions
${prompt}

---
*Execute this with Copilot CLI*
`;
    const filename = `swarm_${task.id.replace(/[^a-z0-9]/gi, '_')}.md`;
    writeFileSync(join(SWARM_DIR, filename), content);
  }

  private initFlightLog(task: string): void {
    const logPath = join(STATE_DIR, 'flight_log.md');
    const content = `# 🛸 Flight Log
Task: ${task}
Mission: swarm
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
    if (!existsSync(SWARM_DIR)) {
      mkdirSync(SWARM_DIR, { recursive: true });
    }
  }

  private buildResult(
    task: string,
    results: SwarmTaskResult[],
    success: boolean,
    beforeCommit?: string
  ): SwarmResult {
    const afterCommit = getCurrentCommit();
    const filesChanged = getChangedFiles().length;
    const duration = Math.floor((Date.now() - this.startTime.getTime()) / 1000);

    return {
      task,
      tasks: results,
      totalDuration: duration,
      success,
      filesChanged,
      commitHash: afterCommit !== beforeCommit ? afterCommit : undefined
    };
  }
}

/**
 * Execute a swarm mission
 */
export async function runSwarm(options: SwarmOptions): Promise<SwarmResult> {
  const executor = new SwarmExecutor(options);
  return executor.execute(options.task);
}
