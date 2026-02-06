// 📍 ORBIT Checkpoint - Resume from Failed Phases
// Saves state before each phase for recovery

import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import type { MissionType, Phase, ModelTier } from './types.js';

const STATE_DIR = '.copilot/state';
const CHECKPOINT_FILE = join(STATE_DIR, 'checkpoint.json');

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

function ensureStateDir(): void {
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
  }
}

export function saveCheckpoint(
  mission: MissionType,
  task: string,
  currentPhase: Phase,
  phasesCompleted: Phase[],
  modelTier: ModelTier,
  dryRun: boolean
): void {
  ensureStateDir();
  
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
  
  writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

export function loadCheckpoint(): Checkpoint | null {
  if (!existsSync(CHECKPOINT_FILE)) return null;
  
  try {
    return JSON.parse(readFileSync(CHECKPOINT_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

export function checkpointExists(): boolean {
  return existsSync(CHECKPOINT_FILE);
}

export function clearCheckpoint(): void {
  if (existsSync(CHECKPOINT_FILE)) {
    unlinkSync(CHECKPOINT_FILE);
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
