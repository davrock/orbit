// 🔄 ORBIT Persistence Mode - Ralph Never Gives Up
// Retry with escalation and different approaches until task is verified complete

import type { Phase, ModelTier, CrewMember, PhaseResult } from './types.js';
import { colors } from '../utils/output.js';

export interface PersistenceConfig {
  maxAttempts: number;
  escalateTierAfter: number;
  changeCrewAfter: number;
  changeApproachAfter: number;
  verificationAttempts: number;
}

export interface PersistenceState {
  attempt: number;
  totalAttempts: number;
  lastError?: string;
  escalationLevel: number;
  approachVariant: number;
}

const DEFAULT_CONFIG: PersistenceConfig = {
  maxAttempts: 10,
  escalateTierAfter: 2,
  changeCrewAfter: 4,
  changeApproachAfter: 3,
  verificationAttempts: 2
};

export class PersistenceManager {
  private config: PersistenceConfig;
  private state: PersistenceState;

  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      attempt: 0,
      totalAttempts: 0,
      escalationLevel: 0,
      approachVariant: 0
    };
  }

  shouldRetry(): boolean {
    return this.state.totalAttempts < this.config.maxAttempts;
  }

  recordAttempt(success: boolean, error?: string): void {
    this.state.totalAttempts++;
    if (!success) {
      this.state.attempt++;
      this.state.lastError = error;
    } else {
      this.state.attempt = 0;
    }
  }

  shouldEscalateTier(): boolean {
    return this.state.attempt > 0 && this.state.attempt % this.config.escalateTierAfter === 0;
  }

  shouldChangeCrew(): boolean {
    return this.state.attempt > 0 && this.state.attempt % this.config.changeCrewAfter === 0;
  }

  shouldChangeApproach(): boolean {
    return this.state.attempt > 0 && this.state.attempt % this.config.changeApproachAfter === 0;
  }

  getEscalatedTier(currentTier: ModelTier): ModelTier {
    if (this.shouldEscalateTier()) {
      if (currentTier === 'fast') return 'standard';
      if (currentTier === 'standard') return 'premium';
    }
    return currentTier;
  }

  getAlternativeCrew(phase: Phase, currentCrew: CrewMember): CrewMember {
    const crewRotations: Record<Phase, CrewMember[]> = {
      plan: ['mission-planner', 'commander', 'scout'],
      implement: ['pilot', 'engineer', 'backend-specialist', 'frontend-specialist'],
      test: ['specialist', 'qa-lead', 'engineer'],
      review: ['navigator', 'commander', 'pilot'],
      debug: ['engineer', 'pilot', 'specialist'],
      commit: ['pilot', 'navigator'],
      security: ['security-officer', 'engineer'],
      document: ['comms', 'tech-writer'],
      research: ['scout', 'commander', 'mission-planner']
    };

    const crews = crewRotations[phase] || [currentCrew];
    const currentIndex = crews.indexOf(currentCrew);
    const nextIndex = (currentIndex + 1) % crews.length;
    return crews[nextIndex];
  }

  getApproachInstructions(phase: Phase): string {
    const variant = this.state.approachVariant % 3;
    this.state.approachVariant++;

    const approaches: Record<Phase, string[]> = {
      implement: [
        'Take a straightforward, minimal approach. Focus on the simplest solution that works.',
        'Try a different architectural approach. Consider alternative patterns or libraries.',
        'Break down into smaller incremental changes. Implement piece by piece.'
      ],
      test: [
        'Write comprehensive tests covering all edge cases.',
        'Focus on integration tests that verify the feature works end-to-end.',
        'Add property-based or fuzzing tests to find unexpected behaviors.'
      ],
      review: [
        'Review for correctness and adherence to requirements.',
        'Review for edge cases, error handling, and robustness.',
        'Review for code quality, maintainability, and best practices.'
      ],
      debug: [
        'Reproduce the issue systematically and narrow down the root cause.',
        'Add comprehensive logging and debug output to understand the failure.',
        'Try a completely different debugging strategy - check assumptions.'
      ],
      plan: [
        'Create a detailed implementation plan with clear steps.',
        'Focus on identifying risks and edge cases upfront.',
        'Break down the plan into smaller, verifiable milestones.'
      ],
      commit: [
        'Create a clear, descriptive commit message.',
        'Verify all changes are tested and reviewed.',
        'Ensure the commit is atomic and follows conventions.'
      ],
      security: [
        'Perform a thorough security review checking OWASP Top 10.',
        'Focus on input validation and authentication/authorization.',
        'Review for data leakage and privilege escalation vulnerabilities.'
      ],
      document: [
        'Write clear, concise documentation with examples.',
        'Focus on the "why" and "how" for developers.',
        'Add troubleshooting and FAQ sections.'
      ],
      research: [
        'Research industry best practices and established patterns.',
        'Compare multiple approaches and document trade-offs.',
        'Look for existing solutions and libraries to leverage.'
      ]
    };

    return approaches[phase]?.[variant] || 'Try a different approach to complete this phase.';
  }

  generatePersistencePrompt(
    basePrompt: string,
    phase: Phase,
    crew: CrewMember,
    result?: PhaseResult
  ): string {
    const lines: string[] = [];

    if (this.state.attempt > 0) {
      lines.push(`\n⚠️  RETRY ATTEMPT ${this.state.attempt} (Total: ${this.state.totalAttempts}/${this.config.maxAttempts})`);
      
      if (result?.error || this.state.lastError) {
        lines.push(`\nPrevious attempt failed with: ${result?.error || this.state.lastError}`);
      }

      if (this.shouldChangeApproach()) {
        lines.push(`\n🔄 APPROACH CHANGE: ${this.getApproachInstructions(phase)}`);
      }

      if (this.shouldEscalateTier()) {
        lines.push(`\n🚀 ESCALATION: Using higher-tier model for better reasoning.`);
      }

      if (this.shouldChangeCrew()) {
        lines.push(`\n👤 CREW ROTATION: Fresh perspective from different specialist.`);
      }

      lines.push(`\n💪 PERSISTENCE MODE: Don't give up! Verify your work is complete and correct.`);
      lines.push(`Analyze what went wrong, try a different approach, and ensure success.\n`);
    }

    return basePrompt + lines.join('\n');
  }

  async verifyPhaseCompletion(
    phase: Phase,
    result: PhaseResult
  ): Promise<{ verified: boolean; reason?: string }> {
    if (!result.success) {
      return { verified: false, reason: 'Phase execution failed' };
    }

    // Basic verification - check for success markers
    const output = result.output?.toLowerCase() || '';
    const phaseComplete = output.includes(`${phase} complete`);
    const hasError = output.includes('error:') || output.includes('failed:');

    if (hasError) {
      return { verified: false, reason: 'Error detected in output' };
    }

    if (!phaseComplete) {
      return { verified: false, reason: 'Completion marker not found' };
    }

    // Additional phase-specific verification
    switch (phase) {
      case 'test':
        const hasTestRun = output.includes('test') && (output.includes('pass') || output.includes('ok'));
        if (!hasTestRun) {
          return { verified: false, reason: 'No test execution evidence found' };
        }
        break;
      
      case 'implement':
        if (output.length < 100) {
          return { verified: false, reason: 'Implementation output seems too short' };
        }
        break;
    }

    return { verified: true };
  }

  getStatus(): string {
    const lines = [
      colors.secondary('🔄 Persistence Status:'),
      `  Attempt: ${this.state.attempt}`,
      `  Total: ${this.state.totalAttempts}/${this.config.maxAttempts}`,
      `  Escalation Level: ${this.state.escalationLevel}`
    ];

    if (this.state.lastError) {
      lines.push(`  Last Error: ${this.state.lastError.slice(0, 100)}`);
    }

    return lines.join('\n');
  }

  reset(): void {
    this.state = {
      attempt: 0,
      totalAttempts: 0,
      escalationLevel: 0,
      approachVariant: 0
    };
  }
}

export function createPersistenceManager(
  config: Partial<PersistenceConfig> = {}
): PersistenceManager {
  return new PersistenceManager(config);
}
