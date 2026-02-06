# 🤖 SKYNET - Autonomous Development System

AI-powered autonomous software development with self-improvement, smart model selection, and best practices enforcement.

> "I'll be back... with better code" - The Terminator

## Quick Start

```bash
# Full feature workflow
./skynet ship-it "add user authentication"

# Bug fix (uses cheaper models)
./skynet squash "fix login crash"

# Self-improvement loop (processes queue first)
./evolve
```

## 🚀 Workflows

| Workflow | AKA | Phases |
|----------|-----|--------|
| `ship-it` | feature | plan → implement → test → review → commit |
| `squash` | fix | debug → implement → test → commit |
| `yolo` | quick | implement → commit |
| `hotdog` | hotfix | debug → implement → commit |
| `test-first` | tdd | test → implement → test → review → commit |
| `fort-knox` | secure | plan → implement → security → test → review → commit |
| `endpoint` | api | plan → implement → test → document → commit |
| `wordsmith` | docs | implement → review → commit |
| `paranoid` | - | implement → review → test → review → commit |
| `everything` | - | all phases |

```bash
./skynet --workflows  # List all
```

## 🧠 Smart Model Selection

Auto-selects optimal LLM model per task to save tokens:

| Tier | Icon | Cost | Use Case |
|------|------|------|----------|
| `premium` | 🔥 | 3x | Architecture, security, complex debugging |
| `standard` | ⚡ | 1x | General development, tests, reviews |
| `fast` | 💨 | 0.5x | Docs, formatting, simple fixes |

```bash
./skynet --premium fort-knox "security audit"  # Force premium
./skynet --cheap wordsmith "update README"     # Force fast
./skynet --costs                               # View token usage
```

Auto-escalation: If a task fails with standard model, retries with premium.

## 📚 Best Practices

All agents reference `.copilot/best-practices.yaml` for standards:
- Coding standards (TypeScript, Python, JavaScript)
- Testing patterns (arrange-act-assert, naming)
- Security guidelines (OWASP, input validation)
- Documentation conventions
- Git commit standards

## 🤖 Agents

| Agent | Role | Model |
|-------|------|-------|
| `jarvis` | System architect | 🔥 premium |
| `neo` | Implementer | ⚡ standard |
| `sherlock` | Bug detective | 🔥 premium |
| `linus` | Code reviewer | ⚡ standard |
| `testman` | QA superhero | ⚡ standard |
| `cipher` | Security ninja | 🔥 premium |
| `flash` | Performance | ⚡ standard |
| `scribe` | Documentation | 💨 fast |
| `devops-dan` | DevOps | ⚡ standard |
| `oracle` | Planner | ⚡ standard |
| `skynet` | Self-improve | ⚡ standard |

```bash
./skynet --agents
./skynet --agent cipher ship-it "add auth"
```

## 🧬 Self-Improvement (evolve)

Priority order: **Queue → GitHub Issues → Self-Improve**

```bash
./evolve              # Run until stopped
./evolve --once       # Single cycle
./evolve --status     # Show history
./evolve --turbo      # Fast mode (30s delay)

MAX_ITERATIONS=50 ./evolve   # Limit cycles
```

### Feature Queue

Add tasks to `.copilot/feature_queue.txt`:
```
# HIGH PRIORITY
Add user authentication
Implement API rate limiting

# MEDIUM PRIORITY
Add dark mode toggle
```

### Ralph Wiggum Failsafes 🚨

Prevents infinite loops:
- ✓ Max 3 consecutive failures → cooldown
- ✓ Max 5 no-progress cycles → stop
- ✓ Detects repetitive improvements → variety
- ✓ Ralph quotes ("I bent my Wookiee!")

## Files

```
skynet               Main orchestrator
evolve               Self-improvement loop
.copilot/
  agents.yaml        Agent definitions + model tiers
  workflows.yaml     Workflow definitions
  best-practices.yaml Standards reference
  models.yaml        Model selection config
  feature_queue.txt  Task queue
  config.sh          Configuration
  state/             Runtime state
    cost_tracking.json Token usage
```

## Configuration

Edit `.copilot/config.sh`:

```bash
PROJECT_NAME="MyProject"
MAX_RETRIES=2
GIT_BRANCH="development"
TEST_CMD="npm test"
MODEL_TIER=auto  # auto, premium, standard, fast
```

## Examples

```bash
# Standard development
./skynet ship-it "add user settings page"
./skynet squash "fix null pointer in login"

# Cost-conscious
./skynet --cheap wordsmith "update docs"

# Security-focused (uses premium models)
./skynet --premium fort-knox "add payment processing"

# Check costs
./skynet --costs

# Self-improvement with queue
echo "Add dark mode" >> .copilot/feature_queue.txt
./evolve --once
```

## License

MIT
