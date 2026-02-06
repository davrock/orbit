// 🛸 ORBIT Design Review Agent
// Specialized agent for UI/UX design consistency and pattern validation

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { 
  checkDesignConsistency, 
  hasProviders, 
  getProviderSummary,
  type ConsistencyCheck 
} from '../core/ai-providers.js';
import { printInfo, printWarning, printSuccess, printError } from '../utils/output.js';

export interface DesignReviewOptions {
  useExternalAI?: boolean;
  checkUI?: boolean;
  checkUX?: boolean;
  checkAccessibility?: boolean;
  checkResponsiveness?: boolean;
  existingPatternsPath?: string;
}

export interface DesignReviewResult {
  passed: boolean;
  score: number;
  checks: DesignCheck[];
  consistencyChecks?: ConsistencyCheck[];
  recommendations: string[];
  summary: string;
}

export interface DesignCheck {
  category: string;
  aspect: string;
  passed: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  line?: number;
  file?: string;
}

/**
 * Review code changes for UI/UX design consistency
 */
export async function reviewDesign(
  changedFiles: string[],
  options: DesignReviewOptions = {}
): Promise<DesignReviewResult> {
  const checks: DesignCheck[] = [];
  let consistencyChecks: ConsistencyCheck[] | undefined;

  // Filter for frontend/UI files
  const uiFiles = filterUIFiles(changedFiles);
  
  if (uiFiles.length === 0) {
    return {
      passed: true,
      score: 100,
      checks: [],
      recommendations: ['No UI files detected in changes'],
      summary: 'No design review needed - no UI/UX changes detected'
    };
  }

  printInfo(`Reviewing ${uiFiles.length} UI/UX files for design consistency...`);

  // Perform internal design checks
  for (const file of uiFiles) {
    const fileChecks = await analyzeFile(file, options);
    checks.push(...fileChecks);
  }

  // External AI consistency check if enabled and available
  if (options.useExternalAI && hasProviders()) {
    printInfo(`Using external AI for design consistency validation...`);
    printInfo(getProviderSummary());
    
    try {
      const existingPatterns = await loadExistingPatterns(options.existingPatternsPath);
      const newCode = await loadFileContents(uiFiles);
      
      consistencyChecks = await checkDesignConsistency(
        newCode,
        existingPatterns
      );
      
      // Convert consistency checks to design checks
      for (const check of consistencyChecks) {
        checks.push({
          category: 'consistency',
          aspect: check.aspect,
          passed: check.consistent,
          severity: check.severity,
          message: check.details
        });
      }
    } catch (error) {
      printWarning(`External AI validation failed: ${error}`);
    }
  }

  // Calculate score and generate recommendations
  const result = generateResult(checks, consistencyChecks);
  
  return result;
}

/**
 * Filter files to only include UI/UX related files
 */
function filterUIFiles(files: string[]): string[] {
  const uiExtensions = [
    '.tsx', '.jsx', '.vue', '.svelte',
    '.css', '.scss', '.sass', '.less',
    '.html', '.xml', '.xib', '.storyboard'
  ];
  
  const uiPatterns = [
    '/components/', '/screens/', '/pages/', '/views/',
    '/ui/', '/layouts/', '/styles/', '/theme/',
    'Component.', 'Screen.', 'View.', 'Page.'
  ];
  
  return files.filter(file => {
    const hasUIExtension = uiExtensions.some(ext => file.endsWith(ext));
    const hasUIPattern = uiPatterns.some(pattern => file.includes(pattern));
    return hasUIExtension || hasUIPattern;
  });
}

/**
 * Analyze individual file for design issues
 */
async function analyzeFile(
  filepath: string,
  options: DesignReviewOptions
): Promise<DesignCheck[]> {
  const checks: DesignCheck[] = [];
  
  if (!existsSync(filepath)) {
    return checks;
  }

  const content = readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');

  // Check UI patterns
  if (options.checkUI !== false) {
    checks.push(...checkUIPatterns(filepath, content, lines));
  }

  // Check UX patterns
  if (options.checkUX !== false) {
    checks.push(...checkUXPatterns(filepath, content, lines));
  }

  // Check accessibility
  if (options.checkAccessibility !== false) {
    checks.push(...checkAccessibility(filepath, content, lines));
  }

  // Check responsiveness
  if (options.checkResponsiveness !== false) {
    checks.push(...checkResponsiveness(filepath, content, lines));
  }

  return checks;
}

/**
 * Check UI consistency patterns
 */
function checkUIPatterns(filepath: string, content: string, lines: string[]): DesignCheck[] {
  const checks: DesignCheck[] = [];

  // Check for inline styles (anti-pattern in most frameworks)
  const inlineStylePattern = /style=\{\{|style="|style='/g;
  let match;
  let lineNum = 0;
  
  for (const line of lines) {
    lineNum++;
    if (inlineStylePattern.test(line) && !line.includes('// allow-inline-style')) {
      checks.push({
        category: 'ui-consistency',
        aspect: 'styling',
        passed: false,
        severity: 'low',
        message: 'Inline styles detected - consider using CSS modules or styled components',
        line: lineNum,
        file: filepath
      });
    }
  }

  // Check for hardcoded colors (should use theme)
  const colorPattern = /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(/g;
  lineNum = 0;
  
  for (const line of lines) {
    lineNum++;
    if (colorPattern.test(line) && !line.includes('theme') && !line.includes('// hardcoded-color-ok')) {
      checks.push({
        category: 'ui-consistency',
        aspect: 'theming',
        passed: false,
        severity: 'medium',
        message: 'Hardcoded color detected - use theme variables for consistency',
        line: lineNum,
        file: filepath
      });
    }
  }

  // Check for magic numbers in sizing
  const magicNumberPattern = /\d{2,}px|fontSize:\s*\d+|width:\s*\d{3,}|height:\s*\d{3,}/g;
  lineNum = 0;
  
  for (const line of lines) {
    lineNum++;
    const trimmed = line.trim();
    if (magicNumberPattern.test(line) && 
        !trimmed.startsWith('//') && 
        !trimmed.startsWith('*') &&
        !line.includes('spacing') &&
        !line.includes('theme')) {
      checks.push({
        category: 'ui-consistency',
        aspect: 'spacing',
        passed: false,
        severity: 'low',
        message: 'Magic number in sizing - consider using design system spacing units',
        line: lineNum,
        file: filepath
      });
    }
  }

  return checks;
}

/**
 * Check UX patterns and user experience
 */
function checkUXPatterns(filepath: string, content: string, lines: string[]): DesignCheck[] {
  const checks: DesignCheck[] = [];
  let lineNum = 0;

  for (const line of lines) {
    lineNum++;

    // Check for loading states
    if ((line.includes('fetch') || line.includes('axios') || line.includes('api.')) &&
        !content.includes('loading') && 
        !content.includes('isLoading') &&
        !content.includes('Loading')) {
      checks.push({
        category: 'ux-patterns',
        aspect: 'loading-states',
        passed: false,
        severity: 'medium',
        message: 'API call detected without apparent loading state - users need feedback',
        line: lineNum,
        file: filepath
      });
      break; // Only report once per file
    }

    // Check for error handling in UI
    if ((line.includes('catch') || line.includes('.then')) &&
        !content.includes('error') && 
        !content.includes('Error') &&
        !content.includes('toast') &&
        !content.includes('alert')) {
      checks.push({
        category: 'ux-patterns',
        aspect: 'error-handling',
        passed: false,
        severity: 'high',
        message: 'Error handling without user feedback - show errors to users',
        line: lineNum,
        file: filepath
      });
      break; // Only report once per file
    }
  }

  return checks;
}

/**
 * Check accessibility compliance
 */
function checkAccessibility(filepath: string, content: string, lines: string[]): DesignCheck[] {
  const checks: DesignCheck[] = [];
  let lineNum = 0;

  for (const line of lines) {
    lineNum++;

    // Check for images without alt text
    if ((line.includes('<img') || line.includes('<Image')) && 
        !line.includes('alt=') &&
        !line.includes('aria-label=')) {
      checks.push({
        category: 'accessibility',
        aspect: 'alt-text',
        passed: false,
        severity: 'high',
        message: 'Image without alt text - required for screen readers',
        line: lineNum,
        file: filepath
      });
    }

    // Check for buttons without accessible labels
    if (line.includes('<button') && 
        line.includes('>') &&
        !line.includes('aria-label=') &&
        !content.substring(content.indexOf(line)).match(/<button[^>]*>([^<]+)</)) {
      checks.push({
        category: 'accessibility',
        aspect: 'button-labels',
        passed: false,
        severity: 'medium',
        message: 'Button without accessible label - add aria-label or text content',
        line: lineNum,
        file: filepath
      });
    }

    // Check for clickable divs (should be buttons)
    if (line.includes('onClick') && 
        (line.includes('<div') || line.includes('<span')) &&
        !line.includes('role=') &&
        !line.includes('button')) {
      checks.push({
        category: 'accessibility',
        aspect: 'semantic-html',
        passed: false,
        severity: 'medium',
        message: 'Clickable div/span detected - use <button> or add role="button"',
        line: lineNum,
        file: filepath
      });
    }
  }

  return checks;
}

/**
 * Check responsive design patterns
 */
function checkResponsiveness(filepath: string, content: string, lines: string[]): DesignCheck[] {
  const checks: DesignCheck[] = [];

  // Check for fixed widths without media queries
  const hasFixedWidth = /width:\s*\d{3,}px/.test(content);
  const hasMediaQuery = /@media|useMediaQuery|useBreakpoint|Dimensions\.get/.test(content);

  if (hasFixedWidth && !hasMediaQuery) {
    checks.push({
      category: 'responsiveness',
      aspect: 'fluid-layout',
      passed: false,
      severity: 'medium',
      message: 'Fixed pixel widths without responsive breakpoints - consider percentage or viewport units',
      file: filepath
    });
  }

  // Check for viewport meta tag in HTML files
  if (filepath.endsWith('.html') && !content.includes('viewport')) {
    checks.push({
      category: 'responsiveness',
      aspect: 'viewport-meta',
      passed: false,
      severity: 'high',
      message: 'Missing viewport meta tag - required for mobile responsiveness',
      file: filepath
    });
  }

  return checks;
}

/**
 * Load existing design patterns from codebase
 */
async function loadExistingPatterns(customPath?: string): Promise<string[]> {
  const patterns: string[] = [];
  
  const searchPaths = [
    customPath || 'src/components',
    'src/styles',
    'src/theme'
  ];

  for (const searchPath of searchPaths) {
    try {
      if (existsSync(searchPath)) {
        const files = findFiles(searchPath, ['.tsx', '.jsx', '.vue', '.css', '.scss']);
        
        // Sample a few representative files
        const sampleFiles = files.slice(0, 3);
        for (const file of sampleFiles) {
          const content = readFileSync(file, 'utf-8');
          patterns.push(content.substring(0, 2000)); // First 2000 chars
        }
      }
    } catch (error) {
      // Path not found, continue
    }
  }

  return patterns;
}

/**
 * Find files recursively with given extensions
 */
function findFiles(dir: string, extensions: string[], results: string[] = []): string[] {
  try {
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filepath = join(dir, file);
      
      try {
        const stat = statSync(filepath);
        
        if (stat.isDirectory()) {
          if (file !== 'node_modules' && file !== '.git') {
            findFiles(filepath, extensions, results);
          }
        } else if (extensions.some(ext => file.endsWith(ext))) {
          results.push(filepath);
        }
      } catch (error) {
        // Skip files we can't access
        continue;
      }
    }
  } catch (error) {
    // Directory not accessible
  }
  
  return results;
}

/**
 * Load file contents for consistency checking
 */
async function loadFileContents(files: string[]): Promise<string> {
  const contents: string[] = [];
  
  for (const file of files.slice(0, 5)) { // Limit to 5 files to avoid token limits
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');
      contents.push(`// File: ${file}\n${content}`);
    }
  }

  return contents.join('\n\n');
}

/**
 * Generate final result with score and recommendations
 */
function generateResult(
  checks: DesignCheck[],
  consistencyChecks?: ConsistencyCheck[]
): DesignReviewResult {
  const failedChecks = checks.filter(c => !c.passed);
  const criticalIssues = failedChecks.filter(c => c.severity === 'critical').length;
  const highIssues = failedChecks.filter(c => c.severity === 'high').length;
  const mediumIssues = failedChecks.filter(c => c.severity === 'medium').length;
  const lowIssues = failedChecks.filter(c => c.severity === 'low').length;

  // Calculate score (100 - weighted penalties)
  const score = Math.max(0, 100 - 
    (criticalIssues * 25) -
    (highIssues * 10) -
    (mediumIssues * 5) -
    (lowIssues * 2)
  );

  const passed = score >= 70 && criticalIssues === 0;

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (criticalIssues > 0) {
    recommendations.push(`Fix ${criticalIssues} critical design issue(s) before proceeding`);
  }
  if (highIssues > 0) {
    recommendations.push(`Address ${highIssues} high-priority design issue(s)`);
  }
  if (mediumIssues > 0) {
    recommendations.push(`Consider fixing ${mediumIssues} medium-priority design issue(s)`);
  }
  if (lowIssues > 0) {
    recommendations.push(`${lowIssues} low-priority improvement(s) suggested`);
  }

  // Add consistency check recommendations
  if (consistencyChecks) {
    const inconsistent = consistencyChecks.filter(c => !c.consistent);
    if (inconsistent.length > 0) {
      recommendations.push(`Review ${inconsistent.length} design consistency concern(s) from external AI`);
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Design review passed - no issues found!');
  }

  // Generate summary
  let summary = `Design review ${passed ? 'PASSED' : 'FAILED'} with score ${score}/100`;
  if (failedChecks.length > 0) {
    summary += ` - ${failedChecks.length} issue(s) found`;
  }
  if (consistencyChecks) {
    summary += ` (with external AI validation)`;
  }

  return {
    passed,
    score,
    checks,
    consistencyChecks,
    recommendations,
    summary
  };
}

/**
 * Print design review results in a formatted way
 */
export function printDesignReview(result: DesignReviewResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('🎨 DESIGN REVIEW RESULTS');
  console.log('='.repeat(60));
  
  if (result.passed) {
    printSuccess(`\n✓ ${result.summary}`);
  } else {
    printError(`\n✗ ${result.summary}`);
  }

  console.log(`\n📊 Score: ${result.score}/100\n`);

  // Group checks by category
  const byCategory = result.checks.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, DesignCheck[]>);

  for (const [category, checks] of Object.entries(byCategory)) {
    const failed = checks.filter(c => !c.passed);
    if (failed.length === 0) continue;

    console.log(`\n📋 ${category.toUpperCase()}`);
    console.log('-'.repeat(60));
    
    for (const check of failed) {
      const icon = check.severity === 'critical' ? '🔴' :
                   check.severity === 'high' ? '🟠' :
                   check.severity === 'medium' ? '🟡' : '🔵';
      
      const location = check.file ? 
        `${check.file}${check.line ? `:${check.line}` : ''}` : 
        'general';
      
      console.log(`${icon} [${check.severity.toUpperCase()}] ${check.aspect}`);
      console.log(`   ${check.message}`);
      console.log(`   Location: ${location}\n`);
    }
  }

  // Print consistency checks if available
  if (result.consistencyChecks && result.consistencyChecks.length > 0) {
    console.log('\n🤖 EXTERNAL AI CONSISTENCY CHECKS');
    console.log('-'.repeat(60));
    
    for (const check of result.consistencyChecks) {
      if (!check.consistent) {
        const icon = check.severity === 'high' ? '🔴' :
                     check.severity === 'medium' ? '🟡' : '🔵';
        console.log(`${icon} ${check.aspect}: ${check.details}`);
      }
    }
  }

  // Print recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('-'.repeat(60));
  for (const rec of result.recommendations) {
    console.log(`• ${rec}`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}
