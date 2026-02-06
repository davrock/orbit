#!/usr/bin/env node
/**
 * 🛸 ORBIT Post-install script
 * Shows welcome message after global install
 */

import chalk from 'chalk';

console.log('');
console.log(chalk.cyan('🛸 ORBIT installed successfully!'));
console.log('');
console.log(chalk.white('Run ') + chalk.green('orbit --help') + chalk.white(' to get started'));
console.log('');
