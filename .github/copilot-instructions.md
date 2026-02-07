# ORBIT – Copilot Instructions

## Project Overview

ORBIT (Orchestrated Robotic Build & Integration Toolkit) is an AI-powered autonomous software development system built in **TypeScript (strict mode, ESM)**. It orchestrates complex dev workflows through specialized AI agent crews, self-improves via feedback loops, and enforces best practices across codebases.

## 🚨 CRITICAL: Protected Paths

**NEVER delete, move, rename, or modify anything in these directories:**

| Path | Purpose |
|------|---------|
| `.copilot/` | GitHub Copilot's own workspace — **DO NOT TOUCH** |
| `src/config/skills/` | ORBIT's learning memory |
| `src/config/state/` | Runtime state and logs |
| `src/config/plans/` | Flight plans |
| `src/config/*.yaml` | Configuration files |

If you need to change a YAML config, ask the user first.

## Tech Stack

- **Language:** TypeScript 5.9+ (ES2022 target, ESM modules, strict mode)
- **Runtime:** Node.js ≥ 16
- **CLI framework:** Commander.js
- **Testing:** Vitest (V8 coverage, Arrange-Act-Assert)
- **Validation:** Zod
- **YAML parsing:** yaml
- **Terminal output:** chalk

## Repository Layout

```
src/
├── cli/          # CLI entry point & command definitions (Commander.js)
├── core/         # Types, detection, state, models, skills, metrics, AI providers
├── agents/       # YAML-based crew definitions & loader
│   └── definitions/  # 25 agent YAML files
├── workflows/    # Mission control, launch sequence, parallel execution engines
│   └── definitions/  # Workflow YAML files
├── utils/        # Shell exec, git ops, output formatting, safeguards, rate-limiting
└── config/       # Runtime config: YAML configs, state, skills, plans, dashboard
```

## Coding Conventions

### TypeScript

- **Strict mode always** — no `any`; use `unknown` with type guards.
- **Explicit return types** on all exported functions.
- **`const` over `let`**, never `var`.
- **`interface`** for object shapes, **`type`** for unions/aliases.
- **Optional chaining** (`?.`) and **nullish coalescing** (`??`) for null safety.
- **async/await** — avoid raw `.then()` chains.
- **Early returns** to reduce nesting; keep functions under 50 lines.
- **Readonly** properties where mutation is not needed.

### Imports

- Use ESM imports with `.js` extensions on local imports (TypeScript convention for ESM output):
  ```ts
  import { loadGroundControl } from '../core/index.js';
  ```
- Group imports: node builtins → external packages → internal modules.

### Naming

- `camelCase` for variables, functions, parameters.
- `PascalCase` for types, interfaces, classes.
- `UPPER_SNAKE_CASE` for constants and enum-like values.
- Descriptive names — no abbreviations.

### Error Handling

- Always use explicit `try/catch`; never silently swallow errors.
- Fail fast with clear error messages.
- Use `printError()` / `printWarning()` from `src/utils/output.js` for user-facing messages.

### File Comments

- Each file starts with a short one-line comment: `// 🛸 ORBIT <Module Name>`
- Only comment non-obvious logic; avoid restating what the code already says.

## Testing

- **Framework:** Vitest (`npm test` / `npx vitest run`)
- **Pattern:** Arrange-Act-Assert with `describe` / `it` blocks.
- **Mocking:** `vi.mock()` for filesystem and child_process.
- **Test file naming:** `<module>.test.ts` alongside the source file.
- **Coverage target:** Critical paths, error handling, edge cases.
- All 637 tests must pass before committing.

## Build & Run

```bash
npm run build      # tsc → dist/ + copy YAML definitions
npm run dev        # tsx hot-reload
npm test           # vitest run (all tests)
npm run typecheck  # tsc --noEmit
npm start          # run compiled CLI
```

The build copies `src/agents/definitions/*.yaml` and `src/workflows/definitions/*.yaml` into `dist/`.

## Key Types (src/core/types.ts)

```ts
type ModelTier    = 'premium' | 'standard' | 'fast' | 'ecomode';
type MissionType  = 'launch' | 'repair' | 'warp' | 'mayday' | 'preflight'
                  | 'shields-up' | 'dock' | 'transmit' | 'apollo' | 'ralph'
                  | 'ultrawork' | 'swarm' | 'pipeline' | 'design-review';
type Phase        = 'plan' | 'implement' | 'test' | 'review' | 'debug'
                  | 'commit' | 'security' | 'document' | 'research';
type CrewMember   = 'commander' | 'pilot' | 'engineer' | 'navigator' | ...;
```

## Architecture Principles

1. **Modularity** — each directory is a bounded context (agents, workflows, core, utils).
2. **YAML-driven config** — agent definitions and mission workflows are declarative YAML.
3. **Smart model selection** — cost-aware tier routing (premium/standard/fast/ecomode).
4. **Self-improvement loop** — `orbit evolve` runs priority-ordered autonomous improvements.
5. **Safeguards** — constitutional constraints, pre/post-mission file integrity checks.
6. **Multi-stack** — auto-detects 30+ tech stacks via `detectProjectConfig()`.

## Do's and Don'ts

### ✅ Do

- Run `npm run build && npm test` before committing any change.
- Add or update tests when changing behavior.
- Use existing patterns and utilities (`printSuccess`, `execQuiet`, `readJsonFile`).
- Keep changes minimal and focused — one concern per commit.
- Use commit format: `<type>: <description>` (fix, feat, test, refactor, perf, docs, security).

### ❌ Don't

- Delete or modify anything in `.copilot/`.
- Delete `src/config/skills/`, `src/config/state/`, or `src/config/plans/`.
- Change `package.json` dependencies without explicit instruction.
- Introduce breaking changes to public CLI commands or APIs.
- Skip running tests before committing.
- Use `rm -rf`, `drop database`, or other destructive commands.
- Commit secrets, credentials, or API keys.
