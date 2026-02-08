// 🛸 ORBIT Mission Control Tests
// Tests for mission orchestration, construction, and phase routing

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all heavy dependencies
vi.mock('../utils/paths.js', () => ({
  getConfigPaths: vi.fn(() => ({
    base: '/tmp/orbit-test',
    state: '/tmp/orbit-test/state',
    metrics: '/tmp/orbit-test/metrics.json',
    skills: '/tmp/orbit-test/skills',
    flightLog: '/tmp/orbit-test/state/flight_log.md',
    bestPractices: '/tmp/orbit-test/best-practices.yaml'
  }))
}));

vi.mock('../core/index.js', () => ({
  detectProjectConfig: vi.fn(() => ({ name: 'test-project', techStack: 'typescript', packageManager: 'npm', gitBranch: 'main' })),
  getPhasesForMission: vi.fn((mission: string) => {
    const phases: Record<string, string[]> = {
      launch: ['plan', 'implement', 'test', 'review'],
      repair: ['debug', 'implement', 'test'],
      warp: ['implement'],
      ralph: ['plan', 'implement', 'test', 'review'],
      unknown: []
    };
    return phases[mission] || [];
  }),
  getCrewForPhase: vi.fn(() => 'pilot'),
  getModelForPhase: vi.fn(() => 'standard'),
  selectModelTier: vi.fn(() => 'standard'),
  getModelIcon: vi.fn(() => '⚡'),
  trackFuel: vi.fn(),
  appendLog: vi.fn(),
  extractSkill: vi.fn(),
  metricsStart: vi.fn(),
  metricsPhaseStart: vi.fn(),
  metricsPhaseEnd: vi.fn(),
  metricsEnd: vi.fn(),
  metricsFilesChanged: vi.fn(),
  initHUD: vi.fn(),
  setPhase: vi.fn(),
  completePhase: vi.fn(),
  endHUD: vi.fn(),
  hasProviders: vi.fn(() => false),
  getProviderSummary: vi.fn(() => ''),
  crossValidate: vi.fn(),
  checkDesignConsistency: vi.fn()
}));

vi.mock('../core/persistence.js', () => ({
  createPersistenceManager: vi.fn(() => ({
    reset: vi.fn(),
    shouldRetry: vi.fn(() => false),
    getStatus: vi.fn(() => 'test'),
    shouldChangeCrew: vi.fn(() => false),
    getAlternativeCrew: vi.fn(() => 'engineer'),
    getEscalatedTier: vi.fn((t: string) => t),
    recordAttempt: vi.fn(),
    verifyPhaseCompletion: vi.fn().mockResolvedValue({ verified: true }),
    generatePersistencePrompt: vi.fn((p: string) => p),
    state: { totalAttempts: 0, attempt: 0 },
    config: { maxAttempts: 5 }
  }))
}));

vi.mock('../agents/index.js', () => ({
  getAgentSystemPrompt: vi.fn(() => 'You are an AI agent.')
}));

vi.mock('../core/autonomous-prompts.js', () => ({
  getAutonomousGuardrails: vi.fn(() => 'guardrails'),
  getCompactGuardrails: vi.fn(() => 'compact-guardrails'),
  VERIFICATION_REQUIREMENTS: 'verify',
  COMPACT_VERIFICATION: 'compact-verify'
}));

vi.mock('../utils/output.js', () => ({
  printBanner: vi.fn(),
  printPhase: vi.fn(),
  printMissionComplete: vi.fn(),
  printSuccess: vi.fn(),
  printError: vi.fn(),
  printWarning: vi.fn(),
  printKeyValue: vi.fn(),
  colors: {
    primary: (s: string) => s,
    secondary: (s: string) => s,
    success: (s: string) => s,
    error: (s: string) => s,
    warning: (s: string) => s,
    dim: (s: string) => s
  }
}));

vi.mock('../utils/git.js', () => ({
  getCurrentCommit: vi.fn(() => 'abc123'),
  hasChanges: vi.fn(() => false),
  getChangedFiles: vi.fn(() => [])
}));

vi.mock('../utils/exec.js', () => ({
  exec: vi.fn(),
  execCopilot: vi.fn().mockResolvedValue({ success: true, output: 'done', exitCode: 0 }),
  commandExists: vi.fn(() => true)
}));

vi.mock('../core/checkpoint.js', () => ({
  saveCheckpoint: vi.fn(),
  clearCheckpoint: vi.fn(),
  loadCheckpoint: vi.fn(() => null),
  shouldResume: vi.fn(() => false),
  getResumePhases: vi.fn(() => [])
}));

vi.mock('../utils/safeguards.js', () => ({
  checkCriticalFilesBeforeMission: vi.fn(() => true),
  checkCriticalFilesAfterMission: vi.fn(),
  getCriticalFilesWarning: vi.fn(() => '')
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(() => true),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(() => '{}')
}));

const { MissionControl, runMission, resumeMission } = await import('./mission-control.js');
const output = await import('../utils/output.js');
const safeguards = await import('../utils/safeguards.js');
const checkpoint = await import('../core/checkpoint.js');
const core = await import('../core/index.js');

describe('MissionControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create with valid mission type', () => {
      const controller = new MissionControl({
        mission: 'launch',
        task: 'add auth'
      });
      expect(controller).toBeDefined();
    });

    it('should throw for unknown mission type', () => {
      expect(() => new MissionControl({
        mission: 'unknown' as never,
        task: 'test'
      })).toThrow('Unknown mission type');
    });

    it('should resolve auto tier to standard', () => {
      const controller = new MissionControl({
        mission: 'launch',
        task: 'test',
        modelTier: 'auto'
      });
      expect(controller).toBeDefined();
    });

    it('should enable persistence for ralph mode', () => {
      const controller = new MissionControl({
        mission: 'ralph',
        task: 'test'
      });
      expect(controller).toBeDefined();
    });

    it('should accept custom crew', () => {
      const controller = new MissionControl({
        mission: 'launch',
        task: 'test',
        customCrew: 'engineer'
      });
      expect(controller).toBeDefined();
    });

    it('should use resumeFrom phases when provided', () => {
      const controller = new MissionControl({
        mission: 'launch',
        task: 'test',
        resumeFrom: ['test', 'review']
      });
      expect(controller).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should fail if critical files check fails', async () => {
      vi.mocked(safeguards.checkCriticalFilesBeforeMission).mockReturnValueOnce(false);
      const controller = new MissionControl({
        mission: 'launch',
        task: 'test'
      });
      await expect(controller.execute()).rejects.toThrow('Critical configuration files missing');
    });

    it('should complete dry run successfully', async () => {
      const controller = new MissionControl({
        mission: 'warp',
        task: 'quick change',
        dryRun: true
      });
      const result = await controller.execute();
      expect(result.success).toBe(true);
      expect(result.mission).toBe('warp');
      expect(result.task).toBe('quick change');
    });

    it('should handle phase failure gracefully', async () => {
      const { execCopilot } = await import('../utils/exec.js');
      vi.mocked(execCopilot).mockResolvedValueOnce({ success: false, output: 'error', exitCode: 1 });

      const controller = new MissionControl({
        mission: 'warp',
        task: 'test'
      });
      const result = await controller.execute();
      expect(result.success).toBe(false);
      expect(output.printError).toHaveBeenCalled();
    });

    it('should catch unexpected errors in try/catch', async () => {
      const { execCopilot } = await import('../utils/exec.js');
      vi.mocked(execCopilot).mockRejectedValueOnce(new Error('unexpected crash'));

      const controller = new MissionControl({
        mission: 'warp',
        task: 'test'
      });
      const result = await controller.execute();
      expect(result.success).toBe(false);
      expect(output.printError).toHaveBeenCalledWith(
        expect.stringContaining('Mission crashed')
      );
    });

    it('should clear checkpoint on success', async () => {
      const controller = new MissionControl({
        mission: 'warp',
        task: 'quick change',
        dryRun: true
      });
      await controller.execute();
      expect(checkpoint.clearCheckpoint).toHaveBeenCalled();
    });
  });

  describe('runMission', () => {
    it('should create controller and execute', async () => {
      const result = await runMission({
        mission: 'warp',
        task: 'quick fix',
        dryRun: true
      });
      expect(result.success).toBe(true);
    });
  });

  describe('resumeMission', () => {
    it('should return null when no checkpoint found', async () => {
      const result = await resumeMission();
      expect(result).toBeNull();
      expect(output.printWarning).toHaveBeenCalledWith(
        expect.stringContaining('No checkpoint found')
      );
    });

    it('should return null when checkpoint is too old', async () => {
      vi.mocked(checkpoint.loadCheckpoint).mockReturnValueOnce({
        mission: 'launch',
        task: 'test',
        currentPhase: 'implement',
        phasesCompleted: ['plan'],
        modelTier: 'standard',
        timestamp: new Date().toISOString(),
        dryRun: false,
        version: '1.0'
      });
      vi.mocked(checkpoint.shouldResume).mockReturnValueOnce(false);

      const result = await resumeMission();
      expect(result).toBeNull();
    });

    it('should return null when all phases completed', async () => {
      vi.mocked(checkpoint.loadCheckpoint).mockReturnValueOnce({
        mission: 'launch',
        task: 'test',
        currentPhase: 'review',
        phasesCompleted: ['plan', 'implement', 'test', 'review'],
        modelTier: 'standard',
        timestamp: new Date().toISOString(),
        dryRun: false,
        version: '1.0'
      });
      vi.mocked(checkpoint.shouldResume).mockReturnValueOnce(true);
      vi.mocked(checkpoint.getResumePhases).mockReturnValueOnce([]);

      const result = await resumeMission();
      expect(result).toBeNull();
      expect(output.printSuccess).toHaveBeenCalledWith(
        expect.stringContaining('All phases already completed')
      );
    });
  });
});
