// 🛸 ORBIT Model Selector Tests
// Comprehensive test coverage for smart LLM tier selection

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  selectModelTier,
  getModelIcon,
  getModelForTier,
  getCostMultiplier,
  escalateTier,
  estimateCost
} from './models.js';
import type { ModelTier, Phase, CrewMember } from './types.js';

describe('Model Selector', () => {
  describe('selectModelTier', () => {
    describe('keyword-based detection', () => {
      it('should select premium tier for security keywords', () => {
        const securityTasks = [
          'Fix security vulnerability in auth',
          'Investigate breach in API',
          'Security audit for production',
          'Penetration testing setup',
          'Implement GDPR compliance',
          'Add encryption to database',
          'Fix exploit in user service'
        ];

        securityTasks.forEach(task => {
          expect(selectModelTier(task)).toBe('premium');
        });
      });

      it('should select premium tier for architecture keywords', () => {
        const archTasks = [
          'Architecture redesign for scalability',
          'Critical production migration',
          'Redesign authentication architecture'
        ];

        archTasks.forEach(task => {
          expect(selectModelTier(task)).toBe('premium');
        });
      });

      it('should select fast tier for simple tasks', () => {
        const simpleTasks = [
          'Fix typo in README',
          'Rename variable for clarity',
          'Add comment to function',
          'Format code with prettier',
          'Update docs for API',
          'Fix spelling in changelog',
          'Remove whitespace from file',
          'Update LICENSE file'
        ];

        simpleTasks.forEach(task => {
          expect(selectModelTier(task)).toBe('fast');
        });
      });

      it('should be case-insensitive for keyword detection', () => {
        expect(selectModelTier('SECURITY vulnerability')).toBe('premium');
        expect(selectModelTier('Fix TYPO in docs')).toBe('fast');
      });
    });

    describe('phase-based selection', () => {
      it('should select premium tier for security phase', () => {
        expect(selectModelTier('any task', 'security')).toBe('premium');
      });

      it('should select fast tier for document phase', () => {
        expect(selectModelTier('any task', 'document')).toBe('fast');
      });

      it('should select fast tier for commit phase', () => {
        expect(selectModelTier('any task', 'commit')).toBe('fast');
      });

      it('should select standard tier for plan phase', () => {
        expect(selectModelTier('any task', 'plan')).toBe('standard');
      });

      it('should select standard tier for implement phase', () => {
        expect(selectModelTier('any task', 'implement')).toBe('standard');
      });

      it('should select standard tier for test phase', () => {
        expect(selectModelTier('any task', 'test')).toBe('standard');
      });

      it('should select standard tier for review phase', () => {
        expect(selectModelTier('any task', 'review')).toBe('standard');
      });

      it('should select standard tier for debug phase', () => {
        expect(selectModelTier('any task', 'debug')).toBe('standard');
      });

      it('should select standard tier for research phase', () => {
        expect(selectModelTier('any task', 'research')).toBe('standard');
      });
    });

    describe('crew-based selection', () => {
      it('should select premium tier for commander', () => {
        expect(selectModelTier('any task', undefined, 'commander')).toBe('premium');
      });

      it('should select premium tier for security-officer', () => {
        expect(selectModelTier('any task', undefined, 'security-officer')).toBe('premium');
      });

      it('should select premium tier for database-architect', () => {
        expect(selectModelTier('any task', undefined, 'database-architect')).toBe('premium');
      });

      it('should select premium tier for cloud-architect', () => {
        expect(selectModelTier('any task', undefined, 'cloud-architect')).toBe('premium');
      });

      it('should select standard tier for pilot', () => {
        expect(selectModelTier('any task', undefined, 'pilot')).toBe('standard');
      });

      it('should select standard tier for engineer', () => {
        expect(selectModelTier('any task', undefined, 'engineer')).toBe('standard');
      });

      it('should select fast tier for comms', () => {
        expect(selectModelTier('any task', undefined, 'comms')).toBe('fast');
      });

      it('should select fast tier for tech-writer', () => {
        expect(selectModelTier('any task', undefined, 'tech-writer')).toBe('fast');
      });
    });

    describe('explicit override', () => {
      it('should respect premium override', () => {
        expect(selectModelTier('simple typo fix', undefined, undefined, 'premium')).toBe('premium');
      });

      it('should respect fast override', () => {
        expect(selectModelTier('security vulnerability', undefined, undefined, 'fast')).toBe('fast');
      });

      it('should respect standard override', () => {
        expect(selectModelTier('any task', undefined, undefined, 'standard')).toBe('standard');
      });

      it('should handle ecomode override with special logic', () => {
        const tier = selectModelTier('simple task', undefined, undefined, 'ecomode');
        expect(['fast', 'standard', 'premium']).toContain(tier);
      });

      it('should fallback to standard for invalid override', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        // @ts-expect-error - testing invalid input
        const tier = selectModelTier('any task', undefined, undefined, 'invalid-tier');
        expect(tier).toBe('standard');
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid model tier override')
        );
        consoleWarnSpy.mockRestore();
      });

      it('should ignore standard override and use keyword detection', () => {
        // When override is 'standard', it's ignored and normal detection proceeds
        // This allows 'standard' to be passed as a no-op override
        expect(selectModelTier('security vulnerability', undefined, undefined, 'standard')).toBe('premium');
        expect(selectModelTier('fix typo', undefined, undefined, 'standard')).toBe('fast');
      });
    });

    describe('ecomode tier selection', () => {
      it('should use premium only for critical security in ecomode', () => {
        expect(selectModelTier('vulnerability assessment', undefined, undefined, 'ecomode')).toBe('premium');
        expect(selectModelTier('exploit detection', undefined, undefined, 'ecomode')).toBe('premium');
        expect(selectModelTier('breach investigation', undefined, undefined, 'ecomode')).toBe('premium');
        expect(selectModelTier('penetration test', undefined, undefined, 'ecomode')).toBe('premium');
      });

      it('should use fast for simple tasks in ecomode', () => {
        expect(selectModelTier('fix typo', undefined, undefined, 'ecomode')).toBe('fast');
        expect(selectModelTier('update docs', undefined, undefined, 'ecomode')).toBe('fast');
      });

      it('should use fast tier for most phases in ecomode', () => {
        expect(selectModelTier('any task', 'plan', undefined, 'ecomode')).toBe('fast');
        expect(selectModelTier('any task', 'test', undefined, 'ecomode')).toBe('fast');
        expect(selectModelTier('any task', 'review', undefined, 'ecomode')).toBe('fast');
        expect(selectModelTier('any task', 'document', undefined, 'ecomode')).toBe('fast');
        expect(selectModelTier('any task', 'commit', undefined, 'ecomode')).toBe('fast');
        expect(selectModelTier('any task', 'research', undefined, 'ecomode')).toBe('fast');
      });

      it('should use standard for implement/debug phases in ecomode', () => {
        expect(selectModelTier('any task', 'implement', undefined, 'ecomode')).toBe('standard');
        expect(selectModelTier('any task', 'debug', undefined, 'ecomode')).toBe('standard');
      });

      it('should downgrade premium crew to standard in ecomode', () => {
        expect(selectModelTier('any task', undefined, 'commander', 'ecomode')).toBe('standard');
        expect(selectModelTier('any task', undefined, 'security-officer', 'ecomode')).toBe('standard');
        expect(selectModelTier('any task', undefined, 'database-architect', 'ecomode')).toBe('standard');
      });
    });

    describe('priority ordering', () => {
      it('should prioritize override over keywords', () => {
        expect(selectModelTier('security vulnerability', undefined, undefined, 'fast')).toBe('fast');
      });

      it('should prioritize keywords over crew', () => {
        expect(selectModelTier('security vulnerability', undefined, 'comms')).toBe('premium');
        expect(selectModelTier('fix typo', undefined, 'commander')).toBe('fast');
      });

      it('should prioritize crew over phase', () => {
        expect(selectModelTier('generic task', 'document', 'commander')).toBe('premium');
        expect(selectModelTier('generic task', 'security', 'comms')).toBe('fast');
      });
    });

    describe('default behavior', () => {
      it('should default to standard when no specific criteria match', () => {
        expect(selectModelTier('implement new feature')).toBe('standard');
        expect(selectModelTier('update configuration')).toBe('standard');
        expect(selectModelTier('refactor code')).toBe('standard');
      });
    });
  });

  describe('getModelIcon', () => {
    it('should return correct icon for premium tier', () => {
      expect(getModelIcon('premium')).toBe('🔥');
    });

    it('should return correct icon for fast tier', () => {
      expect(getModelIcon('fast')).toBe('💨');
    });

    it('should return correct icon for ecomode tier', () => {
      expect(getModelIcon('ecomode')).toBe('🌱');
    });

    it('should return correct icon for standard tier', () => {
      expect(getModelIcon('standard')).toBe('⚡');
    });
  });

  describe('getCostMultiplier', () => {
    it('should return 3.0 for premium tier', () => {
      expect(getCostMultiplier('premium')).toBe(3.0);
    });

    it('should return 1.0 for standard tier', () => {
      expect(getCostMultiplier('standard')).toBe(1.0);
    });

    it('should return 0.5 for fast tier', () => {
      expect(getCostMultiplier('fast')).toBe(0.5);
    });

    it('should return 0.6 for ecomode tier', () => {
      expect(getCostMultiplier('ecomode')).toBe(0.6);
    });
  });

  describe('escalateTier', () => {
    it('should escalate fast to standard', () => {
      expect(escalateTier('fast')).toBe('standard');
    });

    it('should escalate ecomode to standard', () => {
      expect(escalateTier('ecomode')).toBe('standard');
    });

    it('should escalate standard to premium', () => {
      expect(escalateTier('standard')).toBe('premium');
    });

    it('should keep premium at premium (cannot escalate further)', () => {
      expect(escalateTier('premium')).toBe('premium');
    });
  });

  describe('getModelForTier', () => {
    it('should return claude-sonnet-4.5 for premium tier', () => {
      expect(getModelForTier('premium')).toBe('claude-sonnet-4.5');
    });

    it('should return claude-sonnet-4 for standard tier', () => {
      expect(getModelForTier('standard')).toBe('claude-sonnet-4');
    });

    it('should return claude-haiku-4.5 for fast tier', () => {
      expect(getModelForTier('fast')).toBe('claude-haiku-4.5');
    });

    it('should return claude-haiku-4.5 for ecomode tier', () => {
      expect(getModelForTier('ecomode')).toBe('claude-haiku-4.5');
    });
  });

  describe('estimateCost', () => {
    it('should calculate cost for single phase', () => {
      const phases: Phase[] = ['implement'];
      expect(estimateCost(phases, 'add feature')).toBe(1.0);
    });

    it('should calculate cost for multiple standard phases', () => {
      const phases: Phase[] = ['plan', 'implement', 'test', 'review'];
      expect(estimateCost(phases, 'add feature')).toBe(4.0);
    });

    it('should include premium phase cost', () => {
      const phases: Phase[] = ['plan', 'security', 'implement'];
      expect(estimateCost(phases, 'add feature')).toBe(5.0); // 1 + 3 + 1
    });

    it('should include fast phase cost', () => {
      const phases: Phase[] = ['implement', 'document', 'commit'];
      expect(estimateCost(phases, 'add feature')).toBe(2.0); // 1 + 0.5 + 0.5
    });

    it('should consider task keywords in estimation', () => {
      const phases: Phase[] = ['implement', 'test'];
      // Security keyword should upgrade tier to premium for both phases
      expect(estimateCost(phases, 'security vulnerability fix')).toBe(6.0); // 3 + 3
    });

    it('should calculate correctly for fast tasks', () => {
      const phases: Phase[] = ['implement', 'test', 'review'];
      expect(estimateCost(phases, 'fix typo')).toBe(1.5); // 0.5 + 0.5 + 0.5
    });

    it('should handle empty phases array', () => {
      expect(estimateCost([], 'any task')).toBe(0);
    });

    it('should calculate cost for apollo mission (all phases)', () => {
      const phases: Phase[] = ['research', 'plan', 'implement', 'test', 'security', 'review', 'document'];
      // research, plan, implement, test, review = 1 each = 5
      // security = 3
      // document = 0.5
      // Total = 8.5
      expect(estimateCost(phases, 'generic task')).toBe(8.5);
    });

    it('should calculate cost for warp mission', () => {
      const phases: Phase[] = ['implement'];
      expect(estimateCost(phases, 'quick fix')).toBe(1.0); // standard tier = 1
    });
  });

  describe('edge cases and validation', () => {
    it('should handle undefined phase gracefully', () => {
      expect(selectModelTier('any task', undefined, 'pilot')).toBe('standard');
    });

    it('should handle undefined crew gracefully', () => {
      expect(selectModelTier('any task', 'implement', undefined)).toBe('standard');
    });

    it('should handle empty task string', () => {
      expect(selectModelTier('')).toBe('standard');
    });

    it('should handle task with multiple keywords', () => {
      // Premium keywords take precedence over fast
      expect(selectModelTier('fix typo in security module')).toBe('premium');
    });

    it('should handle special characters in task', () => {
      expect(selectModelTier('Fix security@#$%^&* issue')).toBe('premium');
      expect(selectModelTier('Update docs!!! (typo)')).toBe('fast');
    });
  });
});
