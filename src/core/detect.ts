// 🛸 ORBIT Project Detection
// Auto-detects project configuration from file system

import { existsSync, readFileSync } from 'fs';
import { basename } from 'path';
import type { ProjectConfig, TechStack } from './types.js';
import { execQuiet } from '../utils/exec.js';

function readJsonField(file: string, field: string): string | undefined {
  try {
    const content = JSON.parse(readFileSync(file, 'utf-8'));
    return content[field];
  } catch {
    return undefined;
  }
}

function grepFirst(file: string, pattern: RegExp): string | undefined {
  try {
    const content = readFileSync(file, 'utf-8');
    const match = content.match(pattern);
    return match?.[1];
  } catch {
    return undefined;
  }
}

export function detectProjectName(): string {
  // Node.js
  if (existsSync('package.json')) {
    const name = readJsonField('package.json', 'name');
    if (name) return name;
  }

  // React Native / Expo
  if (existsSync('app.json')) {
    const name = readJsonField('app.json', 'name');
    if (name) return name;
  }

  // Rust
  if (existsSync('Cargo.toml')) {
    const name = grepFirst('Cargo.toml', /^name\s*=\s*"([^"]+)"/m);
    if (name) return name;
  }

  // Maven
  if (existsSync('pom.xml')) {
    const name = grepFirst('pom.xml', /<artifactId>([^<]+)<\/artifactId>/);
    if (name) return name;
  }

  // Gradle
  for (const file of ['settings.gradle', 'settings.gradle.kts', 'build.gradle', 'build.gradle.kts']) {
    if (existsSync(file)) {
      const name = grepFirst(file, /rootProject\.name\s*=\s*['"]([^'"]+)['"]/);
      if (name) return name;
    }
  }

  // gradle.properties
  if (existsSync('gradle.properties')) {
    const name = grepFirst('gradle.properties', /^(?:APP_NAME|PROJECT_NAME)=(.+)$/m);
    if (name) return name;
  }

  // Go
  if (existsSync('go.mod')) {
    const mod = grepFirst('go.mod', /^module\s+(.+)$/m);
    if (mod) return basename(mod);
  }

  // Python
  if (existsSync('pyproject.toml')) {
    const name = grepFirst('pyproject.toml', /^name\s*=\s*"([^"]+)"/m);
    if (name) return name;
  }

  // .NET
  const csproj = execQuiet('ls *.csproj 2>/dev/null | head -1');
  if (csproj) return basename(csproj, '.csproj');

  // Git remote
  const remote = execQuiet('git remote get-url origin 2>/dev/null');
  if (remote) {
    const name = basename(remote).replace(/\.git$/, '');
    if (name && name !== 'origin') return name;
  }

  // Fallback: directory name
  return basename(process.cwd());
}

export function detectTechStack(): TechStack {
  // Cache file reads to avoid multiple reads
  const fileCache = new Map<string, string>();
  
  const readFileCached = (path: string): string | undefined => {
    if (fileCache.has(path)) {
      return fileCache.get(path);
    }
    if (!existsSync(path)) {
      return undefined;
    }
    try {
      const content = readFileSync(path, 'utf-8');
      fileCache.set(path, content);
      return content;
    } catch {
      return undefined;
    }
  };

  const packageJsonContent = readFileCached('package.json');
  const hasPackageJson = packageJsonContent !== undefined;

  // React Native / Expo
  if (existsSync('app.json') || existsSync('app.config.js') || existsSync('app.config.ts')) {
    if (packageJsonContent) {
      if (packageJsonContent.includes('"expo"')) return 'expo';
      if (packageJsonContent.includes('"react-native"')) return 'react-native';
    }
  }

  // Node.js frameworks
  if (hasPackageJson && packageJsonContent) {
    if (existsSync('next.config.js') || existsSync('next.config.mjs') || existsSync('next.config.ts')) return 'nextjs';
    if (existsSync('nuxt.config.js') || existsSync('nuxt.config.ts')) return 'nuxt';
    if (existsSync('svelte.config.js')) return 'svelte';
    if (existsSync('angular.json')) return 'angular';
    
    if (packageJsonContent.includes('"vue"')) return 'vue';
    if (packageJsonContent.includes('"react"')) return 'react';
    if (existsSync('tsconfig.json')) return 'typescript';
    return 'node';
  }

  // Python
  if (existsSync('requirements.txt') || existsSync('pyproject.toml') || existsSync('setup.py') || existsSync('Pipfile')) {
    if (existsSync('manage.py')) return 'django';
    const reqs = readFileCached('requirements.txt') || '';
    const pyproj = readFileCached('pyproject.toml') || '';
    if (reqs.includes('fastapi') || pyproj.includes('fastapi')) return 'fastapi';
    if (reqs.includes('flask') || pyproj.includes('flask')) return 'flask';
    return 'python';
  }

  // Go
  if (existsSync('go.mod')) return 'go';

  // Rust
  if (existsSync('Cargo.toml')) return 'rust';

  // Java/Kotlin
  if (existsSync('pom.xml')) {
    const pom = readFileCached('pom.xml') || '';
    if (pom.includes('spring')) return 'spring';
    return 'maven';
  }
  if (existsSync('build.gradle') || existsSync('build.gradle.kts')) {
    const gradle = readFileCached('build.gradle') || readFileCached('build.gradle.kts') || '';
    if (existsSync('android') || gradle.includes('android')) return 'android';
    if (gradle.includes('kotlin')) return 'kotlin';
    return 'gradle';
  }

  // Ruby
  if (existsSync('Gemfile')) {
    const gemfile = readFileCached('Gemfile') || '';
    if (existsSync('config/application.rb') || gemfile.includes('rails')) return 'rails';
    return 'ruby';
  }

  // .NET
  if (execQuiet('ls *.csproj 2>/dev/null')) return 'dotnet';

  // PHP
  if (existsSync('composer.json')) {
    const composer = readFileCached('composer.json') || '';
    if (composer.includes('laravel')) return 'laravel';
    if (composer.includes('symfony')) return 'symfony';
    return 'php';
  }

  // C/C++
  if (existsSync('CMakeLists.txt')) return 'cmake';

  // Elixir
  if (existsSync('mix.exs')) return 'elixir';

  // Swift/iOS
  if (existsSync('Package.swift')) return 'swift';
  if (execQuiet('ls *.xcodeproj 2>/dev/null')) return 'ios';

  // Terraform
  if (execQuiet('ls *.tf 2>/dev/null')) return 'terraform';

  // Docker-only
  if (existsSync('Dockerfile') && !existsSync('package.json') && !existsSync('requirements.txt')) return 'docker';

  return 'unknown';
}

export function detectTypeCheckCmd(stack: TechStack): string | undefined {
  switch (stack) {
    case 'typescript':
    case 'react':
    case 'nextjs':
    case 'node':
      return existsSync('tsconfig.json') ? 'npx tsc --noEmit' : undefined;
    case 'python':
    case 'django':
    case 'fastapi':
    case 'flask':
      return execQuiet('which mypy') ? 'mypy .' : execQuiet('which pyright') ? 'pyright' : undefined;
    case 'go':
      return 'go vet ./...';
    case 'rust':
      return 'cargo check';
    case 'dotnet':
      return 'dotnet build --no-restore -v q';
    default:
      return undefined;
  }
}

export function detectTestCmd(stack: TechStack): string | undefined {
  switch (stack) {
    case 'typescript':
    case 'react':
    case 'nextjs':
    case 'node':
    case 'expo':
    case 'react-native':
      if (existsSync('vitest.config.js') || existsSync('vitest.config.ts')) return 'npx vitest run';
      if (existsSync('jest.config.js') || existsSync('jest.config.ts')) return 'npx jest';
      return 'npm test';
    case 'python':
    case 'django':
    case 'fastapi':
    case 'flask':
      return 'pytest';
    case 'go':
      return 'go test ./...';
    case 'rust':
      return 'cargo test';
    case 'maven':
    case 'spring':
      return './mvnw test -q';
    case 'gradle':
    case 'kotlin':
    case 'android':
      return './gradlew test -q';
    case 'ruby':
    case 'rails':
      return 'bundle exec rspec';
    case 'dotnet':
      return 'dotnet test --no-build -v q';
    case 'php':
    case 'laravel':
    case 'symfony':
      return 'vendor/bin/phpunit';
    default:
      return undefined;
  }
}

export function detectLintCmd(stack: TechStack): string | undefined {
  switch (stack) {
    case 'typescript':
    case 'react':
    case 'nextjs':
    case 'node':
      if (existsSync('.eslintrc.js') || existsSync('.eslintrc.json') || existsSync('eslint.config.js')) {
        return 'npx eslint .';
      }
      return undefined;
    case 'python':
    case 'django':
    case 'fastapi':
    case 'flask':
      return execQuiet('which ruff') ? 'ruff check .' : execQuiet('which flake8') ? 'flake8' : undefined;
    case 'go':
      return 'golangci-lint run 2>/dev/null || go vet ./...';
    case 'rust':
      return 'cargo clippy';
    case 'ruby':
    case 'rails':
      return 'bundle exec rubocop';
    case 'php':
    case 'laravel':
    case 'symfony':
      return 'vendor/bin/phpcs';
    default:
      return undefined;
  }
}

export function detectGitBranch(): string {
  const current = execQuiet('git branch --show-current');
  if (current) return current;
  
  if (execQuiet('git rev-parse --verify main 2>/dev/null')) return 'main';
  if (execQuiet('git rev-parse --verify master 2>/dev/null')) return 'master';
  if (execQuiet('git rev-parse --verify development 2>/dev/null')) return 'development';
  
  return 'main';
}

export function detectPackageManager(stack: TechStack): string {
  switch (stack) {
    case 'typescript':
    case 'react':
    case 'nextjs':
    case 'node':
    case 'expo':
    case 'react-native':
      if (existsSync('pnpm-lock.yaml')) return 'pnpm';
      if (existsSync('yarn.lock')) return 'yarn';
      if (existsSync('bun.lockb')) return 'bun';
      return 'npm';
    case 'python':
    case 'django':
    case 'fastapi':
    case 'flask':
      if (existsSync('poetry.lock')) return 'poetry';
      if (existsSync('Pipfile.lock')) return 'pipenv';
      return 'pip';
    default:
      return '';
  }
}

export function detectProjectConfig(): ProjectConfig {
  const techStack = detectTechStack();
  return {
    name: detectProjectName(),
    techStack,
    packageManager: detectPackageManager(techStack),
    gitBranch: detectGitBranch(),
    typeCheckCmd: detectTypeCheckCmd(techStack),
    testCmd: detectTestCmd(techStack),
    lintCmd: detectLintCmd(techStack),
  };
}

/**
 * Magic keyword detection for auto-selecting execution modes
 * Keywords: ralph, eco/ecomode, plan, ulw/ultrawork
 */
export interface MagicKeywordResult {
  mission?: 'ralph' | 'ultrawork';
  modelTier?: 'ecomode' | 'fast';
  shouldCreatePlan?: boolean;
  cleanedTask: string;
}

export function detectMagicKeywords(task: string): MagicKeywordResult {
  const result: MagicKeywordResult = {
    cleanedTask: task
  };

  // Normalize task for keyword detection (case-insensitive)
  const normalized = task.toLowerCase();

  // Ralph detection - persistent mode keyword
  // Match: ralph, @ralph, #ralph as standalone words
  const ralphMatch = normalized.match(/(?:^|\s)(@ralph|#ralph|ralph)(?:\s|$)/i);
  if (ralphMatch) {
    result.mission = 'ralph';
    // Remove the keyword from the task
    result.cleanedTask = task.replace(/(?:^|\s)(@ralph|#ralph|ralph)(?:\s|$)/i, ' ').trim();
  }

  // Ultrawork detection - parallel execution keyword
  // Match: ulw, ultrawork, @ulw, #ultrawork as standalone words
  const ulwMatch = normalized.match(/(?:^|\s)(@ulw|#ultrawork|@ultrawork|#ulw|ulw|ultrawork)(?:\s|$)/i);
  if (ulwMatch && !result.mission) {
    result.mission = 'ultrawork';
    // Remove the keyword from the task
    result.cleanedTask = task.replace(/(?:^|\s)(@ulw|#ultrawork|@ultrawork|#ulw|ulw|ultrawork)(?:\s|$)/i, ' ').trim();
  }

  // Eco mode detection - budget-conscious mode
  // Match: eco, ecomode, economy, @eco, #eco as standalone words
  const ecoMatch = normalized.match(/(?:^|\s)(@eco|#eco|@ecomode|#ecomode|eco|ecomode|economy)(?:\s|$)/i);
  if (ecoMatch) {
    result.modelTier = 'ecomode';
    // Remove the keyword from the task
    result.cleanedTask = result.cleanedTask.replace(/(?:^|\s)(@eco|#eco|@ecomode|#ecomode|eco|ecomode|economy)(?:\s|$)/i, ' ').trim();
  }

  // Plan detection - create flight plan
  // Match: plan, @plan, #plan as standalone words
  const planMatch = normalized.match(/(?:^|\s)(@plan|#plan|plan)(?:\s|$)/i);
  if (planMatch) {
    result.shouldCreatePlan = true;
    // Remove the keyword from the task
    result.cleanedTask = result.cleanedTask.replace(/(?:^|\s)(@plan|#plan|plan)(?:\s|$)/i, ' ').trim();
  }

  // Clean up extra whitespace
  result.cleanedTask = result.cleanedTask.replace(/\s+/g, ' ').trim();

  return result;
}
