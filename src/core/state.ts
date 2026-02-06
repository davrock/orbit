// 🛸 ORBIT State Management
// Persists ground control state, fuel usage, and skills

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { readJsonFile, writeJsonFile, updateJsonFile } from '../utils/json-file.js';
import type { GroundControlState, FuelUsage, Skill, ModelTier, CargoItem } from './types.js';

const STATE_DIR = '.copilot/state';
const GC_FILE = join(STATE_DIR, 'ground_control.json');
const FUEL_FILE = join(STATE_DIR, 'fuel_tracking.json');
const SKILLS_DIR = '.copilot/skills';
const CARGO_FILE = '.copilot/cargo_manifest.txt';

function ensureStateDir(): void {
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
  }
  if (!existsSync(SKILLS_DIR)) {
    mkdirSync(SKILLS_DIR, { recursive: true });
  }
}

// Ground Control State
export function loadGroundControl(): GroundControlState {
  ensureStateDir();
  return readJsonFile(GC_FILE, {
    defaultValue: createInitialGCState(),
    validate: (data: any) => ({
      fails: data.fails || 0,
      noProgress: data.noProgress ?? data.no_progress ?? 0,
      types: data.types || [],
      cycles: data.cycles || 0,
      successes: data.successes || 0,
      lastTask: data.lastTask || data.last_task,
      lastError: data.lastError || data.last_error
    })
  });
}

function createInitialGCState(): GroundControlState {
  return {
    fails: 0,
    noProgress: 0,
    types: [],
    cycles: 0,
    successes: 0
  };
}

export function saveGroundControl(state: GroundControlState): void {
  ensureStateDir();
  writeJsonFile(GC_FILE, state);
}

export function recordSuccess(taskType: string): void {
  ensureStateDir();
  updateJsonFile(
    GC_FILE,
    { defaultValue: createInitialGCState() },
    (state) => ({
      ...state,
      fails: 0,
      noProgress: 0,
      successes: state.successes + 1,
      cycles: state.cycles + 1,
      types: [...state.types.slice(-2), taskType]
    })
  );
}

export function recordFailure(error?: string): void {
  ensureStateDir();
  updateJsonFile(
    GC_FILE,
    { defaultValue: createInitialGCState() },
    (state) => ({
      ...state,
      fails: state.fails + 1,
      noProgress: state.noProgress + 1,
      cycles: state.cycles + 1,
      lastError: error
    })
  );
}

export function resetGroundControl(): void {
  saveGroundControl(createInitialGCState());
}

// Fuel Tracking
export function loadFuelUsage(): FuelUsage {
  ensureStateDir();
  return readJsonFile(FUEL_FILE, {
    defaultValue: createInitialFuelUsage(),
    validate: (data: any) => {
      const byTier = data.byTier || data.by_tier || { premium: 0, standard: 0, fast: 0, ecomode: 0 };
      return {
        total: data.total || 0,
        byTier: {
          premium: byTier.premium || 0,
          standard: byTier.standard || 0,
          fast: byTier.fast || 0,
          ecomode: byTier.ecomode || 0
        },
        sessions: data.sessions || 0
      };
    }
  });
}

function createInitialFuelUsage(): FuelUsage {
  return {
    total: 0,
    byTier: { premium: 0, standard: 0, fast: 0, ecomode: 0 },
    sessions: 0
  };
}

export function saveFuelUsage(usage: FuelUsage): void {
  ensureStateDir();
  writeJsonFile(FUEL_FILE, usage);
}

export function trackFuel(tier: ModelTier): void {
  ensureStateDir();
  const multipliers: Record<ModelTier, number> = { premium: 3.0, standard: 1.0, fast: 0.5, ecomode: 0.6 };
  updateJsonFile(
    FUEL_FILE,
    { defaultValue: createInitialFuelUsage() },
    (usage) => ({
      total: usage.total + multipliers[tier],
      byTier: {
        ...usage.byTier,
        [tier]: usage.byTier[tier] + 1
      },
      sessions: usage.sessions + 1
    })
  );
}

// Skills
export function loadSkills(): Skill[] {
  if (!existsSync(SKILLS_DIR)) return [];
  
  const skills: Skill[] = [];
  const files = readdirSync(SKILLS_DIR);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const skill = JSON.parse(readFileSync(join(SKILLS_DIR, file), 'utf-8'));
        skills.push(skill);
      } catch {
        // Skip invalid files
      }
    }
  }
  return skills;
}

export function saveSkill(skill: Skill): void {
  ensureStateDir();
  const file = join(SKILLS_DIR, `${skill.id}.json`);
  writeJsonFile(file, skill);
}

export function findMatchingSkill(task: string): Skill | undefined {
  const skills = loadSkills();
  const taskLower = task.toLowerCase();
  
  return skills.find(skill => {
    if (!skill.pattern) return false;
    const patternLower = skill.pattern.toLowerCase();
    return taskLower.includes(patternLower) || patternLower.includes(taskLower);
  });
}

// Cargo
export function loadCargo(): CargoItem[] {
  if (!existsSync(CARGO_FILE)) return [];
  
  const content = readFileSync(CARGO_FILE, 'utf-8');
  const lines = content.split('\n');
  const items: CargoItem[] = [];
  let currentPriority: 'high' | 'medium' | 'low' = 'medium';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      if (trimmed.includes('HIGH')) currentPriority = 'high';
      else if (trimmed.includes('MEDIUM')) currentPriority = 'medium';
      else if (trimmed.includes('LOW')) currentPriority = 'low';
      
      if (trimmed.startsWith('# ✓')) {
        const task = trimmed.replace(/^# ✓\s*/, '').replace(/\s*\([^)]+\)$/, '');
        items.push({ task, priority: currentPriority, delivered: true });
      }
      continue;
    }
    
    items.push({ task: trimmed, priority: currentPriority, delivered: false });
  }
  
  return items;
}

export function getNextCargoItem(): CargoItem | undefined {
  const items = loadCargo();
  return items.find(item => !item.delivered);
}

export function markCargoDelivered(task: string): void {
  if (!existsSync(CARGO_FILE)) return;
  
  let content = readFileSync(CARGO_FILE, 'utf-8');
  const date = new Date().toISOString().split('T')[0];
  content = content.replace(
    new RegExp(`^${escapeRegExp(task)}$`, 'm'),
    `# ✓ ${task} (${date})`
  );
  writeFileSync(CARGO_FILE, content);
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function addCargoItem(task: string, priority: 'high' | 'medium' | 'low' = 'medium'): void {
  ensureStateDir();
  
  let content = '';
  if (existsSync(CARGO_FILE)) {
    content = readFileSync(CARGO_FILE, 'utf-8');
  } else {
    content = `# 🚀 ORBIT Cargo Manifest - Feature Queue
# Priority order: HIGH → MEDIUM → LOW

# HIGH PRIORITY

# MEDIUM PRIORITY

# LOW PRIORITY

# COMPLETED
`;
  }
  
  const marker = priority === 'high' ? '# HIGH' : priority === 'low' ? '# LOW' : '# MEDIUM';
  const insertPoint = content.indexOf(marker);
  
  if (insertPoint >= 0) {
    const endOfLine = content.indexOf('\n', insertPoint);
    content = content.slice(0, endOfLine + 1) + task + '\n' + content.slice(endOfLine + 1);
  } else {
    content += '\n' + task;
  }
  
  writeFileSync(CARGO_FILE, content);
}

// Log file
export function appendLog(message: string): void {
  ensureStateDir();
  const logFile = join(STATE_DIR, 'mission.log');
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
  const entry = `[${timestamp}] ${message}\n`;
  
  if (existsSync(logFile)) {
    const content = readFileSync(logFile, 'utf-8');
    writeFileSync(logFile, content + entry);
  } else {
    writeFileSync(logFile, entry);
  }
}
