// 🖥️ ORBIT HUD - Real-time Statusline Display
// Shows: phase, crew, model tier, time elapsed, fuel usage

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Phase, CrewMember, ModelTier, HUDState } from './types.js';
import { loadFuelUsage } from './state.js';
import { colors } from '../utils/output.js';

const STATE_DIR = 'src/config/state';
const HUD_FILE = join(STATE_DIR, 'hud.json');

function ensureStateDir(): void {
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
  }
}

export function initHUD(task: string, phases: Phase[]): void {
  ensureStateDir();
  const state: HUDState = {
    task: task.slice(0, 60),
    phases,
    currentPhase: phases[0],
    currentCrew: 'pilot',
    modelTier: 'standard',
    startTime: new Date(),
    completedPhases: [],
    status: 'running'
  };
  writeFileSync(HUD_FILE, JSON.stringify(state, null, 2));
}

export function loadHUD(): HUDState | null {
  if (!existsSync(HUD_FILE)) return null;
  try {
    const data = JSON.parse(readFileSync(HUD_FILE, 'utf-8'));
    return {
      ...data,
      startTime: new Date(data.startTime)
    };
  } catch {
    return null;
  }
}

export function updateHUD(updates: Partial<HUDState>): void {
  const current = loadHUD();
  if (!current) return;
  
  const updated = { ...current, ...updates };
  writeFileSync(HUD_FILE, JSON.stringify(updated, null, 2));
}

export function setPhase(phase: Phase, crew: CrewMember, tier: ModelTier): void {
  updateHUD({
    currentPhase: phase,
    currentCrew: crew,
    modelTier: tier
  });
}

export function completePhase(phase: Phase): void {
  const current = loadHUD();
  if (!current) return;
  
  updateHUD({
    completedPhases: [...current.completedPhases, phase]
  });
}

export function endHUD(success: boolean): void {
  updateHUD({
    status: success ? 'complete' : 'failed'
  });
}

export function formatElapsed(startTime: Date): string {
  const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export function renderHUD(): string {
  const state = loadHUD();
  if (!state) return '';
  
  const fuel = loadFuelUsage();
  const elapsed = formatElapsed(state.startTime);
  const progress = state.completedPhases.length;
  const total = state.phases.length;
  const bar = '█'.repeat(progress) + '░'.repeat(total - progress);
  
  const tierIcon = state.modelTier === 'premium' ? '🔥' : state.modelTier === 'fast' ? '💨' : '⚡';
  const statusIcon = state.status === 'running' ? '🚀' : state.status === 'complete' ? '✅' : '❌';
  
  return [
    `${statusIcon} ${state.currentPhase.toUpperCase()}`,
    `🧑‍🚀 ${state.currentCrew}`,
    `${tierIcon} ${state.modelTier}`,
    `⏱️  ${elapsed}`,
    `⛽ ${fuel.total.toFixed(1)}`,
    `[${bar}] ${progress}/${total}`
  ].join(' │ ');
}

export function printHUD(): void {
  const line = renderHUD();
  if (line) {
    console.log(colors.secondary(line));
  }
}
