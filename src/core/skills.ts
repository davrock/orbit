// 🧠 ORBIT Skills - Learning System
// Extracts and stores reusable patterns from completed missions

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import type { Skill } from './types.js';

const SKILLS_DIR = '.copilot/skills';
const INDEX_FILE = join(SKILLS_DIR, 'index.json');

interface SkillsIndex {
  skills: string[];
  categories: Record<string, number>;
  successRates: Record<string, { success: number; total: number }>;
  lastUpdated: string;
}

function ensureSkillsDir(): void {
  if (!existsSync(SKILLS_DIR)) {
    mkdirSync(SKILLS_DIR, { recursive: true });
  }
}

function loadIndex(): SkillsIndex {
  ensureSkillsDir();
  if (existsSync(INDEX_FILE)) {
    try {
      const data = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
      // Ensure all required fields exist
      return {
        skills: data.skills || [],
        categories: data.categories || {},
        successRates: data.successRates || {},
        lastUpdated: data.lastUpdated || ''
      };
    } catch {
      // Fall through
    }
  }
  return {
    skills: [],
    categories: {},
    successRates: {},
    lastUpdated: ''
  };
}

function saveIndex(index: SkillsIndex): void {
  index.lastUpdated = new Date().toISOString();
  writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

export type SkillCategory = 
  | 'testing' | 'security' | 'api' | 'database' | 'refactoring'
  | 'documentation' | 'performance' | 'debugging' | 'feature' | 'general';

const CATEGORY_KEYWORDS: Record<SkillCategory, string[]> = {
  testing: ['test', 'spec', 'coverage', 'jest', 'mocha', 'cypress'],
  security: ['security', 'auth', 'vuln', 'xss', 'csrf', 'injection', 'encrypt'],
  api: ['api', 'endpoint', 'rest', 'graphql', 'grpc', 'http'],
  database: ['database', 'migration', 'schema', 'sql', 'query', 'index'],
  refactoring: ['refactor', 'clean', 'reorganize', 'extract', 'simplify'],
  documentation: ['docs', 'readme', 'documentation', 'jsdoc', 'comment'],
  performance: ['performance', 'optimize', 'speed', 'cache', 'lazy', 'memory'],
  debugging: ['bug', 'fix', 'error', 'issue', 'crash', 'debug'],
  feature: ['feature', 'implement', 'add', 'create', 'build', 'develop'],
  general: []
};

export function detectCategory(task: string): SkillCategory {
  const taskLower = task.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => taskLower.includes(kw))) {
      return category as SkillCategory;
    }
  }
  return 'general';
}

export function extractSkill(
  task: string,
  outcome: 'success' | 'failure',
  context?: string,
  solution?: string
): Skill {
  ensureSkillsDir();
  
  const id = `skill-${Date.now()}`;
  const category = detectCategory(task);
  
  // Extract a concise solution summary from the full output
  const solutionSummary = solution ? extractSolutionSummary(solution, task) : '';
  
  const skill: Skill = {
    id,
    pattern: task,
    solution: solutionSummary,
    context: context || category,
    successCount: outcome === 'success' ? 1 : 0,
    lastUsed: new Date()
  };
  
  // Save skill file
  const file = join(SKILLS_DIR, `${id}.json`);
  writeFileSync(file, JSON.stringify(skill, null, 2));
  
  // Update index
  const index = loadIndex();
  index.skills.push(id);
  index.categories[category] = (index.categories[category] || 0) + 1;
  
  if (!index.successRates[category]) {
    index.successRates[category] = { success: 0, total: 0 };
  }
  index.successRates[category].total++;
  if (outcome === 'success') {
    index.successRates[category].success++;
  }
  
  saveIndex(index);
  
  return skill;
}

/**
 * Extract a concise solution summary from AI output
 */
function extractSolutionSummary(output: string, task: string): string {
  // Look for common patterns in AI output that indicate what was done
  const lines = output.split('\n');
  const summaryParts: string[] = [];
  
  // Look for file modifications
  const filePatterns = /(?:created|modified|updated|edited|wrote|deleted)\s+[`']?([^\s`']+)[`']?/gi;
  const files = new Set<string>();
  let match;
  while ((match = filePatterns.exec(output)) !== null) {
    files.add(match[1]);
  }
  if (files.size > 0) {
    summaryParts.push(`Files: ${Array.from(files).slice(0, 5).join(', ')}`);
  }
  
  // Look for "COMPLETE" markers which often have context
  for (const line of lines) {
    if (line.includes('COMPLETE') && line.length < 200) {
      const cleanLine = line.replace(/[#*`]/g, '').trim();
      if (cleanLine.length > 10) {
        summaryParts.push(cleanLine);
        break;
      }
    }
  }
  
  // Look for summary-like lines
  const summaryKeywords = ['implemented', 'added', 'fixed', 'created', 'refactored', 'updated'];
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    if (summaryKeywords.some(kw => lineLower.includes(kw)) && 
        line.length > 20 && line.length < 200 &&
        !line.startsWith('//') && !line.startsWith('#')) {
      const cleanLine = line.replace(/[#*`]/g, '').trim();
      if (cleanLine.length > 20 && !summaryParts.includes(cleanLine)) {
        summaryParts.push(cleanLine);
        if (summaryParts.length >= 3) break;
      }
    }
  }
  
  // Fallback: use first meaningful line
  if (summaryParts.length === 0) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 30 && trimmed.length < 200 && 
          !trimmed.startsWith('//') && !trimmed.startsWith('#') &&
          !trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        summaryParts.push(trimmed.slice(0, 150));
        break;
      }
    }
  }
  
  return summaryParts.join(' | ').slice(0, 500);
}

export function findMatchingSkills(task: string, limit = 5): Skill[] {
  ensureSkillsDir();
  
  const taskLower = task.toLowerCase();
  const taskWords = new Set(taskLower.split(/\W+/).filter(w => w.length > 2));
  const skills: Array<{ skill: Skill; score: number }> = [];
  
  if (!existsSync(SKILLS_DIR)) return [];
  
  const files = readdirSync(SKILLS_DIR);
  for (const file of files) {
    if (!file.endsWith('.json') || file === 'index.json') continue;
    
    try {
      const skill = JSON.parse(readFileSync(join(SKILLS_DIR, file), 'utf-8')) as Skill;
      const patternWords = new Set(skill.pattern.toLowerCase().split(/\W+/).filter(w => w.length > 2));
      
      // Calculate overlap score
      let score = 0;
      for (const word of taskWords) {
        if (patternWords.has(word)) score++;
      }
      
      if (score > 0) {
        skills.push({ skill, score });
      }
    } catch {
      // Skip invalid files
    }
  }
  
  return skills
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.skill);
}

export function recordSkillUse(skillId: string, success: boolean): void {
  const file = join(SKILLS_DIR, `${skillId}.json`);
  if (!existsSync(file)) return;
  
  try {
    const skill = JSON.parse(readFileSync(file, 'utf-8')) as Skill;
    if (success) {
      skill.successCount++;
    }
    skill.lastUsed = new Date();
    writeFileSync(file, JSON.stringify(skill, null, 2));
  } catch {
    // Ignore errors
  }
}

export function getSkillStats(): { total: number; byCategory: Record<string, number>; successRates: Record<string, number> } {
  const index = loadIndex();
  
  const successRates: Record<string, number> = {};
  for (const [cat, { success, total }] of Object.entries(index.successRates)) {
    successRates[cat] = total > 0 ? Math.round((success / total) * 100) : 0;
  }
  
  return {
    total: index.skills.length,
    byCategory: index.categories,
    successRates
  };
}
