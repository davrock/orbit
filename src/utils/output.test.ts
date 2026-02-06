// 🛸 ORBIT Terminal Output Utilities Tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  colors,
  printBanner,
  printLaunchBanner,
  printSection,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  printPhase,
  printMissionComplete,
  printKeyValue,
  printList,
  formatDuration,
  spinner
} from './output.js';

describe('output utilities', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let stdoutWriteSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    stdoutWriteSpy.mockRestore();
  });

  describe('colors', () => {
    it('should export color functions', () => {
      expect(colors.primary).toBeTypeOf('function');
      expect(colors.secondary).toBeTypeOf('function');
      expect(colors.success).toBeTypeOf('function');
      expect(colors.warning).toBeTypeOf('function');
      expect(colors.error).toBeTypeOf('function');
      expect(colors.info).toBeTypeOf('function');
      expect(colors.dim).toBeTypeOf('function');
      expect(colors.bold).toBeTypeOf('function');
    });

    it('should return styled strings', () => {
      const text = 'test';
      expect(colors.primary(text)).toBeTruthy();
      expect(colors.success(text)).toBeTruthy();
      expect(colors.error(text)).toBeTruthy();
    });
  });

  describe('printBanner', () => {
    it('should print ORBIT banner', () => {
      printBanner();
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('ORBIT');
      expect(output).toContain('Mission Control');
    });
  });

  describe('printLaunchBanner', () => {
    it('should print launch sequence banner', () => {
      printLaunchBanner();
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('ORBIT');
      expect(output).toContain('Launch Sequence');
    });
  });

  describe('printSection', () => {
    it('should print section with title', () => {
      printSection('Test Section');
      expect(consoleLogSpy).toHaveBeenCalledTimes(4);
      const calls = consoleLogSpy.mock.calls.map((c: unknown[]) => c[0]);
      expect(calls.join('')).toContain('Test Section');
    });

    it('should print separator lines', () => {
      printSection('Title');
      const calls = consoleLogSpy.mock.calls.map((c: unknown[]) => c[0]);
      expect(calls.some((c: unknown) => typeof c === 'string' && c.includes('━'))).toBe(true);
    });
  });

  describe('printSuccess', () => {
    it('should print success message with checkmark', () => {
      printSuccess('Task completed');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✓'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Task completed'));
    });
  });

  describe('printError', () => {
    it('should print error message with X mark', () => {
      printError('Task failed');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✗'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Task failed'));
    });
  });

  describe('printWarning', () => {
    it('should print warning message with warning symbol', () => {
      printWarning('Be careful');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('⚠'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Be careful'));
    });
  });

  describe('printInfo', () => {
    it('should print info message with info symbol', () => {
      printInfo('For your information');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ℹ'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('For your information'));
    });
  });

  describe('printPhase', () => {
    it('should print phase information', () => {
      printPhase('implement', 'pilot', 'standard', '🚀');
      expect(consoleLogSpy).toHaveBeenCalled();
      const calls = consoleLogSpy.mock.calls.map((c: unknown[]) => c[0]).join('');
      expect(calls).toContain('PHASE');
      expect(calls).toContain('IMPLEMENT');
      expect(calls).toContain('pilot');
      expect(calls).toContain('standard');
    });

    it('should format phase name uppercase', () => {
      printPhase('test', 'specialist', 'premium', '⚡');
      const calls = consoleLogSpy.mock.calls.map((c: unknown[]) => c[0]).join('');
      expect(calls).toContain('TEST');
    });
  });

  describe('printMissionComplete', () => {
    it('should print completion message with metrics', () => {
      printMissionComplete(5, 180);
      const calls = consoleLogSpy.mock.calls.map((c: unknown[]) => c[0]).join('');
      expect(calls).toContain('MISSION COMPLETE');
      expect(calls).toContain('Phases: 5');
      expect(calls).toContain('3m 0s');
    });

    it('should handle single phase', () => {
      printMissionComplete(1, 45);
      const calls = consoleLogSpy.mock.calls.map((c: unknown[]) => c[0]).join('');
      expect(calls).toContain('Phases: 1');
      expect(calls).toContain('0m 45s');
    });
  });

  describe('printKeyValue', () => {
    it('should print key-value pair', () => {
      printKeyValue('Status', 'Running');
      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain('Status:');
      expect(output).toContain('Running');
    });
  });

  describe('printList', () => {
    it('should print list of items with bullets', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];
      printList(items);
      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
      consoleLogSpy.mock.calls.forEach((call: unknown[], i: number) => {
        expect(call[0]).toContain('•');
        expect(call[0]).toContain(items[i]);
      });
    });

    it('should handle empty list', () => {
      printList([]);
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should use custom prefix', () => {
      printList(['Test'], '    ');
      expect(consoleLogSpy).toHaveBeenCalledWith('    • Test');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only for < 60s', () => {
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('should format minutes and seconds for < 60m', () => {
      expect(formatDuration(60)).toBe('1m 0s');
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(125)).toBe('2m 5s');
      expect(formatDuration(3599)).toBe('59m 59s');
    });

    it('should format hours and minutes for >= 60m', () => {
      expect(formatDuration(3600)).toBe('1h 0m');
      expect(formatDuration(3660)).toBe('1h 1m');
      expect(formatDuration(7200)).toBe('2h 0m');
      expect(formatDuration(7380)).toBe('2h 3m');
      expect(formatDuration(86400)).toBe('24h 0m');
    });
  });

  describe('spinner', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create spinner object with stop method', () => {
      const spin = spinner('Loading...');
      expect(spin).toHaveProperty('stop');
      expect(spin.stop).toBeTypeOf('function');
      spin.stop();
    });

    it('should animate spinner frames', () => {
      spinner('Processing...');
      
      vi.advanceTimersByTime(80);
      expect(stdoutWriteSpy).toHaveBeenCalled();
      
      const firstCall = stdoutWriteSpy.mock.calls[0][0];
      expect(firstCall).toContain('Processing...');
    });

    it('should stop with success message', () => {
      const spin = spinner('Task');
      vi.advanceTimersByTime(160);
      
      spin.stop(true);
      
      const finalCall = stdoutWriteSpy.mock.calls[stdoutWriteSpy.mock.calls.length - 1][0];
      expect(finalCall).toContain('✓');
      expect(finalCall).toContain('Task');
    });

    it('should stop with error message', () => {
      const spin = spinner('Task');
      vi.advanceTimersByTime(160);
      
      spin.stop(false);
      
      const finalCall = stdoutWriteSpy.mock.calls[stdoutWriteSpy.mock.calls.length - 1][0];
      expect(finalCall).toContain('✗');
      expect(finalCall).toContain('Task');
    });

    it('should stop with success by default', () => {
      const spin = spinner('Task');
      vi.advanceTimersByTime(160);
      
      spin.stop();
      
      const finalCall = stdoutWriteSpy.mock.calls[stdoutWriteSpy.mock.calls.length - 1][0];
      expect(finalCall).toContain('✓');
    });

    it('should clear interval on stop', () => {
      const spin = spinner('Loading');
      const initialCalls = stdoutWriteSpy.mock.calls.length;
      
      vi.advanceTimersByTime(240);
      spin.stop();
      
      const callsBeforeClear = stdoutWriteSpy.mock.calls.length;
      vi.advanceTimersByTime(240);
      const callsAfterClear = stdoutWriteSpy.mock.calls.length;
      
      expect(callsAfterClear).toBe(callsBeforeClear);
    });
  });
});
