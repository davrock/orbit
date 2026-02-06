// 🛸 ORBIT Plan Mode
// Interactive planning interview before execution

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execCopilot } from '../utils/exec.js';
import { printSection, printSuccess, printWarning, colors } from '../utils/output.js';

const STATE_DIR = '.copilot/state';

export interface PlanModeOptions {
  task: string;
  dryRun?: boolean;
}

export interface RequirementsSpec {
  task: string;
  userAnswers: { question: string; answer: string }[];
  detailedRequirements: string;
  technicalApproach: string;
  acceptanceCriteria: string[];
  timestamp: string;
}

export class PlanModeInterviewer {
  private options: PlanModeOptions;
  private spec: RequirementsSpec;

  constructor(options: PlanModeOptions) {
    this.options = options;
    this.spec = {
      task: options.task,
      userAnswers: [],
      detailedRequirements: '',
      technicalApproach: '',
      acceptanceCriteria: [],
      timestamp: new Date().toISOString()
    };
    this.ensureDir();
  }

  private ensureDir(): void {
    if (!existsSync(STATE_DIR)) {
      mkdirSync(STATE_DIR, { recursive: true });
    }
  }

  async conductInterview(): Promise<RequirementsSpec> {
    console.log(colors.primary(`
╔══════════════════════════════════════════════════════════════╗
║  🛸 ORBIT - Planning Interview Mode                          ║
╚══════════════════════════════════════════════════════════════╝
`));

    console.log(`Task: ${colors.secondary(this.options.task)}`);
    console.log('');
    console.log(colors.warning('🎤 Starting requirements gathering interview...'));
    console.log('');

    if (this.options.dryRun) {
      printWarning('[DRY RUN] Would conduct planning interview');
      return this.spec;
    }

    // Generate interview questions
    const questions = await this.generateQuestions();
    
    if (!questions || questions.length === 0) {
      printWarning('Unable to generate questions - proceeding with basic spec');
      return this.spec;
    }

    // Ask each question
    console.log(colors.secondary('Please answer the following questions to gather requirements:'));
    console.log('');

    for (const question of questions) {
      const answer = await this.askQuestion(question);
      this.spec.userAnswers.push({ question, answer });
    }

    // Synthesize requirements from answers
    await this.synthesizeRequirements();

    // Save the spec
    this.saveSpec();

    printSuccess('Requirements gathering complete!');
    console.log('');
    this.displaySpec();

    return this.spec;
  }

  private async generateQuestions(): Promise<string[]> {
    const prompt = `You are a senior product manager conducting a requirements interview.

TASK: ${this.options.task}

Generate 5-7 clarifying questions to gather complete requirements. Focus on:
1. Core functionality and behavior
2. User experience and interface
3. Edge cases and error handling
4. Technical constraints or preferences
5. Success criteria

Return ONLY the questions, one per line, numbered 1-7.
Do NOT include any other text or explanations.`;

    const result = await execCopilot(prompt, {
      timeout: 60
    });

    if (!result.success) {
      return [];
    }

    // Parse questions from output
    const questions: string[] = [];
    const lines = result.output.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match lines that start with numbers like "1.", "1)", etc.
      const match = trimmed.match(/^\d+[\.)]\s*(.+)$/);
      if (match && match[1]) {
        questions.push(match[1].trim());
      }
    }

    return questions;
  }

  private async askQuestion(question: string): Promise<string> {
    console.log(colors.primary(`❓ ${question}`));
    console.log('');

    const prompt = `The user needs to answer this question about their requirements:

QUESTION: ${question}

CONTEXT: ${this.options.task}

PREVIOUS ANSWERS:
${this.spec.userAnswers.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Have a brief conversation with the user to get their answer. Keep it concise.
After getting their answer, say "ANSWER RECORDED" and summarize their response in 1-2 sentences.`;

    const result = await execCopilot(prompt, {
      timeout: 120
    });

    console.log('');

    if (!result.success) {
      return '(No answer provided)';
    }

    // Extract the answer from the output
    const output = result.output;
    const lines = output.split('\n');
    
    // Look for summary after "ANSWER RECORDED"
    let inSummary = false;
    let summary = '';
    
    for (const line of lines) {
      if (line.includes('ANSWER RECORDED')) {
        inSummary = true;
        continue;
      }
      if (inSummary && line.trim()) {
        summary += line.trim() + ' ';
      }
    }

    return summary.trim() || output.substring(0, 200);
  }

  private async synthesizeRequirements(): Promise<void> {
    console.log('');
    console.log(colors.warning('📝 Synthesizing detailed requirements...'));
    console.log('');

    const prompt = `You are a technical writer creating a detailed requirements specification.

ORIGINAL TASK: ${this.options.task}

INTERVIEW Q&A:
${this.spec.userAnswers.map((qa, i) => `${i + 1}. ${qa.question}\n   Answer: ${qa.answer}`).join('\n\n')}

Based on the task and interview answers, create:

1. DETAILED REQUIREMENTS (2-3 paragraphs)
   - Comprehensive description of what needs to be built
   - All functionality based on user answers
   - Clear, unambiguous requirements

2. TECHNICAL APPROACH (1-2 paragraphs)
   - Recommended implementation strategy
   - Technologies/patterns to use
   - Key architectural decisions

3. ACCEPTANCE CRITERIA (5-8 bullet points)
   - Specific, testable criteria
   - Each starting with "✓"

Format your response as:
=== DETAILED REQUIREMENTS ===
[requirements text]

=== TECHNICAL APPROACH ===
[approach text]

=== ACCEPTANCE CRITERIA ===
✓ [criterion 1]
✓ [criterion 2]
...`;

    const result = await execCopilot(prompt, {
      timeout: 120
    });

    if (!result.success) {
      this.spec.detailedRequirements = this.options.task;
      this.spec.technicalApproach = 'Standard implementation approach';
      this.spec.acceptanceCriteria = ['Feature works as expected'];
      return;
    }

    // Parse the output
    const output = result.output;
    
    const reqMatch = output.match(/=== DETAILED REQUIREMENTS ===\s*\n([\s\S]*?)(?=\n=== TECHNICAL APPROACH ===|$)/);
    if (reqMatch) {
      this.spec.detailedRequirements = reqMatch[1].trim();
    }

    const techMatch = output.match(/=== TECHNICAL APPROACH ===\s*\n([\s\S]*?)(?=\n=== ACCEPTANCE CRITERIA ===|$)/);
    if (techMatch) {
      this.spec.technicalApproach = techMatch[1].trim();
    }

    const criteriaMatch = output.match(/=== ACCEPTANCE CRITERIA ===\s*\n([\s\S]*?)$/);
    if (criteriaMatch) {
      const criteriaText = criteriaMatch[1].trim();
      this.spec.acceptanceCriteria = criteriaText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('✓'))
        .map(line => line.substring(1).trim());
    }
  }

  private saveSpec(): void {
    const specFile = join(STATE_DIR, 'plan_requirements.json');
    writeFileSync(specFile, JSON.stringify(this.spec, null, 2));
  }

  private displaySpec(): void {
    console.log(colors.secondary('━'.repeat(64)));
    console.log(colors.primary('📋 REQUIREMENTS SPECIFICATION'));
    console.log(colors.secondary('━'.repeat(64)));
    console.log('');
    
    console.log(colors.primary('DETAILED REQUIREMENTS:'));
    console.log(this.spec.detailedRequirements || '(None)');
    console.log('');

    console.log(colors.primary('TECHNICAL APPROACH:'));
    console.log(this.spec.technicalApproach || '(None)');
    console.log('');

    console.log(colors.primary('ACCEPTANCE CRITERIA:'));
    if (this.spec.acceptanceCriteria.length > 0) {
      this.spec.acceptanceCriteria.forEach(c => console.log(`  ✓ ${c}`));
    } else {
      console.log('  (None)');
    }
    console.log('');
    console.log(colors.secondary('━'.repeat(64)));
  }

  static loadSpec(): RequirementsSpec | null {
    const specFile = join(STATE_DIR, 'plan_requirements.json');
    if (!existsSync(specFile)) {
      return null;
    }

    try {
      const content = readFileSync(specFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  static clearSpec(): void {
    const specFile = join(STATE_DIR, 'plan_requirements.json');
    if (existsSync(specFile)) {
      writeFileSync(specFile, '');
    }
  }
}

export async function runPlanMode(options: PlanModeOptions): Promise<RequirementsSpec> {
  const interviewer = new PlanModeInterviewer(options);
  return await interviewer.conductInterview();
}

export function loadPlanRequirements(): RequirementsSpec | null {
  return PlanModeInterviewer.loadSpec();
}

export function clearPlanRequirements(): void {
  PlanModeInterviewer.clearSpec();
}
