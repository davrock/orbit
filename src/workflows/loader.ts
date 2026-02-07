// 🛸 ORBIT Workflow Loader
// Loads workflow/mission definitions from YAML files

import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import type { Workflow, WorkflowYaml } from './types.js';
import type { Phase, CrewMember, ModelTier, MissionType } from '../core/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to workflow definitions
const DEFINITIONS_DIR = join(__dirname, 'definitions');

// Cache for loaded workflows
let workflowCache: Map<string, Workflow> | null = null;

// Default phase crews (fallback)
const DEFAULT_PHASE_CREWS: Record<Phase, CrewMember> = {
  plan: 'mission-planner',
  implement: 'pilot',
  test: 'specialist',
  review: 'navigator',
  debug: 'engineer',
  commit: 'pilot',
  security: 'security-officer',
  document: 'comms',
  research: 'scout'
};

// Default phase models (fallback)
const DEFAULT_PHASE_MODELS: Record<Phase, ModelTier> = {
  plan: 'standard',
  implement: 'standard',
  test: 'standard',
  review: 'standard',
  debug: 'premium',
  commit: 'fast',
  security: 'premium',
  document: 'fast',
  research: 'standard'
};

/**
 * Transform YAML structure to Workflow interface
 */
function transformYamlToWorkflow(yaml: WorkflowYaml): Workflow {
  return {
    id: yaml.id,
    name: yaml.name,
    description: yaml.description,
    icon: yaml.icon || '🚀',
    phases: (yaml.phases || []) as Phase[],
    phaseCrews: (yaml.phase_crews || {}) as Partial<Record<Phase, CrewMember>>,
    phaseModels: (yaml.phase_models || {}) as Partial<Record<Phase, ModelTier>>,
    useWhen: yaml.use_when || [],
    estimatedTime: yaml.estimated_time || 30,
    tags: yaml.tags || [],
    
    // Special behavior flags
    persistenceMode: yaml.persistence_mode,
    maxRetries: yaml.max_retries,
    escalateOnFailure: yaml.escalate_on_failure,
    parallelMode: yaml.parallel_mode,
    maxParallelTasks: yaml.max_parallel_tasks,
    swarmMode: yaml.swarm_mode,
    maxSwarmAgents: yaml.max_swarm_agents,
    coordinationEnabled: yaml.coordination_enabled,
    pipelineMode: yaml.pipeline_mode,
    stageHandoffs: yaml.stage_handoffs,
    crossValidation: yaml.cross_validation,
    externalAiEnabled: yaml.external_ai_enabled
  };
}

/**
 * Load a single workflow from YAML file
 */
function loadWorkflowFromFile(filePath: string): Workflow | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const yaml = parseYaml(content) as WorkflowYaml;
    return transformYamlToWorkflow(yaml);
  } catch (error) {
    console.warn(`Warning: Failed to load workflow from ${filePath}:`, error);
    return null;
  }
}

/**
 * Load all workflows from the definitions directory
 */
export function loadAllWorkflows(): Map<string, Workflow> {
  if (workflowCache) {
    return workflowCache;
  }

  workflowCache = new Map();

  try {
    const files = readdirSync(DEFINITIONS_DIR);
    
    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        const filePath = join(DEFINITIONS_DIR, file);
        const workflow = loadWorkflowFromFile(filePath);
        if (workflow) {
          workflowCache.set(workflow.id, workflow);
        }
      }
    }
  } catch (error) {
    console.warn('Warning: Could not load workflow definitions:', error);
  }

  return workflowCache;
}

/**
 * Get a workflow by ID
 */
export function getWorkflow(workflowId: string): Workflow | undefined {
  const workflows = loadAllWorkflows();
  return workflows.get(workflowId);
}

/**
 * Get phases for a mission type (backward compatible)
 */
export function getPhasesForMission(mission: MissionType): Phase[] {
  const workflow = getWorkflow(mission);
  return workflow?.phases || [];
}

/**
 * Get crew for a phase, with workflow-specific overrides
 * Signature: getCrewForPhase(phase, customCrew?) for backward compatibility
 * Or: getCrewForPhase(phase, mission, customCrew) for workflow-aware selection
 */
export function getCrewForPhase(
  phase: Phase, 
  missionOrCustomCrew?: MissionType | CrewMember, 
  customCrew?: CrewMember
): CrewMember {
  // Handle backward compatible signature: getCrewForPhase(phase, customCrew)
  let mission: MissionType | undefined;
  let crew: CrewMember | undefined;
  
  if (missionOrCustomCrew) {
    // Check if second arg is a mission type or crew member
    const workflows = loadAllWorkflows();
    if (workflows.has(missionOrCustomCrew)) {
      mission = missionOrCustomCrew as MissionType;
      crew = customCrew;
    } else {
      // It's a custom crew (backward compat)
      crew = missionOrCustomCrew as CrewMember;
    }
  }
  
  if (crew) return crew;
  
  if (mission) {
    const workflow = getWorkflow(mission);
    if (workflow?.phaseCrews[phase]) {
      return workflow.phaseCrews[phase]!;
    }
  }
  
  return DEFAULT_PHASE_CREWS[phase] || 'pilot';
}

/**
 * Get model tier for a phase, with workflow-specific overrides
 */
export function getModelForPhase(phase: Phase, mission?: MissionType): ModelTier {
  if (mission) {
    const workflow = getWorkflow(mission);
    if (workflow?.phaseModels[phase]) {
      return workflow.phaseModels[phase]!;
    }
  }
  
  return DEFAULT_PHASE_MODELS[phase] || 'standard';
}

/**
 * Get workflow description
 */
export function getWorkflowDescription(workflowId: string): string {
  const workflow = getWorkflow(workflowId);
  return workflow?.description || '';
}

/**
 * List all available workflows
 */
export function listWorkflows(): Workflow[] {
  const workflows = loadAllWorkflows();
  return Array.from(workflows.values());
}

/**
 * Get all workflow IDs
 */
export function getWorkflowIds(): string[] {
  const workflows = loadAllWorkflows();
  return Array.from(workflows.keys());
}

/**
 * Get workflows by tag
 */
export function getWorkflowsByTag(tag: string): Workflow[] {
  const workflows = loadAllWorkflows();
  return Array.from(workflows.values()).filter(w => w.tags.includes(tag));
}

/**
 * Clear the workflow cache (useful for testing or reloading)
 */
export function clearWorkflowCache(): void {
  workflowCache = null;
}

/**
 * Reload all workflows from disk
 */
export function reloadWorkflows(): Map<string, Workflow> {
  clearWorkflowCache();
  return loadAllWorkflows();
}

/**
 * Check if a workflow has special mode enabled
 */
export function hasSpecialMode(workflowId: string): {
  persistence: boolean;
  parallel: boolean;
  swarm: boolean;
  pipeline: boolean;
  crossValidation: boolean;
} {
  const workflow = getWorkflow(workflowId);
  return {
    persistence: workflow?.persistenceMode || false,
    parallel: workflow?.parallelMode || false,
    swarm: workflow?.swarmMode || false,
    pipeline: workflow?.pipelineMode || false,
    crossValidation: workflow?.crossValidation || false
  };
}
