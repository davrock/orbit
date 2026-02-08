// 🛸 ORBIT Swarm Tests
// Tests for task parsing, finalization, and coordination logic

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
  selectModelTier: vi.fn(() => 'standard'),
  getModelIcon: vi.fn(() => '⚡'),
  getCrewForPhase: vi.fn(() => 'pilot'),
  trackFuel: vi.fn(),
  appendLog: vi.fn(),
  metricsStart: vi.fn(),
  metricsPhaseStart: vi.fn(),
  metricsPhaseEnd: vi.fn(),
  metricsEnd: vi.fn(),
  metricsFilesChanged: vi.fn(),
  initHUD: vi.fn(),
  setPhase: vi.fn(),
  completePhase: vi.fn(),
  endHUD: vi.fn()
}));

vi.mock('../agents/index.js', () => ({
  getAgentSystemPrompt: vi.fn(() => 'You are an AI agent.')
}));

vi.mock('../utils/output.js', () => ({
  printBanner: vi.fn(),
  printPhase: vi.fn(),
  printMissionComplete: vi.fn(),
  printSuccess: vi.fn(),
  printError: vi.fn(),
  printWarning: vi.fn(),
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
  getChangedFiles: vi.fn(() => [])
}));

vi.mock('../utils/exec.js', () => ({
  execCopilot: vi.fn().mockResolvedValue({ success: true, output: '', exitCode: 0 }),
  commandExists: vi.fn(() => true)
}));

vi.mock('fs', () => ({
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  existsSync: vi.fn(() => true),
  readFileSync: vi.fn(() => '{}')
}));

const { SwarmExecutor } = await import('./swarm.js');

describe('SwarmExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use default values when options are minimal', () => {
      const executor = new SwarmExecutor({ task: 'test task' });
      expect(executor).toBeDefined();
    });

    it('should accept custom options', () => {
      const executor = new SwarmExecutor({
        task: 'test task',
        maxConcurrency: 8,
        dryRun: true,
        modelTier: 'premium',
        enableCoordination: false
      });
      expect(executor).toBeDefined();
    });

    it('should resolve auto tier to standard', () => {
      const executor = new SwarmExecutor({ task: 'test', modelTier: 'auto' });
      expect(executor).toBeDefined();
    });
  });

  describe('parseSwarmTasksFromOutput', () => {
    it('should parse well-formed task output', () => {
      const executor = new SwarmExecutor({ task: 'test' });
      const parseMethod = (executor as unknown as Record<string, (output: string) => unknown[]>)['parseSwarmTasksFromOutput'].bind(executor);

      const output = `
TASK: task-1
DESCRIPTION: Set up base configuration
CREW: pilot
PRIORITY: 9
COMPLEXITY: low
DEPENDS_ON: none

TASK: task-2
DESCRIPTION: Implement feature using config
CREW: engineer
PRIORITY: 7
COMPLEXITY: medium
DEPENDS_ON: task-1
`;

      const tasks = parseMethod(output);
      expect(tasks).toHaveLength(2);
      expect(tasks[0]).toEqual(expect.objectContaining({
        id: 'task-1',
        description: 'Set up base configuration',
        crew: 'pilot',
        priority: 9,
        estimatedComplexity: 'low',
        dependencies: [],
        status: 'pending'
      }));
      expect(tasks[1]).toEqual(expect.objectContaining({
        id: 'task-2',
        description: 'Implement feature using config',
        crew: 'engineer',
        priority: 7,
        estimatedComplexity: 'medium',
        dependencies: ['task-1']
      }));
    });

    it('should handle empty output', () => {
      const executor = new SwarmExecutor({ task: 'test' });
      const parseMethod = (executor as unknown as Record<string, (output: string) => unknown[]>)['parseSwarmTasksFromOutput'].bind(executor);

      const tasks = parseMethod('');
      expect(tasks).toHaveLength(0);
    });

    it('should handle malformed output with defaults', () => {
      const executor = new SwarmExecutor({ task: 'test' });
      const parseMethod = (executor as unknown as Record<string, (output: string) => unknown[]>)['parseSwarmTasksFromOutput'].bind(executor);

      const output = `
TASK: task-1
DESCRIPTION: Minimal task
`;

      const tasks = parseMethod(output);
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toEqual(expect.objectContaining({
        id: 'task-1',
        description: 'Minimal task',
        crew: 'pilot',
        priority: 5,
        estimatedComplexity: 'medium',
        dependencies: []
      }));
    });

    it('should handle multiple dependencies', () => {
      const executor = new SwarmExecutor({ task: 'test' });
      const parseMethod = (executor as unknown as Record<string, (output: string) => unknown[]>)['parseSwarmTasksFromOutput'].bind(executor);

      const output = `
TASK: task-3
DESCRIPTION: Integration task
CREW: navigator
PRIORITY: 5
COMPLEXITY: high
DEPENDS_ON: task-1, task-2
`;

      const tasks = parseMethod(output);
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toEqual(expect.objectContaining({
        dependencies: ['task-1', 'task-2'],
        estimatedComplexity: 'high'
      }));
    });

    it('should normalize invalid complexity to medium', () => {
      const executor = new SwarmExecutor({ task: 'test' });
      const parseMethod = (executor as unknown as Record<string, (output: string) => unknown[]>)['parseSwarmTasksFromOutput'].bind(executor);

      const output = `
TASK: task-1
DESCRIPTION: Test
COMPLEXITY: extreme
`;

      const tasks = parseMethod(output);
      expect(tasks[0]).toEqual(expect.objectContaining({
        estimatedComplexity: 'medium'
      }));
    });
  });

  describe('getMockSwarmTasks', () => {
    it('should return 3 mock tasks with proper structure', () => {
      const executor = new SwarmExecutor({ task: 'test' });
      const mockMethod = (executor as unknown as Record<string, (task: string) => unknown[]>)['getMockSwarmTasks'].bind(executor);

      const tasks = mockMethod('implement auth');
      expect(tasks).toHaveLength(3);
      expect(tasks[0]).toEqual(expect.objectContaining({
        id: 'task-1',
        dependencies: [],
        status: 'pending'
      }));
      expect(tasks[1]).toEqual(expect.objectContaining({
        id: 'task-2',
        dependencies: ['task-1']
      }));
      expect(tasks[2]).toEqual(expect.objectContaining({
        id: 'task-3',
        dependencies: ['task-2']
      }));
    });
  });

  describe('execute (dry run)', () => {
    it('should complete successfully in dry run mode', async () => {
      const executor = new SwarmExecutor({ task: 'test task', dryRun: true });
      const result = await executor.execute('test task');

      expect(result).toEqual(expect.objectContaining({
        task: 'test task',
        success: true
      }));
      expect(result.tasks).toHaveLength(3);
    });
  });

  describe('getCoordinationSummary', () => {
    it('should return coordination state counts', () => {
      const executor = new SwarmExecutor({ task: 'test' });
      const summaryMethod = (executor as unknown as Record<string, () => Record<string, number>>)['getCoordinationSummary'].bind(executor);

      const summary = summaryMethod();
      expect(summary).toEqual({
        completed: 0,
        inProgress: 0,
        failed: 0
      });
    });
  });
});
