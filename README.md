# 🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit

AI-powered autonomous software development with self-improvement, smart model selection, and best practices enforcement.

> "Houston, we have liftoff!" 🚀

## Quick Start

```bash
# Full feature workflow
./mission-control launch "add user authentication"

# Bug fix (uses cheaper models)
./mission-control repair "fix login crash"

# Self-improvement loop (processes queue first)
./launch-sequence
```

## 🚀 Missions (Workflows)

| Mission | AKA | Phases |
|---------|-----|--------|
| `launch` | feature | plan → implement → test → review → commit |
| `repair` | fix | debug → implement → test → commit |
| `warp` | quick | implement → commit |
| `mayday` | hotfix | debug → implement → commit |
| `preflight` | tdd | test → implement → test → review → commit |
| `shields-up` | secure | plan → implement → security → test → review → commit |
| `dock` | api | plan → implement → test → document → commit |
| `transmit` | docs | implement → review → commit |
| `paranoid` | - | implement → review → test → review → commit |
| `apollo` | - | all phases |

```bash
./mission-control --missions  # List all
```

## 🧠 Smart Model Selection

Auto-selects optimal LLM model per task to save tokens:

| Tier | Icon | Cost | Use Case |
|------|------|------|----------|
| `premium` | 🔥 | 3x | Architecture, security, complex debugging |
| `standard` | ⚡ | 1x | General development, tests, reviews |
| `fast` | 💨 | 0.5x | Docs, formatting, simple fixes |

```bash
./mission-control --premium shields-up "security audit"  # Force premium
./mission-control --economy transmit "update README"     # Force fast
./mission-control --fuel                                 # View token usage
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
./mission-control --crew
./mission-control --crew security-officer launch "add auth"
```

## 🧬 Self-Improvement (launch-sequence)

Priority order: **Queue → GitHub Issues → Self-Improve**

```bash
./launch-sequence              # Run until stopped
./launch-sequence --once       # Single cycle
./launch-sequence --status     # Show history
./launch-sequence --turbo      # Fast mode (30s delay)

MAX_ITERATIONS=50 ./launch-sequence   # Limit cycles
```

### Flight Plan (Feature Queue)

Add tasks to `.copilot/feature_queue.txt`:
```
# HIGH PRIORITY
Add user authentication
Implement API rate limiting

# MEDIUM PRIORITY
Add dark mode toggle
```

### Ground Control Failsafes 🚨

Prevents infinite loops:
- ✓ Max 3 consecutive failures → cooldown
- ✓ Max 5 no-progress cycles → abort mission
- ✓ Detects repetitive improvements → variety required
- ✓ Space quotes ("Houston, we have a problem!")

## 📋 Implementation Planning

Generate detailed plans and GitHub issues (inspired by BMAD, but focused):

```bash
# Create a flight plan for a feature
./flight-plan new "Add OAuth2 authentication with Google and GitHub"

# Deeper analysis
./flight-plan new "Refactor database layer" --depth 3

# List all plans
./flight-plan list

# Generate GitHub issues from a plan
./flight-plan issues plan-001

# Execute plan tasks automatically
./flight-plan execute plan-001
```

### Plan Depth Levels

| Depth | Description |
|-------|-------------|
| 1 | Quick: 3-5 high-level tasks |
| 2 | Standard: 8-12 tasks with decisions (default) |
| 3 | Detailed: 15+ tasks, architecture, risks, testing |

## 🐙 GitHub Issue Management

Convert queue, plans, or text into GitHub issues:

```bash
# Create issues from feature queue
./transmit-issues from-queue

# Create issues from a flight plan
./transmit-issues from-plan plan-001

# Quick single issue
./transmit-issues from-text "Add dark mode support" --labels enhancement

# Bulk import from file
./transmit-issues bulk ./features.txt --milestone v2.0

# Create as epic with sub-issues
./transmit-issues from-plan plan-001 --epic

# View created issues log
./transmit-issues log
```

## Files

```
mission-control      Main orchestrator
launch-sequence      Self-improvement loop
flight-plan          Implementation planning
transmit-issues      GitHub issue generator
.copilot/
  crew.yaml          Crew definitions + model tiers
  missions.yaml      Mission definitions
  best-practices.yaml Standards reference
  models.yaml        Model selection config
  feature_queue.txt  Flight plan queue
  config.sh          Configuration
  plans/             Generated flight plans
  state/             Runtime state
    fuel_tracking.json Token usage
    issues_created.log Issue history
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
./mission-control launch "add user settings page"
./mission-control repair "fix null pointer in login"

# Cost-conscious
./mission-control --economy transmit "update docs"

# Security-focused (uses premium models)
./mission-control --premium shields-up "add payment processing"

# Check fuel usage
./mission-control --fuel

# Self-improvement with queue
echo "Add dark mode" >> .copilot/feature_queue.txt
./launch-sequence --once
```

## License

MIT
