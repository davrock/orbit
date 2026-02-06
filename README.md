# 🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit

AI-powered autonomous software development with self-improvement, smart model selection, and best practices enforcement.

> "Houston, we have liftoff!" 🚀

**Now powered by TypeScript for better reliability and type safety!**

## Quick Start

### Install

```bash
# Option 1: npm (any platform)
npm install -g @davrock/orbit

# Option 2: From source (Unix/macOS)
git clone https://github.com/davrock/orbit.git && cd orbit && ./install.sh

# Option 3: From source (Windows PowerShell)
git clone https://github.com/davrock/orbit.git; cd orbit; .\install.ps1
```

### Use

```bash
# Full feature workflow
orbit launch "add user authentication"

# Bug fix (uses cheaper models)
orbit repair "fix login crash"

# Self-improvement loop (processes queue first)
orbit evolve

# Check detected configuration
orbit config
```

## 🚀 Missions (Workflows)

| Mission | Phases | Use Case |
|---------|--------|----------|
| `launch` | plan → implement → test → review → commit | New features |
| `repair` | debug → implement → test → commit | Bug fixes |
| `warp` | implement → commit | Quick changes |
| `mayday` | debug → implement → commit | Hotfixes |
| `preflight` | test → implement → test → review → commit | TDD workflow |
| `shields-up` | plan → implement → security → test → review → commit | Security-sensitive |
| `dock` | plan → implement → test → document → commit | API development |
| `transmit` | implement → review → commit | Documentation |
| `apollo` | all phases | Comprehensive |

```bash
orbit missions  # List all
```

## 🧠 Smart Model Selection

Auto-selects optimal LLM model per task to save tokens:

| Tier | Icon | Cost | Use Case |
|------|------|------|----------|
| `premium` | 🔥 | 3x | Architecture, security, complex debugging |
| `standard` | ⚡ | 1x | General development, tests, reviews |
| `fast` | 💨 | 0.5x | Docs, formatting, simple fixes |

```bash
orbit launch --premium "security audit"  # Force premium
orbit transmit --economy "update README" # Force fast
orbit fuel                               # View token usage
```

Auto-escalation: If a task fails with standard model, retries with premium.

## 📚 Best Practices

All crew members reference `.copilot/best-practices.yaml` for standards:
- Coding standards (TypeScript, Python, JavaScript)
- Testing patterns (arrange-act-assert, naming)
- Security guidelines (OWASP, input validation)
- Documentation conventions
- Git commit standards

## 🧑‍🚀 Crew (Agents)

| Crew | Role | Model |
|------|------|-------|
| `commander` | System architect | 🔥 premium |
| `pilot` | Implementer | ⚡ standard |
| `engineer` | Bug detective | 🔥 premium |
| `navigator` | Code reviewer | ⚡ standard |
| `specialist` | QA hero | ⚡ standard |
| `security-officer` | Security ninja | 🔥 premium |
| `propulsion` | Performance | ⚡ standard |
| `comms` | Documentation | 💨 fast |
| `ground-control` | DevOps | ⚡ standard |
| `mission-planner` | Planner | ⚡ standard |
| `hal` | Self-improve | ⚡ standard |

```bash
orbit crews
orbit launch --crew security-officer "add auth"
```

## 🧬 Self-Improvement Loop

Priority order: **Queue → GitHub Issues → Self-Improve**

```bash
orbit evolve              # Run until stopped
orbit evolve --once       # Single cycle
orbit evolve --turbo      # Fast mode (30s delay)
orbit evolve --max 50     # Limit cycles
orbit status              # Show history
orbit reset               # Reset failsafe counters
```

### Cargo Manifest (Task Queue)

```bash
# Add tasks
orbit cargo-add "Add user authentication" --priority high
orbit cargo-add "Add dark mode toggle"

# View queue
orbit cargo

# Process all
orbit cargo-run
```

### Ground Control Failsafes 🚨

Prevents infinite loops:
- ✓ Max 3 consecutive failures → cooldown
- ✓ Max 5 no-progress cycles → abort mission
- ✓ Detects repetitive improvements → variety required
- ✓ Space quotes ("Houston, we have a problem!")

## 📋 Implementation Planning

Generate detailed plans and GitHub issues:

```bash
# Create a flight plan for a feature
orbit flight-plan new "Add OAuth2 authentication"

# Deeper analysis
orbit flight-plan new "Refactor database layer" --depth 3

# List all plans
orbit flight-plan list

# View a specific plan
orbit flight-plan show plan-001

# Generate GitHub issues from a plan
orbit flight-plan issues plan-001
```

### Plan Depth Levels

| Depth | Description |
|-------|-------------|
| 1 | Quick: 3-5 high-level tasks |
| 2 | Standard: 8-12 tasks with decisions (default) |
| 3 | Detailed: 15+ tasks, architecture, risks, testing |

## Files

```
orbit/
├── src/                 # TypeScript source
│   ├── cli/             # CLI commands
│   ├── core/            # Types, detection, state
│   ├── workflows/       # Mission control, launch sequence, etc.
│   └── utils/           # Output, git, exec utilities
├── dist/                # Compiled JavaScript
├── .copilot/
│   ├── crew.yaml        # Crew definitions
│   ├── missions.yaml    # Mission definitions
│   ├── best-practices.yaml # Standards reference
│   ├── models.yaml      # Model selection config
│   ├── cargo_manifest.txt # Task queue
│   ├── config.sh        # Legacy shell config
│   ├── plans/           # Generated flight plans
│   └── state/           # Runtime state
├── package.json
├── tsconfig.json
├── QUICKSTART.md
└── README.md
```

## Development

```bash
# Development mode (uses tsx)
npm run dev -- launch "task"

# Build TypeScript
npm run build

# Type check
npm run typecheck

# Link globally
npm link
```

## License

MIT
