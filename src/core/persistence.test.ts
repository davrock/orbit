// 🛸 ORBIT Persistence Manager Tests
// Comprehensive test coverage for retry and escalation logic

import { describe, it, expect, beforeEach } from 'vitest';
import { PersistenceManager, createPersistenceManager, type PersistenceConfig } from './persistence.js';
import type { Phase, ModelTier, CrewMember, PhaseResult } from './types.js';

describe('PersistenceManager', () => {
  let manager: PersistenceManager;

  beforeEach(() => {
    manager = new PersistenceManager();
  });

  describe('Initialization', () => {
    it('should create with default config', () => {
      expect(manager.shouldRetry()).toBe(true);
      expect(manager.shouldEscalateTier()).toBe(false);
    });

    it('should accept custom config', () => {
      const customManager = new PersistenceManager({ maxAttempts: 5 });
      expect(customManager).toBeDefined();
    });

    it('should be created via factory function', () => {
      const factoryManager = createPersistenceManager({ maxAttempts: 3 });
      expect(factoryManager).toBeInstanceOf(PersistenceManager);
    });
  });

  describe('Retry Logic', () => {
    it('should allow retries within max attempts', () => {
      for (let i = 0; i < 5; i++) {
        expect(manager.shouldRetry()).toBe(true);
        manager.recordAttempt(false, 'test error');
      }
    });

    it('should stop retries after max attempts', () => {
      const limitedManager = new PersistenceManager({ maxAttempts: 3 });
      
      limitedManager.recordAttempt(false);
      limitedManager.recordAttempt(false);
      expect(limitedManager.shouldRetry()).toBe(true);
      
      limitedManager.recordAttempt(false);
      expect(limitedManager.shouldRetry()).toBe(false);
    });

    it('should reset attempt counter on success', () => {
      manager.recordAttempt(false);
      manager.recordAttempt(false);
      manager.recordAttempt(true);
      
      expect(manager.shouldEscalateTier()).toBe(false);
    });
  });

  describe('Tier Escalation', () => {
    it('should not escalate on first attempt', () => {
      manager.recordAttempt(false);
      expect(manager.shouldEscalateTier()).toBe(false);
    });

    it('should escalate after configured failures', () => {
      const escalateManager = new PersistenceManager({ escalateTierAfter: 2 });
      
      escalateManager.recordAttempt(false);
      escalateManager.recordAttempt(false);
      expect(escalateManager.shouldEscalateTier()).toBe(true);
    });

    it('should escalate from fast to standard', () => {
      manager.recordAttempt(false);
      manager.recordAttempt(false);
      
      const tier = manager.getEscalatedTier('fast');
      expect(tier).toBe('standard');
    });

    it('should escalate from standard to premium', () => {
      manager.recordAttempt(false);
      manager.recordAttempt(false);
      
      const tier = manager.getEscalatedTier('standard');
      expect(tier).toBe('premium');
    });

    it('should not escalate premium tier further', () => {
      manager.recordAttempt(false);
      manager.recordAttempt(false);
      
      const tier = manager.getEscalatedTier('premium');
      expect(tier).toBe('premium');
    });

    it('should maintain tier if escalation not triggered', () => {
      manager.recordAttempt(false);
      
      const tier = manager.getEscalatedTier('fast');
      expect(tier).toBe('fast');
    });
  });

  describe('Crew Rotation', () => {
    it('should not change crew initially', () => {
      manager.recordAttempt(false);
      expect(manager.shouldChangeCrew()).toBe(false);
    });

    it('should change crew after configured attempts', () => {
      const crewManager = new PersistenceManager({ changeCrewAfter: 2 });
      
      crewManager.recordAttempt(false);
      crewManager.recordAttempt(false);
      expect(crewManager.shouldChangeCrew()).toBe(true);
    });

    it('should rotate through implement phase crew', () => {
      const phase: Phase = 'implement';
      const crew1 = manager.getAlternativeCrew(phase, 'pilot');
      expect(crew1).toBe('engineer');
      
      const crew2 = manager.getAlternativeCrew(phase, 'engineer');
      expect(crew2).toBe('backend-specialist');
    });

    it('should rotate through test phase crew', () => {
      const phase: Phase = 'test';
      const crew1 = manager.getAlternativeCrew(phase, 'specialist');
      expect(crew1).toBe('qa-lead');
      
      const crew2 = manager.getAlternativeCrew(phase, 'qa-lead');
      expect(crew2).toBe('engineer');
    });

    it('should cycle back to first crew member', () => {
      const phase: Phase = 'test';
      let currentCrew: CrewMember = 'specialist';
      
      currentCrew = manager.getAlternativeCrew(phase, currentCrew); // qa-lead
      currentCrew = manager.getAlternativeCrew(phase, currentCrew); // engineer
      currentCrew = manager.getAlternativeCrew(phase, currentCrew); // specialist
      
      expect(currentCrew).toBe('specialist');
    });
  });

  describe('Approach Changes', () => {
    it('should not change approach initially', () => {
      manager.recordAttempt(false);
      expect(manager.shouldChangeApproach()).toBe(false);
    });

    it('should change approach after configured attempts', () => {
      const approachManager = new PersistenceManager({ changeApproachAfter: 3 });
      
      approachManager.recordAttempt(false);
      approachManager.recordAttempt(false);
      approachManager.recordAttempt(false);
      expect(approachManager.shouldChangeApproach()).toBe(true);
    });

    it('should provide different approach instructions per phase', () => {
      const implementApproach = manager.getApproachInstructions('implement');
      const testApproach = manager.getApproachInstructions('test');
      const debugApproach = manager.getApproachInstructions('debug');
      
      expect(implementApproach).toBeTruthy();
      expect(testApproach).toBeTruthy();
      expect(debugApproach).toBeTruthy();
      expect(implementApproach).not.toBe(testApproach);
    });

    it('should cycle through approach variants', () => {
      const approach1 = manager.getApproachInstructions('implement');
      const approach2 = manager.getApproachInstructions('implement');
      const approach3 = manager.getApproachInstructions('implement');
      const approach4 = manager.getApproachInstructions('implement'); // Cycle back
      
      expect(approach1).not.toBe(approach2);
      expect(approach2).not.toBe(approach3);
      expect(approach4).toBe(approach1); // Should cycle
    });
  });

  describe('Persistence Prompt Generation', () => {
    it('should return base prompt on first attempt', () => {
      const basePrompt = 'Implement feature X';
      const prompt = manager.generatePersistencePrompt(basePrompt, 'implement', 'pilot');
      
      expect(prompt).toBe(basePrompt);
    });

    it('should add retry information after failure', () => {
      manager.recordAttempt(false, 'Test error');
      
      const basePrompt = 'Implement feature X';
      const prompt = manager.generatePersistencePrompt(basePrompt, 'implement', 'pilot');
      
      expect(prompt).toContain('RETRY ATTEMPT');
      expect(prompt).toContain('Test error');
      expect(prompt).toContain(basePrompt);
    });

    it('should include approach change message when triggered', () => {
      const changeManager = new PersistenceManager({ changeApproachAfter: 2 });
      changeManager.recordAttempt(false);
      changeManager.recordAttempt(false);
      
      const prompt = changeManager.generatePersistencePrompt('Task', 'implement', 'pilot');
      
      expect(prompt).toContain('APPROACH CHANGE');
    });

    it('should include escalation message when triggered', () => {
      const escalateManager = new PersistenceManager({ escalateTierAfter: 1 });
      escalateManager.recordAttempt(false);
      
      const prompt = escalateManager.generatePersistencePrompt('Task', 'implement', 'pilot');
      
      expect(prompt).toContain('ESCALATION');
    });

    it('should include crew rotation message when triggered', () => {
      const crewManager = new PersistenceManager({ changeCrewAfter: 2 });
      crewManager.recordAttempt(false);
      crewManager.recordAttempt(false);
      
      const prompt = crewManager.generatePersistencePrompt('Task', 'implement', 'pilot');
      
      expect(prompt).toContain('CREW ROTATION');
    });

    it('should include previous result error in prompt', () => {
      manager.recordAttempt(false);
      
      const result: PhaseResult = {
        phase: 'implement',
        crew: 'pilot',
        modelTier: 'standard',
        success: false,
        duration: 100,
        error: 'Previous error message'
      };
      
      const prompt = manager.generatePersistencePrompt('Task', 'implement', 'pilot', result);
      
      expect(prompt).toContain('Previous error message');
    });
  });

  describe('Phase Verification', () => {
    it('should fail verification for failed phase', async () => {
      const result: PhaseResult = {
        phase: 'implement',
        crew: 'pilot',
        modelTier: 'standard',
        success: false,
        duration: 100
      };
      
      const verification = await manager.verifyPhaseCompletion('implement', result);
      
      expect(verification.verified).toBe(false);
      expect(verification.reason).toBe('Phase execution failed');
    });

    it('should fail verification when error detected in output', async () => {
      const result: PhaseResult = {
        phase: 'implement',
        crew: 'pilot',
        modelTier: 'standard',
        success: true,
        duration: 100,
        output: 'Some output with error: Something went wrong'
      };
      
      const verification = await manager.verifyPhaseCompletion('implement', result);
      
      expect(verification.verified).toBe(false);
      expect(verification.reason).toBe('Error detected in output');
    });

    it('should fail verification without completion marker', async () => {
      const result: PhaseResult = {
        phase: 'implement',
        crew: 'pilot',
        modelTier: 'standard',
        success: true,
        duration: 100,
        output: 'Some output without completion marker'
      };
      
      const verification = await manager.verifyPhaseCompletion('implement', result);
      
      expect(verification.verified).toBe(false);
      expect(verification.reason).toBe('Completion marker not found');
    });

    it('should pass verification with completion marker', async () => {
      const result: PhaseResult = {
        phase: 'implement',
        crew: 'pilot',
        modelTier: 'standard',
        success: true,
        duration: 100,
        output: 'Great work! implement complete. All done. ' + 'x'.repeat(100) + ' Implementation details here with sufficient content.'
      };
      
      const verification = await manager.verifyPhaseCompletion('implement', result);
      
      expect(verification.verified).toBe(true);
    });

    it('should verify test phase with test evidence', async () => {
      const result: PhaseResult = {
        phase: 'test',
        crew: 'specialist',
        modelTier: 'standard',
        success: true,
        duration: 100,
        output: 'test complete. All tests pass successfully.'
      };
      
      const verification = await manager.verifyPhaseCompletion('test', result);
      
      expect(verification.verified).toBe(true);
    });

    it('should fail test verification without test evidence', async () => {
      const result: PhaseResult = {
        phase: 'test',
        crew: 'specialist',
        modelTier: 'standard',
        success: true,
        duration: 100,
        output: 'test complete.'
      };
      
      const verification = await manager.verifyPhaseCompletion('test', result);
      
      expect(verification.verified).toBe(false);
      expect(verification.reason).toBe('No test execution evidence found');
    });

    it('should fail implement verification with suspiciously short output', async () => {
      const result: PhaseResult = {
        phase: 'implement',
        crew: 'pilot',
        modelTier: 'standard',
        success: true,
        duration: 100,
        output: 'implement complete'
      };
      
      const verification = await manager.verifyPhaseCompletion('implement', result);
      
      expect(verification.verified).toBe(false);
      expect(verification.reason).toBe('Implementation output seems too short');
    });
  });

  describe('Status Reporting', () => {
    it('should report initial status', () => {
      const status = manager.getStatus();
      
      expect(status).toContain('Persistence Status');
      expect(status).toContain('Attempt: 0');
      expect(status).toContain('Total: 0');
    });

    it('should report status after failures', () => {
      manager.recordAttempt(false, 'Error message');
      manager.recordAttempt(false, 'Another error');
      
      const status = manager.getStatus();
      
      expect(status).toContain('Attempt: 2');
      expect(status).toContain('Total: 2');
      expect(status).toContain('Another error');
    });

    it('should truncate long error messages in status', () => {
      const longError = 'x'.repeat(200);
      manager.recordAttempt(false, longError);
      
      const status = manager.getStatus();
      
      expect(status.length).toBeLessThan(longError.length + 100);
    });
  });

  describe('State Reset', () => {
    it('should reset all state', () => {
      manager.recordAttempt(false, 'Error');
      manager.recordAttempt(false, 'Error');
      manager.recordAttempt(false, 'Error');
      
      manager.reset();
      
      expect(manager.shouldEscalateTier()).toBe(false);
      expect(manager.shouldChangeCrew()).toBe(false);
      expect(manager.shouldChangeApproach()).toBe(false);
    });

    it('should allow retries after reset', () => {
      const limitedManager = new PersistenceManager({ maxAttempts: 2 });
      
      limitedManager.recordAttempt(false);
      limitedManager.recordAttempt(false);
      expect(limitedManager.shouldRetry()).toBe(false);
      
      limitedManager.reset();
      expect(limitedManager.shouldRetry()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero max attempts gracefully', () => {
      const noRetryManager = new PersistenceManager({ maxAttempts: 0 });
      expect(noRetryManager.shouldRetry()).toBe(false);
    });

    it('should handle negative escalation threshold gracefully', () => {
      const negativeManager = new PersistenceManager({ escalateTierAfter: -1 });
      negativeManager.recordAttempt(false);
      // With negative threshold, modulo returns true (1 % -1 === 0 in JavaScript)
      // This tests that the code handles edge cases, even if not ideal
      expect(negativeManager.shouldEscalateTier()).toBe(true);
    });

    it('should handle unknown phase in crew rotation', () => {
      const unknownPhase = 'unknown' as Phase;
      const crew = manager.getAlternativeCrew(unknownPhase, 'pilot');
      expect(crew).toBe('pilot'); // Should return same crew
    });

    it('should handle unknown phase in approach instructions', () => {
      const unknownPhase = 'unknown' as Phase;
      const approach = manager.getApproachInstructions(unknownPhase);
      expect(approach).toContain('different approach');
    });

    it('should handle ecomode tier in escalation', () => {
      manager.recordAttempt(false);
      manager.recordAttempt(false);
      
      const tier = manager.getEscalatedTier('ecomode' as ModelTier);
      expect(tier).toBe('ecomode'); // Should not escalate
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete failure cycle', () => {
      const scenarioManager = new PersistenceManager({
        maxAttempts: 6,
        escalateTierAfter: 2,
        changeCrewAfter: 3,
        changeApproachAfter: 2
      });

      let tier: ModelTier = 'fast';
      let crew: CrewMember = 'pilot';
      const phase: Phase = 'implement';

      // Attempt 1: fail
      scenarioManager.recordAttempt(false, 'First error');
      expect(scenarioManager.shouldEscalateTier()).toBe(false);

      // Attempt 2: fail, escalate tier
      scenarioManager.recordAttempt(false, 'Second error');
      expect(scenarioManager.shouldEscalateTier()).toBe(true);
      expect(scenarioManager.shouldChangeApproach()).toBe(true);
      tier = scenarioManager.getEscalatedTier(tier);
      expect(tier).toBe('standard');

      // Attempt 3: fail, change crew
      scenarioManager.recordAttempt(false, 'Third error');
      expect(scenarioManager.shouldChangeCrew()).toBe(true);
      crew = scenarioManager.getAlternativeCrew(phase, crew);
      expect(crew).toBe('engineer');

      // Attempt 4: fail, escalate again
      scenarioManager.recordAttempt(false, 'Fourth error');
      expect(scenarioManager.shouldEscalateTier()).toBe(true);
      expect(scenarioManager.shouldChangeApproach()).toBe(true);
      tier = scenarioManager.getEscalatedTier(tier);
      expect(tier).toBe('premium');

      // Verify still can retry
      expect(scenarioManager.shouldRetry()).toBe(true);
    });

    it('should handle success after failures', () => {
      manager.recordAttempt(false);
      manager.recordAttempt(false);
      manager.recordAttempt(false);
      
      // Success resets attempt counter
      manager.recordAttempt(true);
      
      expect(manager.shouldEscalateTier()).toBe(false);
      expect(manager.shouldChangeCrew()).toBe(false);
    });
  });
});
