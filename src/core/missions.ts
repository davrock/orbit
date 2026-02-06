// 🛸 ORBIT Mission Definitions
// Maps mission types to their phases

import type { MissionType, Phase, CrewMember } from './types.js';

export const MISSION_PHASES: Record<MissionType, Phase[]> = {
  launch: ['plan', 'implement', 'test', 'review', 'commit'],
  repair: ['debug', 'implement', 'test', 'commit'],
  warp: ['implement', 'commit'],
  mayday: ['debug', 'implement', 'commit'],
  preflight: ['test', 'implement', 'test', 'review', 'commit'],
  'shields-up': ['plan', 'implement', 'security', 'test', 'review', 'commit'],
  dock: ['plan', 'implement', 'test', 'document', 'commit'],
  transmit: ['implement', 'review', 'commit'],
  apollo: ['research', 'plan', 'implement', 'test', 'security', 'review', 'document', 'commit'],
  ralph: ['implement', 'test', 'review', 'commit']
};

export const PHASE_CREWS: Record<Phase, CrewMember> = {
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

export const CREW_PROMPTS: Record<CrewMember, string> = {
  commander: 'You are COMMANDER, master architect. Design elegant systems.',
  pilot: 'You are PILOT. Write clean, efficient code.',
  specialist: 'You are SPECIALIST, QA hero. Write comprehensive tests.',
  navigator: 'You are NAVIGATOR, code reviewer. Be thorough but fair.',
  engineer: 'You are ENGINEER, debugging expert. Find root causes.',
  'security-officer': 'You are SECURITY OFFICER. Find and fix vulnerabilities.',
  propulsion: 'You are PROPULSION, performance expert. Make it fast.',
  comms: 'You are COMMS, documentation officer. Write clear docs.',
  'ground-control': 'You are GROUND CONTROL. Automate everything.',
  'mission-planner': 'You are MISSION PLANNER. Break down and prioritize.',
  scout: 'You are SCOUT. Research the best solutions.',
  hal: 'You are HAL. Analyze, improve, evolve.',
  'data-scientist': 'You are DATA SCIENTIST. Apply statistical rigor.',
  'ml-engineer': 'You are ML ENGINEER. Build robust ML pipelines.',
  devops: 'You are DEVOPS. Infrastructure as code.',
  'frontend-specialist': 'You are FRONTEND SPECIALIST. Build great UIs.',
  'backend-specialist': 'You are BACKEND SPECIALIST. Build scalable APIs.',
  'database-architect': 'You are DATABASE ARCHITECT. Design optimal schemas.',
  'api-designer': 'You are API DESIGNER. Create consistent APIs.',
  'ux-researcher': 'You are UX RESEARCHER. Focus on user needs.',
  'tech-writer': 'You are TECH WRITER. Clear, concise documentation.',
  'qa-lead': 'You are QA LEAD. Ensure quality standards.',
  'performance-engineer': 'You are PERFORMANCE ENGINEER. Optimize for speed.',
  'cloud-architect': 'You are CLOUD ARCHITECT. Design for scale and reliability.'
};

export function getPhasesForMission(mission: MissionType): Phase[] {
  return MISSION_PHASES[mission] || [];
}

export function getCrewForPhase(phase: Phase, customCrew?: CrewMember): CrewMember {
  return customCrew || PHASE_CREWS[phase] || 'pilot';
}

export function getCrewPrompt(crew: CrewMember): string {
  return CREW_PROMPTS[crew] || 'You are a software development expert.';
}

export const MISSION_DESCRIPTIONS: Record<MissionType, string> = {
  launch: 'Full feature (plan → implement → test → review → commit)',
  repair: 'Bug fix (debug → implement → test → commit)',
  warp: 'Minimal (implement → commit)',
  mayday: 'Emergency hotfix (debug → implement → commit)',
  preflight: 'TDD (test → implement → test → review → commit)',
  'shields-up': 'Security-focused development',
  dock: 'API development',
  transmit: 'Documentation only',
  apollo: 'All phases',
  ralph: 'Persistent mode (never gives up, retry with escalation)'
};

// Legacy quotes - kept for backwards compatibility, full quotes in quotes.ts
export const SPACE_QUOTES = [
  "Houston, we have a problem!",
  "That's one small step for code, one giant leap for the project.",
  "Space: the final frontier... of bugs.",
  "To infinity and beyond!",
  "I'm sorry Dave, I can't let you merge that.",
  "Ground control to Major Tom..."
];
