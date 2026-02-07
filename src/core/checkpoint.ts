// 📍 ORBIT Checkpoint - Resume from Failed Phases
// Saves state before each phase for recovery

import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { readJsonFile, writeJsonFile } from '../utils/json-file.js';
import type { MissionType, Phase, ModelTier } from './types.js';

interface CheckpointConfig {
  stateDir: string;
}

let config: CheckpointConfig = {
  stateDir: 'src/config/state'
};

export function setCheckpointConfig(newConfig: Partial<CheckpointConfig>): void {
  config = { ...config, ...newConfig };
}

export function resetCheckpointConfig(): void {
  config = {
    stateDir: 'src/config/state'
  };
}

function getCheckpointFile(): string {
  return join(config.stateDir, 'checkpoint.json');
}

export interface Checkpoint {
  version: string;
  mission: MissionType;
  task: string;
  currentPhase: Phase;
  phasesCompleted: Phase[];
  modelTier: ModelTier;
  timestamp: string;
  dryRun: boolean;
}

export function saveCheckpoint(
  mission: MissionType,
  task: string,
  currentPhase: Phase,
  phasesCompleted: Phase[],
  modelTier: ModelTier,
  dryRun: boolean
): void {
  const checkpoint: Checkpoint = {
    version: '1.0',
    mission,
    task,
    currentPhase,
    phasesCompleted,
    modelTier,
    timestamp: new Date().toISOString(),
    dryRun
  };
  
  writeJsonFile(getCheckpointFile(), checkpoint);
}

export function loadCheckpoint(): Checkpoint | null {
  const checkpointFile = getCheckpointFile();
  if (!existsSync(checkpointFile)) return null;
  
  return readJsonFile<Checkpoint | null>(checkpointFile, {
    defaultValue: null,
    validate: (data: any) => {
      if (!data || typeof data !== 'object') return null;
      return {
        version: data.version || '1.0',
        mission: data.mission,
        task: data.task,
        currentPhase: data.currentPhase,
        phasesCompleted: Array.isArray(data.phasesCompleted) ? data.phasesCompleted : [],
        modelTier: data.modelTier,
        timestamp: data.timestamp,
        dryRun: data.dryRun ?? false
      };
    }
  });
}

export function checkpointExists(): boolean {
  return existsSync(getCheckpointFile());
}

export function clearCheckpoint(): void {
  const checkpointFile = getCheckpointFile();
  if (existsSync(checkpointFile)) {
    unlinkSync(checkpointFile);
  }
}

export function getCheckpointInfo(): string | null {
  const checkpoint = loadCheckpoint();
  if (!checkpoint) return null;
  
  const age = Date.now() - new Date(checkpoint.timestamp).getTime();
  const ageStr = formatAge(age);
  
  return [
    `Mission: ${checkpoint.mission}`,
    `Task: ${checkpoint.task}`,
    `Phase: ${checkpoint.currentPhase}`,
    `Completed: ${checkpoint.phasesCompleted.join(', ') || 'none'}`,
    `Age: ${ageStr}`
  ].join('\n');
}

function formatAge(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  
  if (hours > 0) return `${hours}h ${mins % 60}m ago`;
  if (mins > 0) return `${mins}m ${secs % 60}s ago`;
  return `${secs}s ago`;
}

export function shouldResume(checkpoint: Checkpoint): boolean {
  // Don't resume if checkpoint is more than 1 hour old
  const age = Date.now() - new Date(checkpoint.timestamp).getTime();
  return age < 60 * 60 * 1000;
}

export function getResumePhases(
  allPhases: Phase[],
  checkpoint: Checkpoint
): Phase[] {
  const completedSet = new Set(checkpoint.phasesCompleted);
  return allPhases.filter(p => !completedSet.has(p));
}
