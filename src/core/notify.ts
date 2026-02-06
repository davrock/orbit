// 🔔 ORBIT Notifications
// Cross-platform notification support

import { execSync } from 'child_process';
import { escapeShellArg } from '../utils/shell-escape.js';

export type NotifyUrgency = 'low' | 'normal' | 'critical';
export type NotifyMethod = 'auto' | 'desktop' | 'macos' | 'terminal' | 'none';

interface NotifyConfig {
  enabled: boolean;
  method: NotifyMethod;
  slackWebhook?: string;
}

let config: NotifyConfig = {
  enabled: true,
  method: 'auto'
};

export function configureNotify(options: Partial<NotifyConfig>): void {
  config = { ...config, ...options };
}

function commandExists(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function notifyDesktop(title: string, message: string, urgency: NotifyUrgency): boolean {
  if (!commandExists('notify-send')) return false;
  
  try {
    execSync(`notify-send -u ${urgency} ${escapeShellArg(title)} ${escapeShellArg(message)}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function notifyMacOS(title: string, message: string): boolean {
  if (!commandExists('osascript')) return false;
  
  try {
    // Escape for AppleScript string literal (replace " with \" and \ with \\)
    const escapeAppleScript = (str: string): string => 
      str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    
    const script = `display notification "${escapeAppleScript(message)}" with title "${escapeAppleScript(title)}"`;
    execSync(`osascript -e ${escapeShellArg(script)}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function notifyTerminal(title: string, message: string, urgency: NotifyUrgency): void {
  const icon = urgency === 'critical' ? '🚨' : urgency === 'low' ? '💬' : '🔔';
  console.log(`\n${icon} ${title}: ${message}\n`);
}

async function notifySlack(title: string, message: string, urgency: NotifyUrgency): Promise<boolean> {
  if (!config.slackWebhook) return false;
  
  try {
    const color = urgency === 'critical' ? 'danger' : urgency === 'low' ? 'good' : 'warning';
    const payload = {
      attachments: [{
        color,
        title,
        text: message,
        ts: Math.floor(Date.now() / 1000)
      }]
    };
    
    // Use Node's native fetch or write to temp file instead of inline JSON in shell
    // For now, properly escape the JSON string for shell
    const jsonPayload = JSON.stringify(payload).replace(/'/g, "'\\''");
    
    execSync(`curl -s -X POST -H 'Content-type: application/json' --data '${jsonPayload}' ${escapeShellArg(config.slackWebhook)}`, {
      stdio: 'ignore'
    });
    return true;
  } catch {
    return false;
  }
}

export async function notify(
  title: string,
  message: string,
  urgency: NotifyUrgency = 'normal'
): Promise<void> {
  if (!config.enabled) return;
  
  const method = config.method;
  
  switch (method) {
    case 'desktop':
      notifyDesktop(title, message, urgency);
      break;
      
    case 'macos':
      notifyMacOS(title, message);
      break;
      
    case 'terminal':
      notifyTerminal(title, message, urgency);
      break;
      
    case 'auto':
      // Try each method in order
      if (notifyDesktop(title, message, urgency)) return;
      if (notifyMacOS(title, message)) return;
      notifyTerminal(title, message, urgency);
      break;
      
    case 'none':
      // Silent
      break;
  }
  
  // Also send to Slack if configured
  if (config.slackWebhook) {
    await notifySlack(title, message, urgency);
  }
}

// Convenience methods
export async function notifySuccess(message: string): Promise<void> {
  await notify('🚀 ORBIT', message, 'normal');
}

export async function notifyError(message: string): Promise<void> {
  await notify('❌ ORBIT', message, 'critical');
}

export async function notifyWarning(message: string): Promise<void> {
  await notify('⚠️ ORBIT', message, 'low');
}

export async function notifyMissionComplete(task: string, phases: number, duration: number): Promise<void> {
  await notify(
    '✅ Mission Complete',
    `${task.slice(0, 40)}... (${phases} phases, ${duration}s)`,
    'normal'
  );
}

export async function notifyMissionFailed(task: string, phase: string, error?: string): Promise<void> {
  await notify(
    '❌ Mission Failed',
    `${task.slice(0, 30)}... failed at ${phase}${error ? `: ${error}` : ''}`,
    'critical'
  );
}
