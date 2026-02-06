// 🛸 ORBIT Terminal Output Utilities

import chalk from 'chalk';

export const colors = {
  primary: chalk.magenta,
  secondary: chalk.cyan,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.blue,
  dim: chalk.dim,
  bold: chalk.bold
};

export function printBanner(): void {
  console.log(colors.primary(`
╔══════════════════════════════════════════════════════════════╗
║  🛸 ORBIT - Mission Control                                   ║
║     Orchestrated Robotic Build & Integration Toolkit         ║
╚══════════════════════════════════════════════════════════════╝
`));
}

export function printLaunchBanner(): void {
  console.log(colors.primary(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 ORBIT - Launch Sequence                               ║
║     Self-Improving Development System                     ║
╚═══════════════════════════════════════════════════════════╝
`));
}

export function printSection(title: string): void {
  console.log('');
  console.log(colors.secondary('━'.repeat(64)));
  console.log(colors.secondary(`  ${title}`));
  console.log(colors.secondary('━'.repeat(64)));
}

export function printSuccess(message: string): void {
  console.log(colors.success(`✓ ${message}`));
}

export function printError(message: string): void {
  console.log(colors.error(`✗ ${message}`));
}

export function printWarning(message: string): void {
  console.log(colors.warning(`⚠ ${message}`));
}

export function printInfo(message: string): void {
  console.log(colors.info(`ℹ ${message}`));
}

export function printPhase(phase: string, crew: string, tier: string, icon: string): void {
  console.log('');
  console.log(colors.secondary('━'.repeat(64)));
  console.log(colors.secondary(`  PHASE: ${phase.toUpperCase()} │ Crew: ${crew} │ Model: ${icon} ${tier}`));
  console.log(colors.secondary('━'.repeat(64)));
}

export function printMissionComplete(cycles: number, duration: number): void {
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  console.log('');
  console.log(colors.success('━'.repeat(64)));
  console.log(colors.success(`  🎯 MISSION COMPLETE │ Phases: ${cycles} │ Time: ${mins}m ${secs}s`));
  console.log(colors.success('━'.repeat(64)));
}

export function printKeyValue(key: string, value: string): void {
  console.log(`  ${colors.warning(key + ':')} ${colors.secondary(value)}`);
}

export function printList(items: string[], prefix = '  '): void {
  for (const item of items) {
    console.log(`${prefix}• ${item}`);
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

export function spinner(message: string): { stop: (success?: boolean) => void } {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  const interval = setInterval(() => {
    process.stdout.write(`\r${colors.secondary(frames[i])} ${message}`);
    i = (i + 1) % frames.length;
  }, 80);
  
  return {
    stop: (success = true) => {
      clearInterval(interval);
      const icon = success ? colors.success('✓') : colors.error('✗');
      process.stdout.write(`\r${icon} ${message}\n`);
    }
  };
}
