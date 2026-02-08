// 🛸 ORBIT Model Selector
// Smart LLM tier selection based on task complexity

import type { ModelTier, Phase, CrewMember } from './types.js';
import { safeParseModelTier } from './validation.js';

interface ModelConfig {
  premiumKeywords: string[];
  fastKeywords: string[];
  phaseTiers: Record<Phase, ModelTier>;
  crewTiers: Record<CrewMember, ModelTier>;
  ecomodeTiers: Record<Phase, ModelTier>;
  ecamodeCrewTiers: Record<CrewMember, ModelTier>;
  costMultipliers: Record<ModelTier, number>;
}

const config: ModelConfig = {
  premiumKeywords: [
    'security', 'vulnerability', 'exploit', 'breach', 'architecture',
    'redesign', 'migration', 'critical', 'production', 'audit',
    'penetration', 'compliance', 'gdpr', 'pii', 'encryption'
  ],
  fastKeywords: [
    'typo', 'rename', 'comment', 'format', 'simple', 'minor',
    'docs', 'trivial', 'readme', 'spelling', 'whitespace', 'changelog', 'license'
  ],
  phaseTiers: {
    plan: 'standard',
    implement: 'standard',
    test: 'standard',
    review: 'standard',
    debug: 'standard',
    security: 'premium',
    document: 'fast',
    commit: 'fast',
    research: 'standard',
    improve: 'standard'
  },
  crewTiers: {
    commander: 'premium',
    'security-officer': 'premium',
    'database-architect': 'premium',
    'cloud-architect': 'premium',
    pilot: 'standard',
    engineer: 'standard',
    navigator: 'standard',
    specialist: 'standard',
    'mission-planner': 'standard',
    scout: 'standard',
    'ground-control': 'standard',
    hal: 'standard',
    'data-scientist': 'standard',
    'ml-engineer': 'standard',
    devops: 'standard',
    'frontend-specialist': 'standard',
    'backend-specialist': 'standard',
    'api-designer': 'standard',
    'ux-researcher': 'standard',
    'qa-lead': 'standard',
    'performance-engineer': 'standard',
    propulsion: 'standard',
    comms: 'fast',
    'tech-writer': 'fast',
    'design-reviewer': 'standard'
  },
  ecomodeTiers: {
    plan: 'fast',
    implement: 'standard',
    test: 'fast',
    review: 'fast',
    debug: 'standard',
    security: 'standard',
    document: 'fast',
    commit: 'fast',
    research: 'fast',
    improve: 'fast'
  },
  ecamodeCrewTiers: {
    commander: 'standard',
    'security-officer': 'standard',
    'database-architect': 'standard',
    'cloud-architect': 'standard',
    pilot: 'standard',
    engineer: 'standard',
    navigator: 'fast',
    specialist: 'fast',
    'mission-planner': 'fast',
    scout: 'fast',
    'ground-control': 'fast',
    hal: 'standard',
    'data-scientist': 'standard',
    'ml-engineer': 'standard',
    devops: 'fast',
    'frontend-specialist': 'standard',
    'backend-specialist': 'standard',
    'api-designer': 'fast',
    'ux-researcher': 'fast',
    'qa-lead': 'fast',
    'performance-engineer': 'standard',
    propulsion: 'standard',
    comms: 'fast',
    'tech-writer': 'fast',
    'design-reviewer': 'fast'
  },
  costMultipliers: {
    premium: 3.0,
    standard: 1.0,
    fast: 0.5,
    ecomode: 0.6
  }
};

export function selectModelTier(
  task: string,
  phase?: Phase,
  crew?: CrewMember,
  override?: ModelTier
): ModelTier {
  // Explicit override takes precedence
  if (override && override !== 'standard') {
    // Validate the override is a valid ModelTier
    const validOverride = safeParseModelTier(override);
    if (!validOverride) {
      console.warn(`Invalid model tier override: "${override}". Falling back to standard.`);
      return 'standard';
    }
    
    // Ecomode is a special mode that uses its own tier mapping
    if (validOverride === 'ecomode') {
      return selectEcomodeTier(task, phase, crew);
    }
    return validOverride;
  }

  const taskLower = task.toLowerCase();

  // Keyword-based detection
  if (config.premiumKeywords.some(kw => taskLower.includes(kw))) {
    return 'premium';
  }
  if (config.fastKeywords.some(kw => taskLower.includes(kw))) {
    return 'fast';
  }

  // Crew-based selection
  if (crew && config.crewTiers[crew]) {
    return config.crewTiers[crew];
  }

  // Phase-based selection
  if (phase && config.phaseTiers[phase]) {
    return config.phaseTiers[phase];
  }

  return 'standard';
}

function selectEcomodeTier(
  task: string,
  phase?: Phase,
  crew?: CrewMember
): ModelTier {
  const taskLower = task.toLowerCase();

  // In ecomode, only use premium for truly critical security keywords
  const criticalSecurityKeywords = ['vulnerability', 'exploit', 'breach', 'penetration'];
  if (criticalSecurityKeywords.some(kw => taskLower.includes(kw))) {
    return 'premium';
  }

  // Otherwise use fast for most operations
  if (config.fastKeywords.some(kw => taskLower.includes(kw))) {
    return 'fast';
  }

  // Crew-based selection in ecomode
  if (crew && config.ecamodeCrewTiers[crew]) {
    return config.ecamodeCrewTiers[crew];
  }

  // Phase-based selection in ecomode
  if (phase && config.ecomodeTiers[phase]) {
    return config.ecomodeTiers[phase];
  }

  return 'fast';
}

export function getModelIcon(tier: ModelTier): string {
  switch (tier) {
    case 'premium': return '🔥';
    case 'fast': return '💨';
    case 'ecomode': return '🌱';
    default: return '⚡';
  }
}

/**
 * Map a model tier to the actual Copilot CLI model name.
 * Returns undefined to use the Copilot CLI default model.
 */
export function getModelForTier(tier: ModelTier): string | undefined {
  switch (tier) {
    case 'premium': return 'claude-sonnet-4.5';
    case 'standard': return 'claude-sonnet-4';
    case 'fast': return 'claude-haiku-4.5';
    case 'ecomode': return 'claude-haiku-4.5';
  }
}

export function getCostMultiplier(tier: ModelTier): number {
  return config.costMultipliers[tier];
}

export function escalateTier(current: ModelTier): ModelTier {
  switch (current) {
    case 'fast': return 'standard';
    case 'ecomode': return 'standard';
    case 'standard': return 'premium';
    case 'premium': return 'premium'; // Can't escalate further
  }
}

export function estimateCost(phases: Phase[], task: string): number {
  let total = 0;
  for (const phase of phases) {
    const tier = selectModelTier(task, phase);
    total += getCostMultiplier(tier);
  }
  return total;
}
