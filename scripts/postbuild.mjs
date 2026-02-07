#!/usr/bin/env node
// 🛸 ORBIT Post-build script
// Copies YAML definitions and config to dist/ (cross-platform)

import { cpSync, mkdirSync, chmodSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = join(dirname(__filename), '..');

// Copy agent and workflow YAML definitions
const yamlCopies = [
  { from: 'src/agents/definitions',    to: 'dist/agents/definitions' },
  { from: 'src/workflows/definitions', to: 'dist/workflows/definitions' },
];

for (const { from, to } of yamlCopies) {
  const src = join(projectRoot, from);
  const dest = join(projectRoot, to);
  if (existsSync(src)) {
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
  }
}

// Copy only deploy-relevant config files (not runtime state/skills/plans)
const configDest = join(projectRoot, 'dist', 'config');
const configSrc = join(projectRoot, 'src', 'config');
mkdirSync(configDest, { recursive: true });
mkdirSync(join(configDest, 'dashboard'), { recursive: true });

const configFiles = [
  'best-practices.yaml',
  'crew.yaml',
  'missions.yaml',
  'models.yaml',
  'dashboard/index.html',
];

for (const file of configFiles) {
  const src = join(configSrc, file);
  const dest = join(configDest, file);
  if (existsSync(src)) {
    copyFileSync(src, dest);
  }
}

// Make CLI executable (no-op on Windows)
try {
  chmodSync(join(projectRoot, 'dist/cli/index.js'), 0o755);
} catch {
  // chmod not supported on Windows — not needed there
}

console.log('✓ Post-build: copied definitions & config to dist/');
