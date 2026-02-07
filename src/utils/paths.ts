// 🛸 ORBIT Project Paths
// Resolves config paths based on whether we're in ORBIT's own dir or a deployed project

import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ORBIT's own package root (where node_modules/.bin/orbit points to)
const ORBIT_PACKAGE_ROOT = resolve(__dirname, '..', '..');

/**
 * Detect whether the current working directory is ORBIT's own source tree.
 */
export function isOrbitOwnProject(): boolean {
  return resolve('.') === ORBIT_PACKAGE_ROOT;
}

/**
 * Get the project-local config directory.
 * - In ORBIT's own repo: src/config/
 * - In deployed projects: .copilot/
 */
export function getProjectConfigDir(): string {
  if (isOrbitOwnProject()) {
    return 'src/config';
  }
  return '.copilot';
}

/**
 * Get common config paths for the current project.
 */
export function getConfigPaths() {
  const base = getProjectConfigDir();
  return {
    base,
    state: `${base}/state`,
    skills: `${base}/skills`,
    plans: `${base}/plans`,
    cargo: `${base}/cargo_manifest.txt`,
    bestPractices: `${base}/best-practices.yaml`,
    crew: `${base}/crew.yaml`,
    missions: `${base}/missions.yaml`,
    models: `${base}/models.yaml`,
    metrics: `${base}/metrics.json`,
    flightLog: `${base}/state/flight_log.md`,
  };
}
