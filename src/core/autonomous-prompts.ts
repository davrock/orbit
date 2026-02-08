// 🧠 ORBIT Autonomous Prompts
// Structured prompts for self-improvement and autonomous operation
// Based on best practices: Chain-of-Thought, Constitutional AI, and Task Decomposition

import { getConfigPaths } from '../utils/paths.js';

/**
 * Priority-ordered improvement categories for autonomous operation.
 * Order matters: stability → security → quality → features
 */
export const IMPROVEMENT_PRIORITIES = [
  'critical-bugs',      // P0: Crashes, data loss, breaking changes
  'security',           // P1: Vulnerabilities, auth issues, injection risks
  'stability',          // P2: Error handling, edge cases, reliability
  'test-coverage',      // P3: Missing tests, flaky tests, coverage gaps
  'performance',        // P4: Bottlenecks, memory leaks, slow operations
  'code-quality',       // P5: Tech debt, duplication, maintainability
  'documentation',      // P6: Missing docs, outdated comments
  'features'            // P7: New functionality (only if above are satisfied)
] as const;

/**
 * Constitutional AI constraints for autonomous operation.
 * These are hard rules that must never be violated.
 * Uses dynamic paths based on project context.
 */
export function getConstitutionalConstraints(): string {
  const p = getConfigPaths();
  return `
## ABSOLUTE CONSTRAINTS (Never Violate)

🚨 **CRITICAL: DO NOT DELETE, MOVE, OR MODIFY ANYTHING IN THE CONFIG DIRECTORY** 🚨

1. **DO NOT DELETE** ANY files or folders in ${p.base}/ directory
2. **DO NOT DELETE** the ${p.skills}/ directory or any files inside it (ORBIT's learning memory)
3. **DO NOT DELETE** the ${p.state}/ directory or any files inside it (ORBIT's runtime state)
4. **DO NOT MODIFY** package.json dependencies without explicit instruction
5. **DO NOT REMOVE** existing functionality or tests unless fixing a bug
6. **DO NOT INTRODUCE** breaking changes to public APIs
7. **DO NOT COMMIT** secrets, credentials, or sensitive data
8. **DO NOT BYPASS** TypeScript type checking or ESLint rules
9. **DO NOT CREATE** files outside the project directory
10. **DO NOT EXECUTE** destructive commands (rm -rf, drop database, etc.)

PROTECTED PATHS (NEVER delete, move, or modify these):
- ${p.skills}/* - Learning/memory system
- ${p.state}/* - Runtime state  
- ${p.plans}/* - Flight plans
- ${p.metrics} - Performance history

If any action would violate these constraints, STOP and explain why.
`;
}

// Backward compatibility: static constant using default paths
export const CONSTITUTIONAL_CONSTRAINTS = getConstitutionalConstraints();

/**
 * Chain-of-Thought reasoning structure for autonomous analysis.
 */
export const REASONING_FRAMEWORK = `
## REASONING PROCESS (Follow This Order)

### Step 1: Situational Awareness
- What is the current state of the codebase?
- What changes were made recently? (check git log, flight_log.md)
- Are there any failing tests or build errors?

### Step 2: Risk Assessment
- What could break if I make changes?
- What are the dependencies of files I might modify?
- Are there adequate tests for the area I'm considering?

### Step 3: Priority Evaluation
Apply the improvement hierarchy (in order):
1. **CRITICAL BUGS**: Any crashes, data loss, or breaking issues? FIX FIRST.
2. **SECURITY**: Any vulnerabilities, injection risks, auth bypasses? FIX SECOND.
3. **STABILITY**: Error handling gaps, unhandled edge cases? FIX THIRD.
4. **TEST COVERAGE**: Missing tests for critical paths? ADD FOURTH.
5. **PERFORMANCE**: Obvious bottlenecks or inefficiencies? OPTIMIZE FIFTH.
6. **CODE QUALITY**: Duplication, complexity, maintainability? REFACTOR SIXTH.
7. **DOCUMENTATION**: Outdated or missing docs? UPDATE SEVENTH.
8. **FEATURES**: Only add new features if categories 1-7 are satisfied.

### Step 4: Impact Analysis
- What is the smallest change that achieves the goal?
- How can I verify the change works?
- What tests should I add or update?

### Step 5: Implementation Plan
- List specific files to modify
- Describe exact changes
- Identify verification steps
`;

/**
 * Verification requirements for autonomous changes.
 */
export const VERIFICATION_REQUIREMENTS = `
## VERIFICATION CHECKLIST (All Must Pass)

Before committing any change:

1. **Build Check**: \`npm run build\` must succeed with no errors
2. **Type Check**: No new TypeScript errors introduced
3. **Test Suite**: \`npm test\` must pass (all existing + new tests)
4. **No Regressions**: Existing functionality still works
5. **Lint Clean**: No new linting warnings (or fix them)

If any check fails:
- DO NOT COMMIT
- Fix the issue first
- Re-run all checks
- Only commit when everything passes
`;

/**
 * Self-improvement task template for evolve mode.
 * Uses structured reasoning and priority-based improvement selection.
 */
export function generateSelfImprovementTask(): string {
  const p = getConfigPaths();
  return `You are an autonomous software improvement agent. Your goal is to make ONE meaningful improvement to this codebase.

${getConstitutionalConstraints()}

${REASONING_FRAMEWORK}

## YOUR TASK

Analyze this project and implement exactly ONE improvement following the priority hierarchy above.

### Analysis Phase
1. Run \`npm test\` to check current test status
2. Run \`npm run build\` to verify build works
3. Check \`git log --oneline -10\` to see recent changes
4. Read \`${p.flightLog}\` for context
5. Read \`${p.bestPractices}\` for project standards
6. Scan for issues in priority order (bugs → security → stability → tests → performance → quality → docs → features)

### Selection Criteria
Choose the HIGHEST PRIORITY improvement that:
- Has clear, measurable impact
- Can be completed in a single focused change
- Has low risk of breaking existing functionality
- Can be verified with tests

### Implementation Rules
- Make the SMALLEST change that solves the problem
- Add or update tests to cover your change
- Update documentation if behavior changes
- Use existing patterns and conventions from the codebase

### Commit Requirements
- Commit message format: \`<type>: <description>\`
- Types: fix, feat, test, refactor, perf, docs, security
- Description should explain WHAT and WHY

${VERIFICATION_REQUIREMENTS}

### Output Format
After completing:
1. State what category of improvement you chose and why
2. Describe the specific change made
3. List tests added or updated
4. Confirm all verification checks passed
5. End with: "IMPROVEMENT COMPLETE"

Begin your analysis now.`;
}

/**
 * Guardrails prompt section for any autonomous operation.
 */
export function getAutonomousGuardrails(): string {
  const p = getConfigPaths();
  return `
## GUARDRAILS FOR AUTONOMOUS OPERATION

### What You CAN Do:
✅ Add new tests
✅ Fix bugs and errors
✅ Improve error handling
✅ Refactor for clarity (with tests)
✅ Optimize performance (with benchmarks)
✅ Update documentation
✅ Add security validations

### What You CANNOT Do:
🚨 Delete, move, or modify ANYTHING in ${p.base}/ directory (CRITICAL!)
❌ Delete ORBIT state files (skills, metrics, plans)
❌ Remove existing tests (unless they test removed code)
❌ Change public APIs without deprecation
❌ Modify package.json dependencies
❌ Skip running tests before committing
❌ Commit code that doesn't build
❌ Make multiple unrelated changes in one commit

### If Uncertain:
- Choose the safer option
- Make a smaller change
- Add more tests
- Document your reasoning
`;
}

/**
 * Compact guardrails for non-first phases to reduce token repetition.
 * References the full guardrails from the first phase without repeating them.
 */
export function getCompactGuardrails(): string {
  const p = getConfigPaths();
  return `
## GUARDRAILS (Reminder)
🚨 Do NOT delete/modify anything in ${p.base}/. Do NOT modify package.json deps. Build and test before committing.
`;
}

/**
 * Compact verification requirements for non-first phases.
 */
export const COMPACT_VERIFICATION = `
## VERIFICATION
Before committing: \`npm run build\` + \`npm test\` must pass. No regressions.
`;

/**
 * Generate task prompt with full context for autonomous improvement.
 */
export function generateAutonomousTaskPrompt(
  projectName: string,
  recentActivity?: string
): string {
  const context = recentActivity 
    ? `\n### Recent Activity\n${recentActivity}\n` 
    : '';

  return `# Autonomous Improvement Task

**Project**: ${projectName}
**Mode**: Self-improvement
**Constraint Level**: High (production codebase)
${context}
${generateSelfImprovementTask()}
`;
}

/**
 * Priority-specific prompts for targeted improvement areas.
 */
export const PRIORITY_PROMPTS: Record<string, string> = {
  'critical-bugs': `Focus on finding and fixing critical bugs:
- Crashes or exceptions in main code paths
- Data corruption or loss scenarios
- Breaking changes from recent commits
- Null/undefined errors that cause failures`,

  'security': `Focus on security improvements:
- Input validation and sanitization
- SQL/NoSQL injection prevention
- XSS and CSRF protection
- Authentication and authorization checks
- Secrets and credential handling
- Dependency vulnerabilities`,

  'stability': `Focus on stability improvements:
- Error handling and recovery
- Edge case coverage
- Graceful degradation
- Resource cleanup (files, connections)
- Race condition prevention
- Timeout and retry logic`,

  'test-coverage': `Focus on test coverage:
- Critical paths without tests
- Error handling tests
- Edge case tests
- Integration tests for key workflows
- Mock and stub improvements
- Test isolation and reliability`,

  'performance': `Focus on performance:
- Slow operations (profile first)
- Memory leaks
- Unnecessary computations
- Caching opportunities
- Async/parallel optimization
- Bundle size reduction`,

  'code-quality': `Focus on code quality:
- DRY principle violations
- Complex functions (>50 lines)
- Unclear naming
- Missing type annotations
- Code organization
- Consistent patterns`,

  'documentation': `Focus on documentation:
- Missing function/class docs
- Outdated README sections
- API documentation
- Architecture explanations
- Setup instructions
- Changelog updates`,

  'features': `Focus on new features (only if higher priorities are satisfied):
- User-requested functionality
- Developer experience improvements
- Integration capabilities
- Configuration options`
};
