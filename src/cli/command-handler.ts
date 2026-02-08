// 🛸 ORBIT CLI Command Handler
// Eliminates duplication in command actions

import {
  runMission,
  runUltrawork,
  runSwarm,
  runPipeline,
  createFlightPlan,
  runPlanMode
} from '../workflows/index.js';
import { detectMagicKeywords } from '../core/index.js';
import { printWarning, colors } from '../utils/output.js';
import type { MissionType, CrewMember } from '../core/types.js';

interface CommandOptions {
  dryRun?: boolean;
  plan?: boolean;
  premium?: boolean;
  economy?: boolean;
  ecomode?: boolean;
  interactive?: boolean;
  crew?: CrewMember;
  crossValidate?: boolean;
  consistencyCheck?: boolean;
  concurrency?: string;
  coordination?: boolean;
}

interface MissionOptions {
  mission: MissionType;
  task: string;
  dryRun?: boolean;
  interactive?: boolean;
  modelTier?: 'auto' | 'premium' | 'fast' | 'ecomode';
  customCrew?: CrewMember;
  enableCrossValidation?: boolean;
  enableConsistencyCheck?: boolean;
}

export async function handleMissionCommand(
  mission: MissionType,
  task: string,
  options: CommandOptions
): Promise<void> {
  try {
    // Handle plan mode if requested
    if (options.plan) {
      await runPlanMode({ task, dryRun: options.dryRun });
      console.log('');
      console.log(colors.secondary('Requirements gathered. Proceeding with mission...'));
      console.log('');
    }

    const detected = detectMagicKeywords(task);

    // Handle flight plan creation
    if (detected.shouldCreatePlan) {
      printWarning('🔮 Magic keyword detected: creating flight plan first');
      await createFlightPlan(detected.cleanedTask, { depth: 2 });
      console.log(colors.secondary('Flight plan created. Run the task without "plan" keyword to execute.'));
      return;
    }

    // Determine model tier
    const modelTier = determineModelTier(options, detected.modelTier);

    // Handle mission override
    if (detected.mission === 'ralph') {
      printWarning(`🔮 Magic keyword detected: switching to 'ralph' mode`);
      await runMission({
        mission: 'ralph',
        task: detected.cleanedTask,
        dryRun: options.dryRun,
        modelTier,
        enableCrossValidation: options.crossValidate,
        enableConsistencyCheck: options.consistencyCheck
      });
      return;
    }

    if (detected.mission === 'ultrawork') {
      printWarning(`🔮 Magic keyword detected: switching to 'ultrawork' mode`);
      await runUltrawork({
        task: detected.cleanedTask,
        dryRun: options.dryRun,
        maxConcurrency: 4,
        modelTier
      });
      return;
    }

    // Execute normal mission
    const missionOptions: MissionOptions = {
      mission,
      task: detected.cleanedTask,
      dryRun: options.dryRun,
      modelTier
    };

    if (options.interactive !== undefined) {
      missionOptions.interactive = options.interactive;
    }
    if (options.crew) {
      missionOptions.customCrew = options.crew;
    }
    if (options.crossValidate !== undefined) {
      missionOptions.enableCrossValidation = options.crossValidate;
    }
    if (options.consistencyCheck !== undefined) {
      missionOptions.enableConsistencyCheck = options.consistencyCheck;
    }

    await runMission(missionOptions);
  } catch (error) {
    printWarning(`Mission command failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function determineModelTier(
  options: CommandOptions,
  detectedTier?: 'auto' | 'premium' | 'fast' | 'ecomode'
): 'auto' | 'premium' | 'fast' | 'ecomode' {
  if (options.premium) return 'premium';
  if (options.economy) return 'fast';
  if (options.ecomode) return 'ecomode';
  if (detectedTier) return detectedTier;
  return 'auto';
}

interface WorkflowParams {
  task: string;
  dryRun?: boolean;
  modelTier?: 'auto' | 'premium' | 'standard' | 'fast' | 'ecomode';
  [key: string]: unknown;
}

export async function handleParallelCommand(
  task: string,
  options: CommandOptions,
  workflowFn: (params: WorkflowParams) => Promise<unknown>,
  workflowParams: Record<string, unknown> = {}
): Promise<void> {
  try {
    const detected = detectMagicKeywords(task);
    
    if (detected.shouldCreatePlan) {
      printWarning('🔮 Magic keyword detected: creating flight plan first');
      await createFlightPlan(detected.cleanedTask, { depth: 2 });
      console.log(colors.secondary('Flight plan created. Run the task without "plan" keyword to execute.'));
      return;
    }
    
    const modelTier = determineModelTier(options, detected.modelTier);
    
    await workflowFn({
      task: detected.cleanedTask,
      dryRun: options.dryRun,
      modelTier,
      ...workflowParams
    });
  } catch (error) {
    printWarning(`Parallel command failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
