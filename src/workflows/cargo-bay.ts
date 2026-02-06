// 🛸 ORBIT Cargo Bay
// Processes mission cargo (tasks) from the queue

import {
  loadCargo,
  getNextCargoItem,
  markCargoDelivered,
  appendLog,
  type CargoItem
} from '../core/index.js';
import {
  printSection,
  printSuccess,
  printError,
  printWarning,
  colors
} from '../utils/output.js';
import { runMission } from './mission-control.js';

export interface CargoBayOptions {
  dryRun?: boolean;
  mission?: string;
}

export class CargoBay {
  private options: CargoBayOptions;

  constructor(options: CargoBayOptions = {}) {
    this.options = options;
  }

  async process(): Promise<{ delivered: number; lost: number }> {
    console.log(colors.primary(`
╔══════════════════════════════════════════════════════════════╗
║  📦 ORBIT - Cargo Bay                                         ║
║     Autonomous Mission Payload Processor                      ║
╚══════════════════════════════════════════════════════════════╝
`));

    this.showManifest();

    console.log(colors.warning('🚀 Processing cargo autonomously...'));
    console.log('');

    appendLog('Cargo Bay opened');

    let delivered = 0;
    let lost = 0;
    const startTime = Date.now();

    while (true) {
      const item = getNextCargoItem();
      
      if (!item) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;

        console.log('');
        printSection('📦 All cargo delivered!');
        console.log(`Delivered: ${delivered}`);
        console.log(`Lost: ${lost}`);
        console.log(`Time: ${mins}m ${secs}s`);
        break;
      }

      const success = await this.processItem(item);
      
      if (success) {
        delivered++;
        appendLog(`✓ ${item.task}`);
      } else {
        lost++;
        appendLog(`✗ ${item.task} (lost)`);
        printWarning('Cargo lost, continuing...');
      }

      console.log('');
      console.log(colors.info('📦 Loading next cargo...'));
      await this.sleep(3000);
    }

    appendLog(`Cargo Bay closed: ${delivered} delivered, ${lost} lost`);
    return { delivered, lost };
  }

  private async processItem(item: CargoItem): Promise<boolean> {
    printSection(`📦 Processing: ${item.task}`);

    if (this.options.dryRun) {
      console.log(colors.warning('[DRY RUN] Would process cargo'));
      markCargoDelivered(item.task);
      return true;
    }

    try {
      const result = await runMission({
        mission: 'launch',
        task: item.task,
        modelTier: 'auto'
      });

      if (result.success) {
        printSuccess(`Cargo delivered: ${item.task}`);
        markCargoDelivered(item.task);
        return true;
      } else {
        printError(`Cargo delivery failed: ${item.task}`);
        return false;
      }
    } catch (error) {
      printError(`Cargo delivery error: ${error}`);
      return false;
    }
  }

  showManifest(): void {
    console.log(colors.secondary('📦 Cargo Manifest:'));
    console.log('');

    const items = loadCargo();
    const pending = items.filter(i => !i.delivered);
    
    if (pending.length === 0) {
      printSuccess('Cargo bay empty! All deliveries complete.');
      return;
    }

    let count = 0;
    for (const item of pending) {
      count++;
      console.log(`  ${count}. ${item.task}`);
    }
    console.log('');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI entry point
export async function processCargo(options: CargoBayOptions = {}): Promise<void> {
  const bay = new CargoBay(options);
  await bay.process();
}

export function showCargo(): void {
  const bay = new CargoBay();
  bay.showManifest();
}
