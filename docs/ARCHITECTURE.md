# ORBIT Architecture

> Orchestrated Robotic Build & Integration Toolkit

## System Overview

ORBIT is an AI-powered autonomous development system that orchestrates complex software workflows through specialized agent crews. It operates as a Node.js CLI tool that dispatches tasks to AI models, tracks state, learns from outcomes, and self-improves.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLI (Commander.js)                       │
│   orbit launch | repair | warp | evolve | cargo | ...           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                   ┌────────────▼────────────┐
                   │    Command Handler      │
                   │  (dedup, option parse)   │
                   └────────────┬────────────┘
                                │
          ┌─────────────────────▼─────────────────────┐
          │              Mission Control               │
          │  (phase orchestration, crew assignment,     │
          │   model selection, error recovery)          │
          └──┬──────────┬──────────┬──────────────────┘
             │          │          │
     ┌───────▼──┐ ┌─────▼────┐ ┌──▼────────────┐
     │  Agents  │ │  Models  │ │  Safeguards   │
     │  (YAML)  │ │  (Tiers) │ │  (Pre/Post)   │
     └──────────┘ └──────────┘ └───────────────┘
             │          │          │
          ┌──▼──────────▼──────────▼──────────────┐
          │           State Layer                   │
          │  ground_control | metrics | skills |    │
          │  fuel_tracking | checkpoints | HUD      │
          └────────────────────────────────────────┘
                        │
                  src/config/
              (YAML configs, state,
               skills, plans, logs)
```

## Module Breakdown

### `src/cli/` — Command-Line Interface

| File | Purpose |
|------|---------|
| `index.ts` | Commander.js program definition — 40+ commands |
| `command-handler.ts` | Shared logic for mission commands (options, model tier) |

**Entry point:** `dist/cli/index.js` (registered as `orbit` bin in package.json).

All commands ultimately call either a workflow function or a core utility.

### `src/core/` — Domain Logic

| File | Purpose |
|------|---------|
| `types.ts` | All shared TypeScript types (`ModelTier`, `MissionType`, `Phase`, `CrewMember`, etc.) |
| `detect.ts` | Auto-detect project tech stack, package manager, test/lint/typecheck commands |
| `models.ts` | Smart model tier selection based on keywords, phase, crew, and ecomode logic |
| `state.ts` | Persistent state: ground control, fuel usage, skills, cargo manifest, logs |
| `autonomous-prompts.ts` | Constitutional constraints, reasoning framework, self-improvement prompts |
| `checkpoint.ts` | Save/restore mission state for resumption after failures |
| `metrics.ts` | Track run history, success rates, durations, phase-level performance |
| `skills.ts` | Extract, store, match, and recall learned patterns from past missions |
| `hud.ts` | Real-time heads-up display state (current task, phase, crew, timing) |
| `ai-providers.ts` | Cross-validation with Gemini, OpenAI, Claude providers |
| `validation.ts` | Type validation, magic keyword detection |
| `quotes.ts` | Space-themed motivational quotes for ground control |
| `notify.ts` | Desktop notifications for mission outcomes |
| `persistence.ts` | Generic persistence utilities |
| `index.ts` | Re-exports all core modules |

### `src/agents/` — Crew System

| File | Purpose |
|------|---------|
| `loader.ts` | Load YAML definitions, cache agents, transform to `CrewMember` interface |
| `definitions/*.yaml` | 25 agent definitions with role, expertise, model tier, instructions |

**Agent tiers:**

| Tier | Cost | Agents |
|------|------|--------|
| 🔥 Premium (3×) | High | commander, engineer, security-officer, hal, cloud-architect |
| ⚡ Standard (1×) | Normal | pilot, navigator, specialist, mission-planner, most others |
| 💨 Fast (0.5×) | Low | comms, scout, ground-control |

### `src/workflows/` — Execution Engines

| File | Purpose |
|------|---------|
| `mission-control.ts` | **Main orchestrator** — phase execution, crew dispatch, prompt assembly |
| `launch-sequence.ts` | Self-improvement loop (`orbit evolve`) with failsafes |
| `ultrawork.ts` | Parallel independent subtask distribution (3–8 subtasks) |
| `swarm.ts` | Dependency-aware parallel execution in waves |
| `pipeline.ts` | Sequential multi-stage processing with context handoffs |
| `plan-mode.ts` | Interactive requirements-gathering interview |
| `cargo-bay.ts` | Task queue management (add, list, process) |
| `flight-plan.ts` | Implementation planning, GitHub issue generation |
| `design-review.ts` | UI/UX consistency checking |
| `deploy.ts` | Install ORBIT into target projects |
| `doctor.ts` | System diagnostics and health checks |
| `dashboard.ts` | Web-based metrics dashboard |

### `src/utils/` — Shared Utilities

| File | Purpose |
|------|---------|
| `exec.ts` | Shell command execution with timeout, rate-limit detection |
| `git.ts` | Git operations (current commit, staged files, diff) |
| `output.ts` | Terminal colors, banners, sections, formatted printing |
| `safeguards.ts` | Pre/post-mission file integrity validation and auto-restore |
| `rate-limit.ts` | API rate-limit detection and backoff |
| `shell-escape.ts` | Safe shell argument escaping |
| `json-file.ts` | Typed JSON read/write/update with validation |

### `src/config/` — Runtime Configuration

```
src/config/
├── best-practices.yaml   # Coding standards reference (SOLID, testing, security)
├── crew.yaml              # Crew member definitions
├── missions.yaml          # Mission type → phase mapping
├── models.yaml            # Model tier selection config
├── cargo_manifest.txt     # Task queue
├── metrics.json           # Run history and aggregates
├── .orbit-protect         # Protection notice
├── dashboard/
│   └── index.html         # Web metrics dashboard
├── plans/                 # Flight plan documents
├── skills/                # Learned patterns (JSON per skill)
│   └── index.json         # Skill index with stats
└── state/
    ├── ground_control.json # Fail/success counters
    ├── fuel_tracking.json  # Token usage by tier
    ├── checkpoint.json     # Mission resumption data
    ├── current.json        # Current HUD state
    ├── flight_log.md       # Human-readable activity log
    ├── mission.log         # Machine-readable log
    ├── hud.json            # HUD display state
    └── pending_prompt.md   # Last prompt sent to AI
```

## Data Flow

### Mission Execution

```
User runs: orbit launch "Add user auth"
                │
                ▼
1. CLI parses command → MissionControlOptions
2. detectProjectConfig() → tech stack, test cmd, etc.
3. selectModelTier(task, mission) → premium/standard/fast
4. Mission phases resolved: [plan, implement, test, review, commit]
5. For each phase:
   a. Select crew member (phase → crew mapping)
   b. Build prompt (task + project context + best practices + guardrails)
   c. Check for matching skills (pattern recall)
   d. Dispatch to AI via Copilot CLI
   e. Record phase result + metrics
   f. Checkpoint state for resumption
6. If all phases pass → git commit
7. Extract skill from successful outcome
8. Update metrics, ground control state, flight log
```

### Self-Improvement Loop (`orbit evolve`)

```
1. Check cargo manifest for queued tasks
2. Check GitHub issues (via `gh` CLI)
3. If nothing queued → generate self-improvement task
   (priority: bugs → security → stability → tests → perf → quality → docs → features)
4. Run mission with constitutional constraints
5. Record success/failure in ground control
6. Failsafes:
   - 3 consecutive failures → 60s cooldown
   - 5 no-progress cycles → abort
7. Loop (or exit if --once)
```

### Model Tier Selection

```
Task keywords → tier override
  "security", "vulnerability", "architecture" → premium
  "typo", "rename", "format", "readme"       → fast

Phase → default tier
  plan → standard | implement → standard | security → premium
  test → standard | review → standard | debug → premium
  commit → fast   | document → fast

Crew → tier
  commander → premium | pilot → standard | comms → fast

Ecomode → mix fast+standard, save 30-50%
```

## Key Design Decisions

1. **YAML-driven agents** — Crew definitions are declarative, not hardcoded. New agents can be added by dropping a YAML file into `src/agents/definitions/`.

2. **Phase-based orchestration** — Missions are sequences of phases, each handled by a specialized crew member. This allows mix-and-match workflows.

3. **Cost-aware routing** — Every task is analyzed for complexity and routed to the cheapest model tier that can handle it.

4. **Constitutional constraints** — Hard-coded rules in `autonomous-prompts.ts` prevent destructive actions during autonomous operation.

5. **Skills as memory** — Successful patterns are extracted and stored as JSON skills. Future tasks check for matching skills before starting from scratch.

6. **Checkpoint/resume** — Mission state is checkpointed after each phase so interrupted runs can resume.

7. **Multi-stack detection** — `detect.ts` identifies 30+ tech stacks and auto-configures test/lint/build commands.

8. **Parallel execution modes** — Three strategies for concurrent work:
   - **Ultrawork**: Independent subtasks, no coordination needed
   - **Swarm**: Dependency-aware waves with inter-task communication
   - **Pipeline**: Sequential stages with context handoff

## Extension Points

| Want to... | Do this |
|------------|---------|
| Add a new agent | Create `src/agents/definitions/<name>.yaml` |
| Add a new mission type | Add type to `MissionType`, add phase mapping in `missions.yaml`, add command in `cli/index.ts` |
| Add a new phase | Add type to `Phase`, implement in `mission-control.ts` |
| Support a new tech stack | Add detection logic in `detect.ts`, add type to `TechStack` |
| Add new CLI command | Add `.command()` in `src/cli/index.ts` |
