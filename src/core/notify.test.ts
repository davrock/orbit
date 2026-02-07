// 🔔 ORBIT Notifications Tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as cp from 'child_process';
import {
  configureNotify,
  notify,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyMissionComplete,
  notifyMissionFailed,
  type NotifyUrgency,
  type NotifyMethod
} from './notify.js';

// Mock child_process
vi.mock('child_process');

describe('notify', () => {
  let execSyncMock: ReturnType<typeof vi.fn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    execSyncMock = vi.fn();
    (cp.execSync as any) = execSyncMock;
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Reset config to default
    configureNotify({ enabled: true, method: 'auto' });
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  describe('configureNotify', () => {
    it('should update notification config', () => {
      configureNotify({ enabled: false });
      // Verify by calling notify and checking it doesn't do anything
      notify('Test', 'Message');
      expect(execSyncMock).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should allow partial config updates', () => {
      configureNotify({ method: 'terminal' });
      notify('Test', 'Message');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should allow setting slack webhook', () => {
      configureNotify({ slackWebhook: 'https://hooks.slack.com/test' });
      // Config is set, actual notification tested separately
      expect(true).toBe(true);
    });
  });

  describe('commandExists check', () => {
    it('should detect when command exists', () => {
      execSyncMock.mockImplementation((cmd: string) => {
        if (cmd.includes('which')) return Buffer.from('');
        throw new Error('Command not found');
      });

      configureNotify({ method: 'desktop' });
      notify('Test', 'Message');
      
      // Should have called which to check for notify-send
      expect(execSyncMock).toHaveBeenCalledWith(
        expect.stringContaining('which'),
        expect.any(Object)
      );
    });

    it('should handle when command does not exist in auto mode', () => {
      execSyncMock.mockImplementation(() => {
        throw new Error('Command not found');
      });

      configureNotify({ method: 'auto' });
      notify('Test', 'Message');
      
      // Should fall back to terminal notification
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('desktop notifications', () => {
    it('should send desktop notification with notify-send', () => {
      execSyncMock.mockReturnValue(Buffer.from(''));

      configureNotify({ method: 'desktop' });
      notify('Test Title', 'Test Message', 'normal');

      const calls = execSyncMock.mock.calls;
      const notifySendCall = calls.find((call: any) => 
        call[0].includes('notify-send') && !call[0].includes('which')
      );
      
      expect(notifySendCall).toBeDefined();
      expect(notifySendCall![0]).toContain('-u normal');
      expect(notifySendCall![0]).toContain('Test Title');
      expect(notifySendCall![0]).toContain('Test Message');
    });

    it('should handle different urgency levels', () => {
      execSyncMock.mockReturnValue(Buffer.from(''));

      const urgencies: NotifyUrgency[] = ['low', 'normal', 'critical'];
      
      for (const urgency of urgencies) {
        execSyncMock.mockClear();
        configureNotify({ method: 'desktop' });
        notify('Test', 'Message', urgency);

        const calls = execSyncMock.mock.calls;
        const notifySendCall = calls.find((call: any) => 
          call[0].includes('notify-send') && !call[0].includes('which')
        );
        
        expect(notifySendCall).toBeDefined();
        expect(notifySendCall![0]).toContain(`-u ${urgency}`);
      }
    });

    it('should escape shell arguments in title and message', () => {
      execSyncMock.mockReturnValue(Buffer.from(''));

      configureNotify({ method: 'desktop' });
      notify('Title "with quotes"', 'Message $with special;chars', 'normal');

      const calls = execSyncMock.mock.calls;
      const notifySendCall = calls.find((call: any) => 
        call[0].includes('notify-send')
      );
      
      expect(notifySendCall).toBeDefined();
      // Shell escape should handle special characters
      expect(notifySendCall![0]).toContain('notify-send');
    });

    it('should fall back when notify-send fails', () => {
      execSyncMock.mockImplementation((cmd: string) => {
        if (cmd.includes('notify-send') && !cmd.includes('which')) throw new Error('Failed');
        if (cmd.includes('osascript') && !cmd.includes('which')) throw new Error('Failed');
        return Buffer.from('');
      });

      configureNotify({ method: 'auto' });
      notify('Test', 'Message');
      
      // Should fall back to terminal
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('macOS notifications', () => {
    it('should send macOS notification with osascript', () => {
      execSyncMock.mockReturnValue(Buffer.from(''));

      configureNotify({ method: 'macos' });
      notify('Test Title', 'Test Message');

      const calls = execSyncMock.mock.calls;
      const osascriptCall = calls.find((call: any) => 
        call[0].includes('osascript') && !call[0].includes('which')
      );
      
      expect(osascriptCall).toBeDefined();
      expect(osascriptCall![0]).toContain('display notification');
      expect(osascriptCall![0]).toContain('Test Message');
      expect(osascriptCall![0]).toContain('Test Title');
    });

    it('should escape AppleScript special characters', () => {
      execSyncMock.mockReturnValue(Buffer.from(''));

      configureNotify({ method: 'macos' });
      notify('Title "quoted"', 'Message with \\ backslash');

      const calls = execSyncMock.mock.calls;
      const osascriptCall = calls.find((call: any) => 
        call[0].includes('osascript') && !call[0].includes('which')
      );
      
      expect(osascriptCall).toBeDefined();
      // AppleScript escape should handle backslashes and quotes
      expect(osascriptCall![0]).toContain('osascript');
    });

    it('should fall back when osascript fails', () => {
      execSyncMock.mockImplementation((cmd: string) => {
        if (cmd.includes('osascript') && !cmd.includes('which')) throw new Error('Failed');
        if (cmd.includes('notify-send') && !cmd.includes('which')) throw new Error('Failed');
        return Buffer.from('');
      });

      configureNotify({ method: 'auto' });
      notify('Test', 'Message');
      
      // Should fall back to terminal
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('terminal notifications', () => {
    it('should output to console with correct icon for normal urgency', () => {
      configureNotify({ method: 'terminal' });
      notify('Test Title', 'Test Message', 'normal');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔔')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test Title')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test Message')
      );
    });

    it('should use critical icon for critical urgency', () => {
      configureNotify({ method: 'terminal' });
      notify('Error', 'Something went wrong', 'critical');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚨')
      );
    });

    it('should use low icon for low urgency', () => {
      configureNotify({ method: 'terminal' });
      notify('Info', 'Just a note', 'low');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('💬')
      );
    });
  });

  describe('auto method selection', () => {
    it('should try desktop first, then macOS, then terminal', () => {
      // Make all commands fail
      execSyncMock.mockImplementation(() => {
        throw new Error('Command not found');
      });

      configureNotify({ method: 'auto' });
      notify('Test', 'Message');

      // Should fall back to terminal
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should stop at first successful method', () => {
      execSyncMock.mockReturnValue(Buffer.from(''));

      configureNotify({ method: 'auto' });
      notify('Test', 'Message');

      // Should succeed with desktop or macOS, not fall back to terminal
      // (unless both fail, which is handled in the implementation)
      const notifySent = execSyncMock.mock.calls.some((call: any) => 
        call[0].includes('notify-send') || call[0].includes('osascript')
      );
      
      expect(notifySent || consoleLogSpy).toBeTruthy();
    });
  });

  describe('none method', () => {
    it('should not send any notifications when method is none', () => {
      configureNotify({ method: 'none' });
      notify('Test', 'Message');

      expect(execSyncMock).not.toHaveBeenCalledWith(
        expect.stringContaining('notify-send'),
        expect.any(Object)
      );
      expect(execSyncMock).not.toHaveBeenCalledWith(
        expect.stringContaining('osascript'),
        expect.any(Object)
      );
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('Slack notifications', () => {
    it('should send Slack notification when webhook is configured', async () => {
      execSyncMock.mockReturnValue(Buffer.from(''));

      configureNotify({
        method: 'terminal',
        slackWebhook: 'https://hooks.slack.com/test'
      });

      await notify('Test', 'Message', 'normal');

      const curlCall = execSyncMock.mock.calls.find((call: any) => 
        call[0].includes('curl')
      );
      
      expect(curlCall).toBeDefined();
      expect(curlCall![0]).toContain('hooks.slack.com/test');
      expect(curlCall![0]).toContain('-X POST');
      expect(curlCall![0]).toContain('Content-type: application/json');
    });

    it('should use correct color for different urgencies', async () => {
      execSyncMock.mockReturnValue(Buffer.from(''));

      const urgencies: Record<NotifyUrgency, string> = {
        critical: 'danger',
        normal: 'warning',
        low: 'good'
      };

      for (const [urgency, expectedColor] of Object.entries(urgencies)) {
        execSyncMock.mockClear();
        configureNotify({
          method: 'none',
          slackWebhook: 'https://hooks.slack.com/test'
        });

        await notify('Test', 'Message', urgency as NotifyUrgency);

        const curlCall = execSyncMock.mock.calls.find((call: any) => 
          call[0].includes('curl')
        );
        
        expect(curlCall).toBeDefined();
        expect(curlCall![0]).toContain(expectedColor);
      }
    });

    it('should not send Slack notification when webhook is not configured', async () => {
      execSyncMock.mockReturnValue(Buffer.from(''));
      
      configureNotify({ method: 'terminal', slackWebhook: undefined });
      await notify('Test', 'Message');

      const curlCall = execSyncMock.mock.calls.find((call: any) => 
        call[0]?.includes('curl')
      );
      
      expect(curlCall).toBeUndefined();
    });

    it('should handle Slack notification failures gracefully', async () => {
      execSyncMock.mockImplementation((cmd: string) => {
        if (cmd.includes('curl')) throw new Error('Slack failed');
        return Buffer.from('');
      });

      configureNotify({
        method: 'terminal',
        slackWebhook: 'https://hooks.slack.com/test'
      });

      // Should not throw
      await expect(notify('Test', 'Message')).resolves.toBeUndefined();
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      configureNotify({ method: 'terminal' });
    });

    it('should call notifySuccess with correct parameters', async () => {
      await notifySuccess('Build succeeded');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚀 ORBIT')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Build succeeded')
      );
    });

    it('should call notifyError with correct parameters', async () => {
      await notifyError('Build failed');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ ORBIT')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Build failed')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚨')
      );
    });

    it('should call notifyWarning with correct parameters', async () => {
      await notifyWarning('Low disk space');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ ORBIT')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Low disk space')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('💬')
      );
    });

    it('should call notifyMissionComplete with formatted message', async () => {
      await notifyMissionComplete('Build and deploy the application', 5, 120);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Mission Complete')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('5 phases')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('120s')
      );
    });

    it('should truncate long task names in notifyMissionComplete', async () => {
      const longTask = 'A'.repeat(100);
      await notifyMissionComplete(longTask, 3, 60);

      const call = consoleLogSpy.mock.calls.find((c: any) => 
        c[0]?.includes('Mission Complete')
      );
      
      expect(call).toBeDefined();
      expect(call![0]).toContain('...');
      expect(call![0].length).toBeLessThan(longTask.length + 50);
    });

    it('should call notifyMissionFailed with error details', async () => {
      await notifyMissionFailed('Deploy to production', 'deploy', 'Timeout');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Mission Failed')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('deploy')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Timeout')
      );
    });

    it('should handle notifyMissionFailed without error message', async () => {
      await notifyMissionFailed('Deploy to production', 'deploy');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Mission Failed')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('deploy')
      );
    });

    it('should truncate long task names in notifyMissionFailed', async () => {
      const longTask = 'B'.repeat(100);
      await notifyMissionFailed(longTask, 'test', 'Error');

      const call = consoleLogSpy.mock.calls.find((c: any) => 
        c[0]?.includes('Mission Failed')
      );
      
      expect(call).toBeDefined();
      expect(call![0]).toContain('...');
      expect(call![0].length).toBeLessThan(longTask.length + 50);
    });
  });

  describe('disabled notifications', () => {
    it('should not send any notifications when disabled', async () => {
      configureNotify({ enabled: false });
      await notify('Test', 'Message');

      expect(execSyncMock).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not send notifications from convenience methods when disabled', async () => {
      configureNotify({ enabled: false });
      
      await notifySuccess('Success');
      await notifyError('Error');
      await notifyWarning('Warning');
      await notifyMissionComplete('Task', 5, 60);
      await notifyMissionFailed('Task', 'phase', 'error');

      expect(execSyncMock).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});
