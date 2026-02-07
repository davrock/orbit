// 🛸 ORBIT Agent Types
// Type definitions for agent configuration

import type { Phase } from '../core/types.js';

/**
 * Model preference for agent tasks
 */
export type ModelPreference = 'premium' | 'standard' | 'fast';

/**
 * Agent configuration loaded from YAML
 */
export interface Agent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  capabilities: string[];
  preferredPhases: Phase[];
  modelPreference: ModelPreference;
}

/**
 * Raw YAML structure before transformation
 */
export interface AgentYaml {
  id: string;
  name: string;
  role: string;
  system_prompt: string;
  capabilities: string[];
  preferred_phases: string[];
  model_preference: string;
}
