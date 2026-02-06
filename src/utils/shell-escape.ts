// 🛸 ORBIT Shell Escape Utilities
// Prevent command injection by properly escaping shell arguments

/**
 * Escapes a string for safe use in a shell command.
 * Wraps the string in single quotes and escapes any single quotes within.
 * This prevents command injection attacks.
 * 
 * @param arg - The string to escape
 * @returns The escaped string safe for shell execution
 */
export function escapeShellArg(arg: string): string {
  // Replace single quotes with '\'' (end quote, escaped quote, start quote)
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

/**
 * Escapes multiple arguments for safe use in a shell command.
 * 
 * @param args - Array of strings to escape
 * @returns Array of escaped strings
 */
export function escapeShellArgs(args: string[]): string[] {
  return args.map(escapeShellArg);
}

/**
 * Joins escaped shell arguments with spaces.
 * 
 * @param args - Array of strings to escape and join
 * @returns A single string with all arguments properly escaped and space-separated
 */
export function joinShellArgs(args: string[]): string {
  return escapeShellArgs(args).join(' ');
}
