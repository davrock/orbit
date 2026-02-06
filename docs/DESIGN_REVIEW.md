# 🎨 Design Review Agent

The Design Review Agent is a specialized ORBIT agent for reviewing UI/UX changes for consistency, accessibility, and design system compliance.

## Features

### Automated Checks

- **UI Consistency**: Inline styles, hardcoded colors, magic numbers in sizing
- **UX Patterns**: Loading states, error handling, user feedback
- **Accessibility (WCAG)**: Alt text, semantic HTML, keyboard navigation, ARIA labels
- **Responsive Design**: Fluid layouts, viewport settings, media queries

### Optional External AI Integration

When enabled, the design review agent can use external AI providers (Gemini, OpenAI, Anthropic) to:
- Cross-validate design decisions
- Check consistency with existing patterns
- Provide additional design feedback
- Generate consensus-based recommendations

## Usage

### Basic Review

Review all changed files from git:
```bash
orbit design-review
```

Review specific files:
```bash
orbit design-review --files src/components/Button.tsx src/components/Card.tsx
```

### With External AI

Enable external AI providers for deeper analysis:
```bash
orbit design-review --external-ai
```

Configure AI providers via environment variables:
```bash
export GEMINI_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"
```

### Pre-commit Hook

Block commits with critical design issues:
```bash
orbit design-review --pre-commit
```

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/sh
orbit design-review --pre-commit
```

### CI/CD Integration

In your CI pipeline (GitHub Actions, GitLab CI, etc.):
```bash
orbit design-review --ci --fail-on-warnings
```

Example GitHub Actions:
```yaml
- name: Design Review
  run: |
    npm install -g @davrock/orbit
    orbit design-review --ci --external-ai
```

### Report Generation

Generate reports in different formats:
```bash
# Console output (default)
orbit design-review

# JSON format
orbit design-review --report json > design-report.json

# Markdown format
orbit design-review --report markdown > design-report.md
```

## Configuration Options

```bash
orbit design-review [options]

Options:
  --files <files...>          Specific files to review
  --external-ai               Use external AI for consistency checking
  --no-ui                     Skip UI pattern checks
  --no-ux                     Skip UX pattern checks
  --no-accessibility          Skip accessibility checks
  --no-responsiveness         Skip responsiveness checks
  --patterns <path>           Path to existing patterns directory
  --pre-commit                Run as pre-commit hook
  --ci                        Run in CI/CD mode
  --fail-on-warnings          Fail on warnings (CI mode only)
  --report <format>           Generate report (console|json|markdown)
```

## Scoring System

The design review generates a score from 0-100 based on issue severity:

- **Critical** (-25 points): Blocks functionality or violates core standards
- **High** (-10 points): Significant issues affecting UX or accessibility
- **Medium** (-5 points): Design inconsistencies or missing patterns
- **Low** (-2 points): Minor improvements or style suggestions

**Pass Threshold**: 70/100 with zero critical issues

## Example Output

```
============================================================
🎨 DESIGN REVIEW RESULTS
============================================================

✓ Design review PASSED with score 85/100

📊 Score: 85/100

📋 UI-CONSISTENCY
------------------------------------------------------------
🟡 [MEDIUM] theming
   Hardcoded color detected - use theme variables for consistency
   Location: src/components/Button.tsx:42

🔵 [LOW] spacing
   Magic number in sizing - consider using design system spacing units
   Location: src/components/Card.tsx:18

📋 ACCESSIBILITY
------------------------------------------------------------
🟠 [HIGH] alt-text
   Image without alt text - required for screen readers
   Location: src/components/Hero.tsx:15

💡 RECOMMENDATIONS
------------------------------------------------------------
• Address 1 high-priority design issue(s)
• Consider fixing 1 medium-priority design issue(s)
• 1 low-priority improvement(s) suggested
============================================================
```

## Integration with ORBIT Workflows

The design reviewer can be used as a custom crew member in any mission:

```bash
# Use design reviewer for review phase
orbit launch "Add user profile component" --custom-crew design-reviewer
```

Or as part of the mission control flow by selecting the `design-review` mission type.

## External AI Providers

### Supported Providers

1. **Google Gemini** - Set `GEMINI_API_KEY`
2. **OpenAI** - Set `OPENAI_API_KEY`
3. **Anthropic Claude** - Set `ANTHROPIC_API_KEY`

### How It Works

When external AI is enabled:
1. Loads sample existing patterns from your codebase
2. Sends new code changes to configured providers
3. Analyzes consistency with existing patterns
4. Generates consensus recommendations
5. Adds consistency checks to the review report

### Graceful Degradation

If no external AI providers are configured:
- All built-in checks still run normally
- No errors or warnings about missing providers
- Results focus on automated pattern detection
- Can be enabled later without code changes

## Best Practices

1. **Start with built-in checks** - No external dependencies required
2. **Add external AI for complex projects** - Gets better with scale
3. **Use pre-commit hooks** - Catch issues early
4. **Integrate into CI/CD** - Enforce standards automatically
5. **Review reports regularly** - Identify patterns and improve guidelines
6. **Customize patterns path** - Point to your design system

## Architecture

### Agent Definition
- **Role**: UI/UX Consistency Expert
- **Capabilities**: design-review, ui-consistency, ux-patterns, accessibility, design-systems
- **Model Preference**: Standard (or Fast in ecomode)
- **Preferred Phases**: review, implement

### File Structure
```
src/
├── agents/
│   ├── design-review.ts      # Core review logic
│   └── index.ts              # Agent definition
├── workflows/
│   └── design-review.ts      # Workflow orchestration
└── cli/
    └── index.ts              # CLI command integration
```

## Future Enhancements

Potential improvements:
- Design system component detection
- Style guide auto-generation
- Visual regression testing integration
- Performance budget checking
- Brand consistency validation
- Internationalization checks
- Dark mode compatibility checks

---
*Part of the ORBIT toolkit - Orchestrated Robotic Build & Integration Toolkit*
