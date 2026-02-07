// 📊 ORBIT Metrics - Detailed Performance Tracking
// Records timing, success rates, and phase analytics

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { MissionType, Phase, ModelTier } from './types.js';

interface MetricsConfig {
  metricsFile: string;
}

let config: MetricsConfig = {
  metricsFile: 'src/config/metrics.json'
};

export function setMetricsConfig(newConfig: Partial<MetricsConfig>): void {
  config = { ...config, ...newConfig };
}

export function resetMetricsConfig(): void {
  config = {
    metricsFile: 'src/config/metrics.json'
  };
  runCounter = 0;
  currentRun = null;
}

interface PhaseMetric {
  name: Phase;
  started: string;
  duration: number;
  status: 'success' | 'failed' | 'timeout' | 'skipped';
  attempts: number;
  modelTier: ModelTier;
}

interface RunMetric {
  id: string;
  task: string;
  mission: MissionType;
  started: string;
  ended?: string;
  totalDuration: number;
  phases: PhaseMetric[];
  filesChanged: number;
  testsAdded: number;
  retries: number;
  success: boolean;
  validations: {
    typeCheck?: boolean;
    tests?: boolean;
    lint?: boolean;
  };
}

interface MetricsStore {
  version: string;
  runs: RunMetric[];
  aggregates: {
    totalRuns: number;
    successRate: number;
    avgDuration: number;
    byMission: Record<string, { count: number; successRate: number }>;
    byPhase: Record<string, { avgDuration: number; successRate: number }>;
  };
}

let currentRun: RunMetric | null = null;
let runCounter = 0;

function ensureDir(): void {
  const dir = config.metricsFile.split('/').slice(0, -1).join('/');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function loadMetrics(): MetricsStore {
  ensureDir();
  if (existsSync(config.metricsFile)) {
    try {
      return JSON.parse(readFileSync(config.metricsFile, 'utf-8'));
    } catch {
      // Fall through
    }
  }
  return {
    version: '1.0',
    runs: [],
    aggregates: {
      totalRuns: 0,
      successRate: 0,
      avgDuration: 0,
      byMission: {},
      byPhase: {}
    }
  };
}

function saveMetrics(store: MetricsStore): void {
  ensureDir();
  writeFileSync(config.metricsFile, JSON.stringify(store, null, 2));
}

export function metricsStart(task: string, mission: MissionType): string {
  const id = `run-${Date.now()}-${runCounter++}`;
  currentRun = {
    id,
    task,
    mission,
    started: new Date().toISOString(),
    totalDuration: 0,
    phases: [],
    filesChanged: 0,
    testsAdded: 0,
    retries: 0,
    success: false,
    validations: {}
  };
  return id;
}

export function metricsPhaseStart(phase: Phase, tier: ModelTier): void {
  if (!currentRun) return;
  
  currentRun.phases.push({
    name: phase,
    started: new Date().toISOString(),
    duration: 0,
    status: 'success', // Will be updated
    attempts: 1,
    modelTier: tier
  });
}

export function metricsPhaseEnd(
  phase: Phase,
  status: 'success' | 'failed' | 'timeout' | 'skipped',
  duration: number
): void {
  if (!currentRun) return;
  
  const phaseMetric = currentRun.phases.find(p => p.name === phase);
  if (phaseMetric) {
    phaseMetric.duration = duration;
    phaseMetric.status = status;
  }
}

export function metricsRetry(): void {
  if (!currentRun) return;
  currentRun.retries++;
  
  const lastPhase = currentRun.phases[currentRun.phases.length - 1];
  if (lastPhase) {
    lastPhase.attempts++;
  }
}

export function metricsValidation(type: 'typeCheck' | 'tests' | 'lint', passed: boolean): void {
  if (!currentRun) return;
  currentRun.validations[type] = passed;
}

export function metricsFilesChanged(count: number): void {
  if (!currentRun) return;
  currentRun.filesChanged = count;
}

export function metricsEnd(success: boolean): void {
  if (!currentRun) return;
  
  currentRun.ended = new Date().toISOString();
  currentRun.totalDuration = Math.floor(
    (new Date(currentRun.ended).getTime() - new Date(currentRun.started).getTime()) / 1000
  );
  currentRun.success = success;
  
  // Save to store
  const store = loadMetrics();
  store.runs.push(currentRun);
  
  // Keep only last 100 runs
  if (store.runs.length > 100) {
    store.runs = store.runs.slice(-100);
  }
  
  // Update aggregates
  updateAggregates(store);
  
  saveMetrics(store);
  currentRun = null;
}

function updateAggregates(store: MetricsStore): void {
  const runs = store.runs;
  if (runs.length === 0) return;
  
  const successCount = runs.filter(r => r.success).length;
  const totalDuration = runs.reduce((sum, r) => sum + r.totalDuration, 0);
  
  store.aggregates = {
    totalRuns: runs.length,
    successRate: Math.round((successCount / runs.length) * 100),
    avgDuration: Math.round(totalDuration / runs.length),
    byMission: {},
    byPhase: {}
  };
  
  // By mission type
  const missionGroups = new Map<string, RunMetric[]>();
  for (const run of runs) {
    const group = missionGroups.get(run.mission) || [];
    group.push(run);
    missionGroups.set(run.mission, group);
  }
  
  for (const [mission, group] of missionGroups) {
    const s = group.filter(r => r.success).length;
    store.aggregates.byMission[mission] = {
      count: group.length,
      successRate: Math.round((s / group.length) * 100)
    };
  }
  
  // By phase
  const phaseStats = new Map<string, { totalDuration: number; success: number; total: number }>();
  for (const run of runs) {
    for (const phase of run.phases) {
      const stats = phaseStats.get(phase.name) || { totalDuration: 0, success: 0, total: 0 };
      stats.totalDuration += phase.duration;
      stats.total++;
      if (phase.status === 'success') stats.success++;
      phaseStats.set(phase.name, stats);
    }
  }
  
  for (const [phase, stats] of phaseStats) {
    store.aggregates.byPhase[phase] = {
      avgDuration: Math.round(stats.totalDuration / stats.total),
      successRate: Math.round((stats.success / stats.total) * 100)
    };
  }
}

export function getMetricsSummary(): MetricsStore['aggregates'] {
  return loadMetrics().aggregates;
}

export function getRecentRuns(limit = 10): RunMetric[] {
  return loadMetrics().runs.slice(-limit);
}

export function exportMetricsForDashboard(): object {
  const store = loadMetrics();
  const recent = store.runs.slice(-50);
  
  return {
    aggregates: store.aggregates,
    timeline: recent.map(r => ({
      date: r.started,
      duration: r.totalDuration,
      success: r.success,
      mission: r.mission
    })),
    phaseBreakdown: store.aggregates.byPhase,
    missionBreakdown: store.aggregates.byMission
  };
}
