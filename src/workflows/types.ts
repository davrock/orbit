// 🛸 ORBIT Workflow Types
// Type definitions for workflow/mission configuration

import type { Phase, CrewMember, ModelTier } from '../core/types.js';

/**
 * Workflow/Mission configuration loaded from YAML
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  phases: Phase[];
  phaseCrews: Partial<Record<Phase, CrewMember>>;
  phaseModels: Partial<Record<Phase, ModelTier>>;
  useWhen: string[];
  estimatedTime: number;
  tags: string[];
  
  // Special behavior flags
  persistenceMode?: boolean;
  maxRetries?: number;
  escalateOnFailure?: boolean;
  parallelMode?: boolean;
  maxParallelTasks?: number;
  swarmMode?: boolean;
  maxSwarmAgents?: number;
  coordinationEnabled?: boolean;
  pipelineMode?: boolean;
  stageHandoffs?: boolean;
  crossValidation?: boolean;
  externalAiEnabled?: boolean;
}

/**
 * Raw YAML structure before transformation
 */
export interface WorkflowYaml {
  id: string;
  name: string;
  description: string;
  icon: string;
  phases: string[];
  phase_crews?: Record<string, string>;
  phase_models?: Record<string, string>;
  use_when?: string[];
  estimated_time?: number;
  tags?: string[];
  
  // Special behavior flags
  persistence_mode?: boolean;
  max_retries?: number;
  escalate_on_failure?: boolean;
  parallel_mode?: boolean;
  max_parallel_tasks?: number;
  swarm_mode?: boolean;
  max_swarm_agents?: number;
  coordination_enabled?: boolean;
  pipeline_mode?: boolean;
  stage_handoffs?: boolean;
  cross_validation?: boolean;
  external_ai_enabled?: boolean;
}
