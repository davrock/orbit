# 🎨 Design Review Quick Reference

## Quick Start
```bash
# Review git changes
orbit design-review

# Review specific files
orbit design-review --files src/components/*.tsx

# With external AI
orbit design-review --external-ai
```

## Common Use Cases

### Pre-commit Hook
```bash
# In .git/hooks/pre-commit
#!/bin/sh
orbit design-review --pre-commit
```

### CI/CD Pipeline
```bash
# In .github/workflows/ci.yml or similar
- run: orbit design-review --ci --fail-on-warnings
```

### Generate Report
```bash
orbit design-review --report markdown > design-report.md
```

## What It Checks

### UI Consistency
- ❌ Inline styles → Use CSS modules/styled-components
- ❌ Hardcoded colors → Use theme variables
- ❌ Magic numbers → Use spacing units

### UX Patterns
- ❌ Missing loading states
- ❌ Missing error handling feedback

### Accessibility (WCAG)
- ❌ Images without alt text
- ❌ Buttons without labels
- ❌ Clickable divs without semantic HTML

### Responsiveness
- ❌ Fixed widths without breakpoints
- ❌ Missing viewport meta tag

## Severity Levels

🔴 **Critical** (-25 pts): Blocks functionality  
🟠 **High** (-10 pts): Major UX/accessibility issues  
🟡 **Medium** (-5 pts): Design inconsistencies  
🔵 **Low** (-2 pts): Minor improvements  

**Pass**: 70/100 with zero critical issues

## External AI Setup

```bash
# Configure one or more providers
export GEMINI_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"

# Use in review
orbit design-review --external-ai
```

## CLI Options

```
--files <files...>          Specific files
--external-ai               Use AI providers
--no-ui                     Skip UI checks
--no-ux                     Skip UX checks
--no-accessibility          Skip a11y checks
--no-responsiveness         Skip responsive checks
--patterns <path>           Custom patterns path
--pre-commit                Pre-commit mode
--ci                        CI/CD mode
--fail-on-warnings          Strict CI mode
--report <format>           console|json|markdown
```

## Integration with ORBIT

```bash
# Use as custom crew member
orbit launch "Add profile page" --custom-crew design-reviewer

# Or run standalone
orbit design-review
```

## Example Output

```
🎨 DESIGN REVIEW RESULTS
============================================================
✓ Design review PASSED with score 85/100 - 3 issue(s) found

📋 UI-CONSISTENCY
🟡 [MEDIUM] theming
   Hardcoded color detected
   Location: src/Button.tsx:42

📋 ACCESSIBILITY
🟠 [HIGH] alt-text
   Image without alt text
   Location: src/Hero.tsx:15

💡 RECOMMENDATIONS
• Address 1 high-priority issue(s)
• Consider fixing 1 medium-priority issue(s)
```

## Tips

1. ✅ Run locally before committing
2. ✅ Add to pre-commit hooks for team consistency
3. ✅ Enable in CI for automated enforcement
4. ✅ Use external AI on complex design systems
5. ✅ Generate reports for design reviews
6. ✅ Customize patterns path for your design system

---
**Documentation**: `docs/DESIGN_REVIEW.md`
