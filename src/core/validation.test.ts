// 🛸 ORBIT Runtime Validation Tests

import { describe, it, expect } from 'vitest';
import {
  validateModelTier,
  validateMissionType,
  validatePhase,
  validateCrewMember,
  safeParseModelTier,
  safeParseMissionType,
  safeParsePhase,
  safeParseCrewMember,
  isValidModelTier,
  isValidMissionType,
  isValidPhase,
  isValidCrewMember
} from './validation.js';

describe('validateModelTier', () => {
  it('should accept valid model tiers', () => {
    expect(() => validateModelTier('premium')).not.toThrow();
    expect(() => validateModelTier('standard')).not.toThrow();
    expect(() => validateModelTier('fast')).not.toThrow();
    expect(() => validateModelTier('ecomode')).not.toThrow();
  });

  it('should reject invalid model tiers', () => {
    expect(() => validateModelTier('invalid')).toThrow('Invalid model tier');
    expect(() => validateModelTier('Premium')).toThrow(); // case sensitive
    expect(() => validateModelTier('')).toThrow();
    expect(() => validateModelTier(null)).toThrow();
    expect(() => validateModelTier(undefined)).toThrow();
    expect(() => validateModelTier(123)).toThrow();
  });

  it('should provide helpful error message', () => {
    expect(() => validateModelTier('turbo')).toThrow(
      'Invalid model tier: "turbo". Must be one of: premium, standard, fast, ecomode'
    );
  });
});

describe('validateMissionType', () => {
  it('should accept valid mission types', () => {
    expect(() => validateMissionType('launch')).not.toThrow();
    expect(() => validateMissionType('repair')).not.toThrow();
    expect(() => validateMissionType('warp')).not.toThrow();
    expect(() => validateMissionType('mayday')).not.toThrow();
    expect(() => validateMissionType('ralph')).not.toThrow();
    expect(() => validateMissionType('ultrawork')).not.toThrow();
    expect(() => validateMissionType('design-review')).not.toThrow();
  });

  it('should reject invalid mission types', () => {
    expect(() => validateMissionType('invalid')).toThrow('Invalid mission type');
    expect(() => validateMissionType('Launch')).toThrow(); // case sensitive
    expect(() => validateMissionType('')).toThrow();
    expect(() => validateMissionType(null)).toThrow();
  });
});

describe('validatePhase', () => {
  it('should accept valid phases', () => {
    expect(() => validatePhase('plan')).not.toThrow();
    expect(() => validatePhase('implement')).not.toThrow();
    expect(() => validatePhase('test')).not.toThrow();
    expect(() => validatePhase('review')).not.toThrow();
    expect(() => validatePhase('debug')).not.toThrow();
    expect(() => validatePhase('commit')).not.toThrow();
    expect(() => validatePhase('security')).not.toThrow();
    expect(() => validatePhase('document')).not.toThrow();
    expect(() => validatePhase('research')).not.toThrow();
  });

  it('should reject invalid phases', () => {
    expect(() => validatePhase('deploy')).toThrow('Invalid phase');
    expect(() => validatePhase('Plan')).toThrow(); // case sensitive
    expect(() => validatePhase('')).toThrow();
  });
});

describe('validateCrewMember', () => {
  it('should accept valid crew members', () => {
    expect(() => validateCrewMember('commander')).not.toThrow();
    expect(() => validateCrewMember('pilot')).not.toThrow();
    expect(() => validateCrewMember('engineer')).not.toThrow();
    expect(() => validateCrewMember('security-officer')).not.toThrow();
    expect(() => validateCrewMember('frontend-specialist')).not.toThrow();
  });

  it('should reject invalid crew members', () => {
    expect(() => validateCrewMember('captain')).toThrow('Invalid crew member');
    expect(() => validateCrewMember('Pilot')).toThrow(); // case sensitive
    expect(() => validateCrewMember('')).toThrow();
  });
});

describe('safeParseModelTier', () => {
  it('should return value for valid input', () => {
    expect(safeParseModelTier('premium')).toBe('premium');
    expect(safeParseModelTier('standard')).toBe('standard');
    expect(safeParseModelTier('fast')).toBe('fast');
    expect(safeParseModelTier('ecomode')).toBe('ecomode');
  });

  it('should return undefined for invalid input', () => {
    expect(safeParseModelTier('invalid')).toBeUndefined();
    expect(safeParseModelTier('Premium')).toBeUndefined();
    expect(safeParseModelTier('')).toBeUndefined();
    expect(safeParseModelTier(null)).toBeUndefined();
    expect(safeParseModelTier(undefined)).toBeUndefined();
    expect(safeParseModelTier(123)).toBeUndefined();
  });
});

describe('safeParseMissionType', () => {
  it('should return value for valid input', () => {
    expect(safeParseMissionType('launch')).toBe('launch');
    expect(safeParseMissionType('repair')).toBe('repair');
    expect(safeParseMissionType('warp')).toBe('warp');
  });

  it('should return undefined for invalid input', () => {
    expect(safeParseMissionType('invalid')).toBeUndefined();
    expect(safeParseMissionType('')).toBeUndefined();
    expect(safeParseMissionType(null)).toBeUndefined();
  });
});

describe('safeParsePhase', () => {
  it('should return value for valid input', () => {
    expect(safeParsePhase('plan')).toBe('plan');
    expect(safeParsePhase('implement')).toBe('implement');
    expect(safeParsePhase('test')).toBe('test');
  });

  it('should return undefined for invalid input', () => {
    expect(safeParsePhase('invalid')).toBeUndefined();
    expect(safeParsePhase('')).toBeUndefined();
  });
});

describe('safeParseCrewMember', () => {
  it('should return value for valid input', () => {
    expect(safeParseCrewMember('pilot')).toBe('pilot');
    expect(safeParseCrewMember('engineer')).toBe('engineer');
    expect(safeParseCrewMember('security-officer')).toBe('security-officer');
  });

  it('should return undefined for invalid input', () => {
    expect(safeParseCrewMember('invalid')).toBeUndefined();
    expect(safeParseCrewMember('')).toBeUndefined();
  });
});

describe('isValidModelTier', () => {
  it('should return true for valid tiers', () => {
    expect(isValidModelTier('premium')).toBe(true);
    expect(isValidModelTier('standard')).toBe(true);
    expect(isValidModelTier('fast')).toBe(true);
    expect(isValidModelTier('ecomode')).toBe(true);
  });

  it('should return false for invalid tiers', () => {
    expect(isValidModelTier('invalid')).toBe(false);
    expect(isValidModelTier('Premium')).toBe(false);
    expect(isValidModelTier('')).toBe(false);
    expect(isValidModelTier(null)).toBe(false);
    expect(isValidModelTier(undefined)).toBe(false);
    expect(isValidModelTier(123)).toBe(false);
  });
});

describe('isValidMissionType', () => {
  it('should return true for valid mission types', () => {
    expect(isValidMissionType('launch')).toBe(true);
    expect(isValidMissionType('repair')).toBe(true);
    expect(isValidMissionType('warp')).toBe(true);
    expect(isValidMissionType('ralph')).toBe(true);
  });

  it('should return false for invalid mission types', () => {
    expect(isValidMissionType('invalid')).toBe(false);
    expect(isValidMissionType('Launch')).toBe(false);
    expect(isValidMissionType('')).toBe(false);
    expect(isValidMissionType(null)).toBe(false);
  });
});

describe('isValidPhase', () => {
  it('should return true for valid phases', () => {
    expect(isValidPhase('plan')).toBe(true);
    expect(isValidPhase('implement')).toBe(true);
    expect(isValidPhase('test')).toBe(true);
  });

  it('should return false for invalid phases', () => {
    expect(isValidPhase('invalid')).toBe(false);
    expect(isValidPhase('Plan')).toBe(false);
    expect(isValidPhase('')).toBe(false);
  });
});

describe('isValidCrewMember', () => {
  it('should return true for valid crew members', () => {
    expect(isValidCrewMember('pilot')).toBe(true);
    expect(isValidCrewMember('engineer')).toBe(true);
    expect(isValidCrewMember('security-officer')).toBe(true);
  });

  it('should return false for invalid crew members', () => {
    expect(isValidCrewMember('invalid')).toBe(false);
    expect(isValidCrewMember('Pilot')).toBe(false);
    expect(isValidCrewMember('')).toBe(false);
  });
});

// Edge cases and integration tests
describe('validation edge cases', () => {
  it('should handle objects as input', () => {
    expect(isValidModelTier({})).toBe(false);
    expect(isValidMissionType({})).toBe(false);
  });

  it('should handle arrays as input', () => {
    expect(isValidModelTier(['premium'])).toBe(false);
    expect(isValidPhase(['plan'])).toBe(false);
  });

  it('should handle boolean as input', () => {
    expect(isValidCrewMember(true)).toBe(false);
    expect(isValidCrewMember(false)).toBe(false);
  });
});
