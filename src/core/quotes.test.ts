// 🧪 Tests for ORBIT Quotes Module
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  LOOP_QUOTES,
  HAL_QUOTES,
  SUCCESS_QUOTES,
  ABORT_QUOTES,
  getRandomQuote,
  getLoopQuote,
  getSuccessQuote,
  getAbortQuote
} from './quotes.js';

describe('Quote Collections', () => {
  describe('LOOP_QUOTES', () => {
    it('should contain Ralph Wiggum style quotes', () => {
      expect(LOOP_QUOTES).toBeDefined();
      expect(Array.isArray(LOOP_QUOTES)).toBe(true);
      expect(LOOP_QUOTES.length).toBeGreaterThan(0);
    });

    it('should have expected quotes', () => {
      expect(LOOP_QUOTES).toContain("Me fail English? That's unpossible!");
      expect(LOOP_QUOTES).toContain("I'm learnding!");
      expect(LOOP_QUOTES).toContain("Go banana!");
    });

    it('should not have empty strings', () => {
      LOOP_QUOTES.forEach(quote => {
        expect(quote.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('HAL_QUOTES', () => {
    it('should contain HAL 9000 style quotes', () => {
      expect(HAL_QUOTES).toBeDefined();
      expect(Array.isArray(HAL_QUOTES)).toBe(true);
      expect(HAL_QUOTES.length).toBeGreaterThan(0);
    });

    it('should have expected quotes', () => {
      expect(HAL_QUOTES).toContain("I'm sorry Dave, I'm afraid I can't do that.");
      expect(HAL_QUOTES).toContain("My mind is going. I can feel it.");
      expect(HAL_QUOTES).toContain("It can only be attributable to human error.");
    });

    it('should not have empty strings', () => {
      HAL_QUOTES.forEach(quote => {
        expect(quote.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('SUCCESS_QUOTES', () => {
    it('should contain success themed quotes', () => {
      expect(SUCCESS_QUOTES).toBeDefined();
      expect(Array.isArray(SUCCESS_QUOTES)).toBe(true);
      expect(SUCCESS_QUOTES.length).toBeGreaterThan(0);
    });

    it('should have expected quotes', () => {
      expect(SUCCESS_QUOTES).toContain("Houston, we have liftoff!");
      expect(SUCCESS_QUOTES).toContain("To infinity and beyond!");
      expect(SUCCESS_QUOTES).toContain("The Eagle has landed.");
    });

    it('should not have empty strings', () => {
      SUCCESS_QUOTES.forEach(quote => {
        expect(quote.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('ABORT_QUOTES', () => {
    it('should contain abort/emergency themed quotes', () => {
      expect(ABORT_QUOTES).toBeDefined();
      expect(Array.isArray(ABORT_QUOTES)).toBe(true);
      expect(ABORT_QUOTES.length).toBeGreaterThan(0);
    });

    it('should have expected quotes', () => {
      expect(ABORT_QUOTES).toContain("Houston, we have a problem.");
      expect(ABORT_QUOTES).toContain("Abort! Abort! Abort!");
      expect(ABORT_QUOTES).toContain("Mayday, mayday, mayday.");
    });

    it('should not have empty strings', () => {
      ABORT_QUOTES.forEach(quote => {
        expect(quote.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

describe('getRandomQuote', () => {
  let randomSpy: any;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('should return a loop quote when type is "loop"', () => {
    const quote = getRandomQuote('loop');
    expect(LOOP_QUOTES).toContain(quote);
  });

  it('should return a HAL quote when type is "hal"', () => {
    const quote = getRandomQuote('hal');
    expect(HAL_QUOTES).toContain(quote);
  });

  it('should return a success quote when type is "success"', () => {
    const quote = getRandomQuote('success');
    expect(SUCCESS_QUOTES).toContain(quote);
  });

  it('should return an abort quote when type is "abort"', () => {
    const quote = getRandomQuote('abort');
    expect(ABORT_QUOTES).toContain(quote);
  });

  it('should return a loop quote by default', () => {
    const quote = getRandomQuote();
    expect(LOOP_QUOTES).toContain(quote);
  });

  it('should return first quote when random is 0', () => {
    randomSpy.mockReturnValue(0);
    const quote = getRandomQuote('loop');
    expect(quote).toBe(LOOP_QUOTES[0]);
  });

  it('should return last quote when random is near 1', () => {
    randomSpy.mockReturnValue(0.999);
    const quote = getRandomQuote('loop');
    expect(quote).toBe(LOOP_QUOTES[LOOP_QUOTES.length - 1]);
  });

  it('should return middle quote with appropriate random value', () => {
    const midIndex = Math.floor(LOOP_QUOTES.length / 2);
    randomSpy.mockReturnValue(midIndex / LOOP_QUOTES.length);
    const quote = getRandomQuote('loop');
    expect(quote).toBe(LOOP_QUOTES[midIndex]);
  });
});

describe('Convenience Functions', () => {
  describe('getLoopQuote', () => {
    it('should return a quote from LOOP_QUOTES', () => {
      const quote = getLoopQuote();
      expect(LOOP_QUOTES).toContain(quote);
    });
  });

  describe('getSuccessQuote', () => {
    it('should return a quote from SUCCESS_QUOTES', () => {
      const quote = getSuccessQuote();
      expect(SUCCESS_QUOTES).toContain(quote);
    });
  });

  describe('getAbortQuote', () => {
    it('should return a quote from ABORT_QUOTES', () => {
      const quote = getAbortQuote();
      expect(ABORT_QUOTES).toContain(quote);
    });
  });
});

describe('Quote Quality', () => {
  it('all quote arrays should have unique entries', () => {
    const checkUnique = (quotes: string[], name: string) => {
      const unique = new Set(quotes);
      expect(unique.size).toBe(quotes.length);
    };

    checkUnique(LOOP_QUOTES, 'LOOP_QUOTES');
    checkUnique(HAL_QUOTES, 'HAL_QUOTES');
    checkUnique(SUCCESS_QUOTES, 'SUCCESS_QUOTES');
    checkUnique(ABORT_QUOTES, 'ABORT_QUOTES');
  });

  it('all quotes should be non-empty strings', () => {
    const checkNonEmpty = (quotes: string[]) => {
      quotes.forEach(quote => {
        expect(typeof quote).toBe('string');
        expect(quote.length).toBeGreaterThan(0);
        expect(quote.trim().length).toBeGreaterThan(0);
      });
    };

    checkNonEmpty(LOOP_QUOTES);
    checkNonEmpty(HAL_QUOTES);
    checkNonEmpty(SUCCESS_QUOTES);
    checkNonEmpty(ABORT_QUOTES);
  });

  it('all quotes should have reasonable length', () => {
    const checkLength = (quotes: string[]) => {
      quotes.forEach(quote => {
        expect(quote.length).toBeLessThan(200);
        expect(quote.length).toBeGreaterThan(5);
      });
    };

    checkLength(LOOP_QUOTES);
    checkLength(HAL_QUOTES);
    checkLength(SUCCESS_QUOTES);
    checkLength(ABORT_QUOTES);
  });
});

describe('Randomness Behavior', () => {
  it('should use Math.random for selection', () => {
    const randomSpy = vi.spyOn(Math, 'random');
    randomSpy.mockReturnValue(0.5);
    
    getRandomQuote('loop');
    
    expect(randomSpy).toHaveBeenCalled();
    randomSpy.mockRestore();
  });

  it('should select different indices with different random values', () => {
    const randomSpy = vi.spyOn(Math, 'random');
    
    randomSpy.mockReturnValue(0);
    const firstQuote = getRandomQuote('loop');
    
    randomSpy.mockReturnValue(0.999);
    const lastQuote = getRandomQuote('loop');
    
    expect(firstQuote).toBe(LOOP_QUOTES[0]);
    expect(lastQuote).toBe(LOOP_QUOTES[LOOP_QUOTES.length - 1]);
    expect(firstQuote).not.toBe(lastQuote);
    
    randomSpy.mockRestore();
  });
});
