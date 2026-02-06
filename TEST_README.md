# 🧪 ORBIT Test Suite

Comprehensive test coverage for ORBIT's core utilities and state management.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI (interactive)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Shell Escape Tests (`src/utils/shell-escape.test.ts`)
Security-critical tests ensuring shell command injection prevention:
- Single quote escaping
- Command injection vectors (semicolons, backticks, dollar signs)
- Special characters handling
- Multiple argument escaping
- Empty string edge cases

### State Management Tests (`src/core/state.test.ts`)
Persistence layer tests for ground control and fuel tracking:
- Ground control state save/load
- Success and failure recording
- Task type tracking (keeps last 3)
- Fuel usage tracking by tier (premium, standard, fast, ecomode)
- Legacy format migration (snake_case → camelCase)
- Graceful error handling for corrupted files

## Coverage Goals

Following ORBIT best practices:
- **Core logic**: 80%+ coverage ✅
- **Utilities**: 100% coverage ✅
- **Integration points**: 90%+ coverage (planned)

## Test Philosophy

Tests follow the AAA pattern (Arrange-Act-Assert):
- Clear, descriptive test names
- One logical assertion per test
- Fast execution (< 100ms per test)
- No external dependencies
- Deterministic results

## Adding New Tests

1. Create `*.test.ts` alongside source file
2. Import from vitest: `import { describe, it, expect } from 'vitest'`
3. Follow existing naming patterns
4. Run `npm test` before committing

## Framework

Using **Vitest** for:
- Fast execution with native ESM support
- TypeScript first-class support
- Compatible with Node.js testing patterns
- Great DX with watch mode and UI
