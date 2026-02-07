// 🛸 ORBIT Project Paths
// Resolves config paths:
//   - Read-only configs (YAML) → from the npm package (dist/config/)
//   - Per-project state → .orbit/ in the project root (or src/config/ in ORBIT's own repo)

import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ORBIT's own package root (where node_modules/.bin/orbit points to)
const ORBIT_PACKAGE_ROOT = resolve(__dirname, '..', '..');

// Read-only config shipped with the npm package
const PACKAGE_CONFIG_DIR = join(__dirname, '..', 'config');

/**
 * Detect whether the current working directory is ORBIT's own source tree.
 */
export function isOrbitOwnProject(): boolean {
  return resolve('.') === ORBIT_PACKAGE_ROOT;
}

/**
 * Get the directory for read-only config files (YAML definitions).
 * Always resolves to the npm package's dist/config/ (or src/config/ in dev).
 */
export function getPackageConfigDir(): string {
  if (existsSync(PACKAGE_CONFIG_DIR)) return PACKAGE_CONFIG_DIR;
  // Fallback for dev: src/config/
  const srcConfig = join(ORBIT_PACKAGE_ROOT, 'src', 'config');
  if (existsSync(srcConfig)) return srcConfig;
  return PACKAGE_CONFIG_DIR;
}

/**
 * Get the per-project state directory.
 * - In ORBIT's own repo: src/config/
 * - In other projects: .orbit/
 */
export function getProjectStateDir(): string {
  if (isOrbitOwnProject()) {
    return 'src/config';
  }
  return '.orbit';
}

/**
 * Get all config paths for the current project.
 * Read-only configs come from the package; state is per-project.
 */
export function getConfigPaths() {
  const pkgConfig = getPackageConfigDir();
  const stateBase = getProjectStateDir();
  return {
    // Per-project writable state
    base: stateBase,
    state: `${stateBase}/state`,
    skills: `${stateBase}/skills`,
    plans: `${stateBase}/plans`,
    cargo: `${stateBase}/cargo_manifest.txt`,
    metrics: `${stateBase}/metrics.json`,
    flightLog: `${stateBase}/state/flight_log.md`,
    // Read-only configs from the npm package
    bestPractices: join(pkgConfig, 'best-practices.yaml'),
    crew: join(pkgConfig, 'crew.yaml'),
    missions: join(pkgConfig, 'missions.yaml'),
    models: join(pkgConfig, 'models.yaml'),
  };
}
