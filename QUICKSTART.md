# 🛸 ORBIT Quickstart Guide
## Orchestrated Robotic Build & Integration Toolkit

> "Houston, we have liftoff!" 🚀

---

## 📋 Table of Contents

1. [Installation](#-installation)
2. [Core Features](#-core-features)
   - [Mission Control](#1-mission-control---main-orchestrator)
   - [Cargo Bay](#2-cargo-bay---task-queue-processor)
   - [Launch Sequence](#3-launch-sequence---self-improvement-loop)
2. [Planning & Issues](#-planning--issues)
   - [Flight Plan](#4-flight-plan---implementation-planning)
   - [Transmit Issues](#5-transmit-issues---github-issue-generator)
3. [Monitoring](#-monitoring)
   - [Mission Tracker](#6-mission-tracker---real-time-dashboard)
4. [Smart Features](#-smart-features)
   - [Model Selection](#7-smart-model-selection)
   - [Best Practices](#8-best-practices-enforcement)
   - [Crew Members](#9-crew-agents)
5. [Configuration](#-configuration)
6. [Examples](#-examples)

---

## 📦 Installation

### Install into Existing Project

From the ORBIT directory, run the deploy script with your project path:

```bash
./deploy /path/to/your/project
```

This copies all ORBIT files and makes them executable.


### Post-Installation

**Zero configuration needed!** ORBIT auto-detects everything:

- ✅ Project name (from package.json, Cargo.toml, go.mod, etc.)
- ✅ Tech stack (Node, Python, Go, Rust, Java, Ruby, .NET, PHP)
- ✅ Test command (npm test, pytest, go test, cargo test, etc.)
- ✅ Type checker (tsc, mypy, go vet, cargo check, etc.)
- ✅ Linter (eslint, ruff, clippy, etc.)
- ✅ Git branch (current branch or main/master)
- ✅ Package manager (npm, pnpm, yarn, pip, poetry, etc.)

```bash
# Verify what ORBIT detected
./mission-control --config

# Verify installation
./mission-control --help
```

**Optional:** Add to .gitignore to not commit state:
```
.copilot/state/
.copilot/*.log
```

**Override if needed:** Set environment variables:
```bash
TEST_CMD="pytest -v" ./mission-control launch "add feature"
```

---

## 🚀 Core Features

### 1. Mission Control - Main Orchestrator

The heart of ORBIT. Runs multi-phase development workflows with intelligent agent selection.

```bash
# Basic usage
./mission-control <mission> "task description"

# Examples
./mission-control launch "add user authentication"    # Full feature
./mission-control repair "fix login crash"            # Bug fix
./mission-control warp "rename variable"              # Quick change
./mission-control shields-up "add payment processing" # Security-focused
```

**Available Missions:**

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

**Options:**
```bash
./mission-control --help           # Show all options
./mission-control --missions       # List all missions
./mission-control --crews          # List all crew members
./mission-control --fuel           # Show token usage
./mission-control --premium ...    # Force premium model (3x)
./mission-control --economy ...    # Force fast model (0.5x)
./mission-control --dry-run ...    # Preview without executing
./mission-control -i ...           # Interactive (confirm each phase)
./mission-control --crew pilot ... # Override crew member
```

---

### 2. Cargo Bay - Task Queue Processor

Processes tasks from the queue autonomously, one after another.

```bash
# Run cargo processor
./cargo-bay
```

**Cargo Manifest:** `.copilot/cargo_manifest.txt`

```text
# 📦 Cargo Manifest

# HIGH PRIORITY
Add user authentication
Fix critical security bug

# MEDIUM PRIORITY
Add dark mode toggle
Improve error messages

# LOW PRIORITY
Update dependencies
```

- Tasks are processed top-to-bottom
- Completed tasks are marked with `# ✓`
- Failed tasks remain for retry

---

### 3. Launch Sequence - Self-Improvement Loop

Autonomous improvement cycle that processes work in priority order:

1. **Queue** → Tasks from cargo manifest
2. **GitHub Issues** → Open issues from the repo
3. **Flight Plans** → Pending plan executions
4. **Self-Improve** → AI finds and implements improvements

```bash
# Continuous operation (until stopped)
./launch-sequence

# Single cycle
./launch-sequence --once

# Fast mode (30s between cycles)
./launch-sequence --turbo

# View status/history
./launch-sequence --status

# Reset failsafe counters
./launch-sequence --reset
```

**Environment Variables:**
```bash
LOOP_DELAY=120        # Seconds between cycles
MAX_ITERATIONS=50     # Stop after N cycles (0=infinite)
```

**Failsafes (Ground Control):**
- ✅ Max 3 consecutive failures → 60s cooldown
- ✅ Max 5 no-progress cycles → abort mission
- ✅ Detects stuck loops and repetitive patterns
- ✅ Auto-escalates to premium model on failure

---

## 📋 Planning & Issues

### 4. Flight Plan - Implementation Planning

Generate detailed implementation plans from feature descriptions.

```bash
# Create a new plan
./flight-plan new "Add OAuth2 authentication"

# With depth control
./flight-plan new "Refactor database layer" --depth 3

# List all plans
./flight-plan list

# View a specific plan
./flight-plan show plan-001

# Generate GitHub issues from plan
./flight-plan issues plan-001

# Execute plan tasks automatically
./flight-plan execute plan-001

# Preview without changes
./flight-plan new "Feature" --dry-run
```

**Depth Levels:**

| Depth | Tasks | Detail Level |
|-------|-------|--------------|
| 1 | 3-5 | Quick, high-level |
| 2 | 8-12 | Standard with decisions (default) |
| 3 | 15+ | Comprehensive with architecture, risks |

**Plan Output:** `.copilot/plans/plan-XXX.md`

---

### 5. Transmit Issues - GitHub Issue Generator

Convert tasks, plans, or text into well-structured GitHub issues.

```bash
# From cargo manifest
./transmit-issues from-cargo

# From a flight plan
./transmit-issues from-plan plan-001

# Quick single issue
./transmit-issues from-text "Add dark mode support"

# With labels and milestone
./transmit-issues from-text "Fix bug" --labels bug,urgent --milestone v2.0

# Bulk import from file
./transmit-issues bulk ./features.txt

# Create as epic with sub-issues
./transmit-issues from-plan plan-001 --epic

# View created issues
./transmit-issues log

# Show templates
./transmit-issues templates
```

**Options:**
```bash
--labels <l1,l2>    # Add labels (comma-separated)
--milestone <name>  # Add to milestone
--assignee <user>   # Assign to user
--project <name>    # Add to GitHub project
--epic              # Create parent epic with linked sub-issues
--dry-run           # Preview without creating
```

---

## 📡 Monitoring

### 6. Mission Tracker - Real-time Dashboard

Monitor operations in real-time.

```bash
# Show current status
./mission-tracker

# Auto-refreshing dashboard (every 5s)
./mission-tracker watch

# Follow mission log
./mission-tracker tail

# Follow cargo processing
./mission-tracker cargo

# View flight log
./mission-tracker flight

# View HAL/self-improvement log
./mission-tracker hal
```

**Alternative: Open Dashboard**
```bash
./open-dashboard    # Opens web-based dashboard (if configured)
```

---

## 🧠 Smart Features

### 7. Smart Model Selection

ORBIT auto-selects the optimal LLM model tier based on task complexity:

| Tier | Icon | Cost | Auto-Selected For |
|------|------|------|-------------------|
| `premium` | 🔥 | 3x | Security, architecture, complex debugging |
| `standard` | ⚡ | 1x | General development, tests, reviews |
| `fast` | 💨 | 0.5x | Docs, formatting, simple fixes, commits |

**Behavior:**
- Keywords trigger tier selection (e.g., "security" → premium)
- Phases have default tiers (e.g., document → fast)
- Failed tasks auto-escalate to premium on retry

**Manual Override:**
```bash
./mission-control --premium shields-up "security audit"
./mission-control --economy transmit "update README"
```

**Track Usage:**
```bash
./mission-control --fuel
```

**Config:** `.copilot/models.yaml`

---

### 8. Best Practices Enforcement

All crew members reference `.copilot/best-practices.yaml` for standards:

- **Coding**: TypeScript, Python, JavaScript conventions
- **Testing**: Arrange-Act-Assert, naming, coverage
- **Security**: OWASP guidelines, input validation
- **Documentation**: Format, structure, examples
- **Git**: Commit message conventions

Crew prompts include: "Reference .copilot/best-practices.yaml for standards."

---

### 9. Crew (Agents)

Specialized AI personas for different tasks:

| Crew | Role | Default Tier |
|------|------|--------------|
| `commander` | System architect, design decisions | 🔥 premium |
| `pilot` | Code implementation | ⚡ standard |
| `engineer` | Debugging, root cause analysis | 🔥 premium |
| `navigator` | Code review, quality checks | ⚡ standard |
| `specialist` | Testing, QA | ⚡ standard |
| `security-officer` | Security audits, vulnerability fixes | 🔥 premium |
| `propulsion` | Performance optimization | ⚡ standard |
| `comms` | Documentation | 💨 fast |
| `ground-control` | DevOps, automation | ⚡ standard |
| `mission-planner` | Task breakdown, planning | ⚡ standard |
| `scout` | Research, exploration | ⚡ standard |
| `hal` | Self-improvement analysis | ⚡ standard |

**Override crew for a task:**
```bash
./mission-control --crew security-officer launch "add auth"
```

**Config:** `.copilot/crew.yaml`

---

## ⚙️ Configuration

### Zero-Config Auto-Detection

ORBIT automatically detects everything based on your project files:

| Detected From | Values |
|---------------|--------|
| `package.json` | Project name, Node.js stack, npm/pnpm/yarn |
| `tsconfig.json` | TypeScript type checking |
| `Cargo.toml` | Rust stack, cargo commands |
| `go.mod` | Go stack, go commands |
| `pom.xml` / `build.gradle` | Java stack, maven/gradle |
| `requirements.txt` / `pyproject.toml` | Python stack, pip/poetry |
| `.eslintrc.*` | ESLint for linting |
| Current git branch | Default branch for commits |

**View detected config:**
```bash
./mission-control --config
```

### Override When Needed

Set environment variables to override any detection:

```bash
# One-time override
TEST_CMD="pytest -v" ./mission-control launch "add tests"

# Session override
export GIT_BRANCH="feature-branch"
./mission-control launch "new feature"
```

### File Structure

```
orbit/
├── mission-control      # Main orchestrator
├── cargo-bay            # Task queue processor
├── launch-sequence      # Self-improvement loop
├── flight-plan          # Implementation planning
├── transmit-issues      # GitHub issue generator
├── mission-tracker      # Real-time monitoring
├── open-dashboard       # Web dashboard launcher
│
└── .copilot/
    ├── config.sh          # Main configuration
    ├── crew.yaml          # Crew/agent definitions
    ├── missions.yaml      # Mission definitions
    ├── models.yaml        # Model selection rules
    ├── best-practices.yaml # Standards reference
    ├── cargo_manifest.txt # Task queue
    ├── plans/             # Generated flight plans
    └── state/             # Runtime state
        ├── flight_log.md      # Current mission log
        ├── mission.log        # Activity log
        ├── cargo.log          # Cargo processing log
        ├── launch.log         # Self-improvement log
        ├── ground_control.json # Failsafe state
        ├── fuel_tracking.json # Token usage
        └── issues_created.log # Issue history
```

---

## 💡 Examples

### Daily Development

```bash
# Start a new feature
./mission-control launch "add user settings page"

# Fix a bug
./mission-control repair "null pointer in login handler"

# Quick doc update (uses fast model, saves tokens)
./mission-control --economy transmit "update API docs"

# Security-critical change
./mission-control --premium shields-up "add payment processing"
```

### Batch Processing

```bash
# Add tasks to queue
echo "Add dark mode" >> .copilot/cargo_manifest.txt
echo "Improve error messages" >> .copilot/cargo_manifest.txt

# Process all tasks
./cargo-bay
```

### Autonomous Operation

```bash
# Let ORBIT improve itself until you stop it
./launch-sequence

# Or limit to 10 cycles
MAX_ITERATIONS=10 ./launch-sequence
```

### Planning Workflow

```bash
# 1. Create detailed plan
./flight-plan new "Add OAuth2 with Google and GitHub" --depth 3

# 2. Review the plan
./flight-plan show plan-001

# 3. Create GitHub issues
./flight-plan issues plan-001

# 4. Execute automatically
./flight-plan execute plan-001
```

### Monitor Progress

```bash
# Real-time dashboard
./mission-tracker watch

# Follow logs
./mission-tracker tail

# Check token usage
./mission-control --fuel
```

---

## 🚀 Quick Reference

| Command | Purpose |
|---------|---------|
| `./mission-control launch "task"` | Full feature workflow |
| `./mission-control repair "task"` | Bug fix workflow |
| `./mission-control warp "task"` | Quick change |
| `./cargo-bay` | Process task queue |
| `./launch-sequence` | Self-improvement loop |
| `./flight-plan new "feature"` | Create implementation plan |
| `./transmit-issues from-cargo` | Convert queue to issues |
| `./mission-tracker watch` | Real-time monitoring |
| `./mission-control --fuel` | Check token usage |

---

*Generated by ORBIT - "To infinity and beyond!"* 🚀
