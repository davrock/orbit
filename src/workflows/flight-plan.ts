// 🛸 ORBIT Flight Plan
// Implementation planning and GitHub issue generation

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';
import { appendLog } from '../core/index.js';
import { printSection, printSuccess, printError, colors } from '../utils/output.js';
import { commandExists, execQuiet, execCopilot } from '../utils/exec.js';

const PLANS_DIR = 'src/config/plans';

export interface FlightPlanOptions {
  depth?: 1 | 2 | 3;
  dryRun?: boolean;
  noIssues?: boolean;
}

export interface FlightPlan {
  id: string;
  title: string;
  objective: string;
  status: 'draft' | 'issues_created' | 'in_progress' | 'complete' | 'failed';
  createdAt: string;
  totalTasks: number;
  completedTasks: number;
  phases: FlightPlanPhase[];
}

export interface FlightPlanPhase {
  name: string;
  tasks: FlightPlanTask[];
}

export interface FlightPlanTask {
  id: string;
  description: string;
  completed: boolean;
  issueNumber?: number;
}

export class FlightPlanGenerator {
  private options: FlightPlanOptions;

  constructor(options: FlightPlanOptions = {}) {
    this.options = {
      depth: options.depth || 2,
      dryRun: options.dryRun || false,
      noIssues: options.noIssues || false
    };
    this.ensureDir();
  }

  private ensureDir(): void {
    if (!existsSync(PLANS_DIR)) {
      mkdirSync(PLANS_DIR, { recursive: true });
    }
  }

  generatePlanId(): string {
    const files = existsSync(PLANS_DIR) ? readdirSync(PLANS_DIR).filter(f => f.endsWith('.md')) : [];
    return `plan-${String(files.length + 1).padStart(3, '0')}`;
  }

  async createPlan(feature: string): Promise<string> {
    const planId = this.generatePlanId();
    const planFile = join(PLANS_DIR, `${planId}.md`);

    console.log(colors.primary(`
╔══════════════════════════════════════════════════════════════╗
║  🛸 ORBIT - Flight Plan Generator                            ║
╚══════════════════════════════════════════════════════════════╝
`));

    console.log(`Feature: ${colors.secondary(feature)}`);
    console.log(`Plan ID: ${colors.secondary(planId)}`);
    console.log(`Depth: ${colors.secondary(String(this.options.depth))}`);
    console.log('');

    if (this.options.dryRun) {
      const template = this.generateTemplate(planId, feature);
      writeFileSync(planFile, template);
      console.log(colors.warning('[DRY RUN] Would generate plan with AI analysis'));
      return planId;
    }

    // Check if Copilot CLI is available
    if (!commandExists('copilot')) {
      console.log(colors.warning('Copilot CLI not found - generating template only'));
      const template = this.generateTemplate(planId, feature);
      writeFileSync(planFile, template);
      printSuccess(`Flight plan template created: ${planFile}`);
      return planId;
    }

    console.log(colors.warning('🚀 Analyzing codebase with Copilot CLI...'));
    console.log('');

    const depthDescriptions: Record<number, string> = {
      1: '3-5 high-level tasks',
      2: '8-12 tasks with architecture decisions',
      3: '15+ detailed tasks with risks, testing strategy, and dependencies'
    };

    const prompt = `You are a software architect creating an implementation plan.

FEATURE: ${feature}

Analyze this codebase and create a detailed flight plan (implementation plan) for the feature above.

DEPTH LEVEL: ${this.options.depth} (${depthDescriptions[this.options.depth || 2]})

Create a markdown file at: ${planFile}

The plan MUST include:
1. Objective - clear description of what will be built
2. Requirements - specific requirements derived from analyzing the codebase
3. Architecture Decisions - key technical decisions based on existing patterns
4. Implementation Phases - organized tasks with checkboxes (- [ ] Task description)
5. Testing Strategy - unit, integration, e2e tests needed
6. Documentation Updates - what docs need updating

Format each task as a checkbox: - [ ] Task description

After creating the plan, say 'FLIGHT PLAN COMPLETE'.`;

    const result = await execCopilot(prompt, {
      timeout: 300,
      allowAllPaths: true
    });

    if (!result.success) {
      console.log(colors.warning('AI analysis failed - generating template'));
      const template = this.generateTemplate(planId, feature);
      writeFileSync(planFile, template);
    }

    // Verify the plan was created
    if (!existsSync(planFile)) {
      console.log(colors.warning('Plan file not created - generating template'));
      const template = this.generateTemplate(planId, feature);
      writeFileSync(planFile, template);
    }

    printSuccess(`Flight plan created: ${planFile}`);
    appendLog(`Created flight plan: ${planId} - ${feature}`);

    return planId;
  }

  private generateTemplate(planId: string, feature: string): string {
    const date = new Date().toISOString().split('T')[0];
    
    return `# 🛸 Flight Plan: ${feature}
# Generated: ${date}
# ID: ${planId}
# Status: DRAFT

## 🎯 Objective
${feature}

## 📋 Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## 🏗️ Architecture Decisions
<!-- Key technical decisions and rationale -->

## 📦 Components
<!-- Major components/modules affected -->

## 🔄 Implementation Phases

### Phase 1: Foundation
- [ ] Task 1.1: Description
- [ ] Task 1.2: Description

### Phase 2: Core Implementation
- [ ] Task 2.1: Description
- [ ] Task 2.2: Description

### Phase 3: Integration & Testing
- [ ] Task 3.1: Description
- [ ] Task 3.2: Description

## 🧪 Testing Strategy
- Unit tests:
- Integration tests:
- E2E tests:

## 📚 Documentation Updates
- [ ] README updates
- [ ] API documentation
- [ ] User guides

## ⚠️ Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
|      |        |            |

## 📊 Estimation
- Complexity: [LOW/MEDIUM/HIGH]
- Estimated phases: 3
- Estimated tasks: 6

## 🔗 Dependencies
- External:
- Internal:

---
*Generated by ORBIT Flight Plan*
`;
  }

  listPlans(): FlightPlan[] {
    if (!existsSync(PLANS_DIR)) return [];

    const files = readdirSync(PLANS_DIR).filter(f => f.endsWith('.md'));
    const plans: FlightPlan[] = [];

    for (const file of files) {
      const content = readFileSync(join(PLANS_DIR, file), 'utf-8');
      const id = file.replace('.md', '');
      
      const titleMatch = content.match(/^# 🛸 Flight Plan: (.+)$/m);
      const statusMatch = content.match(/^# Status: (.+)$/m);
      const dateMatch = content.match(/^# Generated: (.+)$/m);

      // Count tasks and completed tasks
      const totalTasks = (content.match(/^- \[[ x]\] /gm) || []).length;
      const completedTasks = (content.match(/^- \[x\] /gm) || []).length;

      // Extract phases
      const phaseMatches = content.matchAll(/^### (?:Phase \d+: )?(.+)$/gm);
      const phases: FlightPlanPhase[] = [];
      for (const pm of phaseMatches) {
        phases.push({ name: pm[1], tasks: [] });
      }

      plans.push({
        id,
        title: titleMatch?.[1] || 'Unknown',
        objective: titleMatch?.[1] || '',
        status: (statusMatch?.[1]?.toLowerCase() || 'draft') as FlightPlan['status'],
        createdAt: dateMatch?.[1] || '',
        totalTasks,
        completedTasks,
        phases
      });
    }

    return plans;
  }

  showPlan(planId: string): string | null {
    const planFile = join(PLANS_DIR, `${planId}.md`);
    if (!existsSync(planFile)) {
      printError(`Plan not found: ${planId}`);
      return null;
    }
    return readFileSync(planFile, 'utf-8');
  }

  showPlanSummary(planId: string): void {
    const planFile = join(PLANS_DIR, `${planId}.md`);
    if (!existsSync(planFile)) {
      printError(`Plan not found: ${planId}`);
      return;
    }

    const content = readFileSync(planFile, 'utf-8');
    const titleMatch = content.match(/^# 🛸 Flight Plan: (.+)$/m);
    const statusMatch = content.match(/^# Status: (.+)$/m);
    const dateMatch = content.match(/^# Generated: (.+)$/m);
    const complexityMatch = content.match(/^- Complexity: (.+)$/m);

    const totalTasks = (content.match(/^- \[[ x]\] /gm) || []).length;
    const completedTasks = (content.match(/^- \[x\] /gm) || []).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const statusColors: Record<string, (s: string) => string> = {
      'draft': colors.warning,
      'issues_created': colors.secondary,
      'in_progress': colors.primary,
      'complete': colors.success,
      'failed': colors.error,
    };
    const status = statusMatch?.[1]?.toLowerCase() || 'draft';
    const colorFn = statusColors[status] || colors.secondary;

    console.log('');
    console.log(`  📋 ${colors.secondary(titleMatch?.[1] || 'Unknown')}`);
    console.log(`  ID:       ${planId}`);
    console.log(`  Status:   ${colorFn(status.toUpperCase())}`);
    if (dateMatch?.[1]) console.log(`  Created:  ${dateMatch[1]}`);
    if (complexityMatch?.[1]) console.log(`  Complexity: ${complexityMatch[1]}`);
    console.log('');

    // Progress bar
    const barWidth = 30;
    const filled = Math.round((progress / 100) * barWidth);
    const empty = barWidth - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    console.log(`  Progress: [${bar}] ${progress}% (${completedTasks}/${totalTasks} tasks)`);
    console.log('');

    // Show phases with task counts
    const sections = content.split(/^### /gm);
    let phaseNum = 0;
    for (const section of sections.slice(1)) {
      const nameEnd = section.indexOf('\n');
      const phaseName = section.substring(0, nameEnd).replace(/^Phase \d+: /, '');
      // Stop counting at the next ## header to avoid bleeding into other sections
      const nextH2 = section.indexOf('\n## ');
      const phaseContent = nextH2 > -1 ? section.substring(nameEnd, nextH2) : section.substring(nameEnd);
      const pTotal = (phaseContent.match(/^- \[[ x]\] /gm) || []).length;
      const pDone = (phaseContent.match(/^- \[x\] /gm) || []).length;
      if (pTotal === 0) continue;
      phaseNum++;
      const phaseIcon = pDone === pTotal ? '✅' : pDone > 0 ? '🔄' : '⬜';
      console.log(`  ${phaseIcon} Phase ${phaseNum}: ${phaseName} (${pDone}/${pTotal})`);
    }
    console.log('');
    console.log(`  View full plan: ${colors.secondary(`orbit flight-plan show ${planId} --full`)}`);
  }

  deletePlan(planId: string): boolean {
    const planFile = join(PLANS_DIR, `${planId}.md`);
    if (!existsSync(planFile)) {
      printError(`Plan not found: ${planId}`);
      return false;
    }
    unlinkSync(planFile);
    printSuccess(`Deleted flight plan: ${planId}`);
    appendLog(`Deleted flight plan: ${planId}`);
    return true;
  }

  updateStatus(planId: string, newStatus: FlightPlan['status']): boolean {
    const planFile = join(PLANS_DIR, `${planId}.md`);
    if (!existsSync(planFile)) {
      printError(`Plan not found: ${planId}`);
      return false;
    }
    let content = readFileSync(planFile, 'utf-8');
    content = content.replace(/^# Status: .+$/m, `# Status: ${newStatus.toUpperCase()}`);
    writeFileSync(planFile, content);
    printSuccess(`Updated ${planId} status to: ${newStatus.toUpperCase()}`);
    return true;
  }

  async generateIssues(planId: string): Promise<boolean> {
    const planFile = join(PLANS_DIR, `${planId}.md`);
    
    if (!existsSync(planFile)) {
      printError(`Plan not found: ${planId}`);
      return false;
    }

    if (!commandExists('gh')) {
      printError('GitHub CLI (gh) not installed');
      return false;
    }

    console.log(colors.primary(`
╔══════════════════════════════════════════════════════════════╗
║  🐙 ORBIT - Issue Transmitter                                ║
╚══════════════════════════════════════════════════════════════╝
`));

    console.log(`Plan: ${colors.secondary(planId)}`);
    console.log('');

    if (this.options.dryRun) {
      console.log(colors.warning('[DRY RUN] Would generate issues'));
      return true;
    }

    const content = readFileSync(planFile, 'utf-8');
    const tasks = this.extractTasks(content);

    console.log(`Found ${tasks.length} tasks to create as issues`);

    for (const task of tasks) {
      const result = execQuiet(
        `gh issue create --title "[${planId}] ${task}" --body "From flight plan ${planId}" --label enhancement`
      );
      if (result) {
        printSuccess(`Created issue for: ${task}`);
      } else {
        printError(`Failed to create issue for: ${task}`);
      }
    }

    // Update plan status
    let updatedContent = content.replace(/^# Status: .+$/m, '# Status: ISSUES_CREATED');
    writeFileSync(planFile, updatedContent);

    printSuccess('Issues created');
    return true;
  }

  private extractTasks(content: string): string[] {
    const tasks: string[] = [];
    const regex = /^- \[ \] (.+)$/gm;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      // Skip generic placeholders
      if (!match[1].includes('Requirement') && !match[1].includes('Description')) {
        tasks.push(match[1]);
      }
    }
    
    return tasks;
  }
}

// CLI functions
export async function createFlightPlan(feature: string, options: FlightPlanOptions = {}): Promise<string> {
  const generator = new FlightPlanGenerator(options);
  return generator.createPlan(feature);
}

export function listFlightPlans(): void {
  const generator = new FlightPlanGenerator();
  const plans = generator.listPlans();

  console.log(colors.secondary('📋 Flight Plans'));
  console.log('');

  if (plans.length === 0) {
    console.log('  No plans yet. Create one with: orbit flight-plan new "feature"');
    return;
  }

  const statusIcons: Record<string, string> = {
    'draft': '📝',
    'issues_created': '🐙',
    'in_progress': '🚀',
    'complete': '✅',
    'failed': '❌',
  };

  for (const plan of plans) {
    const icon = statusIcons[plan.status] || '📋';
    const progress = plan.totalTasks > 0
      ? ` (${plan.completedTasks}/${plan.totalTasks} tasks)`
      : '';
    const date = plan.createdAt ? ` │ ${plan.createdAt}` : '';
    console.log(`  ${icon} ${colors.secondary(plan.id)}: ${plan.title}${progress}${date}`);
  }

  console.log('');
  console.log(`  View details: ${colors.secondary('orbit flight-plan show <planId>')}`);
}

export function showFlightPlan(planId: string, options: { full?: boolean } = {}): void {
  const generator = new FlightPlanGenerator();
  if (options.full) {
    const content = generator.showPlan(planId);
    if (content) {
      console.log(content);
    }
  } else {
    generator.showPlanSummary(planId);
  }
}

export function deleteFlightPlan(planId: string): void {
  const generator = new FlightPlanGenerator();
  generator.deletePlan(planId);
}

export function updateFlightPlanStatus(planId: string, status: string): void {
  const validStatuses: FlightPlan['status'][] = ['draft', 'in_progress', 'complete', 'failed'];
  if (!validStatuses.includes(status as FlightPlan['status'])) {
    printError(`Invalid status: ${status}. Valid: ${validStatuses.join(', ')}`);
    return;
  }
  const generator = new FlightPlanGenerator();
  generator.updateStatus(planId, status as FlightPlan['status']);
}

export async function generateIssuesFromPlan(planId: string, options: FlightPlanOptions = {}): Promise<void> {
  const generator = new FlightPlanGenerator(options);
  await generator.generateIssues(planId);
}
