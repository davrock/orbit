# 🤖 AI Provider Integration

ORBIT supports optional integration with multiple AI providers for cross-validation and design consistency checks.

## Overview

When enabled, ORBIT can validate code changes using external AI providers (Gemini, Codex, Anthropic) to:
- **Cross-validate** implementations across multiple AI models
- **Check design consistency** with existing codebase patterns
- **Identify potential issues** that a single AI might miss
- **Build consensus** before committing changes

## Configuration

### Environment Variables

Set API keys for the providers you want to use:

```bash
# Google Gemini
export GEMINI_API_KEY="your-gemini-api-key"

# OpenAI Codex
export OPENAI_API_KEY="your-openai-api-key"

# Anthropic Claude
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### Enable Features

Use CLI flags to enable AI provider features:

```bash
# Enable cross-validation
orbit launch "add user authentication" --cross-validate

# Enable design consistency checks
orbit launch "add new API endpoint" --consistency-check

# Enable both
orbit warp "refactor login logic" --cross-validate --consistency-check
```

## Features

### Cross-Validation

Cross-validation runs your code changes through multiple AI providers and checks for consensus:

```bash
orbit launch "implement payment processing" --cross-validate
```

**What it does:**
- Sends code changes to all configured AI providers
- Collects feedback from each provider
- Calculates agreement rate across providers
- Shows consensus level and recommendations

**Output example:**
```
🤖 Running AI provider validations...
  Running cross-validation...
  Agreement rate: 85%
  Consensus: ✓
  High consensus - proceed with implementation
```

### Design Consistency Checks

Ensures new code follows existing patterns in your codebase:

```bash
orbit warp "add new feature" --consistency-check
```

**What it checks:**
- Naming conventions (camelCase, PascalCase, etc.)
- Error handling patterns
- Code structure and organization
- API design consistency
- Testing patterns

**Output example:**
```
🤖 Running AI provider validations...
  Checking design consistency...
  Design patterns consistent ✓
```

## How It Works

1. **After each successful phase**, if validation is enabled:
   - Changed files are identified
   - Code snippets are extracted
   - Context is gathered (task, phase, changes)

2. **Validation requests** are sent to configured providers:
   - Each provider analyzes the code independently
   - Providers check for quality, security, and best practices
   - Results are aggregated and compared

3. **Consensus calculation**:
   - Agreement rate calculated across providers
   - Consistency issues identified
   - Recommendations generated based on consensus

4. **Results displayed**:
   - Summary shown in console
   - Detailed logs written to flight log
   - Mission continues regardless of validation results

## Agreement Thresholds

- **90%+**: High consensus - excellent alignment
- **70-89%**: Good consensus - minor concerns
- **50-69%**: Mixed feedback - review inconsistencies
- **<50%**: Low consensus - significant concerns

## Best Practices

### When to Use

✅ **Use cross-validation for:**
- Security-critical implementations
- Complex architectural changes
- Production-ready features
- API design decisions
- Performance-critical code

✅ **Use consistency checks for:**
- New feature implementations
- Refactoring existing code
- Adding new modules/components
- Team collaboration projects

### When to Skip

❌ **Skip for:**
- Simple typo fixes
- Documentation updates
- Minor formatting changes
- Experimental prototypes
- Quick debugging sessions

### Cost Considerations

Cross-validation makes additional API calls to external providers:
- Each validation = 1 API call per provider
- Costs vary by provider and usage
- Consider using selectively for important changes

## Limitations

- **API Keys Required**: Need at least one provider configured
- **Network Dependency**: Requires internet connectivity
- **API Costs**: External API calls may incur charges
- **Best Effort**: Validation runs but doesn't block mission completion
- **Placeholder Implementation**: Current version has simplified API calls (placeholders)

## Future Enhancements

Planned improvements:
- Full API integration with real provider SDKs
- Structured response parsing from each provider
- Configurable validation rules and thresholds
- Caching of validation results
- Offline validation mode using local models
- Custom validation plugins
- Detailed validation reports

## Example Workflow

```bash
# Set up providers
export GEMINI_API_KEY="..."
export ANTHROPIC_API_KEY="..."

# Run mission with validation
orbit launch "implement OAuth2 flow" \
  --cross-validate \
  --consistency-check \
  --premium

# View results in flight log
cat .copilot/state/flight_log.md
```

## Troubleshooting

### No providers configured
```
AI Validation: No external AI providers configured
```
**Solution**: Set at least one API key environment variable

### Validation fails
```
Validation error: Provider gemini failed: Network error
```
**Solution**: Check internet connection and API key validity

### Low consensus
```
Agreement rate: 45%
Consensus: ✗
Low consensus - significant concerns from multiple providers
```
**Solution**: Review the specific issues raised by providers, consider revising implementation

## Security Notes

- API keys should be kept secure
- Never commit API keys to version control
- Use environment variables or secure key management
- Consider rate limits and quotas
- Review provider terms of service
- Be mindful of sending proprietary code to external APIs

## See Also

- [Model Selection Guide](../README.md#model-tiers)
- [Mission Types](../README.md#missions)
- [Best Practices](../.copilot/best-practices.yaml)
