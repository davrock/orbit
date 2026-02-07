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

// Generic validation factory functions
function createValidator<T extends z.ZodSchema>(
  schema: T,
  errorMessage: string
): (value: unknown) => asserts value is z.infer<T> {
  return (value: unknown): asserts value is z.infer<T> => {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new Error(errorMessage.replace('{value}', String(value)));
    }
  };
}

function createSafeParser<T extends z.ZodSchema>(
  schema: T
): (value: unknown) => z.infer<T> | undefined {
  return (value: unknown): z.infer<T> | undefined => {
    const result = schema.safeParse(value);
    return result.success ? result.data : undefined;
  };
}

function createIsValid<T extends z.ZodSchema>(
  schema: T
): (value: unknown) => boolean {
  return (value: unknown): boolean => {
    return schema.safeParse(value).success;
  };
}

// Validation functions with helpful error messages
export const validateModelTier = createValidator(
  modelTierSchema,
  'Invalid model tier: "{value}". Must be one of: premium, standard, fast, ecomode'
);

export const validateMissionType = createValidator(
  missionTypeSchema,
  'Invalid mission type: "{value}". Use \'orbit --help\' to see available mission types.'
);

export const validatePhase = createValidator(
  phaseSchema,
  'Invalid phase: "{value}". Must be one of: plan, implement, test, review, debug, commit, security, document, research'
);

export const validateCrewMember = createValidator(
  crewMemberSchema,
  'Invalid crew member: "{value}". Check crew.yaml for valid crew members.'
);

// Safe parsing (returns undefined instead of throwing)
export const safeParseModelTier = createSafeParser(modelTierSchema);
export const safeParseMissionType = createSafeParser(missionTypeSchema);
export const safeParsePhase = createSafeParser(phaseSchema);
export const safeParseCrewMember = createSafeParser(crewMemberSchema);

// Utility to check if a value is valid without throwing
export const isValidModelTier = createIsValid(modelTierSchema);
export const isValidMissionType = createIsValid(missionTypeSchema);
export const isValidPhase = createIsValid(phaseSchema);
export const isValidCrewMember = createIsValid(crewMemberSchema);
