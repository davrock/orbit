// 🛸 ORBIT Agent Loader
// Loads agent definitions from YAML files

import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml } from 'yaml';
import type { Agent, AgentYaml, ModelPreference } from './types.js';
import type { Phase, CrewMember } from '../core/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to agent definitions
const DEFINITIONS_DIR = join(__dirname, 'definitions');

// Cache for loaded agents
let agentCache: Map<string, Agent> | null = null;

/**
 * Transform YAML structure to Agent interface
 */
function transformYamlToAgent(yaml: AgentYaml): Agent {
  return {
    id: yaml.id,
    name: yaml.name,
    role: yaml.role,
    systemPrompt: yaml.system_prompt,
    capabilities: yaml.capabilities || [],
    preferredPhases: (yaml.preferred_phases || []) as Phase[],
    modelPreference: (yaml.model_preference || 'standard') as ModelPreference
  };
}

/**
 * Load a single agent from YAML file
 */
function loadAgentFromFile(filePath: string): Agent | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const yaml = parseYaml(content) as AgentYaml;
    return transformYamlToAgent(yaml);
  } catch (error) {
    console.warn(`Warning: Failed to load agent from ${filePath}:`, error);
    return null;
  }
}

/**
 * Load all agents from the definitions directory
 */
export function loadAllAgents(): Map<string, Agent> {
  if (agentCache) {
    return agentCache;
  }

  agentCache = new Map();

  try {
    const files = readdirSync(DEFINITIONS_DIR);
    
    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        const filePath = join(DEFINITIONS_DIR, file);
        const agent = loadAgentFromFile(filePath);
        if (agent) {
          agentCache.set(agent.id, agent);
        }
      }
    }
  } catch (error) {
    console.warn('Warning: Could not load agent definitions:', error);
  }

  return agentCache;
}

/**
 * Get an agent by ID
 */
export function getAgent(agentId: string): Agent | undefined {
  const agents = loadAllAgents();
  return agents.get(agentId);
}

/**
 * Get agent by crew member ID (for backward compatibility)
 */
export function getAgentByCrewId(crewId: CrewMember): Agent | undefined {
  return getAgent(crewId);
}

/**
 * Get the system prompt for an agent
 */
export function getAgentSystemPrompt(crewId: CrewMember): string {
  const agent = getAgent(crewId);
  if (agent) {
    return agent.systemPrompt;
  }
  // Fallback for unknown agents
  return `You are ${crewId}, a software development expert. Complete the assigned task professionally.`;
}

/**
 * Get agents suited for a specific phase
 */
export function getAgentsForPhase(phase: Phase): Agent[] {
  const agents = loadAllAgents();
  return Array.from(agents.values()).filter(agent =>
    agent.preferredPhases.includes(phase)
  );
}

/**
 * Get agents with a specific capability
 */
export function getAgentsWithCapability(capability: string): Agent[] {
  const agents = loadAllAgents();
  return Array.from(agents.values()).filter(agent =>
    agent.capabilities.includes(capability)
  );
}

/**
 * List all available agents
 */
export function listAgents(): Agent[] {
  const agents = loadAllAgents();
  return Array.from(agents.values());
}

/**
 * Get all agent IDs
 */
export function getAgentIds(): string[] {
  const agents = loadAllAgents();
  return Array.from(agents.keys());
}

/**
 * Clear the agent cache (useful for testing or reloading)
 */
export function clearAgentCache(): void {
  agentCache = null;
}

/**
 * Reload all agents from disk
 */
export function reloadAgents(): Map<string, Agent> {
  clearAgentCache();
  return loadAllAgents();
}
