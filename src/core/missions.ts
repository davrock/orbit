// 🛸 ORBIT Mission Definitions
// Re-exports from workflow loader for backward compatibility

import type { MissionType, Phase, CrewMember } from './types.js';
import { 
  getPhasesForMission as getPhases,
  getCrewForPhase as getCrew,
  getWorkflowDescription,
  listWorkflows
} from '../workflows/loader.js';
import { getAgentSystemPrompt } from '../agents/index.js';

// Re-export for backward compatibility
export { getPhasesForMission, getCrewForPhase } from '../workflows/loader.js';

/**
 * Get crew prompt (uses agent system prompts)
 */
export function getCrewPrompt(crew: CrewMember): string {
  return getAgentSystemPrompt(crew);
}

/**
 * Get mission descriptions from loaded workflows
 */
export function getMissionDescriptions(): Record<MissionType, string> {
  const workflows = listWorkflows();
  const descriptions: Record<string, string> = {};
  
  for (const workflow of workflows) {
    descriptions[workflow.id] = workflow.description;
  }
  
  return descriptions as Record<MissionType, string>;
}

/**
 * Legacy MISSION_DESCRIPTIONS - now dynamically loaded
 */
export const MISSION_DESCRIPTIONS = getMissionDescriptions();

// Legacy quotes - kept for backwards compatibility, full quotes in quotes.ts
export const SPACE_QUOTES = [
  "Houston, we have a problem!",
  "That's one small step for code, one giant leap for the project.",
  "Space: the final frontier... of bugs.",
  "To infinity and beyond!",
  "I'm sorry Dave, I can't let you merge that.",
  "Ground control to Major Tom..."
];
