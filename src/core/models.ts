// 🛸 ORBIT Model Selector
// Smart LLM tier selection based on task complexity

import type { ModelTier, Phase, CrewMember } from './types.js';

interface ModelConfig {
  premiumKeywords: string[];
  fastKeywords: string[];
  phaseTiers: Record<Phase, ModelTier>;
  crewTiers: Record<CrewMember, ModelTier>;
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
    research: 'standard'
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
    'tech-writer': 'fast'
  },
  costMultipliers: {
    premium: 3.0,
    standard: 1.0,
    fast: 0.5
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
    return override;
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

export function getModelIcon(tier: ModelTier): string {
  switch (tier) {
    case 'premium': return '🔥';
    case 'fast': return '💨';
    default: return '⚡';
  }
}

export function getCostMultiplier(tier: ModelTier): number {
  return config.costMultipliers[tier];
}

export function escalateTier(current: ModelTier): ModelTier {
  switch (current) {
    case 'fast': return 'standard';
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
