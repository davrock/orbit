// 🛸 ORBIT CLI Command Handler Tests

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all workflow and core dependencies
vi.mock('../workflows/index.js', () => ({
  runMission: vi.fn().mockResolvedValue({ success: true }),
  runUltrawork: vi.fn().mockResolvedValue({ success: true }),
  runSwarm: vi.fn().mockResolvedValue({ success: true }),
  runPipeline: vi.fn().mockResolvedValue({ success: true }),
  createFlightPlan: vi.fn().mockResolvedValue(undefined),
  runPlanMode: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../core/index.js', () => ({
  detectMagicKeywords: vi.fn((task: string) => {
    const normalized = task.toLowerCase();
    if (normalized.includes('ralph')) {
      return { mission: 'ralph', cleanedTask: task.replace(/ralph/i, '').trim(), shouldCreatePlan: false };
    }
    if (normalized.includes('ultrawork')) {
      return { mission: 'ultrawork', cleanedTask: task.replace(/ultrawork/i, '').trim(), shouldCreatePlan: false };
    }
    if (normalized.includes('plan for')) {
      return { cleanedTask: task, shouldCreatePlan: true };
    }
    return { cleanedTask: task, shouldCreatePlan: false };
  })
}));

vi.mock('../utils/output.js', () => ({
  printWarning: vi.fn(),
  colors: {
    secondary: (s: string) => s,
    warning: (s: string) => s,
    success: (s: string) => s,
    primary: (s: string) => s,
    error: (s: string) => s,
    dim: (s: string) => s
  }
}));

const { handleMissionCommand, handleParallelCommand } = await import('./command-handler.js');
const workflows = await import('../workflows/index.js');

describe('Command Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleMissionCommand', () => {
    it('should route normal mission to runMission', async () => {
      await handleMissionCommand('launch', 'add auth', {});
      expect(workflows.runMission).toHaveBeenCalledWith(
        expect.objectContaining({
          mission: 'launch',
          task: 'add auth',
          modelTier: 'auto'
        })
      );
    });

    it('should detect ralph magic keyword and switch mode', async () => {
      await handleMissionCommand('launch', 'ralph fix the tests', {});
      expect(workflows.runMission).toHaveBeenCalledWith(
        expect.objectContaining({
          mission: 'ralph'
        })
      );
    });

    it('should detect ultrawork magic keyword and switch mode', async () => {
      await handleMissionCommand('launch', 'ultrawork optimize builds', {});
      expect(workflows.runUltrawork).toHaveBeenCalledWith(
        expect.objectContaining({
          maxConcurrency: 4
        })
      );
    });

    it('should use premium tier when --premium is set', async () => {
      await handleMissionCommand('launch', 'add auth', { premium: true });
      expect(workflows.runMission).toHaveBeenCalledWith(
        expect.objectContaining({
          modelTier: 'premium'
        })
      );
    });

    it('should use fast tier when --economy is set', async () => {
      await handleMissionCommand('launch', 'add auth', { economy: true });
      expect(workflows.runMission).toHaveBeenCalledWith(
        expect.objectContaining({
          modelTier: 'fast'
        })
      );
    });

    it('should use ecomode tier when --ecomode is set', async () => {
      await handleMissionCommand('launch', 'add auth', { ecomode: true });
      expect(workflows.runMission).toHaveBeenCalledWith(
        expect.objectContaining({
          modelTier: 'ecomode'
        })
      );
    });

    it('should pass interactive option', async () => {
      await handleMissionCommand('launch', 'add auth', { interactive: true });
      expect(workflows.runMission).toHaveBeenCalledWith(
        expect.objectContaining({
          interactive: true
        })
      );
    });

    it('should pass custom crew option', async () => {
      await handleMissionCommand('launch', 'add auth', { crew: 'engineer' });
      expect(workflows.runMission).toHaveBeenCalledWith(
        expect.objectContaining({
          customCrew: 'engineer'
        })
      );
    });

    it('should pass cross-validation option', async () => {
      await handleMissionCommand('launch', 'add auth', { crossValidate: true });
      expect(workflows.runMission).toHaveBeenCalledWith(
        expect.objectContaining({
          enableCrossValidation: true
        })
      );
    });

    it('should pass dryRun option', async () => {
      await handleMissionCommand('launch', 'add auth', { dryRun: true });
      expect(workflows.runMission).toHaveBeenCalledWith(
        expect.objectContaining({
          dryRun: true
        })
      );
    });

    it('should run plan mode first if --plan is set', async () => {
      await handleMissionCommand('launch', 'add auth', { plan: true });
      expect(workflows.runPlanMode).toHaveBeenCalledWith(
        expect.objectContaining({ task: 'add auth' })
      );
      expect(workflows.runMission).toHaveBeenCalled();
    });

    it('should handle flight plan creation on magic keyword', async () => {
      await handleMissionCommand('launch', 'plan for user auth', {});
      expect(workflows.createFlightPlan).toHaveBeenCalled();
      expect(workflows.runMission).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(workflows.runMission).mockRejectedValueOnce(new Error('test error'));
      await expect(handleMissionCommand('launch', 'crash', {})).resolves.not.toThrow();
    });
  });

  describe('handleParallelCommand', () => {
    it('should call workflow function with correct params', async () => {
      const mockFn = vi.fn().mockResolvedValue({});
      await handleParallelCommand('add tests', {}, mockFn, { maxConcurrency: 4 });
      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({
          task: 'add tests',
          modelTier: 'auto',
          maxConcurrency: 4
        })
      );
    });

    it('should apply premium tier from options', async () => {
      const mockFn = vi.fn().mockResolvedValue({});
      await handleParallelCommand('add tests', { premium: true }, mockFn);
      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({
          modelTier: 'premium'
        })
      );
    });

    it('should detect flight plan keyword and create plan', async () => {
      const mockFn = vi.fn().mockResolvedValue({});
      await handleParallelCommand('plan for auth', {}, mockFn);
      expect(workflows.createFlightPlan).toHaveBeenCalled();
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('workflow failed'));
      await expect(handleParallelCommand('crash', {}, mockFn)).resolves.not.toThrow();
    });
  });
});
