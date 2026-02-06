// 🧪 Tests for ORBIT Project Detection
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import {
  detectProjectName,
  detectTechStack,
  detectTypeCheckCmd,
  detectTestCmd,
  detectLintCmd,
  detectGitBranch,
  detectPackageManager,
  detectProjectConfig,
  detectMagicKeywords
} from './detect.js';

vi.mock('fs');
vi.mock('child_process');

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);
const mockExecSync = vi.mocked(execSync);

describe('detectProjectName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
  });

  it('detects name from package.json', () => {
    mockExistsSync.mockImplementation((path) => path === 'package.json');
    mockReadFileSync.mockReturnValue('{"name": "my-app"}');
    expect(detectProjectName()).toBe('my-app');
  });

  it('detects name from app.json', () => {
    mockExistsSync.mockImplementation((path) => path === 'app.json');
    mockReadFileSync.mockReturnValue('{"name": "expo-app"}');
    expect(detectProjectName()).toBe('expo-app');
  });

  it('detects name from Cargo.toml', () => {
    mockExistsSync.mockImplementation((path) => path === 'Cargo.toml');
    mockReadFileSync.mockReturnValue('name = "rust-app"\nversion = "1.0.0"');
    expect(detectProjectName()).toBe('rust-app');
  });

  it('detects name from pom.xml', () => {
    mockExistsSync.mockImplementation((path) => path === 'pom.xml');
    mockReadFileSync.mockReturnValue('<artifactId>maven-app</artifactId>');
    expect(detectProjectName()).toBe('maven-app');
  });

  it('detects name from settings.gradle', () => {
    mockExistsSync.mockImplementation((path) => path === 'settings.gradle');
    mockReadFileSync.mockReturnValue('rootProject.name = "gradle-app"');
    expect(detectProjectName()).toBe('gradle-app');
  });

  it('detects name from go.mod', () => {
    mockExistsSync.mockImplementation((path) => path === 'go.mod');
    mockReadFileSync.mockReturnValue('module github.com/user/go-app');
    expect(detectProjectName()).toBe('go-app');
  });

  it('detects name from pyproject.toml', () => {
    mockExistsSync.mockImplementation((path) => path === 'pyproject.toml');
    mockReadFileSync.mockReturnValue('name = "python-app"');
    expect(detectProjectName()).toBe('python-app');
  });

  it('fallsback to directory name when exec fails', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('Command not found');
    });
    // Should fall back to process.cwd() basename
    const name = detectProjectName();
    expect(name).toBeTruthy();
    expect(typeof name).toBe('string');
  });

  it('handles invalid JSON gracefully', () => {
    mockExistsSync.mockImplementation((path) => path === 'package.json');
    mockReadFileSync.mockReturnValue('{invalid json}');
    mockExecSync.mockImplementation(() => { throw new Error(); });
    expect(detectProjectName()).toBeTruthy(); // Falls back to directory name
  });
});

describe('detectTechStack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
  });

  it('detects expo', () => {
    mockExistsSync.mockImplementation((path) => 
      path === 'app.json' || path === 'package.json'
    );
    mockReadFileSync.mockReturnValue('{"expo": {}}');
    expect(detectTechStack()).toBe('expo');
  });

  it('detects react-native', () => {
    mockExistsSync.mockImplementation((path) => 
      path === 'app.json' || path === 'package.json'
    );
    mockReadFileSync.mockReturnValue('{"react-native": "0.70"}');
    expect(detectTechStack()).toBe('react-native');
  });

  it('detects nextjs', () => {
    mockExistsSync.mockImplementation((path) => 
      path === 'package.json' || path === 'next.config.js'
    );
    expect(detectTechStack()).toBe('nextjs');
  });

  it('detects vue', () => {
    mockExistsSync.mockImplementation((path) => path === 'package.json');
    mockReadFileSync.mockReturnValue('{"vue": "3.0"}');
    expect(detectTechStack()).toBe('vue');
  });

  it('detects react', () => {
    mockExistsSync.mockImplementation((path) => path === 'package.json');
    mockReadFileSync.mockReturnValue('{"react": "18.0"}');
    expect(detectTechStack()).toBe('react');
  });

  it('detects typescript', () => {
    mockExistsSync.mockImplementation((path) => 
      path === 'package.json' || path === 'tsconfig.json'
    );
    mockReadFileSync.mockReturnValue('{"typescript": "5.0"}');
    expect(detectTechStack()).toBe('typescript');
  });

  it('detects django', () => {
    mockExistsSync.mockImplementation((path) => 
      path === 'requirements.txt' || path === 'manage.py'
    );
    expect(detectTechStack()).toBe('django');
  });

  it('detects fastapi', () => {
    mockExistsSync.mockImplementation((path) => path === 'requirements.txt');
    mockReadFileSync.mockReturnValue('fastapi==0.100.0\nuvicorn');
    expect(detectTechStack()).toBe('fastapi');
  });

  it('detects go', () => {
    mockExistsSync.mockImplementation((path) => path === 'go.mod');
    expect(detectTechStack()).toBe('go');
  });

  it('detects rust', () => {
    mockExistsSync.mockImplementation((path) => path === 'Cargo.toml');
    expect(detectTechStack()).toBe('rust');
  });

  it('detects spring', () => {
    mockExistsSync.mockImplementation((path) => path === 'pom.xml');
    mockReadFileSync.mockReturnValue('<dependency>spring-boot</dependency>');
    expect(detectTechStack()).toBe('spring');
  });

  it('detects android', () => {
    mockExistsSync.mockImplementation((path) => 
      path === 'build.gradle' || path === 'android'
    );
    mockReadFileSync.mockReturnValue('android { }');
    expect(detectTechStack()).toBe('android');
  });

  it('detects rails', () => {
    mockExistsSync.mockImplementation((path) => 
      path === 'Gemfile' || path === 'config/application.rb'
    );
    mockReadFileSync.mockReturnValue('gem "rails"');
    expect(detectTechStack()).toBe('rails');
  });

  it('detects unknown for unrecognized projects', () => {
    expect(detectTechStack()).toBe('unknown');
  });
});

describe('detectTypeCheckCmd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
    mockExecSync.mockImplementation(() => { throw new Error(); });
  });

  it('returns tsc command for typescript projects', () => {
    mockExistsSync.mockImplementation((path) => path === 'tsconfig.json');
    expect(detectTypeCheckCmd('typescript')).toBe('npx tsc --noEmit');
  });

  it('returns undefined for typescript projects without tsconfig', () => {
    expect(detectTypeCheckCmd('typescript')).toBeUndefined();
  });

  it('returns undefined when python type checker not found', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error();
    });
    expect(detectTypeCheckCmd('python')).toBeUndefined();
  });

  it('returns go vet for go projects', () => {
    expect(detectTypeCheckCmd('go')).toBe('go vet ./...');
  });

  it('returns cargo check for rust projects', () => {
    expect(detectTypeCheckCmd('rust')).toBe('cargo check');
  });

  it('returns dotnet build for dotnet projects', () => {
    expect(detectTypeCheckCmd('dotnet')).toBe('dotnet build --no-restore -v q');
  });
});

describe('detectTestCmd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
  });

  it('detects vitest', () => {
    mockExistsSync.mockImplementation((path) => path === 'vitest.config.ts');
    expect(detectTestCmd('typescript')).toBe('npx vitest run');
  });

  it('detects jest', () => {
    mockExistsSync.mockImplementation((path) => path === 'jest.config.js');
    expect(detectTestCmd('react')).toBe('npx jest');
  });

  it('returns npm test as fallback for node projects', () => {
    expect(detectTestCmd('node')).toBe('npm test');
  });

  it('returns pytest for python projects', () => {
    expect(detectTestCmd('python')).toBe('pytest');
  });

  it('returns go test for go projects', () => {
    expect(detectTestCmd('go')).toBe('go test ./...');
  });

  it('returns cargo test for rust projects', () => {
    expect(detectTestCmd('rust')).toBe('cargo test');
  });
});

describe('detectLintCmd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
    mockExecSync.mockImplementation(() => { throw new Error(); });
  });

  it('detects eslint', () => {
    mockExistsSync.mockImplementation((path) => path === '.eslintrc.js');
    expect(detectLintCmd('typescript')).toBe('npx eslint .');
  });

  it('returns undefined when no eslint config', () => {
    expect(detectLintCmd('typescript')).toBeUndefined();
  });

  it('returns undefined when python linter not found', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error();
    });
    expect(detectLintCmd('python')).toBeUndefined();
  });

  it('returns cargo clippy for rust', () => {
    expect(detectLintCmd('rust')).toBe('cargo clippy');
  });
});

describe('detectGitBranch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a branch name', () => {
    // This will either return the actual branch or fall back to 'main'
    const branch = detectGitBranch();
    expect(branch).toBeTruthy();
    expect(typeof branch).toBe('string');
  });

  it('defaults to main when git commands fail', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error();
    });
    expect(detectGitBranch()).toBe('main');
  });

  // Remove duplicate test - covered by 'defaults to main when git commands fail'
});

describe('detectPackageManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
  });

  it('detects pnpm', () => {
    mockExistsSync.mockImplementation((path) => path === 'pnpm-lock.yaml');
    expect(detectPackageManager('typescript')).toBe('pnpm');
  });

  it('detects yarn', () => {
    mockExistsSync.mockImplementation((path) => path === 'yarn.lock');
    expect(detectPackageManager('react')).toBe('yarn');
  });

  it('detects bun', () => {
    mockExistsSync.mockImplementation((path) => path === 'bun.lockb');
    expect(detectPackageManager('node')).toBe('bun');
  });

  it('defaults to npm', () => {
    expect(detectPackageManager('typescript')).toBe('npm');
  });

  it('detects poetry for python', () => {
    mockExistsSync.mockImplementation((path) => path === 'poetry.lock');
    expect(detectPackageManager('python')).toBe('poetry');
  });

  it('detects pipenv for python', () => {
    mockExistsSync.mockImplementation((path) => path === 'Pipfile.lock');
    expect(detectPackageManager('python')).toBe('pipenv');
  });

  it('defaults to pip for python', () => {
    expect(detectPackageManager('python')).toBe('pip');
  });
});

describe('detectProjectConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
    mockExecSync.mockImplementation(() => { throw new Error(); });
  });

  it('returns complete project config', () => {
    mockExistsSync.mockImplementation((path) => 
      path === 'package.json' || path === 'tsconfig.json'
    );
    mockReadFileSync.mockReturnValue('{"name": "test-app"}');
    
    const config = detectProjectConfig();
    
    expect(config.name).toBe('test-app');
    expect(config.techStack).toBe('typescript');
    expect(config.packageManager).toBe('npm');
    expect(config.gitBranch).toBe('main');
    expect(config.typeCheckCmd).toBe('npx tsc --noEmit');
  });
});

describe('detectMagicKeywords', () => {
  it('detects ralph keyword', () => {
    const result = detectMagicKeywords('ralph fix the bug');
    expect(result.mission).toBe('ralph');
    expect(result.cleanedTask).toBe('fix the bug');
  });

  it('detects @ralph keyword', () => {
    const result = detectMagicKeywords('@ralph implement feature');
    expect(result.mission).toBe('ralph');
    expect(result.cleanedTask).toBe('implement feature');
  });

  it('detects ultrawork keyword', () => {
    const result = detectMagicKeywords('ulw run tests');
    expect(result.mission).toBe('ultrawork');
    expect(result.cleanedTask).toBe('run tests');
  });

  it('detects #ultrawork keyword', () => {
    const result = detectMagicKeywords('#ultrawork deploy app');
    expect(result.mission).toBe('ultrawork');
    expect(result.cleanedTask).toBe('deploy app');
  });

  it('detects eco keyword', () => {
    const result = detectMagicKeywords('eco fix typo');
    expect(result.modelTier).toBe('ecomode');
    expect(result.cleanedTask).toBe('fix typo');
  });

  it('detects plan keyword', () => {
    const result = detectMagicKeywords('plan create dashboard');
    expect(result.shouldCreatePlan).toBe(true);
    expect(result.cleanedTask).toBe('create dashboard');
  });

  it('detects multiple keywords', () => {
    const result = detectMagicKeywords('ralph eco plan build api');
    expect(result.mission).toBe('ralph');
    expect(result.modelTier).toBe('ecomode');
    expect(result.shouldCreatePlan).toBe(true);
    expect(result.cleanedTask).toBe('build api');
  });

  it('prioritizes ralph over ultrawork', () => {
    const result = detectMagicKeywords('ralph ulw test');
    expect(result.mission).toBe('ralph');
    // ulw should still be in the task since it's only removed if it's the mission
    expect(result.cleanedTask).toBe('ulw test');
  });

  it('handles keywords at different positions', () => {
    const result = detectMagicKeywords('fix the eco bug ralph style');
    expect(result.mission).toBe('ralph');
    expect(result.modelTier).toBe('ecomode');
    expect(result.cleanedTask).toBe('fix the bug style');
  });

  it('returns original task when no keywords', () => {
    const result = detectMagicKeywords('just fix the bug');
    expect(result.mission).toBeUndefined();
    expect(result.modelTier).toBeUndefined();
    expect(result.shouldCreatePlan).toBeUndefined();
    expect(result.cleanedTask).toBe('just fix the bug');
  });

  it('handles case-insensitive keywords', () => {
    const result = detectMagicKeywords('RALPH ECO PLAN build');
    expect(result.mission).toBe('ralph');
    expect(result.modelTier).toBe('ecomode');
    expect(result.shouldCreatePlan).toBe(true);
  });

  it('cleans up extra whitespace', () => {
    const result = detectMagicKeywords('ralph    eco    fix    bug');
    expect(result.cleanedTask).toBe('fix bug');
  });
});
