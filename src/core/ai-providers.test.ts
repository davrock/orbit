// 🛸 ORBIT AI Provider Tests
// Tests for AI provider integration

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getProviderConfigs,
  hasProviders,
  getProviderSummary,
  type AIProviderConfig,
  type ValidationResult,
  type ConsistencyCheck
} from './ai-providers.js';

describe('AI Provider Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should detect no providers when no API keys are set', () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const configs = getProviderConfigs();
    expect(configs).toEqual([]);
    expect(hasProviders()).toBe(false);
  });

  it('should detect Gemini provider when API key is set', () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';

    const configs = getProviderConfigs();
    expect(configs).toHaveLength(1);
    expect(configs[0].name).toBe('gemini');
    expect(configs[0].enabled).toBe(true);
    expect(configs[0].apiKey).toBe('test-gemini-key');
    expect(hasProviders()).toBe(true);
  });

  it('should detect OpenAI provider when API key is set', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';

    const configs = getProviderConfigs();
    expect(configs).toHaveLength(1);
    expect(configs[0].name).toBe('codex');
    expect(configs[0].enabled).toBe(true);
    expect(configs[0].apiKey).toBe('test-openai-key');
  });

  it('should detect Anthropic provider when API key is set', () => {
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

    const configs = getProviderConfigs();
    expect(configs).toHaveLength(1);
    expect(configs[0].name).toBe('anthropic');
    expect(configs[0].enabled).toBe(true);
    expect(configs[0].apiKey).toBe('test-anthropic-key');
  });

  it('should detect multiple providers when multiple API keys are set', () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

    const configs = getProviderConfigs();
    expect(configs).toHaveLength(3);
    expect(configs.map(c => c.name).sort()).toEqual(['anthropic', 'codex', 'gemini']);
  });

  it('should include correct endpoints for each provider', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.ANTHROPIC_API_KEY = 'test-key';

    const configs = getProviderConfigs();
    const gemini = configs.find(c => c.name === 'gemini');
    const openai = configs.find(c => c.name === 'codex');
    const anthropic = configs.find(c => c.name === 'anthropic');

    expect(gemini?.endpoint).toBe('https://generativelanguage.googleapis.com/v1');
    expect(openai?.endpoint).toBe('https://api.openai.com/v1');
    expect(anthropic?.endpoint).toBe('https://api.anthropic.com/v1');
  });
});

describe('Provider Summary', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return helpful message when no providers configured', () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const summary = getProviderSummary();
    expect(summary).toContain('No AI providers configured');
    expect(summary).toContain('GEMINI_API_KEY');
    expect(summary).toContain('OPENAI_API_KEY');
    expect(summary).toContain('ANTHROPIC_API_KEY');
  });

  it('should list configured providers', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.OPENAI_API_KEY = 'test-key';

    const summary = getProviderSummary();
    expect(summary).toContain('Configured providers');
    expect(summary).toContain('gemini');
    expect(summary).toContain('codex');
  });

  it('should list all providers when all are configured', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.ANTHROPIC_API_KEY = 'test-key';

    const summary = getProviderSummary();
    expect(summary).toContain('gemini');
    expect(summary).toContain('codex');
    expect(summary).toContain('anthropic');
  });
});

describe('Validation Result Structure', () => {
  it('should have correct ValidationResult structure', () => {
    const result: ValidationResult = {
      provider: 'gemini',
      validated: true,
      confidence: 0.95,
      issues: ['Minor issue found'],
      suggestions: ['Add more tests'],
      timestamp: new Date()
    };

    expect(result.provider).toBe('gemini');
    expect(result.validated).toBe(true);
    expect(result.confidence).toBe(0.95);
    expect(result.issues).toHaveLength(1);
    expect(result.suggestions).toHaveLength(1);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should handle empty issues and suggestions', () => {
    const result: ValidationResult = {
      provider: 'codex',
      validated: true,
      confidence: 1.0,
      issues: [],
      suggestions: [],
      timestamp: new Date()
    };

    expect(result.issues).toEqual([]);
    expect(result.suggestions).toEqual([]);
  });
});

describe('Consistency Check Structure', () => {
  it('should have correct ConsistencyCheck structure', () => {
    const check: ConsistencyCheck = {
      aspect: 'naming-conventions',
      consistent: true,
      details: 'All names follow camelCase',
      severity: 'low'
    };

    expect(check.aspect).toBe('naming-conventions');
    expect(check.consistent).toBe(true);
    expect(check.details).toBe('All names follow camelCase');
    expect(check.severity).toBe('low');
  });

  it('should support different severity levels', () => {
    const severities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    
    severities.forEach(severity => {
      const check: ConsistencyCheck = {
        aspect: 'test',
        consistent: false,
        details: 'test',
        severity
      };
      expect(check.severity).toBe(severity);
    });
  });
});

describe('Provider Config Structure', () => {
  it('should support optional endpoint field', () => {
    const config: AIProviderConfig = {
      name: 'gemini',
      enabled: true
    };

    expect(config.endpoint).toBeUndefined();
  });

  it('should support optional apiKey field', () => {
    const config: AIProviderConfig = {
      name: 'gemini',
      enabled: false
    };

    expect(config.apiKey).toBeUndefined();
  });

  it('should allow all fields to be set', () => {
    const config: AIProviderConfig = {
      name: 'anthropic',
      apiKey: 'test-key',
      enabled: true,
      endpoint: 'https://api.test.com'
    };

    expect(config.name).toBe('anthropic');
    expect(config.apiKey).toBe('test-key');
    expect(config.enabled).toBe(true);
    expect(config.endpoint).toBe('https://api.test.com');
  });
});
