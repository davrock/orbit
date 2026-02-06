// 🛸 ORBIT Runtime Validation
// Type-safe validation using Zod for critical inputs

import { z } from 'zod';

// Define schemas for core types
export const modelTierSchema = z.enum(['premium', 'standard', 'fast', 'ecomode']);

export const missionTypeSchema = z.enum([
  'launch', 'repair', 'warp', 'mayday', 'preflight',
  'shields-up', 'dock', 'transmit', 'apollo', 'ralph',
  'ultrawork', 'swarm', 'pipeline', 'design-review'
]);

export const phaseSchema = z.enum([
  'plan', 'implement', 'test', 'review', 'debug',
  'commit', 'security', 'document', 'research'
]);

export const crewMemberSchema = z.enum([
  'commander', 'pilot', 'engineer', 'navigator', 'specialist',
  'security-officer', 'propulsion', 'comms', 'ground-control',
  'mission-planner', 'scout', 'hal', 'data-scientist', 'ml-engineer',
  'devops', 'frontend-specialist', 'backend-specialist',
  'database-architect', 'api-designer', 'ux-researcher',
  'tech-writer', 'qa-lead', 'performance-engineer',
  'cloud-architect', 'design-reviewer'
]);

export const techStackSchema = z.enum([
  'node', 'typescript', 'react', 'nextjs', 'vue', 'nuxt',
  'svelte', 'angular', 'expo', 'react-native', 'python',
  'django', 'fastapi', 'flask', 'go', 'rust', 'java',
  'kotlin', 'spring', 'gradle', 'maven', 'android', 'ruby',
  'rails', 'php', 'laravel', 'symfony', 'dotnet', 'fsharp',
  'c', 'cpp', 'cmake', 'elixir', 'swift', 'ios',
  'terraform', 'docker', 'unknown'
]);

// Validation functions with helpful error messages
export function validateModelTier(value: unknown): asserts value is z.infer<typeof modelTierSchema> {
  const result = modelTierSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `Invalid model tier: "${value}". Must be one of: premium, standard, fast, ecomode`
    );
  }
}

export function validateMissionType(value: unknown): asserts value is z.infer<typeof missionTypeSchema> {
  const result = missionTypeSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `Invalid mission type: "${value}". Use 'orbit --help' to see available mission types.`
    );
  }
}

export function validatePhase(value: unknown): asserts value is z.infer<typeof phaseSchema> {
  const result = phaseSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `Invalid phase: "${value}". Must be one of: plan, implement, test, review, debug, commit, security, document, research`
    );
  }
}

export function validateCrewMember(value: unknown): asserts value is z.infer<typeof crewMemberSchema> {
  const result = crewMemberSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `Invalid crew member: "${value}". Check crew.yaml for valid crew members.`
    );
  }
}

// Safe parsing (returns undefined instead of throwing)
export function safeParseModelTier(value: unknown): z.infer<typeof modelTierSchema> | undefined {
  const result = modelTierSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

export function safeParseMissionType(value: unknown): z.infer<typeof missionTypeSchema> | undefined {
  const result = missionTypeSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

export function safeParsePhase(value: unknown): z.infer<typeof phaseSchema> | undefined {
  const result = phaseSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

export function safeParseCrewMember(value: unknown): z.infer<typeof crewMemberSchema> | undefined {
  const result = crewMemberSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

// Utility to check if a value is valid without throwing
export function isValidModelTier(value: unknown): boolean {
  return modelTierSchema.safeParse(value).success;
}

export function isValidMissionType(value: unknown): boolean {
  return missionTypeSchema.safeParse(value).success;
}

export function isValidPhase(value: unknown): boolean {
  return phaseSchema.safeParse(value).success;
}

export function isValidCrewMember(value: unknown): boolean {
  return crewMemberSchema.safeParse(value).success;
}
