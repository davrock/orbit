// 🛸 ORBIT Design Review Workflow
// Specialized workflow for reviewing UI/UX changes for consistency and accessibility

import { existsSync } from 'fs';
import { 
  reviewDesign, 
  printDesignReview,
  type DesignReviewOptions,
  type DesignReviewResult 
} from '../agents/design-review.js';
import { hasProviders, getProviderSummary } from '../core/ai-providers.js';
import { getChangedFiles, hasChanges } from '../utils/git.js';
import { 
  printSuccess, 
  printError, 
  printWarning, 
  printInfo,
  colors 
} from '../utils/output.js';

export interface DesignReviewWorkflowOptions {
  files?: string[];
  useExternalAI?: boolean;
  checkUI?: boolean;
  checkUX?: boolean;
  checkAccessibility?: boolean;
  checkResponsiveness?: boolean;
  existingPatternsPath?: string;
  exitOnFailure?: boolean;
}

/**
 * Run design review workflow
 */
export async function runDesignReview(
  options: DesignReviewWorkflowOptions = {}
): Promise<DesignReviewResult> {
  console.log(colors.primary('\n🎨 DESIGN REVIEW\n'));
  
  // Determine which files to review
  let filesToReview: string[];
  
  if (options.files && options.files.length > 0) {
    filesToReview = options.files;
    printInfo(`Reviewing ${filesToReview.length} specified file(s)...`);
  } else if (await hasChanges()) {
    filesToReview = await getChangedFiles();
    printInfo(`Reviewing ${filesToReview.length} changed file(s) from git...`);
  } else {
    printWarning('No files specified and no git changes detected');
    return {
      passed: true,
      score: 100,
      checks: [],
      recommendations: ['No files to review'],
      summary: 'No files to review'
    };
  }

  // Check for external AI providers
  if (options.useExternalAI) {
    if (hasProviders()) {
      printSuccess('External AI providers available for consistency checking');
      printInfo(getProviderSummary());
    } else {
      printWarning('External AI requested but no providers configured');
      printInfo('Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY to enable');
      options.useExternalAI = false;
    }
  }

  // Run the design review
  const reviewOptions: DesignReviewOptions = {
    useExternalAI: options.useExternalAI,
    checkUI: options.checkUI,
    checkUX: options.checkUX,
    checkAccessibility: options.checkAccessibility,
    checkResponsiveness: options.checkResponsiveness,
    existingPatternsPath: options.existingPatternsPath
  };

  const result = await reviewDesign(filesToReview, reviewOptions);

  // Print results
  printDesignReview(result);

  // Handle exit on failure
  if (!result.passed && options.exitOnFailure) {
    printError('Design review failed - exiting with error code');
    process.exit(1);
  }

  return result;
}

/**
 * Run design review as a git pre-commit hook
 */
export async function runDesignReviewPreCommit(): Promise<void> {
  console.log(colors.primary('\n🎨 PRE-COMMIT DESIGN REVIEW\n'));
  
  const result = await runDesignReview({
    useExternalAI: false, // Faster for pre-commit
    exitOnFailure: false
  });

  // Only block commit on critical issues
  const criticalIssues = result.checks.filter(
    c => !c.passed && c.severity === 'critical'
  );

  if (criticalIssues.length > 0) {
    printError(`\n❌ Commit blocked: ${criticalIssues.length} critical design issue(s) found`);
    process.exit(1);
  } else if (!result.passed) {
    printWarning(`\n⚠️  Commit allowed but design review found ${result.checks.filter(c => !c.passed).length} issue(s)`);
    printInfo('Consider fixing these issues before merging');
  } else {
    printSuccess('\n✓ Design review passed - commit allowed');
  }
}

/**
 * Run design review in CI/CD pipeline
 */
export async function runDesignReviewCI(
  options: {
    baseBranch?: string;
    useExternalAI?: boolean;
    failOnWarnings?: boolean;
  } = {}
): Promise<void> {
  console.log(colors.primary('\n🎨 CI/CD DESIGN REVIEW\n'));
  
  const result = await runDesignReview({
    useExternalAI: options.useExternalAI || true, // Default to true in CI
    exitOnFailure: false
  });

  // Generate exit code based on severity
  const criticalIssues = result.checks.filter(c => !c.passed && c.severity === 'critical').length;
  const highIssues = result.checks.filter(c => !c.passed && c.severity === 'high').length;
  const mediumIssues = result.checks.filter(c => !c.passed && c.severity === 'medium').length;

  if (criticalIssues > 0 || highIssues > 0) {
    printError(`\n❌ CI build failed: ${criticalIssues + highIssues} critical/high issue(s)`);
    process.exit(1);
  } else if (options.failOnWarnings && (mediumIssues > 0 || !result.passed)) {
    printError(`\n❌ CI build failed: Design warnings present and failOnWarnings=true`);
    process.exit(1);
  } else if (!result.passed) {
    printWarning(`\n⚠️  CI build passed but design review found ${result.checks.filter(c => !c.passed).length} issue(s)`);
    printInfo('Consider fixing these issues');
  } else {
    printSuccess('\n✓ Design review passed - CI build continues');
  }
}

/**
 * Generate design review report for specific files or directories
 */
export async function generateDesignReport(
  paths: string[],
  outputFormat: 'console' | 'json' | 'markdown' = 'console'
): Promise<void> {
  console.log(colors.primary('\n🎨 DESIGN REVIEW REPORT\n'));
  
  // Collect all files from paths
  const files: string[] = [];
  for (const path of paths) {
    if (existsSync(path)) {
      files.push(path);
    } else {
      printWarning(`Path not found: ${path}`);
    }
  }

  if (files.length === 0) {
    printError('No valid files found to review');
    return;
  }

  const result = await runDesignReview({
    files,
    useExternalAI: true,
    exitOnFailure: false
  });

  // Output in requested format
  switch (outputFormat) {
    case 'json':
      console.log(JSON.stringify(result, null, 2));
      break;
    case 'markdown':
      printMarkdownReport(result);
      break;
    case 'console':
    default:
      // Already printed by runDesignReview
      break;
  }
}

/**
 * Print design review report in markdown format
 */
function printMarkdownReport(result: DesignReviewResult): void {
  console.log('# Design Review Report\n');
  console.log(`**Status:** ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`);
  console.log(`**Score:** ${result.score}/100\n`);
  
  if (result.checks.length > 0) {
    console.log('## Issues Found\n');
    
    const byCategory = result.checks.reduce((acc, check) => {
      if (!acc[check.category]) {
        acc[check.category] = [];
      }
      acc[check.category].push(check);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [category, checks] of Object.entries(byCategory)) {
      const failed = checks.filter(c => !c.passed);
      if (failed.length === 0) continue;

      console.log(`### ${category}\n`);
      for (const check of failed) {
        const icon = check.severity === 'critical' ? '🔴' :
                     check.severity === 'high' ? '🟠' :
                     check.severity === 'medium' ? '🟡' : '🔵';
        console.log(`- ${icon} **[${check.severity}]** ${check.aspect}`);
        console.log(`  - ${check.message}`);
        if (check.file) {
          console.log(`  - Location: \`${check.file}${check.line ? `:${check.line}` : ''}\``);
        }
        console.log('');
      }
    }
  }

  console.log('## Recommendations\n');
  for (const rec of result.recommendations) {
    console.log(`- ${rec}`);
  }
  console.log('');
}
